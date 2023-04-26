import Email from "email-templates";
import path from "path";
import { fileURLToPath } from "url";
import { transporter } from "../util/transporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendEmail = (connection, queue, template) => {
	connection.createChannel(function (error, channel) {
		if (error) {
			logger.error("Cannot create channel to message queue", {
				details: error,
			});

			return;
		}

		channel.assertQueue(queue, {
			durable: true,
		});

		//Tells RabbitMQ not to give more than one message to a worker at a time. Or, in other words,
		//don't dispatch a new message to a worker until it has processed and acknowledged the previous one.
		//Instead, it will dispatch it to the next worker that is not still busy
		channel.prefetch(1);

		logger.info("Listening messages from <" + queue + "> queue");

		channel.consume(
			queue,
			function (msg) {
				let msgObj = JSON.parse(msg.content.toString());
				const email = new Email({
					send: true,
					preview: false,
					transport: transporter,
					juice: true,
					juiceResources: {
						preserveImportant: true,
						webResources: {
							relativeTo: path.join(__dirname, "..", "resources"),
							images: true,
						},
					},
					i18n: {
						locales: ["en", "tr"],
						directory: "./locales",
						defaultLocale: "en",
						autoReload: false,
						register: global,
						api: {
							__: "t", //now req.__ becomes req.t
							__n: "tn", //and req.__n can be called as req.tn
						},
					},
				});

				email
					.send({
						template: template,
						message: {
							from: '"Altogic" <noreply@altogic.com>',
							to: msgObj.to,
							attachDataUrls: false,
							attachments: [
								{
									path:
										path.join(__dirname, "..", "resources") + "/logo_color.png",
									cid: "logo_image_src",
									contentDisposition: "inline", //this is needed not to not show attachment icons in email bodies
								},
							],
						},
						locals: msgObj,
					})
					.then(() => {
						channel.ack(msg);
						logger.info(`Sent email: ${queue}`);
					})
					.catch((error) => {
						channel.nack(msg);
						logger.error(`Send email failed: ${queue}`, {
							details: error,
						});
					});
			},
			{
				noAck: false,
			}
		);
	});
};
