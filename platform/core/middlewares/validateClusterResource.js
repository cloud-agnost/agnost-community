import axios from "axios";
import { clusterOtherComponents } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateClusterResource = async (req, res, next) => {
	try {
		const { componentName } = req.params;

		const clsResourceNames = clusterOtherComponents.map((entry) => entry.name);
		if (!clsResourceNames.includes(componentName)) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such cluster component with the provided name '%s' exists.",
					componentName
				),
				code: ERROR_CODES.notFound,
			});
		}

		// Get cluster configuration
		const result = await axios.get(
			helper.getWorkerUrl() + "/v1/resource/cluster-info",
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		const resInfo = result.data.find((entry) => entry.name === componentName);
		if (!resInfo) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such cluster component with the provided name '%s' exists.",
					componentName
				),
				code: ERROR_CODES.notFound,
			});
		}

		const metaInfo = clusterOtherComponents.find(
			(entry) => entry.name === componentName
		);

		// Assign resource data
		req.body.name = metaInfo.k8sName;
		req.body.type = metaInfo.type;
		req.body.instance = metaInfo.instance;
		req.resource = {
			name: componentName,
			managed: true,
			config: {
				replicas: resInfo.info.configuredReplicas,
				size: resInfo.info.pvcSize,
			},
		};

		req.resInfo = resInfo;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
