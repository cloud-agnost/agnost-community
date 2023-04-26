import nodemailer from "nodemailer";
import config from "config";

// Create email connection to SMTP server
export const transporter = nodemailer.createTransport({
	host: config.get("emailServer.host"),
	port: config.get("emailServer.port"),
	secure: config.get("emailServer.secure"),
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PWD,
	},
	pool: config.get("emailServer.pool"),
});
