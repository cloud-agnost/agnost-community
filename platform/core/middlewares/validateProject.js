import prjCtrl from "../controllers/project.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateProject = async (req, res, next) => {
	try {
		const { projectId } = req.params;

		// Get the project object
		let project = await prjCtrl.getOneById(projectId, { cacheKey: projectId });

		if (!project) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such project with the provided id '%s' exists.",
					projectId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (project.orgId.toString() !== req.org._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"Organization does not have a project with the provided id '%s'",
					projectId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// If we have the user information, in case of endpoints called by the master token we do not have user info
		if (req.user) {
			// If the user is cluster owner then by default he has 'Admin' privileges to the project
			if (req.user.isClusterOwner) {
				// Assign project membership data
				req.projectMember = {
					userId: req.user._id,
					role: "Admin",
					joinDate: req.user.createdAt,
				};
			} else {
				// Check if the user is a member of the project or not
				let projectMember = project.team.find(
					(entry) => entry.userId.toString() === req.user._id.toString()
				);

				if (!projectMember) {
					return res.status(401).json({
						error: t("Not Authorized"),
						details: t(
							"You are not a member of the project '%s'",
							project.name
						),
						code: ERROR_CODES.unauthorized,
					});
				}

				// Assign project membership data
				req.projectMember = projectMember;
			}
		}

		// Assign project data
		req.project = project;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
