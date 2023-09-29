import express from "express";
import responseTime from "response-time";
import { logRequestToConsole } from "../middlewares/logRequest.js";
import { getResponseBody } from "../middlewares/getResponseBody.js";
import { applyDefaultRateLimiters } from "../middlewares/applyDefaultRateLimiters.js";
import { checkServerStatus } from "../middlewares/checkServerStatus.js";
import { checkAPIKey } from "../middlewares/checkAPIKey.js";
import { checkContentType } from "../middlewares/checkContentType.js";
import { applyRules, validate } from "../util/authRules.js";
import { getRealtime } from "../init/realtime.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });
const AWAIT_TIMEOUT = 5000;

/*
@route      /realtime/get-members
@method     POST
@desc       Returns the members of a channel
@access     public
*/
router.post(
	"/get-members",
	responseTime(logRequestToConsole),
	getResponseBody,
	applyDefaultRateLimiters(),
	checkServerStatus,
	checkContentType,
	checkAPIKey(null),
	applyRules("realtime-get-members"),
	validate,
	async (req, res) => {
		try {
			let realtime = getRealtime();
			if (!realtime) {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.realtimeNotEnabled,
							t("Realtime is not enabled in your app version settings.")
						)
					);
			}

			realtime
				.timeout(AWAIT_TIMEOUT)
				.emit(
					"get_members",
					{ envId: META.getEnvId(), channel: req.body.channel },
					(err, response) => {
						console.log("***memmber", response);
						if (err) {
							return res
								.status(400)
								.json(
									helper.createErrorMessage(
										ERROR_CODES.clientError,
										ERROR_CODES.getMembersError,
										t(
											"Cannot get the list of members of channel '%s'. %s",
											req.body.channel,
											err
										)
									)
								);
						} else return res.status(200).json(response);
					}
				);
		} catch (error) {
			routeUtil.processInternalError(req, res, error, "clientlib");
		}
	}
);

export default router;
