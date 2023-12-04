import axios from "axios";
import nodemailer from "nodemailer";
import config from "config";

var transporter = null;
var fromEmail = null;
var fromName = null;

export async function getTransport() {
	if (transporter) return { transporter, fromEmail, fromName };

	// Get the SMTP server configuration. Make api call to the platform to to get the SMTP configuration
	try {
		const smtpConfig = await axios.get(
			config.get("general.platformBaseUrl") + "/v1/cluster/smtp",
			{
				headers: {
					Authorization: process.env.MASTER_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		transporter = nodemailer.createTransport({
			host: smtpConfig.data.host,
			port: smtpConfig.data.port,
			secure: smtpConfig.data.useTLS,
			auth: {
				user: smtpConfig.data.user,
				pass: smtpConfig.data.password,
			},
			//pool: config.get("emailServer.pool"),
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
