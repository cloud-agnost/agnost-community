import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import uaParser from "ua-parser-js";
import { getKey, setKey, deleteKey } from "../init/cache.js";
import { getRealtime } from "../init/realtime.js";
import ERROR_CODES from "../config/errorCodes.js";

var SMTPconnection = null;
/**
 * Sets up the SMTP connection
 */
export function setUpSMTPConnection(connData) {
	// If we already have a connection then first close it
	if (SMTPconnection) {
		try {
			SMTPconnection.close();
			SMTPconnection = null;
		} catch (err) {
			SMTPconnection = null;
		}
	}

	if (!connData.host || !connData.port || !connData.user || connData.pass)
		return null;

	// Create the new connection
	SMTPconnection = nodemailer.createTransport({
		host: connData.host,
		port: connData.port,
		secure: connData.useTLS,
		auth: {
			user: connData.user,
			pass: helper.decryptText(connData.password),
		},
		pool: true,
		maxConnections: config.get("general.SMTPserverConnectionPoolSize"),
		maxMessages: config.get("general.SMTPserverConnectionMaxMessages"),
	});

	return SMTPconnection;
}

/**
 * Returns the SMTP connection
 */
export function getSMTPconnection(connData) {
	if (SMTPconnection) return SMTPconnection;
	else return setUpSMTPConnection(connData);
}

/**
 * Checks whether the redirectURL is configurate in the redirect URLs list of the environment
 * @param  {object} version The version object
 * @param  {string} redirectUrl The redirect URL
 */
export function isValidRedirectURL(version, redirectUrl) {
	const { authentication } = version;
	return authentication.redirectURLs.includes(redirectUrl);
}

/**
 * Creates email verification token and stores it in cache
 */
export function createEmailToken(
	userId,
	email,
	actionType,
	expireDuration,
	baseURL,
	redirectURL
) {
	let key = helper.generateSlug("tk", 36);

	let createdAt = Date.now();
	let expiresAt = createdAt + expireDuration * 1000;

	let token = {
		envId: META.getEnvId(),
		email: email,
		userId: userId,
		actionType: actionType,
		expiresIn: expireDuration,
		createdAt: new Date(createdAt),
		expiresAt: new Date(expiresAt),
		confirmationURL: `${baseURL}/auth/verify?key=${key}&action=${actionType}&redirect=${encodeURIComponent(
			redirectURL
		)}`,
		redirectURL: redirectURL,
		key: key,
		type: "email",
	};

	// Cache the token
	setKey(`tokens.${META.getEnvId()}.${key}`, token, expireDuration);
	return token;
}

/**
 * Removes the token from cache
 */
export function clearToken(key) {
	deleteKey(`tokens.${META.getEnvId()}.${key}`);
}

export function createAccessToken(userId, actionType, expireDuration = null) {
	expireDuration = expireDuration
		? expireDuration
		: config.get("general.defaultTokenExpiryDuration");
	let key = helper.generateSlug("at", 36);

	let createdAt = Date.now();
	let expiresAt = createdAt + expireDuration * 1000;

	let token = {
		envId: envObj._id,
		userId: userId,
		createdAt: new Date(createdAt),
		expiresAt: new Date(expiresAt),
		key: key,
		actionType: actionType,
		type: "access",
	};

	//Cache the token
	setKey(`tokens.${META.getEnvId()}.${key}`, token, expireDuration);
	return token;
}

/**
 * Sends the email message using the template
 */
export async function sendTemplatedEmail(
	templateType,
	inputObjects,
	useTokenEmail = false
) {
	const template = META.getMessageTemplate(templateType);
	if (!template) {
		throw new AgnostError(
			t("Cannot identify the message template for '%s'", templateType),
			ERROR_CODES.missingMessageTemplate
		);
	}

	if (!template.fromEmail) {
		throw new AgnostError(
			t(
				"The message template for '%s' messages does not have the 'from email' definition.",
				templateType
			),
			ERROR_CODES.missingFromEmail
		);
	}

	const subject = processTemplate(inputObjects, template.subject);
	const body = processTemplate(inputObjects, template.body);

	await sendEmail(
		template.fromName
			? `"${template.fromName}" <${template.fromEmail}>`
			: template.fromEmail,
		useTokenEmail ? inputObjects.token.email : inputObjects.user.email,
		subject,
		body
	);
}

/**
 * Parses the message template and replaces the expressions with their actual values
 */
