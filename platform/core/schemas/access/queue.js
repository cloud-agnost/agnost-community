import { body } from "express-validator";
import {
	rabbitMQConnFormat,
	rabbitMQConnScheme,
	kafkaConnFormat,
	kafkaSaslMechanism,
} from "../../config/constants.js";

export default [
	// RabbitMQ access settings rules
	body("access.format")
		.if(
			(value, { req }) =>
				req.body.type === "queue" && ["RabbitMQ"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(rabbitMQConnFormat)
		.withMessage(t("Unsupported connection format")),
	body("access.url")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "url"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.scheme")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(rabbitMQConnScheme)
		.withMessage(t("Unsupported connection format")),
	body("access.host")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.port")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isInt({
			min: 0,
			max: 65535,
		})
		.withMessage(t("Port number needs to be an integer between 0-65535"))
		.toInt(),
	body("access.vhost")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.optional(),
	body("access.username")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.password")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.options")
		.optional()
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.isArray()
		.withMessage(t("Access options need to be an array of key-value pairs")),
	body("access.options.*.key")
		.if(
			(value, { req }) =>
				Array.isArray(req.body.access.options) &&
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.options.*.value")
		.if(
			(value, { req }) =>
				Array.isArray(req.body.access.options) &&
				req.body.type === "queue" &&
				["RabbitMQ"].includes(req.body.instance) &&
				req.body.access?.format === "object"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	// Kafka access settings rules
	body("access.format")
		.if(
			(value, { req }) =>
				req.body.type === "queue" && ["Kafka"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(kafkaConnFormat)
		.withMessage(t("Unsupported connection format")),
	// Kafka access settings rules
	body("access.clientId")
		.if(
			(value, { req }) =>
				req.body.type === "queue" && ["Kafka"].includes(req.body.instance)
		)
		.trim()
		.optional(),
	body("access.brokers")
		.if(
			(value, { req }) =>
				req.body.type === "queue" && ["Kafka"].includes(req.body.instance)
		)
		.isArray()
		.withMessage(t("Brokers needs to be an array of strings")),
	body("access.brokers.*")
		.if(
			(value, { req }) =>
				req.body.type === "queue" && ["Kafka"].includes(req.body.instance)
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.ssl.rejectUnauthorized")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "ssl"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isBoolean()
		.withMessage(t("Not a valid boolean value"))
		.toBoolean(),
	body("access.ssl.ca")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "ssl"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.ssl.key")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "ssl"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.ssl.cert")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "ssl"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.sasl.mechanism")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "sasl"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty"))
		.bail()
		.isIn(kafkaSaslMechanism)
		.withMessage(t("Unsupported SASL mechanism")),
	body("access.sasl.username")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "sasl"
		)
		.trim()
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
	body("access.sasl.password")
		.if(
			(value, { req }) =>
				req.body.type === "queue" &&
				["Kafka"].includes(req.body.instance) &&
				req.body.access?.format === "sasl"
		)
		.notEmpty()
		.withMessage(t("Required field, cannot be left empty")),
];
