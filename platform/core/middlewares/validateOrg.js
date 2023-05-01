import orgCtrl from "../controllers/organization.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

// Middleare the create the error message for failed request input validations
export const validateOrg = async (req, res, next) => {
	try {
		const { orgId } = req.params;

		// Get the organization object
		let org = await orgCtrl.getOneById(orgId, { cacheKey: orgId });

		if (!org) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such organization with the provided id '%s' exists.",
					orgId
				),
				code: ERROR_CODES.notFound,
			});
		}

		// If we have the user information, in case of endpoints called by the master token we do not have user info
		if (req.user) {
			// Check if the user is a member of the orgnization or not
			let orgMember = await orgMemberCtrl.getOneByQuery(
				{
					userId: req.user._id,
					orgId: orgId,
				},
				{ cacheKey: `${orgId}.${req.user._id}` }
			);

			if (!orgMember) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t("You are not a member of the organization '%s'", org.name),
					code: ERROR_CODES.unauthorized,
				});
			}
			// Assign organization membership data
			req.orgMembrer = orgMember;
		}

		// Assign organization membership data
		req.org = org;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
