import path from "path";
import fs from "fs/promises";
import { execSync } from "child_process";

import { DeploymentManager } from "./deploymentManager.js";
import { getKey } from "../init/cache.js";
import { corePackages } from "../config/constants.js";

export class PrimaryProcessDeploymentManager extends DeploymentManager {
	constructor(msgObj, envObj) {
		super(msgObj, envObj);
	}

	/**
	 * Manages the metadata of the api server
	 */
	async initializeCore() {
		this.addLog(t("Started configuring the API server"));
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
				// Send the deployment telemetry information to the platform
				await this.sendEnvironmentLogs("OK");
				return;
			}
		}

		// Intially clear all configuration files
		await this.clearConfig();
		// Save all configuration files
		await this.saveConfig();
		// Manage NPM packages
		await this.manageNPMPackages();
		this.addLog(t("Completed initializing API server"));
		this.addLog(t("Starting child process and HTTP server"));
		// Send the deployment telemetry information to the platform
		await this.sendEnvironmentLogs("OK");
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
	 * Save the environment config file
	 */
	async saveEnvConfigFile() {
		const appPath = path.resolve(__dirname);
		const filePath = path.join(`${appPath}/meta/config/environment.json`);
		// Write environemnt config data
		await fs.writeFile(filePath, JSON.stringify(this.getEnvObj(), null, 2));
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
		// Save databases info
		const databases = await getKey(
			`${process.env.AGNOST_ENVIRONMENT_ID}.databases`
		);
		await this.saveEntityConfigFile("databases", databases);

		this.addLog(t("Saved new app configuration files and metadata"));
	}

	/**
	 * Saves configuration files to the specified meta folder and overall config folder
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares. This will also be used as the folder name.
	 * @param  {Array} contents The array of JSON objects for the app configuration e.g., array of endpoints, tasks
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async manageConfigFiles(contentType, contents, actionType) {
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
						`${appPath}/meta/${contentType}/${entry.iid}.js`
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
						`${appPath}/meta/${contentType}/${entry.iid}.js`
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

		// Save the summary info about all design elements under the /meta/config folder
		await this.updateConfigEntries(contentType, configItems, actionType);
	}

	/**
	 * Saves configuration data to config folder
	 * @param  {string} contentType The content type such as endpoints, queues, tasks, middlewares
	 * @param  {Array} configEntries The array of JSON objects for the app configuration e.g., array of endpoints, tasks excluding their code
	 * @param  {string} actionType The action type such as set, update, delete and add
	 */
	async updateConfigEntries(contentType, configEntries, actionType) {
		const config = await this.loadEntityConfigFile(contentType);
		switch (actionType) {
			case "set":
				config = configEntries;
				break;
			case "add":
				config.push(...configEntries);
				await this.saveEntityConfigFile(contentType, config);
				break;
			case "update":
				config = config.map((entry) => {
					let newEntry = configEntries.find(
						(newEntry) => newEntry.iid === entry.iid
					);

					if (newEntry) return newEntry;
					else return entry;
				});
				break;
			case "delete":
				config = config.filter(
					(entry) => !secondArray.find((item) => item.iid === entry.iid)
				);
				break;
			default:
				break;
		}

		await this.saveEntityConfigFile(contentType, configEntries);
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
		const packages = this.getPackages() ?? [];

		const packagesToInstall = [];
		for (const pkg of packages) {
			// Check if the package is already installed as a core package of the API server pod
			if (corePackages.includes(pkg.name)) continue;

			// Check whether the package is installed as an add-on and has the same version
			if (installedPackages[pkg.name] === `^${pkg.version}`) continue;

			// This is a new package or the package has a different version, we need to add it to our installation list
			packagesToInstall.push(`${pkg.name}@${pkg.version}`);
		}

		const packagesToUnInstall = [];
		for (const [key, value] of Object.entries(installedPackages)) {
			// Check if the package is a core package
			if (corePackages.includes(key)) continue;
			// Check if the package is in the version packages list
			if (packages.find((entry) => entry.name === key)) continue;
			// Add package to uninstall list
			packagesToUnInstall.push(`${key}`);
		}

		if (packagesToUnInstall.length > 0) {
			this.addLog(t("Uninstalling %s package(s)", packagesToUnInstall.length));
		}
		// If there are packages to uninstall then uninstall them
		for (let i = 0; i < packagesToUnInstall.length; i++) {
			const entry = packagesToUnInstall[i];
			try {
				execSync(`npm uninstall ${entry}`, {
					stdio: "ignore",
				});
				this.addLog(t("Uninstalled package %s", entry));
			} catch (err) {
				this.addLog(t("Failed to uninstall package %s", entry));
			}
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
