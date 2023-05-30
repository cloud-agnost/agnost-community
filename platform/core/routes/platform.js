import express from "express";
import nodemailer from "nodemailer";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { authSession } from "../middlewares/authSession.js";
import { validateSMTPTestParams } from "../middlewares/validationRules.js";
import { validate } from "../middlewares/validate.js";
import { PlatformErrorModel, handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/platform/error
@method     POST
@desc       Logs the error message occurred in the platform part of an Agnost cluster
@access     public
*/
router.post("/error", checkContentType, authMasterToken, async (req, res) => {
	try {
		// Save the error to the errors collection, do not wait for the save operation to complete and write it fast
		new PlatformErrorModel(req.body).save({ w: 0 });

		res
			.status(200)
			.send(new Date().toISOString() + " - Logged platform error message");
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/platform/test/smtp
@method     POST
@desc       Tests the SMTP server connection
@access     public
*/
router.post(
	"/test/smtp",
	checkContentType,
	authSession,
	validateSMTPTestParams(),
	validate,
	async (req, res) => {
		try {
			const { host, port, useTLS, user, password } = req.body;
			let transport = nodemailer.createTransport({
				host: host,
				port: port,
				secure: useTLS,
				auth: {
					user: user,
					pass: password,
				},
				pool: false,
			});

			try {
				await transport.verify();
				return res.json();
			} catch (err) {
				return res.status(400).json({
					error: t("Connection Error"),
					details: err.message,
					code: ERROR_CODES.connectionError,
				});
			}
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
