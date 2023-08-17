(() => {
	"use strict";
	var e = {
			602: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.APIBase = void 0),
					(t.APIBase = class {
						constructor(e, t) {
							(this.metaManager = e), (this.adapterManager = t);
						}
						getMetadata(e, t) {
							switch (e) {
								case "database":
									return this.metaManager.getDatabaseByName(t);
								case "queue":
									return this.metaManager.getQueueByName(t);
								case "task":
									return this.metaManager.getTaskByName(t);
								case "storage":
									return this.metaManager.getStorageByName(t);
								default:
									return null;
							}
						}
						getAdapter(e, t, i) {
							switch (e) {
								case "database":
									return this.adapterManager.getDatabaseAdapter(
										t,
										null != i && i
									);
								case "queue":
									return this.adapterManager.getQueueAdapter(t);
								case "task":
									return this.adapterManager.getTaskAdapter(t);
								case "storage":
									return this.adapterManager.getStorageAdapter(t);
								default:
									return null;
							}
						}
					});
			},
			779: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.AgnostServerSideClient = void 0);
				const n = i(602),
					r = i(120),
					a = i(760),
					s = i(634),
					o = i(665),
					l = i(419),
					d = i(990);
				class u extends n.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					storage(e) {
						if (!(0, l.isString)(e))
							throw new d.ClientError(
								"invalid_value",
								"Storage name needs to be a string value"
							);
						const t = this.managers.get(`storage-${e}`);
						if (t) return t;
						{
							const t = new r.Storage(this.metaManager, this.adapterManager, e);
							return this.managers.set(`storage-${e}`, t), t;
						}
					}
					queue(e) {
						if (!(0, l.isString)(e))
							throw new d.ClientError(
								"invalid_value",
								"Queue name needs to be a string value"
							);
						const t = this.managers.get(`queue-${e}`);
						if (t) return t;
						{
							const t = new a.Queue(this.metaManager, this.adapterManager, e);
							return this.managers.set(`queue-${e}`, t), t;
						}
					}
					task(e) {
						if (!(0, l.isString)(e))
							throw new d.ClientError(
								"invalid_value",
								"Task name needs to be a string value"
							);
						const t = this.managers.get(`task-${e}`);
						if (t) return t;
						{
							const t = new s.Task(this.metaManager, this.adapterManager, e);
							return this.managers.set(`task-${e}`, t), t;
						}
					}
					db(e) {
						if (!(0, l.isString)(e))
							throw new d.ClientError(
								"invalid_value",
								"Database name needs to be a string value"
							);
						const t = this.managers.get(`db-${e}`);
						if (t) return t;
						{
							const t = new o.Database(
								this.metaManager,
								this.adapterManager,
								e
							);
							return this.managers.set(`db-${e}`, t), t;
						}
					}
				}
				t.AgnostServerSideClient = u;
			},
			341: function (e, t, i) {
				var n =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, i, n) {
									void 0 === n && (n = i);
									var r = Object.getOwnPropertyDescriptor(t, i);
									(r &&
										!("get" in r
											? !t.__esModule
											: r.writable || r.configurable)) ||
										(r = {
											enumerable: !0,
											get: function () {
												return t[i];
											},
										}),
										Object.defineProperty(e, n, r);
							  }
							: function (e, t, i, n) {
									void 0 === n && (n = i), (e[n] = t[i]);
							  }),
					r =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var i in e)
								"default" === i ||
									Object.prototype.hasOwnProperty.call(t, i) ||
									n(t, e, i);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Field =
						t.Model =
						t.Database =
						t.Task =
						t.Queue =
						t.File =
						t.Bucket =
						t.Storage =
						t.AgnostServerSideClient =
						t.APIBase =
						t.createServerSideClient =
							void 0);
				const a = i(602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return a.APIBase;
					},
				});
				const s = i(779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return s.AgnostServerSideClient;
					},
				});
				const o = i(120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return o.Storage;
					},
				});
				const l = i(414);
				Object.defineProperty(t, "Bucket", {
					enumerable: !0,
					get: function () {
						return l.Bucket;
					},
				});
				const d = i(979);
				Object.defineProperty(t, "File", {
					enumerable: !0,
					get: function () {
						return d.File;
					},
				});
				const u = i(760);
				Object.defineProperty(t, "Queue", {
					enumerable: !0,
					get: function () {
						return u.Queue;
					},
				});
				const c = i(634);
				Object.defineProperty(t, "Task", {
					enumerable: !0,
					get: function () {
						return c.Task;
					},
				});
				const h = i(665);
				Object.defineProperty(t, "Database", {
					enumerable: !0,
					get: function () {
						return h.Database;
					},
				});
				const v = i(831);
				Object.defineProperty(t, "Model", {
					enumerable: !0,
					get: function () {
						return v.Model;
					},
				});
				const f = i(111);
				Object.defineProperty(t, "Field", {
					enumerable: !0,
					get: function () {
						return f.Field;
					},
				}),
					(t.createServerSideClient = (e, t) =>
						new s.AgnostServerSideClient(e, t)),
					r(i(307), t);
			},
			414: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function s(e) {
								try {
									l(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									l(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function l(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(s, o);
							}
							l((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Bucket = void 0);
				const r = i(781),
					a = i(979),
					s = i(990),
					o = i(419);
				t.Bucket = class {
					constructor(e, t, i) {
						(this.name = i), (this.meta = e), (this.adapter = t);
					}
					file(e) {
						if (!(0, o.isString)(e))
							throw new s.ClientError(
								"invalid_value",
								"File path needs to be a string value"
							);
						return new a.File(this.meta, this.adapter, this.name, e);
					}
					exists() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.bucketExists(this.meta, this.name);
						});
					}
					getInfo(e = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isBoolean)(e))
								throw new s.ClientError(
									"invalid_value",
									"Detailed parameter needs to be a boolean value"
								);
							return yield this.adapter.getBucketInfo(this.meta, this.name, e);
						});
					}
					rename(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new s.ClientError(
									"invalid_value",
									"New name needs to be a string value"
								);
							return yield this.adapter.renameBucket(this.meta, this.name, e);
						});
					}
					empty() {
						return n(this, void 0, void 0, function* () {
							yield this.adapter.emptyBucket(this.meta, this.name);
						});
					}
					delete() {
						return n(this, void 0, void 0, function* () {
							yield this.adapter.deleteBucket(this.meta, this.name);
						});
					}
					makePublic(e = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isBoolean)(e))
								throw new s.ClientError(
									"invalid_value",
									"Include files parameter needs to be a boolean value"
								);
							return yield this.adapter.makeBucketPublic(
								this.meta,
								this.name,
								e
							);
						});
					}
					makePrivate(e = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isBoolean)(e))
								throw new s.ClientError(
									"invalid_value",
									"Include files parameter needs to be a boolean value"
								);
							return yield this.adapter.makeBucketPrivate(
								this.meta,
								this.name,
								e
							);
						});
					}
					setTag(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new s.ClientError(
									"invalid_value",
									"Key parameter needs to be a string value"
								);
							return yield this.adapter.setBucketTag(
								this.meta,
								this.name,
								e,
								t
							);
						});
					}
					removeTag(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new s.ClientError(
									"invalid_value",
									"Key parameter needs to be a string value"
								);
							return yield this.adapter.removeBucketTag(
								this.meta,
								this.name,
								e
							);
						});
					}
					removeAllTags() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllBucketTags(
								this.meta,
								this.name
							);
						});
					}
					updateInfo(e, t, i, r = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new s.ClientError(
									"invalid_value",
									"New name parameter needs to be a string value"
								);
							if (!(0, o.isObject)(i))
								throw new s.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, o.isBoolean)(t))
								throw new s.ClientError(
									"invalid_value",
									"isPublic parameter needs to be a boolean value"
								);
							if (!(0, o.isBoolean)(r))
								throw new s.ClientError(
									"invalid_value",
									"includeFiles parameter needs to be a boolean value"
								);
							return yield this.adapter.updateBucketInfo(
								this.meta,
								this.name,
								e,
								t,
								i,
								r
							);
						});
					}
					deleteFiles(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isArray)(e))
								throw new s.ClientError(
									"invalid_value",
									"File paths parameter needs to be an array of string values"
								);
							yield this.adapter.deleteBucketFiles(this.meta, this.name, e);
						});
					}
					listFiles(e) {
						return n(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, o.isObject)(e))
									throw new s.ClientError(
										"invalid_value",
										"File listing options need to be a JSON object"
									);
								if ((0, o.valueExists)(e.search) && !(0, o.isString)(e.search))
									throw new s.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, o.valueExists)(e.page) &&
									!(0, o.isPositiveInteger)(e.page)
								)
									throw new s.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.limit) &&
									!(0, o.isPositiveInteger)(e.limit)
								)
									throw new s.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.returnCountInfo) &&
									!(0, o.isBoolean)(e.returnCountInfo)
								)
									throw new s.ClientError(
										"invalid_value",
										"Return count info option needs to be a boolean value"
									);
							}
							return yield this.adapter.listBucketFiles(
								this.meta,
								this.name,
								e
							);
						});
					}
					upload(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.valueExists)(e) || !(0, o.isObject)(e))
								throw new s.ClientError(
									"invalid_value",
									"File data to upload needs to be provided"
								);
							if (!(0, o.isString)(e.path))
								throw new s.ClientError(
									"invalid_value",
									"File path needs to be a string value"
								);
							if (!(0, o.isString)(e.mimeType))
								throw new s.ClientError(
									"invalid_value",
									"File mime-type needs to be a string value"
								);
							if (!(0, o.isPositiveInteger)(e.size))
								throw new s.ClientError(
									"invalid_value",
									"File size needs to be a positive integer value value"
								);
							if ("stream" in e && !(e.stream instanceof r.Readable))
								throw new s.ClientError(
									"invalid_value",
									"File stream needs to be a Readable stream"
								);
							if ("localPath" in e && !(0, o.isString)(e.localPath))
								throw new s.ClientError(
									"invalid_value",
									"File local path needs to be a string value"
								);
							if (t) {
								if (!(0, o.isObject)(t))
									throw new s.ClientError(
										"invalid_value",
										"File upload options need to be a JSON object"
									);
								if (
									(0, o.valueExists)(t.isPublic) &&
									!(0, o.isBoolean)(t.isPublic)
								)
									throw new s.ClientError(
										"invalid_value",
										"isPublic parameter needs to be a boolean value"
									);
								if ((0, o.valueExists)(t.upsert) && !(0, o.isBoolean)(t.upsert))
									throw new s.ClientError(
										"invalid_value",
										"Upsert parameter needs to be a boolean value"
									);
								if ((0, o.valueExists)(t.tags) && !(0, o.isObject)(t.tags))
									throw new s.ClientError(
										"invalid_value",
										"Tags parameter needs to be a JSON object"
									);
								if ((0, o.valueExists)(t.userId) && (0, o.isObject)(t.userId))
									throw new s.ClientError(
										"invalid_value",
										"User id can be either a number or a string value"
									);
							}
							return yield this.adapter.uploadFile(this.meta, this.name, e, t);
						});
					}
				};
			},
			665: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Database = void 0);
				const n = i(602),
					r = i(831),
					a = i(990);
				class s extends n.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.models = new Map()),
							(this.name = i),
							(this.meta = this.getMetadata("database", i)),
							!this.meta)
						)
							throw new a.ClientError(
								"database_not_found",
								`Cannot find the database object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("database", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the database named '${i}'`
							);
						const { models: n } = this.meta,
							s = n.filter((e) => "model" === e.type);
						for (const e of s) {
							console.log("model", e.name);
							const t = new r.Model(e, null, this);
							this.addModel(e.name, t);
						}
					}
					addModel(e, t) {
						console.log("**add model", e), this.models.set(e, t);
					}
					getName() {
						return this.meta.name;
					}
					getModelMetaByIId(e) {
						const { models: t } = this.meta;
						return t.find((t) => t.iid === e);
					}
					model(e) {
						const t = this.models.get(e);
						if (!t)
							throw new a.ClientError(
								"model_not_found",
								`Cannot find the model identified by name '${e}' in database '${this.meta.name}'`
							);
						return t;
					}
				}
				t.Database = s;
			},
			979: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function s(e) {
								try {
									l(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									l(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function l(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(s, o);
							}
							l((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.File = void 0);
				const r = i(781),
					a = i(990),
					s = i(419);
				t.File = class {
					constructor(e, t, i, n) {
						(this.path = n),
							(this.bucketName = i),
							(this.meta = e),
							(this.adapter = t);
					}
					exists() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.fileExists(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					getInfo() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.getFileInfo(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					delete() {
						return n(this, void 0, void 0, function* () {
							yield this.adapter.deleteFile(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePublic() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePublic(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePrivate() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePrivate(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					createReadStream() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.createFileReadStream(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					setTag(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Key parameter needs to be a string value"
								);
							return yield this.adapter.setFileTag(
								this.meta,
								this.bucketName,
								this.path,
								e,
								t
							);
						});
					}
					removeTag(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Key parameter needs to be a string value"
								);
							return yield this.adapter.removeFileTag(
								this.meta,
								this.bucketName,
								this.path,
								e
							);
						});
					}
					removeAllTags() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllFileTags(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					copyTo(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Path parameter needs to be a string value"
								);
							return yield this.adapter.copyFileTo(
								this.meta,
								this.bucketName,
								this.path,
								e
							);
						});
					}
					moveTo(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Path parameter needs to be a string value"
								);
							return yield this.adapter.moveFileTo(
								this.meta,
								this.bucketName,
								this.path,
								e
							);
						});
					}
					replace(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.valueExists)(e) || !(0, s.isObject)(e))
								throw new a.ClientError(
									"invalid_value",
									"File data to upload needs to be provided"
								);
							if (!(0, s.isString)(e.mimeType))
								throw new a.ClientError(
									"invalid_value",
									"File mime-type needs to be a string value"
								);
							if (!(0, s.isPositiveInteger)(e.size))
								throw new a.ClientError(
									"invalid_value",
									"File size needs to be a positive integer value value"
								);
							if ("stream" in e && !(e.stream instanceof r.Readable))
								throw new a.ClientError(
									"invalid_value",
									"File stream needs to be a Readable stream"
								);
							if ("localPath" in e && !(0, s.isString)(e.localPath))
								throw new a.ClientError(
									"invalid_value",
									"File local path needs to be a string value"
								);
							return yield this.adapter.replaceFile(
								this.meta,
								this.bucketName,
								this.path,
								e
							);
						});
					}
					updateInfo(e, t, i) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"New path parameter needs to be a string value"
								);
							if (!(0, s.isObject)(i))
								throw new a.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, s.isBoolean)(t))
								throw new a.ClientError(
									"invalid_value",
									"isPublic parameter needs to be a boolean value"
								);
							return yield this.adapter.updateFileInfo(
								this.meta,
								this.bucketName,
								this.path,
								e,
								t,
								i
							);
						});
					}
				};
			},
			760: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function s(e) {
								try {
									l(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									l(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function l(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(s, o);
							}
							l((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const r = i(602),
					a = i(990);
				class s extends r.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("queue", i)),
							!this.meta)
						)
							throw new a.ClientError(
								"queue_not_found",
								`Cannot find the queue object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("queue", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${i}'`
							);
					}
					submitMessage(e, t) {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.sendMessage(
								this.meta,
								e,
								null != t ? t : 0
							);
						});
					}
					getMessageStatus(e) {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.getMessageTrackingRecord(
								this.meta.iid,
								e
							);
						});
					}
				}
				t.Queue = s;
			},
			120: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function s(e) {
								try {
									l(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									l(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function l(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(s, o);
							}
							l((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const r = i(602),
					a = i(990),
					s = i(414),
					o = i(419);
				class l extends r.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("storage", i)),
							!this.meta)
						)
							throw new a.ClientError(
								"storage_not_found",
								`Cannot find the storage object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("storage", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the storage named '${i}'`
							);
					}
					bucket(e) {
						if (!(0, o.isString)(e))
							throw new a.ClientError(
								"invalid_value",
								"Bucket name needs to be a string value"
							);
						return new s.Bucket(this.meta, this.adapter, e.trim());
					}
					createBucket(e, t = !0, i, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Bucket name needs to be a string value"
								);
							if (!(0, o.isBoolean)(t))
								throw new a.ClientError(
									"invalid_value",
									"Public flag needs to be a boolean value"
								);
							if (i && !(0, o.isObject)(i))
								throw new a.ClientError(
									"invalid_value",
									"Bucket tags need to be a JSON object"
								);
							return yield this.adapter.createBucket(
								this.meta,
								e.trim(),
								t,
								i,
								r
							);
						});
					}
					listBuckets(e) {
						return n(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, o.isObject)(e))
									throw new a.ClientError(
										"invalid_value",
										"Bucket listing options need to be a JSON object"
									);
								if ((0, o.valueExists)(e.search) && !(0, o.isString)(e.search))
									throw new a.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, o.valueExists)(e.page) &&
									!(0, o.isPositiveInteger)(e.page)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.limit) &&
									!(0, o.isPositiveInteger)(e.limit)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.returnCountInfo) &&
									!(0, o.isBoolean)(e.returnCountInfo)
								)
									throw new a.ClientError(
										"invalid_value",
										"Return count info option needs to be a boolean value"
									);
							}
							return yield this.adapter.listBuckets(this.meta, e);
						});
					}
					listFiles(e) {
						return n(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, o.isObject)(e))
									throw new a.ClientError(
										"invalid_value",
										"File listing options need to be a JSON object"
									);
								if ((0, o.valueExists)(e.search) && !(0, o.isString)(e.search))
									throw new a.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, o.valueExists)(e.page) &&
									!(0, o.isPositiveInteger)(e.page)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.limit) &&
									!(0, o.isPositiveInteger)(e.limit)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, o.valueExists)(e.returnCountInfo) &&
									!(0, o.isBoolean)(e.returnCountInfo)
								)
									throw new a.ClientError(
										"invalid_value",
										"Return count info option needs to be a boolean value"
									);
							}
							return yield this.adapter.listFiles(this.meta, e);
						});
					}
					getStats() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.getStats(this.meta);
						});
					}
				}
				t.Storage = l;
			},
			634: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function s(e) {
								try {
									l(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									l(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function l(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(s, o);
							}
							l((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const r = i(602),
					a = i(990);
				class s extends r.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("task", i)),
							!this.meta)
						)
							throw new a.ClientError(
								"cronjob_not_found",
								`Cannot find the cron job object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("task", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${i}'`
							);
					}
					runOnce() {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.triggerCronJob(this.meta);
						});
					}
					getTaskStatus(e) {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.getTaskTrackingRecord(this.meta.iid, e);
						});
					}
				}
				t.Task = s;
			},
			866: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.createField = void 0);
				const n = i(264),
					r = i(433),
					a = i(984),
					s = i(199),
					o = i(977),
					l = i(288),
					d = i(126),
					u = i(86),
					c = i(206),
					h = i(81),
					v = i(848),
					f = i(677),
					p = i(736),
					m = i(382),
					b = i(745),
					g = i(361),
					w = i(175),
					_ = i(666),
					y = i(646),
					F = i(335),
					P = i(620),
					E = i(337),
					C = i(811),
					M = i(321),
					j = i(300);
				t.createField = function (e, t) {
					switch (e.type) {
						case "id":
							return new f.IdField(e, t);
						case "text":
							return new C.TextField(e, t);
						case "rich-text":
							return new E.RichTextField(e, t);
						case "encrypted-text":
							return new c.EncryptedTextField(e, t);
						case "email":
							return new u.EmailField(e, t);
						case "link":
							return new b.LinkField(e, t);
						case "phone":
							return new F.PhoneField(e, t);
						case "boolean":
							return new a.BooleanField(e, t);
						case "integer":
							return new p.IntegerField(e, t);
						case "decimal":
							return new d.DecimalField(e, t);
						case "monetary":
							return new g.MonetaryField(e, t);
						case "createdat":
							return new s.CreatedAtField(e, t);
						case "updatedat":
							return new j.UpdatedAtField(e, t);
						case "datetime":
							return new l.DateTimeField(e, t);
						case "date":
							return new o.DateField(e, t);
						case "time":
							return new M.TimeField(e, t);
						case "enum":
							return new h.EnumField(e, t);
						case "geo-point":
							return new v.GeoPointField(e, t);
						case "binary":
							return new r.BinaryField(e, t);
						case "json":
							return new m.JSONField(e, t);
						case "reference":
							return new P.ReferenceField(e, t);
						case "basic-values-list":
							return new n.BasicValuesListField(e, t);
						case "object-list":
							return new _.ObjectListField(e, t);
						case "object":
							return new w.ObjectField(e, t);
						case "parent":
							return new y.ParentField(e, t);
					}
				};
			},
			111: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Field = void 0),
					(t.Field = class {
						constructor(e, t) {
							(this.meta = e), (this.model = t);
						}
					});
			},
			831: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Model = void 0);
				const n = i(866);
				t.Model = class {
					constructor(e, t, i) {
						(this.meta = e),
							(this.parent = t),
							(this.db = i),
							(this.fields = new Map());
						const { fields: r } = e;
						for (const e of r) {
							const t = (0, n.createField)(e, this);
							t && this.fields.set(e.name, t);
						}
					}
					getDb() {
						return this.db;
					}
					getName() {
						return this.meta.name;
					}
				};
			},
			264: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BasicValuesListField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.BasicValuesListField = r;
			},
			433: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BinaryField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.BinaryField = r;
			},
			984: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BooleanField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.BooleanField = r;
			},
			199: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.CreatedAtField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.CreatedAtField = r;
			},
			977: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.DateField = r;
			},
			288: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateTimeField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.DateTimeField = r;
			},
			126: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DecimalField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.DecimalField = r;
			},
			86: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EmailField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.EmailField = r;
			},
			206: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EncryptedTextField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.EncryptedTextField = r;
			},
			81: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EnumField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.EnumField = r;
			},
			848: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.GeoPointField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.GeoPointField = r;
			},
			677: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IdField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.IdField = r;
			},
			736: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IntegerField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.IntegerField = r;
			},
			382: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JSONField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.JSONField = r;
			},
			745: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.LinkField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.LinkField = r;
			},
			361: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.MonetaryField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.MonetaryField = r;
			},
			175: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectField = void 0);
				const n = i(831),
					r = i(111),
					a = i(990);
				class s extends r.Field {
					constructor(e, t) {
						super(e, t);
						const i = t.getDb().getModelMetaByIId(e.object.iid);
						if (!i)
							throw new a.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new n.Model(i, t, t.getDb())),
							t
								.getDb()
								.addModel(
									i.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
				}
				t.ObjectField = s;
			},
			666: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectListField = void 0);
				const n = i(831),
					r = i(111),
					a = i(990);
				class s extends r.Field {
					constructor(e, t) {
						super(e, t);
						const i = t.getDb().getModelMetaByIId(e.objectList.iid);
						if (!i)
							throw new a.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new n.Model(i, t, t.getDb())),
							t
								.getDb()
								.addModel(
									i.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
				}
				t.ObjectListField = s;
			},
			646: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ParentField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.ParentField = r;
			},
			335: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.PhoneField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.PhoneField = r;
			},
			620: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ReferenceField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.ReferenceField = r;
			},
			337: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.RichTextField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.RichTextField = r;
			},
			811: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TextField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.TextField = r;
			},
			321: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TimeField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.TimeField = r;
			},
			300: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.UpdatedAtField = void 0);
				const n = i(111);
				class r extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
				}
				t.UpdatedAtField = r;
			},
			990: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ClientError = void 0);
				class i extends Error {
					constructor(e, t, i) {
						super(t),
							(this.origin = "client_error"),
							(this.code = e),
							(this.message = t),
							(this.details = i);
					}
				}
				t.ClientError = i;
			},
			419: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.isArray =
						t.isPositiveInteger =
						t.valueExists =
						t.isString =
						t.isBoolean =
						t.isObject =
							void 0),
					(t.isObject = function (e) {
						return "object" == typeof e && !Array.isArray(e) && null !== e;
					}),
					(t.isBoolean = function (e) {
						return "boolean" == typeof e;
					}),
					(t.isString = function (e) {
						return "string" == typeof e && "" !== e && 0 !== e.trim().length;
					}),
					(t.valueExists = function (e) {
						return null != e;
					}),
					(t.isPositiveInteger = function (e) {
						return !("number" != typeof e || !Number.isInteger(e)) && e > 0;
					}),
					(t.isArray = function (e) {
						return Array.isArray(e);
					});
			},
			307: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
			},
			781: (e) => {
				e.exports = require("stream");
			},
		},
		t = {},
		i = (function i(n) {
			var r = t[n];
			if (void 0 !== r) return r.exports;
			var a = (t[n] = { exports: {} });
			return e[n].call(a.exports, a, a.exports, i), a.exports;
		})(341);
	module.exports = i;
})();
