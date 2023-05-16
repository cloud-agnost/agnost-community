import path from "path";
import fs from "fs/promises";
import { execSync, spawn } from "child_process";

import { DeploymentManager } from "./deploymentManager.js";
import { getKey } from "../init/cache.js";
import { corePackages } from "../config/constants.js";

export class PrimaryProcessDeploymentManager extends DeploymentManager {
	constructor(msgObj) {
		super(msgObj);
	}

	/**
	 * Initializes the API server
	 */
	async initializeCore() {
		this.addLog(t("Started initializing API server"));
		// Check whether app is already deployed to this api server or not
		const envConfig = await this.loadEnvConfigFile();

		// If there is previous deployment check the timestamps
		if (envConfig) {
			const latestTimestamp = await getKey(
				`${process.env.AGNOST_ENVIRONMENT_ID}.timestamp`
			);

			// The api server has the latest configuration
			if (latestTimestamp && envConfig.timestamp === latestTimestamp) {
				this.addLog(
					t("API server has the latest configuration, no changes applied")
				);
				//return;
			}
		}

		// Intially clear all configuration files
		await this.clearConfig();
		// Save all configuration files
		await this.saveConfig();
		// Manage NPM packages
		await this.manageNPMPackages();
		this.addLog(t("Completed initializing API server"));
	}

	/**
	 * Clears all configuration files
	 */
	async clearConfig() {
		await this.deleteFilesInFolder("config");
		await this.deleteFilesInFolder("endpoints");
		await this.deleteFilesInFolder("middlewares");
		await this.deleteFilesInFolder("queues");
		await this.deleteFilesInFolder("tasks");

		this.addLog(t("Cleared app configuration files and metadata"));
	}

