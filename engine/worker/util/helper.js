import cyripto from "crypto-js";
import { customAlphabet } from "nanoid";
import axios from "axios";
import mongo from "mongodb";
import querystring from "querystring";
import ERROR_CODES from "../config/errorCodes.js";

const constants = {
    "1hour": 3600, // in seconds
    "1day": 86400, // in seconds
    "1week": 604800, // in seconds
    "1month": 2592000, // in seconds (30 days)
    "6months": 15552000, // in seconds (180 days)
    "1year": 31536000, // in seconds (365 days)
};

/**
 * Generates a hihg probability unique slugs
 * @param  {string} prefix The prefix prepended to the slug
 * @param  {string} prefix The length of the slug excluding the prefix
 */
function generateSlug(length = 5) {
    // Kubernetes resource names need to be alphanumeric and in lowercase letters
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    const nanoid = customAlphabet(alphabet, length);
    return nanoid();
}

/**
 * Returns a random integer between min and max
 * @param  {integer} min
 * @param  {integer} max
 */
function randomInt(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get the IP number of requesting client
 * @param  {object} req HTTP request object
 */
function getIP(req) {
    try {
        var ip;
        if (req.headers["x-forwarded-for"]) {
            ip = req.headers["x-forwarded-for"].split(",")[0];
        } else if (req.connection && req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        } else {
            ip = req.ip;
        }

        return ip;
    } catch (err) {
        return req.ip ?? null;
    }
}

/**
 * Handle exceptions in route handlers
 * @param  {object} req Express request object
 * @param  {object} res Express response object
 * @param  {object} error Error object
 */
function handleError(req, res, error) {
    let entry = {
        source: "engine-worker",
        type: "worker",
        code: ERROR_CODES.internalServerError,
        name: error.name,
        message: error.message,
        stack: error.stack,
    };

    if (!res.headersSent) {
        if (error.name == "CastError") {
            entry.error = t("Not Found");
            entry.details = t("The object identifier is not recognized.");
            res.status(400).json(entry);
        } else {
            entry.error = t("Internal Server Error");
            entry.details = t(
                "The server has encountered a situation it does not know how to handle. %s",
                error.message
            );
            res.status(500).json(entry);
        }
    }

    // Log also the error message in console
    logger.info(JSON.stringify(entry, null, 2));

    //Make api call to the platform to log the error message
    axios
        .post(config.get("general.platformBaseUrl") + "/v1/engine/error", entry, {
            headers: {
                Authorization: process.env.MASTER_TOKEN,
                "Content-Type": "application/json",
            },
        })
        .catch((error) => {});
}

/**
 * Generate a new unique MongoDB identifier
 */
function generateId() {
    return new mongo.ObjectId();
}

/**
 * Returns an ObjectId object
 * @param  {string} idString The string representation of the id
 */
function objectId(idString) {
    return new mongo.ObjectId(idString);
}

/**
 * Converts array of key-value objets to query string format e.g. key1=value1&key2=value2
 * @param  {Array} keyValuePairs Array of key-value pair objects
 */
function getQueryString(keyValuePairs) {
    if (!keyValuePairs || keyValuePairs.length === 0) return "";

    // Convert the array to an object
    const obj = {};
    keyValuePairs.forEach((item) => {
        obj[item.key] = item.value;
    });

    return querystring.stringify(obj);
}

/**
 * Converts array of key-value objets to an object {key1:value1, key2:value2}
 * @param  {Array} keyValuePairs Array of key-value pair objects
 */
function getAsObject(keyValuePairs) {
    if (!keyValuePairs || keyValuePairs.length === 0) return {};

    // Convert the array to an object
    const obj = {};
    keyValuePairs.forEach((item) => {
        obj[item.key] = item.value;
    });

    return obj;
}

/**
 * Encrypts the input text and returns the encrypted string value
 * @param  {string} text The input text to encrypt
 */
function encryptText(text) {
    return cyripto.AES.encrypt(text, process.env.PASSPHRASE).toString();
}

/**
 * Decrypts the encrypted text and returns the decrypted string value
 * @param  {string} ciphertext The encrypted input text
 */
function decryptText(cipherText) {
    const bytes = cyripto.AES.decrypt(cipherText, process.env.PASSPHRASE);
    return bytes.toString(cyripto.enc.Utf8);
}

/**
 * Encrtypes sensitive connection data
 * @param  {Object} access The connection settings needed to connect to the resource
 */
function encyrptSensitiveData(access) {
    if (Array.isArray(access)) {
        let list = [];
        access.forEach((entry) => {
            list.push(encyrptSensitiveData(entry));
        });

        return list;
    }

    let encrypted = {};
    for (const key in access) {
        const value = access[key];
        if (Array.isArray(value)) {
            encrypted[key] = value.map((entry) => {
                if (entry && typeof entry === "object") return encyrptSensitiveData(entry);
                if (entry && typeof entry === "string") return encryptText(entry);
                else return entry;
            });
        } else if (typeof value === "object" && value !== null) {
            encrypted[key] = encyrptSensitiveData(value);
        } else if (value && typeof value === "string") encrypted[key] = encryptText(value);
        else encrypted[key] = value;
    }

    return encrypted;
}

/**
 * Decrypt resource access settings
 * @param  {Object} access The encrypted access settings needed to connect to the resource
 */
function decryptSensitiveData(access) {
    if (Array.isArray(access)) {
        let list = [];
        access.forEach((entry) => {
            list.push(decryptSensitiveData(entry));
        });

        return list;
    }

    let decrypted = {};
    for (const key in access) {
        const value = access[key];
        if (Array.isArray(value)) {
            decrypted[key] = value.map((entry) => {
                if (entry && typeof entry === "object") return decryptSensitiveData(entry);
                if (entry && typeof entry === "string") return decryptText(entry);
                else return entry;
            });
        } else if (typeof value === "object" && value !== null) {
            decrypted[key] = decryptSensitiveData(value);
        } else if (value && typeof value === "string") decrypted[key] = decryptText(value);
        else decrypted[key] = value;
    }

    return decrypted;
}

/**
 * Generates a secret name for a certificate.
 * @param {number} [length=12] - The length of the secret name. Default is 12.
 * @returns {string} - The generated secret name.
 */
function getCertSecretName(length = 12) {
    // Kubernetes resource names need to be alphanumeric and in lowercase letters
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    const nanoid = customAlphabet(alphabet, length);
    return `cert-secret-${nanoid()}`;
}

export default {
    constants,
    generateSlug,
    randomInt,
    getIP,
    handleError,
    generateId,
    objectId,
    getQueryString,
    getAsObject,
    decryptSensitiveData,
    encyrptSensitiveData,
    getCertSecretName,
    decryptText,
};