function processTemplate(inputObjects, message) {
	if (!message) return null;

	// If you use a global search with .match, JavaScript won't give the capture groups in its array output.
	// As such, you need to do it twice: Once to find the {{...}} pairs, then again to extract the names from within them:
	let matches = [];
	let regex = /{{\s*[^\r\n\t\f\v{}]*\s*}}/g;
	let results = message.matchAll(regex);

	let item = results.next();
	while (!item.done) {
		let expStr = item.value[0].match(/[^{{]+(?=}})/g);
		matches.push({
			block: item.value[0],
			expression: expStr ? expStr[0].trim() : "",
			blockStart: item.value.index,
			blockEnd: item.value.index + item.value[0].length,
		});
		item = results.next();
	}

	// Do the replacing of the message template blocks with actual values
	for (const entry of matches) {
		const val = getExpressionValue(inputObjects, entry.expression);
		if (val !== undefined) message = message.replace(entry.block, val);
	}

	return message;
}

/**
 * Gets the actual value form the input objects using the expression e.g., token.confirmationURL
 */
function getExpressionValue(inputObjects, expression) {
	if (!expression) return undefined;
	const parts = expression.split(".");
	if (parts.length !== 2) return undefined;

	const main = inputObjects[parts[0]];
	if (!main) return undefined;

	return main[parts[1]];
}

/**
 * Sends the email message
 */
async function sendEmail(from, to, subject, body) {
	if (!SMTPconnection) {
		throw new AgnostError(
			t(
				"No SMTP server defined to send authentication emails in version settings."
			),
			ERROR_CODES.noAuthSMTPDefinition
		);
	}

	try {
		await SMTPconnection.sendMail({
			from: from,
			to: to,
			subject: subject,
			html: body,
		});
	} catch (err) {
		throw new AgnostError(
			t("Cannot send the email message. %s", err.message),
			ERROR_CODES.cannotSendAuthEmail
		);
	}
}

/**
 * Creates a new session
 */
export async function createSession(userId, userAgentStr = null) {
	// Get session of the users
	let userSessions = await getKey(`sessions.${META.getEnvId()}.${userId}`);

	const key = helper.generateSlug("sn", 36);
	const token = createSessionToken(META.getEnvId(), userId, key);
	const session = {
		userId: userId,
		token: token,
		creationDtm: new Date().toISOString(),
		userAgent: userAgentStr ? getUserAgentObject(userAgentStr) : undefined,
	};

	if (userSessions) userSessions.push(session);
	else userSessions = [session];

	// Cache the session in Redis, we store the session data using the key in Redis
	// and the list of user sessions are stored under userId key
	setKey(`sessions.${META.getEnvId()}.${key}`, session);
	setKey(`sessions.${META.getEnvId()}.${userId}`, userSessions);

	// Trigger user:signin notification event if realtime is enabled in version settings
	const realtime = getRealtime();
	if (realtime)
		realtime.emit("user_event", {
			eventName: "user:signin",
			envId: META.getEnvId(),
			userId,
			session,
		});

	return session;
}

/**
 * Create a new session JWT
 */
export function createSessionToken(userId, key) {
	const payload = {
		envId: META.getEnvId(),
		userId: userId,
		key: key,
	};

	return jwt.sign(payload, process.env.JWT_SECRET);
}

/**
 * Returns the user agent string
 */
export function getUserAgentObject(userAgentStr) {
	return uaParser(userAgentStr);
}

/**
 * Get user agent info
 */
export function getUserAgentString(req) {
	if (req.get) return req.get("user-agent");
	else if (req.headers) return req.headers["user-agent"];
	else return "AgnostEngine";
}

/**
 * Performs the redirect
 */
export function processRedirect(req, res, redirectURL, queryParams) {
	const finalURL = buildURL(res, redirectURL, queryParams);
	return res.redirect(finalURL.href);
}

function buildURL(res, url, queryParams) {
	try {
		const primaryURL = new URL(url);
		for (const key in queryParams) {
			let value = queryParams[key];
			primaryURL.searchParams.append(key, value);
		}

		return primaryURL;
	} catch (error) {
		res
			.status(403)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidRedirectURL,
					t(
						"Cannot create URL from the redirect link %s. %s",
						url,
						error.message
					)
				)
			);

		return null;
	}
}

/**
 * Sends a realtime user event
 */
export function sendRealtimeUserEvent(eventName, userId, session) {
	const realtime = getRealtime();
	if (realtime)
		realtime.emit("user_event", {
			eventName: eventName,
			envId: META.getEnvId(),
			userId,
			session,
		});
}