	/**
	 * Loads the environment config file
	 */
	async loadEnvConfigFile() {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/environment.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return null;
		}
	}

	/**
	 * Save the environment config file
	 */
	async saveEnvConfigFile() {
		const appPath = path.resolve(__dirname);
		const filePath = path.join(`${appPath}/meta/config/environment.json`);
		// Write environemnt config data
		await fs.writeFile(filePath, JSON.stringify(this.getEnvObj(), null, 2));
	}

	/**
	 * Loads the specific entity configuration file, if not config file exists it returns an empty array object
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 */
	async loadEntityConfigFile(contentType) {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(
				`${appPath}/meta/config/${contentType}.json`,
				"utf8"
			);
			return JSON.parse(fileContents);
		} catch (error) {
			return [];
		}
	}

	/**
	 * Saves the configuration data of the entity to its configuration file
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} configEntries The array of JSON objects for the app configuration e.g., array of endpoints, tasks excluding their code
	 */
	async saveEntityConfigFile(contentType, configEntries) {
		const appPath = path.resolve(__dirname);
		const filePath = path.join(`${appPath}/meta/config/${contentType}.json`);

		// Write config data
		await fs.writeFile(filePath, JSON.stringify(configEntries, null, 2));
	}

	/**
	 * Deletes all files in given metadata folder
	 * @param  {string} folderName The metadata foler name such as endpoints, queues, tasks, middlewares
	 */
	async deleteFilesInFolder(folderName) {
		const appPath = path.resolve(__dirname);
		const files = await fs.readdir(`${appPath}/meta/${folderName}`);
		for (const file of files) {
			const filePath = path.join(`${appPath}/meta/${folderName}`, file);
			// If the file does not exists it will throw an error, during initial load there will be no config files
			try {
				await fs.unlink(filePath);
			} catch (err) {}
		}
	}

	/**
	 * Saves configuration files
	 */
	async saveConfig() {
		// Save endpoints
		const endpoints = await getKey(
			`${process.env.AGNOST_ENVIRONMENT_ID}.endpoints`
		);
		await this.manageConfigFiles("endpoints", endpoints, "set");

		// Save middlewares
		const middlewares = await getKey(
			`${process.env.AGNOST_ENVIRONMENT_ID}.middlewares`
		);
		await this.manageConfigFiles("middlewares", middlewares, "set");

		// Save queues
		const queues = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.queues`);
		await this.manageConfigFiles("queues", queues, "set");

		// Save tasks
		const tasks = await getKey(`${process.env.AGNOST_ENVIRONMENT_ID}.tasks`);
		await this.manageConfigFiles("tasks", tasks, "set");

		// Save environment and version info
		await this.saveEnvConfigFile();

		this.addLog(t("Saved new app configuration files and metadata"));
	}

	/**
	 * Saves configuration files to the specified meta folder and overall config folder
	 * @param  {string} folderName The metadata foler name such as endpoints, queues, tasks, middlewares
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} contents The array of JSON objects for the app configuration e.g., array of endpoints, tasks
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async manageConfigFiles(folderName, contentType, contents, actionType) {
		if (contents.length === 0) return;

		// We save the files both to their respective meta folder but also udpate the entries in their respective data in config folder
		// As an example when we save each endpoint to meta/endpoints folder individually, we also save their configuration (without the code part) to meta/config/endpoints.json file also
		const configItems = [];
		const appPath = path.resolve(__dirname);
		switch (actionType) {
			case "set":
			case "update":
			case "add":
				for (const entry of contents) {
					const filePath = path.join(
						`${appPath}/meta/${folderName}/${entry.iid}.js`
					);

					// Write file code
					await fs.writeFile(filePath, entry.code);

					// Add the config item without the code to the overall config file
					delete entry.code;
					configItems.push(entry);
				}
				break;
			case "delete":
				for (const entry of contents) {
					const filePath = path.join(
						`${appPath}/meta/${folderName}/${entry.iid}.js`
					);

					// Delete the file if it exists
					try {
						await fs.unlink(filePath);
					} catch (err) {}

					// Add the config item withoud the code to the overall config file
					delete entry.code;
					configItems.push(entry);
				}
				break;
			default:
				break;
		}

		await this.updateConfigEntries(contentType, configItems, actionType);
	}

	/**
	 * Saves configuration data to config folder
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} configEntries The array of JSON objects for the app configuration e.g., array of endpoints, tasks excluding their code
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async updateConfigEntries(contentType, configEntries, actionType) {
		switch (actionType) {
			case "set":
				await this.saveEntityConfigFile(contentType, configEntries);
				break;
			case "add":
				{
					const config = await this.loadEntityConfigFile(contentType);
					config.push(...configEntries);
					await this.saveEntityConfigFile(contentType, config);
				}
				break;
			case "update":
				{
					const config = await this.loadEntityConfigFile(contentType);
					config = config.map((entry) => {
						let newEntry = configEntries.find(
							(newEntry) => newEntry.iid === entry.iid
						);

						if (newEntry) return newEntry;
						else return entry;
					});
					await this.saveEntityConfigFile(contentType, config);
				}
				break;
			case "delete":
				{
					const config = await this.loadEntityConfigFile(contentType);
					config = config.filter(
						(entry) => !secondArray.find((item) => item.iid === entry.iid)
					);
					await this.saveEntityConfigFile(contentType, config);
				}
				break;
			default:
				break;
		}
	}

	/**
	 * Parses the packages.json file and returns the dependencies list
	 */
	async getInstalledNPMPackages() {
		try {
			const appPath = path.resolve(__dirname);
			const fileContents = await fs.readFile(`${appPath}/package.json`, "utf8");
			const json = JSON.parse(fileContents);
			return json.dependencies;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Installs the required NPM packages
	 */
	async manageNPMPackages() {
		const installedPackages = await this.getInstalledNPMPackages();
		// const packages = this.getPackages() ?? [];
		console.log("***installedPackages", installedPackages);

		const packages = [
			{ name: "altogic", version: "2.3.9" },
			{ name: "moment", version: "2.29.4" },
		];

		if (packages.length === 0) return;

		const packagesToInstall = [];
		for (const pkg of packages) {
			// Check if the package is already installed as a core package of the API server pod
			if (corePackages.includes(pkg.name)) continue;

			// Check whether the package is installed as an add-on and has the same version
			if (installedPackages[pkg.name] === `^${pkg.version}`) continue;

			// This is a new package or the package has a different version, we need to add it to our installation list
			packagesToInstall.push(`${pkg.name}@${pkg.version}`);
		}

		if (packagesToInstall.length > 0) {
			this.addLog(
				t("Installing/updating %s package(s)", packagesToInstall.length)
			);
		}

		// If there are packages to install then install them
		for (let i = 0; i < packagesToInstall.length; i++) {
			const entry = packagesToInstall[i];
			try {
				execSync(`npm install ${entry}`, {
					stdio: "ignore",
				});
				this.addLog(t("Installed/updated package %s", entry));
			} catch (err) {
				this.addLog(t("Failed to install package %s", entry));
			}
		}
	}
}
