import nodemailer from "nodemailer";
import config from "config";

// Create email connection to SMTP server
export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST,
	port: process.env.EMAIL_SERVER_PORT,
	secure: process.env.EMAIL_SERVER_SECURE === "false" ? false : true,
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PWD,
	},
	pool: config.get("emailServer.pool"),
});
