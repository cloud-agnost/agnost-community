import BaseController from "./base.js";
import { UserModel } from "../schemas/user.js";
import { setKey, getKey, deleteKey } from "../init/cache.js";

class UserController extends BaseController {
	constructor() {
		super(UserModel);
	}

	/**
	 * Creates a new token that is send through email for changing emails
	 * @param  {string} userId The user id that is initiating the email change (contact email, login profile email)
	 * @param  {string} email The new email address
	 * @param  {number} expiry The ttl of token in seconds
	 */
	async createChangeEmailToken(userId, email, expiry = 86400) {
		let token = helper.generateSlug("tkn", 36);
		await setKey(token, { userId, email }, expiry);

		return token;
	}

	/**
	 * Creates a new token that is send through email for resetting the password
	 * @param  {string} userId The user id that is initiating the email change (contact email, login profile email)
	 * @param  {string} email The email address of the user
	 * @param  {number} expiry The ttl of token in seconds
	 */
	async createResetPwdToken(userId, email, expiry = 86400) {
		let token = helper.generateSlug("tkn", 36);
		await setKey(token, { userId, email }, expiry);

		return token;
	}

	/**
	 * Returns the change email info stored in cache
	 * @param  {string} token The unique token value
	 */
	async getChangeEmailTokenInfo(token) {
		return await getKey(token);
	}

	/**
	 * Deletes the change email token stored in cache
	 * @param  {string} token The unique token value
	 */
	async deleteChangeEmailTokenInfo(token) {
		await deleteKey(token);
	}

	/**
	 * Returns the reset password info stored in cache
	 * @param  {string} token The unique token value
	 */
	async getResetPwdTokenInfo(token) {
		return await getKey(token);
	}

	/**
	 * Deletes the reset password token stored in cache
	 * @param  {string} token The unique token value
	 */
	async deleteResetPwdTokenInfo(token) {
		await deleteKey(token);
	}
}

export default new UserController();
