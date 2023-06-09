import axios from "axios";
import nodemailer from "nodemailer";
import config from "config";

var transporter = null;

export async function getTransport() {
	if (transporter) return transporter;

	// Get the SMTP server configuration. Make api call to the platform to log the error message
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
			pool: config.get("emailServer.pool"),
		});

		return transporter;
	} catch (err) {}
}
