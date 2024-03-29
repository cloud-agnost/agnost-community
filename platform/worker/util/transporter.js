import axios from "axios";
import nodemailer from "nodemailer";
import config from "config";

var transporter = null;
var fromEmail = null;
var fromName = null;
var smtpConfigStr = null;

export async function getTransport() {
	// Get the SMTP server configuration. Make api call to the platform to to get the SMTP configuration
	try {
		const smtpConfig = await axios.get(
			helper.getPlatformUrl() + "/v1/cluster/smtp",
			{
				headers: {
					Authorization: process.env.MASTER_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		let configStr = JSON.stringify(smtpConfig.data);
		if (transporter && smtpConfigStr && smtpConfigStr === configStr)
			return { transporter, fromEmail, fromName };

		smtpConfigStr = configStr;
		transporter = nodemailer.createTransport({
			host: smtpConfig.data.host,
			port: smtpConfig.data.port,
			secure: smtpConfig.data.useTLS,
			auth: {
				user: smtpConfig.data.user,
				pass: smtpConfig.data.password,
			},
			pool: config.get("emailServer.pool"),
		});
		fromEmail = smtpConfig.data.fromEmail;
		fromName = smtpConfig.data.fromName;

		return {
			transporter,
			fromEmail: smtpConfig.data.fromEmail,
			fromName: smtpConfig.data.fromName,
		};
	} catch (err) {}
}
