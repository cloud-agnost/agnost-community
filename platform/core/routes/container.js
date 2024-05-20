import axios from "axios";
import express from "express";
import auditCtrl from "../controllers/audit.js";
import cntrCtrl from "../controllers/container.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateProject } from "../middlewares/validateProject.js";
import { validateProjectEnvironment } from "../middlewares/validateProjectEnvironment.js";
import { validateContainer } from "../middlewares/validateContainer.js";
import { authorizeProjectAction } from "../middlewares/authorizeProjectAction.js";
import { validateGitOps } from "../middlewares/validateGitOps.js";
import { applyRules } from "../schemas/container.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers
@method     GET
@desc       Get all containers of a project environment
@access     private
*/
router.get(
  "/",
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  authorizeProjectAction("project.container.view"),
  async (req, res) => {
    try {
      const { environment } = req;
      const { search, sortBy, sortDir } = req.query;

      let query = { environmentId: environment._id };
      if (search) {
        query.name = {
          $regex: helper.escapeStringRegexp(search),
          $options: "i",
        };
      }

      let sort = {};
      if (sortBy && sortDir) {
        sort[sortBy] = sortDir;
      } else sort = { createdAt: "desc" };

      console.log(query, sort);

      let containers = await cntrCtrl.getManyByQuery(query, {
        sort,
      });

      res.json(containers);
    } catch (err) {
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers
@method     POST
@desc       Creates a new container in project environment
@access     private
*/
router.post(
  "/",
  checkContentType,
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  authorizeProjectAction("project.container.create"),
  applyRules("create"),
  validate,
  async (req, res) => {
    const session = await cntrCtrl.startSession();

    try {
      let prefix = "cnt";
      const { org, project, environment, body, user } = req;
      // Sanitize values
      switch (body.type) {
        case "deployment":
          prefix = "dpl";
          break;
        case "stateful set":
          prefix = "sts";
          break;
        case "cron job":
          prefix = "crj";
          break;
        case "knative service":
          prefix = "kns";
          break;
        default:
          break;
      }

      const containerId = helper.generateId();
      const container = await cntrCtrl.create(
        {
          ...body,
          _id: containerId,
          orgId: org._id,
          projectId: project._id,
          environmentId: environment._id,
          iid: helper.generateSlug(prefix),
          createdBy: user._id,
        },
        { session, cacheKey: containerId }
      );

      // Create the container in the Kubernetes cluster
      await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container",
        { container, environment, action: "create" },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      // Commit the database transaction
      await cntrCtrl.commit(session);

      res.json(container);

      // Log action
      auditCtrl.logAndNotify(
        environment._id,
        user,
        "org.project.environment.container",
        "create",
        t("Created new '%s' named '%s'", body.type, body.name),
        container,
        {
          orgId: org._id,
          projectId: project._id,
          environmentId: environment._id,
          containerId: container._id,
        }
      );
    } catch (err) {
      await cntrCtrl.rollback(session);
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId
@method     GET
@desc       Returns data about a specific container
@access     private
*/
router.get(
  "/:containerId",
  checkContentType,
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.view"),
  async (req, res) => {
    try {
      const { container } = req;

      res.json(container);
    } catch (err) {
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId
@method     PUT
@desc       Updates the container properties
@access     private
*/
router.put(
  "/:containerId",
  checkContentType,
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.update"),
  applyRules("update"),
  validate,
  async (req, res) => {
    const session = await cntrCtrl.startSession();

    try {
      const { org, project, environment, container, body, user } = req;
      // If there already a port number assignment then use it otherwise generate a new one
      body.networking.tcpProxy.publicPort =
        container.networking.tcpProxy.publicPort ??
        (await helper.getNewTCPPortNumber());

      // Once accesss mode for storage is set, it cannot be changed
      if (
        container.storageConfig.enabled === true &&
        body.storageConfig.enabled === true
      ) {
        body.storageConfig.accessModes = container.storageConfig.accessModes;
      }

      const updatedContainer = await cntrCtrl.updateOneById(
        container._id,
        {
          ...body,
          updatedBy: user._id,
        },
        {},
        {
          session,
          cacheKey: container._id,
        }
      );

      // Deletes the container in the Kubernetes cluster
      await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container",
        {
          container: updatedContainer,
          environment,
          changes: {
            containerPort:
              container.networking.containerPort !==
              updatedContainer.networking.containerPort,
            customDomain:
              container.networking.customDomain.domain !==
              updatedContainer.networking.customDomain.domain,
          },
          action: "update",
        },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      // Commit the database transaction
      await cntrCtrl.commit(session);

      res.json(updatedContainer);

      // Log action
      auditCtrl.logAndNotify(
        environment._id,
        user,
        "org.project.environment.container",
        "update",
        t("Updated '%s' named '%s'", body.type, body.name),
        container,
        {
          orgId: org._id,
          projectId: project._id,
          environmentId: environment._id,
          containerId: container._id,
        }
      );
    } catch (err) {
      await cntrCtrl.rollback(session);
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId
@method     PIT
@desc       Deletes the container
@access     private
*/
router.delete(
  "/:containerId",
  checkContentType,
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.delete"),
  async (req, res) => {
    const session = await cntrCtrl.startSession();

    try {
      const { org, project, environment, container, body, user } = req;
      await cntrCtrl.deleteOneById(container._id, {
        session,
        cacheKey: container._id,
      });

      // Deletes the container in the Kubernetes cluster
      await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container",
        { container, environment, action: "delete" },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      // Commit the database transaction
      await cntrCtrl.commit(session);

      res.json();

      // Log action
      auditCtrl.logAndNotify(
        environment._id,
        user,
        "org.project.environment.container",
        "delete",
        t("Deleted '%s' named '%s'", body.type, body.name),
        {},
        {
          orgId: org._id,
          projectId: project._id,
          environmentId: environment._id,
          containerId: container._id,
        }
      );
    } catch (err) {
      await cntrCtrl.rollback(session);
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId/pods
@method     GET
@desc       Returns container pods
@access     private
*/
router.get(
  "/:containerId/pods",
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.view"),
  async (req, res) => {
    try {
      const { container, environment } = req;
      const result = await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container/pods",
        { container, environment },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(result.data.payload);
    } catch (err) {
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId/events
@method     GET
@desc       Returns container events
@access     private
*/
router.get(
  "/:containerId/events",

  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.view"),
  async (req, res) => {
    try {
      const { container, environment } = req;
      const result = await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container/events",
        { container, environment },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(result.data.payload);
    } catch (err) {
      handleError(req, res, err);
    }
  }
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers/:containerId/logs
@method     GET
@desc       Returns container logs
@access     private
*/
router.get(
  "/:containerId/logs",
  authSession,
  validateGitOps,
  validateOrg,
  validateProject,
  validateProjectEnvironment,
  validateContainer,
  authorizeProjectAction("project.container.view"),
  async (req, res) => {
    try {
      const { container, environment } = req;
      const result = await axios.post(
        helper.getWorkerUrl() + "/v1/cicd/container/logs",
        { container, environment },
        {
          headers: {
            Authorization: process.env.ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(result.data.payload);
    } catch (err) {
      handleError(req, res, err);
    }
  }
);

export default router;
