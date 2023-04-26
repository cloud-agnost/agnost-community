import Field from "./Field.js";
import { DATABASE } from "../../../config/constants.js";

export default class PhoneNumber extends Field {
	adapter;
	type = "number";
	name;
	static typeName = "PhoneNumber";

	versions = {
		[DATABASE.MySQL]: "VARCHAR(20)",
		[DATABASE.PostgreSQL]: "VARCHAR(20)",
		[DATABASE.SQLServer]: "NVARCHAR(20)",
		[DATABASE.Oracle]: "VARCHAR2(20)",
	};

	constructor(adapter, name) {
		super();
		this.adapter = adapter;
		this.name = name;
	}

	toDefinitionQuery() {
		return `${this.name} ${this.versions[this.adapter]}`;
	}

	toDefinitionQueryForRename() {
		return this.versions[this.adapter];
	}
}
