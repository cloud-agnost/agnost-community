import BaseController from "./base.js";
import { AppInvitationModel } from "../schemas/appInvitation.js";

class AppInvitationController extends BaseController {
	constructor() {
		super(AppInvitationModel);
	}

	/**
	 * Updates the matching host name in all app invitaions
	 * @param  {string} userId The user identifier
	 * @param  {string} name The name of the user
	 */
	async updateHOstName(userId, name) {
		await this.updateMultiByQuery(
			{ "host.userId": userId },
			{ "host.name": name },
			{},
			{ writeConcern: { w: 0 } }
		);
	}

	/**
	 * Updates the matching host contact email in all app invitaions
	 * @param  {string} userId The user identifier
	 * @param  {string} email The contact email of the user
	 */
	async updateHostContactEmail(userId, email) {
		await this.updateMultiByQuery(
			{ "host.userId": userId },
			{ "host.contactEmail": email },
			{},
			{ writeConcern: { w: 0 } }
		);
	}

	/**
	 * Updates the matching host login email in all app invitaions
	 * @param  {string} userId The user identifier
	 * @param  {string} email The login email of the user
	 */
	async updateHostLoginEmail(userId, email) {
		await this.updateMultiByQuery(
			{ "host.userId": userId },
			{ "host.loginEmail": email },
			{},
			{ writeConcern: { w: 0 } }
		);
	}

	/**
	 * Updates the matching host profile image in all app invitaions
	 * @param  {string} userId The user identifier
	 * @param  {string} pictureUrl The url of the profile picture
	 */
	async updateHostPicture(userId, pictureUrl) {
		await this.updateMultiByQuery(
			{ "host.userId": userId },
			{ "host.pictureUrl": pictureUrl },
			{},
			{ writeConcern: { w: 0 } }
		);
	}

	/**
	 * Removes the matching host profile image in all app invitaions
	 * @param  {string} userId The user identifier
	 */
	async removeHostPicture(userId) {
		await this.updateMultiByQuery(
			{ "host.userId": userId },
			{},
			{ "host.pictureUrl": 1 },
			{ writeConcern: { w: 0 } }
		);
	}
}

export default new AppInvitationController();
