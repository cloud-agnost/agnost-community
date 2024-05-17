import axios from "axios";
import express from "express";
import bcrypt from "bcrypt";
import authCtrl from "../controllers/auth.js";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import clsCtrl from "../controllers/cluster.js";
import orgCtrl from "../controllers/organization.js";
import appCtrl from "../controllers/app.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import projectInvitationCtrl from "../controllers/projectInvitation.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import deployCtrl from "../controllers/deployment.js";
import resourceCtrl from "../controllers/resource.js";
import { applyRules } from "../schemas/user.js";
import { handleError } from "../schemas/platformError.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validate } from "../middlewares/validate.js";
//import { authClusterToken } from "../middlewares/authClusterToken.js";
import { authSession } from "../middlewares/authSession.js";
import { authRefreshToken } from "../middlewares/authRefreshToken.js";
import {
  checkClusterSetupStatus,
  hasClusterSetUpCompleted,
} from "../middlewares/checkClusterSetupStatus.js";
import { sendMessage } from "../init/queue.js";
import { setKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";
import { notificationTypes } from "../config/constants.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/auth/init-cluster-setup
@method     POST
@desc       Initializes the cluster set-up. Signs up the cluster owner using email/password verification.
			By default also creates a top level new account for the user and assigns the contact email to the login profile email.
			By default also creates the cluster configuration entry in the database.
@access     public
*/
router.post(
  "/init-cluster-setup",
  checkContentType,
  //authClusterToken,
  checkClusterSetupStatus,
  applyRules("initiate-cluster-setup"),
  validate,
  async (req, res) => {
    // Start new database transaction session
    const session = await userCtrl.startSession();
    try {
      let userId = helper.generateId();
      let { email, password, name } = req.body;

      // Encrypt user password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      // Save user to the database
      const userObj = await userCtrl.create(
        {
          _id: userId,
          iid: helper.generateSlug("usr"),
          name: name,
          color: helper.generateColor("dark"),
          contactEmail: email,
          status: "Active",
          canCreateOrg: true,
          isClusterOwner: true,
          loginProfiles: [
            {
              provider: "agnost",
              id: userId,
              password,
              email,
              emailVerified: true, //During cluster set-up we assume the email of the cluster owner is verified
            },
          ],
          notifications: notificationTypes,
        },
        { session }
      );

      // Get cluster configuration
      const cluster = await clsCtrl.getOneByQuery({
        clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
      });

      // If there is no cluster configuration then create a new one
      if (!cluster) {
        // Save initial cluster config to the database
        await clsCtrl.create(
          {
            clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
            masterToken: process.env.MASTER_TOKEN,
            accessToken: process.env.ACCESS_TOKEN,
            release: process.env.RELEASE_NUMBER,
            releaseHistory: [
              { release: process.env.RELEASE_NUMBER, timestamp: Date.now() },
            ],
            ips: await helper.getClusterIPs(),
            createdBy: userId,
          },
          { session }
        );

        try {
          // Due to a bug in mysql operator where we cannot create a mysql database in clusters except minikube, we need to restart the mysql operator
          await axios.post(
            helper.getWorkerUrl() + "/v1/resource/mysql-operator-restart",
            {},
            {
              headers: {
                Authorization: process.env.ACCESS_TOKEN,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (err) {}
      } else {
        // Update existing configuration
        await clsCtrl.updateOneById(
          cluster._id,
          {
            clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
            masterToken: process.env.MASTER_TOKEN,
            accessToken: process.env.ACCESS_TOKEN,
            release: process.env.RELEASE_NUMBER,
            releaseHistory: [
              { release: process.env.RELEASE_NUMBER, timestamp: Date.now() },
            ],
            ips: await helper.getClusterIPs(),
            createdBy: userId,
          },
          {},
          { session }
        );
      }

      // Create new session
      let tokens = await authCtrl.createSession(
        userId,
        helper.getIP(req),
        req.headers["user-agent"],
        "agnost"
      );

      // Commit transaction
      await userCtrl.commit(session);

      // Remove password field value from returned object
      delete userObj.loginProfiles[0].password;
      res.json({ ...userObj, ...tokens });

      // Log action
      auditCtrl.log(
        userObj,
        "user",
        "initiate-cluster-setup",
        t("Initiated cluster setup")
      );
    } catch (error) {
      await userCtrl.rollback(session);
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/finalize-cluster-setup
@method     POST
@desc       Finalizes the cluster set-up. Creates the initial organization and app and if SMTP config provided and app members specified sends app invitations to members.
@access     public
*/
router.post(
  "/finalize-cluster-setup",
  checkContentType,
  hasClusterSetUpCompleted,
  authSession,
  applyRules("finalize-cluster-setup"),
  validate,
  async (req, res) => {
    // Start new database transaction session
    const session = await userCtrl.startSession();
    try {
      const { user } = req;
      const { orgName, appName, smtp, appMembers, uiBaseURL } = req.body;

      // Check if the user is cluster owner or not
      if (!user.isClusterOwner) {
        await userCtrl.endSession(session);

        return res.status(422).json({
          error: t("Not Allowed"),
          details: t("Only cluster owners can finalize cluster set-up."),
          code: ERROR_CODES.notAllowed,
        });
      }

      // Check whether cluster set up has been finalized or not. If we have an organization then it means that cluster set-up has been finalized
      const org = await orgCtrl.getOneByQuery({});
      if (org) {
        await userCtrl.endSession(session);

        return res.status(422).json({
          error: t("Not Allowed"),
          details: t("Cluster set-up has already been finalized."),
          code: ERROR_CODES.notAllowed,
        });
      }

      // We are good to finalize the cluster set-up. One last check whether we have members list and whether the SMTP configuration has been provided
      if (!smtp && appMembers && appMembers.length > 0) {
        await userCtrl.endSession(session);

        return res.status(422).json({
          error: t("Not Allowed"),
          details: t(
            "In order to invite members to your app, you need to specify the SMTP server configuration."
          ),
          code: ERROR_CODES.notAllowed,
        });
      }

      // Create the new organization object
      let orgId = helper.generateId();
      let orgObj = await orgCtrl.create(
        {
          _id: orgId,
          ownerUserId: user._id,
          iid: helper.generateSlug("org"),
          name: orgName,
          color: helper.generateColor("light"),
          createdBy: user._id,
        },
        { session, cacheKey: orgId }
      );

      // Add the creator of the organization as an 'Admin' member
      await orgMemberCtrl.create(
        {
          orgId: orgId,
          userId: user._id,
          role: "Admin",
        },
        { session, cacheKey: `${orgId}.${user._id}` }
      );

      // Add the default Agnost cluster resources to the organization
      const resources = await resourceCtrl.addDefaultOrganizationResources(
        session,
        user,
        orgObj
      );

      // Create the new app and associated master version, environment and engine API server
      const { app, version, resource, resLog, env, envLog } =
        await appCtrl.createApp(session, user, orgObj, appName);

      if (smtp) {
        // Save SMTP server configuration
        await clsCtrl.updateOneByQuery(
          {
            clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
          },
          { smtp: helper.encyrptSensitiveData(smtp) },
          {},
          { session }
        );
      }

      // Prepare the invitations array to store in the database
      let invitations = [];
      if (appMembers) {
        appMembers.forEach((entry) => {
          invitations.push({
            orgId: orgObj._id,
            appId: app._id,
            email: entry.email,
            token: helper.generateSlug("tkn", 36),
            role: entry.role,
            orgRole: "Member",
          });
        });

        // Create invitations
        await appInvitationCtrl.createMany(invitations, {
          session,
        });
      }

      // Commit changes to the database
      await userCtrl.commit(session);
      res.json({ org: orgObj, app, version, env });

      // Deploy application version to the environment
      await deployCtrl.deploy(envLog, app, version, env, user);

      // We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
      await setKey(env._id, env, helper.constants["1month"]);

      // We first deploy the app then create the resources. The environment data needs to be cached before the api-server pod starts up.
      // Create the engine deployment (API server), associated HPA, service and ingress rule
      await resourceCtrl.manageClusterResources([
        resources.storage,
        resources.queue,
        resources.scheduler,
        resources.realtime,
        { resource, log: resLog },
      ]);

      // Send invitation emails
      invitations.forEach((entry) => {
        sendMessage("send-app-inivation", {
          to: entry.email,
          role: entry.role,
          organization: orgObj.name,
          app: app.name,
          url: `${uiBaseURL}/studio/redirect-handle?token=${entry.token}&type=app-invite`,
        });
      });

      // Log action
      auditCtrl.log(
        user,
        "user",
        "finalize-cluster-setup",
        t("Completed cluster setup")
      );
    } catch (error) {
      await userCtrl.rollback(session);
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/resend-code
@method     POST
@desc       Resends the email validation code. For cluster owner we do not send email validation code.
@access     public
*/
router.post(
  "/resend-code",
  checkContentType,
  applyRules("resend-code"),
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;
      // Create the 6-digit email validation code
      let code = await authCtrl.createValidationCode(email);
      sendMessage("send-validation-code", {
        to: email,
        code1: code.substring(0, 3),
        code2: code.substring(3, 6),
      });
      res.json();
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/validate-email
@method     POST
@desc       Validates the users email address using the validation code. For cluster owner we automatically validate email and do not send a validation code.
@access     public
*/
router.post(
  "/validate-email",
  checkContentType,
  applyRules("validate-email"),
  validate,
  async (req, res) => {
    try {
      const { email, code } = req.body;
      let storedCode = await authCtrl.getValidationCode(email);

      //Codes match validate user email and create session
      if (code && code.toString() === storedCode?.toString()) {
        let user = await userCtrl.updateOneByQuery(
          {
            "loginProfiles.provider": "agnost",
            "loginProfiles.email": email,
          },
          {
            lastLoginAt: Date.now(),
            lastLoginProvider: "agnost",
            "loginProfiles.$.emailVerified": true,
          },
          {}
        );

        // Delete email validation code
        authCtrl.deleteValidationCode(email);
        // Remove password field value from returned object
        delete user.loginProfiles[0].password;
        res.json(user);

        // Log action
        auditCtrl.log(
          user,
          "user",
          "validate-email",
          t("Validated account email")
        );
      } else {
        return res.status(401).json({
          error: t("Invalid Credentials"),
          details: t("The validation code provided is invalid or has expired."),
          code: ERROR_CODES.invalidValidationCode,
        });
      }
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/login
@method     POST
@desc       Login with email and password
@access     public
*/
router.post(
  "/login",
  checkContentType,
  applyRules("login"),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Get user record
      let user = await userCtrl.getOneByQuery({
        "loginProfiles.provider": "agnost",
        "loginProfiles.email": email,
      });

      if (!user) {
        return res.status(401).json({
          error: t("Invalid Credentials"),
          code: ERROR_CODES.invalidCredentials,
          details: t(
            "Invalid credentials. Email or password provided is invalid."
          ),
        });
      }

      // Get email based login profile
      let profile = user.loginProfiles.find(
        (entry) => entry.provider === "agnost"
      );

      // Check account status and email verification
      if (!profile || !profile.emailVerified) {
        return res.status(403).json({
          error: t("Pending account"),
          code: ERROR_CODES.pendingEmailConfirmation,
          details: t("Your email address has not been confirmed yet."),
        });
      }

      // Check account status and email verification
      if (user.status === "Pending") {
        return res.status(403).json({
          error: t("Pending account"),
          code: ERROR_CODES.pendingAccount,
          details: t(
            "You have not completed your account setup yet. Please complete your account set up to set your name and password."
          ),
        });
      }

      // It seems this is a valid user, we can check the password match
      const isMatch = await bcrypt.compare(
        password.toString(),
        profile.password
      );

      if (!isMatch) {
        return res.status(401).json({
          error: t("Invalid Credentials"),
          code: ERROR_CODES.invalidCredentials,
          details: t(
            "Invalid credentials. Email or password provided is invalid."
          ),
        });
      }

      // Update user's last login information
      user = await userCtrl.updateOneById(user._id, {
        lastLoginAt: Date.now(),
        lastLoginProvider: "agnost",
      });

      // Success, create the session token and return user information and do not return the password field value
      // Remove password field value from returned object
      delete user.loginProfiles[0].password;
      let tokens = await authCtrl.createSession(
        user._id,
        helper.getIP(req),
        req.headers["user-agent"],
        "agnost"
      );

      res.json({ ...user, ...tokens });

      // Log action
      auditCtrl.log(
        user,
        "user",
        "login",
        t("Logged in using email & password credentials")
      );
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/logout
@method     POST
@desc       Logout from current session
@access     private
*/
router.post("/logout", authSession, async (req, res) => {
  try {
    // Delete the session token and also the associated refresh token
    await authCtrl.deleteSession(req.session, true);
    res.json();
  } catch (error) {
    handleError(req, res, error);
  }
});

/*
@route      /v1/auth/renew
@method     POST
@desc       Renews access and refresh tokens. Uses the refresh token to create the new access and refresh tokens
@access     private
*/
router.post("/renew", authRefreshToken, async (req, res) => {
  try {
    // First delete existing access and refresh tokens
    await authCtrl.deleteSession(req.tokens);

    // Create new session
    let tokens = await authCtrl.createSession(
      req.tokens.userId,
      helper.getIP(req),
      req.headers["user-agent"]
    );

    res.json(tokens);
  } catch (error) {
    handleError(req, res, error);
  }
});

/*
@route      /v1/auth/init-account-setup
@method     POST
@desc       Checks the account status of the user, if the user has already completed the account set up returns an error. 
			If the account set up has not been completed returns success and sends a verification code to user's email address.
@access     public
*/
router.post(
  "/init-account-setup",
  checkContentType,
  hasClusterSetUpCompleted,
  applyRules("init-account-setup"),
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;
      // Get user record
      let user = await userCtrl.getOneByQuery({
        "loginProfiles.provider": "agnost",
        "loginProfiles.email": email,
      });

      if (!user) {
        return res.status(404).json({
          error: t("Not Found"),
          code: ERROR_CODES.notFound,
          details: t("No user account with provided email exists."),
        });
      }

      if (user.status === "Active") {
        return res.status(400).json({
          error: t("Setup Completed"),
          code: ERROR_CODES.setupCompleted,
          details: t(
            "User account setup has already been completed. Try signing in."
          ),
        });
      }

      // Create the 6-digit email validation code
      let code = await authCtrl.createValidationCode(email);
      sendMessage("send-validation-code", {
        to: email,
        code1: code.substring(0, 3),
        code2: code.substring(3, 6),
      });

      res.json();
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/finalize-account-setup
@method     POST
@desc       Finalizes/completes the account set-up
@access     public
*/
router.post(
  "/finalize-account-setup",
  checkContentType,
  hasClusterSetUpCompleted,
  applyRules("finalize-account-setup"),
  validate,
  async (req, res) => {
    try {
      const { email, password, name, verificationCode } = req.body;
      // Get user record
      let user = await userCtrl.getOneByQuery({
        "loginProfiles.provider": "agnost",
        "loginProfiles.email": email,
      });

      if (!user) {
        return res.status(404).json({
          error: t("Not Found"),
          code: ERROR_CODES.notFound,
          details: t("No user account with provided email exists."),
        });
      }

      if (user.status === "Active") {
        return res.status(400).json({
          error: t("Setup Completed"),
          code: ERROR_CODES.setupCompleted,
          details: t(
            "User account setup has already been completed. Try signing in."
          ),
        });
      }

      // Get the stored validateion code
      let storedCode = await authCtrl.getValidationCode(email);
      if (
        verificationCode &&
        verificationCode.toString() === storedCode?.toString()
      ) {
        // Encrypt user password
        const salt = await bcrypt.genSalt(10);
        let encryptedPassword = await bcrypt.hash(password, salt);
        let updatedUser = await userCtrl.updateOneByQuery(
          { _id: user._id, "loginProfiles.email": email },
          {
            name: name,
            status: "Active",
            lastLoginAt: Date.now(),
            lastLoginProvider: "agnost",
            "loginProfiles.$.password": encryptedPassword,
            "loginProfiles.$.emailVerified": true,
          }
        );

        // Create new session
        let tokens = await authCtrl.createSession(
          updatedUser._id,
          helper.getIP(req),
          req.headers["user-agent"],
          "agnost"
        );

        // Remove password field value from returned object
        delete updatedUser.loginProfiles[0].password;
        res.json({ ...updatedUser, ...tokens });
      } else {
        return res.status(401).json({
          error: t("Invalid Credentials"),
          details: t("The validation code provided is invalid or has expired."),
          code: ERROR_CODES.invalidValidationCode,
        });
      }
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

/*
@route      /v1/auth/complete-setup
@method     POST
@desc       Completes the account set-up. This endpoint needs to be called immediately after the user accepts an organization or app invitation and has not completed his account set up yet.
@access     public
*/
router.post(
  "/complete-setup",
  checkContentType,
  hasClusterSetUpCompleted,
  applyRules("complete-setup"),
  validate,
  async (req, res) => {
    try {
      const { email, password, name, token, inviteType } = req.body;
      // Get user record
      let user = await userCtrl.getOneByQuery({
        "loginProfiles.provider": "agnost",
        "loginProfiles.email": email,
      });

      if (!user) {
        return res.status(404).json({
          error: t("Not Found"),
          code: ERROR_CODES.notFound,
          details: t("No user account with provided email exists."),
        });
      }

      if (user.status === "Active") {
        return res.status(400).json({
          error: t("Setup Completed"),
          code: ERROR_CODES.setupCompleted,
          details: t(
            "User account setup has already been completed. Try signing in."
          ),
        });
      }

      let invite = null;
      if (inviteType === "org") {
        invite = await orgInvitationCtrl.getOneByQuery({
          token,
          email,
          status: "Accepted",
        });

        if (!invite) {
          return res.status(404).json({
            error: t("Not Found"),
            details: t("No such invitation exists for the organization."),
            code: ERROR_CODES.notFound,
          });
        }
      } else if (inviteType === "app") {
        invite = await appInvitationCtrl.getOneByQuery({
          token,
          email,
          status: "Accepted",
        });

        if (!invite) {
          return res.status(404).json({
            error: t("Not Found"),
            details: t("No such invitation exists for the app."),
            code: ERROR_CODES.notFound,
          });
        }
      } else {
        invite = await projectInvitationCtrl.getOneByQuery({
          token,
          email,
          status: "Accepted",
        });

        if (!invite) {
          return res.status(404).json({
            error: t("Not Found"),
            details: t("No such invitation exists for the project."),
            code: ERROR_CODES.notFound,
          });
        }
      }

      // Encrypt user password
      const salt = await bcrypt.genSalt(10);
      let encryptedPassword = await bcrypt.hash(password, salt);
      let updatedUser = await userCtrl.updateOneByQuery(
        { _id: user._id, "loginProfiles.email": email },
        {
          name: name,
          status: "Active",
          lastLoginAt: Date.now(),
          lastLoginProvider: "agnost",
          "loginProfiles.$.password": encryptedPassword,
          "loginProfiles.$.emailVerified": true,
        }
      );

      // Create new session
      let tokens = await authCtrl.createSession(
        updatedUser._id,
        helper.getIP(req),
        req.headers["user-agent"],
        "agnost"
      );

      // Remove password field value from returned object
      delete updatedUser.loginProfiles[0].password;
      res.json({ ...updatedUser, ...tokens });
    } catch (error) {
      handleError(req, res, error);
    }
  }
);

export default router;
