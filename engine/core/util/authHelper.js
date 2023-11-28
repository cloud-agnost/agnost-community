import axios from "axios";
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
export async function setUpSMTPConnection(connData) {
	// If we already have a connection then first close it
	if (SMTPconnection) {
		try {
			SMTPconnection.close();
			SMTPconnection = null;
		} catch (err) {
			SMTPconnection = null;
		}
	}

	if (!connData.host || !connData.port || !connData.user || !connData.password)
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

	await SMTPconnection.verify();
	return SMTPconnection;
}

/**
 * Returns the SMTP connection
 */
export async function getSMTPconnection(connData) {
	if (SMTPconnection) return SMTPconnection;
	else return await setUpSMTPConnection(connData);
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

export function createPhoneToken(userId, phone, actionType, expireDuration) {
	let code = Math.floor(100000 + Math.random() * 900000);

	let createdAt = Date.now();
	let expiresAt = createdAt + expireDuration * 1000;

	let token = {
		envId: META.getEnvId(),
		phone: phone,
		userId: userId,
		actionType: actionType,
		expiresIn: expireDuration,
		createdAt: new Date(createdAt),
		expiresAt: new Date(expiresAt),
		code: code,
		type: "phone",
	};

	// Cache the token
	setKey(`tokens.${META.getEnvId()}.${phone}.${code}`, token, expireDuration);
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
		envId: META.getEnvId(),
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
export async function createSession(
	userId,
	userAgentStr = null,
	userObj = null
) {
	// Get session of the users
	let userSessions = await getKey(`sessions.${META.getEnvId()}.${userId}`);

	const key = helper.generateSlug("sn", 36);
	const token = createSessionToken(userId, key);
	const session = {
		userId: userId,
		token: token,
		creationDtm: new Date(),
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
			user: userObj,
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
export function sendRealtimeUserEvent(eventName, userId, session, user) {
	const realtime = getRealtime();
	if (realtime)
		realtime.emit("user_event", {
			eventName: eventName,
			envId: META.getEnvId(),
			userId: userId.toString(),
			session: session ?? null,
			user: user ?? null,
		});
}

/**
 * Decodes the jsonwebtoken string
 */
export function verifySessionToken(token) {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
}

/**
 * Decodes the jsonwebtoken string and returns the key
 */
export function getSessionKey(token) {
	let decoded = null;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
		return decoded.key;
	} catch (error) {
		return null;
	}
}

/**
 * Sends the SMS code using the template
 */
export async function sendTemplatedSMS(templateType, inputObjects) {
	const template = META.getMessageTemplate(templateType);
	if (!template) {
		throw new AgnostError(
			t("Cannot identify the message template for '%s'", templateType),
			ERROR_CODES.missingMessageTemplate
		);
	}

	// Create SMS message body
	const body = processTemplate(inputObjects, template.body);
	// Get SMS provider configuration
	const smsProvider = META.getVersion().authentication.phone.smsProvider;
	const providerConfig = helper.decryptSensitiveData(
		META.getVersion().authentication.phone.providerConfig
	);

	if (smsProvider === "Twilio") {
		const params = new URLSearchParams();
		params.append("From", providerConfig.fromNumberOrSID);
		params.append("To", inputObjects.token.phone);
		params.append("Body", body);

		try {
			await axios.post(
				`https://api.twilio.com/2010-04-01/Accounts/${providerConfig.accountSID}/Messages.json`,
				params,
				{
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					auth: {
						username: providerConfig.accountSID,
						password: providerConfig.authToken,
					},
				}
			);
		} catch (err) {
			const message =
				err.response && err.response.data && err.response.data.message
					? err.response.data.message
					: err.message;

			throw new AgnostError(
				t("Cannot send SMS message using '%s'. %s", smsProvider, message),
				ERROR_CODES.cannotSendSMSCode
			);
		}
	} else if (smsProvider === "MessageBird") {
		const params = new URLSearchParams();
		params.append("originator", providerConfig.originator);
		params.append("recipients", inputObjects.token.phone);
		params.append("body", body);

		try {
			await axios.post("https://rest.messagebird.com/messages", params, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
					Authorization: `AccessKey ${providerConfig.accessKey}`,
				},
			});
		} catch (err) {
			let message = err.message;
			if (
				err.response.data &&
				err.response.data.errors &&
				Array.isArray(err.response.data.errors) &&
				err.response.data.errors.length > 0
			) {
				message = err.response.data.errors[0].description;
			}

			throw new AgnostError(
				t("Cannot send SMS message using '%s'. %s", smsProvider, message),
				ERROR_CODES.cannotSendSMSCode
			);
		}
	} else if (smsProvider === "Vonage") {
		const params = new URLSearchParams();
		params.append("from", providerConfig.from);
		params.append("text", body);
		params.append("to", inputObjects.token.phone);
		params.append("api_key", providerConfig.apiKey);
		params.append("api_secret", providerConfig.apiSecret);

		try {
			let result = await axios.post("https://rest.nexmo.com/sms/json", params, {
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			});

			// Error messages are also returned with 200 code
			if (
				result.data &&
				result.data.messages &&
				Array.isArray(result.data.messages) &&
				result.data.messages.length > 0 &&
				result.data.messages[0]["error-text"]
			) {
				throw new AgnostError(
					t(
						"Cannot send SMS message using '%s'. %s",
						smsProvider,
						result.data.messages[0]["error-text"]
					),
					ERROR_CODES.cannotSendSMSCode
				);
			}
		} catch (err) {
			throw new AgnostError(
				t("Cannot send SMS message using '%s'. %s", smsProvider, err.message),
				ERROR_CODES.cannotSendSMSCode
			);
		}
	}
}
