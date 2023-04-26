import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class Monetary extends Field {
	static typeName = "Monetary";
	adapter;
	name;
	type = "number";

	versions = {
		[DATABASE.MySQL]: "DECIMAL(15,2)",
		[DATABASE.PostgreSQL]: "MONEY",
		[DATABASE.SQLServer]: "MONEY",
		[DATABASE.Oracle]: "NUMBER(15,2)",
	};

	constructor(adapter, name) {
		super();
		this.adapter = adapter;
		this.name = name;
	}

	toDefinitionQuery() {
		return this.name + " " + this.versions[this.adapter];
	}

	toDefinitionQueryForRename() {
		return this.versions[this.adapter];
	}
}
