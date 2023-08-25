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
					o = i(634),
					s = i(665),
					u = i(419),
					l = i(990);
				class d extends n.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					storage(e) {
						if (!(0, u.isString)(e))
							throw new l.ClientError(
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
						if (!(0, u.isString)(e))
							throw new l.ClientError(
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
						if (!(0, u.isString)(e))
							throw new l.ClientError(
								"invalid_value",
								"Task name needs to be a string value"
							);
						const t = this.managers.get(`task-${e}`);
						if (t) return t;
						{
							const t = new o.Task(this.metaManager, this.adapterManager, e);
							return this.managers.set(`task-${e}`, t), t;
						}
					}
					db(e) {
						if (!(0, u.isString)(e))
							throw new l.ClientError(
								"invalid_value",
								"Database name needs to be a string value"
							);
						const t = this.managers.get(`db-${e}`);
						if (t) return t;
						{
							const t = new s.Database(
								this.metaManager,
								this.adapterManager,
								e
							);
							return this.managers.set(`db-${e}`, t), t;
						}
					}
				}
				t.AgnostServerSideClient = d;
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
						t.agnost =
							void 0);
				const a = i(602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return a.APIBase;
					},
				});
				const o = i(779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return o.AgnostServerSideClient;
					},
				});
				const s = i(120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return s.Storage;
					},
				});
				const u = i(414);
				Object.defineProperty(t, "Bucket", {
					enumerable: !0,
					get: function () {
						return u.Bucket;
					},
				});
				const l = i(979);
				Object.defineProperty(t, "File", {
					enumerable: !0,
					get: function () {
						return l.File;
					},
				});
				const d = i(760);
				Object.defineProperty(t, "Queue", {
					enumerable: !0,
					get: function () {
						return d.Queue;
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
				const f = i(831);
				Object.defineProperty(t, "Model", {
					enumerable: !0,
					get: function () {
						return f.Model;
					},
				});
				const v = i(111);
				Object.defineProperty(t, "Field", {
					enumerable: !0,
					get: function () {
						return v.Field;
					},
				});
				const m = (e, t) => new o.AgnostServerSideClient(e, t);
				t.createServerSideClient = m;
				const p = m(global.META, global.ADAPTERS);
				(t.agnost = p), r(i(307), t);
			},
			414: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Bucket = void 0);
				const r = i(781),
					a = i(979),
					o = i(990),
					s = i(419);
				t.Bucket = class {
					constructor(e, t, i) {
						(this.name = i), (this.meta = e), (this.adapter = t);
					}
					file(e) {
						if (!(0, s.isString)(e))
							throw new o.ClientError(
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
							if (!(0, s.isBoolean)(e))
								throw new o.ClientError(
									"invalid_value",
									"Detailed parameter needs to be a boolean value"
								);
							const t = yield this.adapter.getBucketInfo(
								this.meta,
								this.name,
								e
							);
							return null != t ? t : null;
						});
					}
					rename(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new o.ClientError(
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
							if (!(0, s.isBoolean)(e))
								throw new o.ClientError(
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
							if (!(0, s.isBoolean)(e))
								throw new o.ClientError(
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
							if (!(0, s.isString)(e))
								throw new o.ClientError(
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
							if (!(0, s.isString)(e))
								throw new o.ClientError(
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
							if (!(0, s.isString)(e))
								throw new o.ClientError(
									"invalid_value",
									"New name parameter needs to be a string value"
								);
							if (!(0, s.isObject)(i))
								throw new o.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, s.isBoolean)(t))
								throw new o.ClientError(
									"invalid_value",
									"isPublic parameter needs to be a boolean value"
								);
							if (!(0, s.isBoolean)(r))
								throw new o.ClientError(
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
							if (!(0, s.isArray)(e))
								throw new o.ClientError(
									"invalid_value",
									"File paths parameter needs to be an array of string values"
								);
							yield this.adapter.deleteBucketFiles(this.meta, this.name, e);
						});
					}
					listFiles(e) {
						return n(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, s.isObject)(e))
									throw new o.ClientError(
										"invalid_value",
										"File listing options need to be a JSON object"
									);
								if ((0, s.valueExists)(e.search) && !(0, s.isString)(e.search))
									throw new o.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, s.valueExists)(e.page) &&
									!(0, s.isPositiveInteger)(e.page)
								)
									throw new o.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.limit) &&
									!(0, s.isPositiveInteger)(e.limit)
								)
									throw new o.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.returnCountInfo) &&
									!(0, s.isBoolean)(e.returnCountInfo)
								)
									throw new o.ClientError(
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
							if (!(0, s.valueExists)(e) || !(0, s.isObject)(e))
								throw new o.ClientError(
									"invalid_value",
									"File data to upload needs to be provided"
								);
							if (!(0, s.isString)(e.path))
								throw new o.ClientError(
									"invalid_value",
									"File path needs to be a string value"
								);
							if (!(0, s.isString)(e.mimeType))
								throw new o.ClientError(
									"invalid_value",
									"File mime-type needs to be a string value"
								);
							if (!(0, s.isPositiveInteger)(e.size))
								throw new o.ClientError(
									"invalid_value",
									"File size needs to be a positive integer value value"
								);
							if ("stream" in e && !(e.stream instanceof r.Readable))
								throw new o.ClientError(
									"invalid_value",
									"File stream needs to be a Readable stream"
								);
							if ("localPath" in e && !(0, s.isString)(e.localPath))
								throw new o.ClientError(
									"invalid_value",
									"File local path needs to be a string value"
								);
							if (t) {
								if (!(0, s.isObject)(t))
									throw new o.ClientError(
										"invalid_value",
										"File upload options need to be a JSON object"
									);
								if (
									(0, s.valueExists)(t.isPublic) &&
									!(0, s.isBoolean)(t.isPublic)
								)
									throw new o.ClientError(
										"invalid_value",
										"isPublic parameter needs to be a boolean value"
									);
								if ((0, s.valueExists)(t.upsert) && !(0, s.isBoolean)(t.upsert))
									throw new o.ClientError(
										"invalid_value",
										"Upsert parameter needs to be a boolean value"
									);
								if ((0, s.valueExists)(t.tags) && !(0, s.isObject)(t.tags))
									throw new o.ClientError(
										"invalid_value",
										"Tags parameter needs to be a JSON object"
									);
								if ((0, s.valueExists)(t.userId) && (0, s.isObject)(t.userId))
									throw new o.ClientError(
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
				class o extends n.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.models = new Map()),
							(this.subModels = new Map()),
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
							o = n.filter((e) => "model" === e.type);
						for (const e of o) {
							const t = new r.Model(e, null, this);
							this.addModel(e.name, t);
						}
					}
					addModel(e, t) {
						const i = t.getSchema();
						i ? this.models.set(`${i}.${e}`, t) : this.models.set(e, t);
					}
					addSubModel(e, t) {
						const i = t.getSchema();
						i ? this.subModels.set(`${i}.${e}`, t) : this.subModels.set(e, t);
					}
					getName() {
						return this.meta.name;
					}
					getType() {
						return this.meta.type;
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
				t.Database = o;
			},
			979: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.File = void 0);
				const r = i(781),
					a = i(990),
					o = i(419);
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
							if (!(0, o.isString)(e))
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
							if (!(0, o.isString)(e))
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
							if (!(0, o.isString)(e))
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
							if (!(0, o.isString)(e))
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
							if (!(0, o.valueExists)(e) || !(0, o.isObject)(e))
								throw new a.ClientError(
									"invalid_value",
									"File data to upload needs to be provided"
								);
							if (!(0, o.isString)(e.mimeType))
								throw new a.ClientError(
									"invalid_value",
									"File mime-type needs to be a string value"
								);
							if (!(0, o.isPositiveInteger)(e.size))
								throw new a.ClientError(
									"invalid_value",
									"File size needs to be a positive integer value value"
								);
							if ("stream" in e && !(e.stream instanceof r.Readable))
								throw new a.ClientError(
									"invalid_value",
									"File stream needs to be a Readable stream"
								);
							if ("localPath" in e && !(0, o.isString)(e.localPath))
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
							if (!(0, o.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"New path parameter needs to be a string value"
								);
							if (!(0, o.isObject)(i))
								throw new a.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, o.isBoolean)(t))
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
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const r = i(602),
					a = i(990);
				class o extends r.APIBase {
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
				t.Queue = o;
			},
			120: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const r = i(602),
					a = i(990),
					o = i(414),
					s = i(419);
				class u extends r.APIBase {
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
						if (!(0, s.isString)(e))
							throw new a.ClientError(
								"invalid_value",
								"Bucket name needs to be a string value"
							);
						return new o.Bucket(this.meta, this.adapter, e.trim());
					}
					createBucket(e, t = !0, i, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"Bucket name needs to be a string value"
								);
							if (!(0, s.isBoolean)(t))
								throw new a.ClientError(
									"invalid_value",
									"Public flag needs to be a boolean value"
								);
							if (i && !(0, s.isObject)(i))
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
								if (!(0, s.isObject)(e))
									throw new a.ClientError(
										"invalid_value",
										"Bucket listing options need to be a JSON object"
									);
								if ((0, s.valueExists)(e.search) && !(0, s.isString)(e.search))
									throw new a.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, s.valueExists)(e.page) &&
									!(0, s.isPositiveInteger)(e.page)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.limit) &&
									!(0, s.isPositiveInteger)(e.limit)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.returnCountInfo) &&
									!(0, s.isBoolean)(e.returnCountInfo)
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
								if (!(0, s.isObject)(e))
									throw new a.ClientError(
										"invalid_value",
										"File listing options need to be a JSON object"
									);
								if ((0, s.valueExists)(e.search) && !(0, s.isString)(e.search))
									throw new a.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, s.valueExists)(e.page) &&
									!(0, s.isPositiveInteger)(e.page)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.limit) &&
									!(0, s.isPositiveInteger)(e.limit)
								)
									throw new a.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.returnCountInfo) &&
									!(0, s.isBoolean)(e.returnCountInfo)
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
				t.Storage = u;
			},
			634: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const r = i(602),
					a = i(990);
				class o extends r.APIBase {
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
				t.Task = o;
			},
			687: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DBAction = void 0);
				const n = i(419),
					r = i(990);
				t.DBAction = class {
					constructor(e) {
						(this.model = e),
							(this.definition = {
								method: null,
								createData: null,
								select: null,
							});
					}
					setMethod(e) {
						this.definition.method = e;
					}
					setSelect(e) {
						if (e) {
							if (!(0, n.isString)(e))
								throw new r.ClientError(
									"invalid_value",
									"Select option needs to specify the names of the fiels to return, either a single field name or space separated list of field names e.g., 'name email profile.age'"
								);
							this.definition.select = e;
						}
					}
					setCreateData(e) {
						if (!e)
							throw new r.ClientError(
								"invalid_value",
								"The data to create in the database table/collection needs to be provided"
							);
						if (!(0, n.isObject)(e) && !(0, n.isArray)(e))
							throw new r.ClientError(
								"invalid_value",
								"The data to create in the database table/collection needs to be a single or an array of JSON objects"
							);
						this.definition.createData = e;
					}
				};
			},
			866: (e, t, i) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.createField = void 0);
				const n = i(264),
					r = i(433),
					a = i(984),
					o = i(199),
					s = i(977),
					u = i(288),
					l = i(126),
					d = i(86),
					c = i(206),
					h = i(81),
					f = i(848),
					v = i(677),
					m = i(736),
					p = i(382),
					g = i(745),
					y = i(175),
					_ = i(666),
					b = i(335),
					w = i(620),
					E = i(337),
					F = i(811),
					P = i(321),
					x = i(300);
				t.createField = function (e, t) {
					switch (e.type) {
						case "id":
							return new v.IdField(e, t);
						case "text":
							return new F.TextField(e, t);
						case "rich-text":
							return new E.RichTextField(e, t);
						case "encrypted-text":
							return new c.EncryptedTextField(e, t);
						case "email":
							return new d.EmailField(e, t);
						case "link":
							return new g.LinkField(e, t);
						case "phone":
							return new b.PhoneField(e, t);
						case "boolean":
							return new a.BooleanField(e, t);
						case "integer":
							return new m.IntegerField(e, t);
						case "decimal":
							return new l.DecimalField(e, t);
						case "createdat":
							return new o.CreatedAtField(e, t);
						case "updatedat":
							return new x.UpdatedAtField(e, t);
						case "datetime":
							return new u.DateTimeField(e, t);
						case "date":
							return new s.DateField(e, t);
						case "time":
							return new P.TimeField(e, t);
						case "enum":
							return new h.EnumField(e, t);
						case "geo-point":
							return new f.GeoPointField(e, t);
						case "binary":
							return new r.BinaryField(e, t);
						case "json":
							return new p.JSONField(e, t);
						case "reference":
							return new w.ReferenceField(e, t);
						case "basic-values-list":
							return new n.BasicValuesListField(e, t);
						case "object-list":
							return new _.ObjectListField(e, t);
						case "object":
							return new y.ObjectField(e, t);
					}
				};
			},
			111: function (e, t) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Field = void 0),
					(t.Field = class {
						constructor(e, t) {
							(this.meta = e), (this.model = t);
						}
						getName() {
							return this.meta.name;
						}
						getType() {
							return this.meta.type;
						}
						getQueryPath() {
							return this.meta.queryPath;
						}
						getDBType() {
							return this.model.getDb().getType();
						}
						hasDefaultValue() {
							return (
								null !== this.meta.defaultValue &&
								void 0 !== this.meta.defaultValue
							);
						}
						hasFieldsWithDefaultValue() {
							return !1;
						}
						hasRequiredFields() {
							return !1;
						}
						getDefaultValue() {
							return this.meta.defaultValue;
						}
						isReadOnly() {
							return this.meta.immutable;
						}
						isRequired() {
							return this.meta.required;
						}
						isSystemField() {
							return "system" === this.meta.creator;
						}
						isUserField() {
							return "user" === this.meta.creator;
						}
						setValue(e, t, n, r = !0, a = -1) {
							return i(this, void 0, void 0, function* () {});
						}
						addValidationError(e, t, i, n = -1, r = !0) {
							const a = {};
							(a.origin = r ? "client_error" : "server_error"),
								(a.code = i),
								(a.details = {}),
								(a.details.field = this.getQueryPath()),
								n >= 0 && (a.details.index = n),
								void 0 !== t && (a.details.value = t);
							const o = e.errors;
							o ? o.push(a) : ((e.errors = []), e.errors.push(a));
						}
						prepare(e, t, n, r = !0, a = -1) {
							return i(this, void 0, void 0, function* () {
								r
									? yield this.prepareForCrete(e, t, n, a)
									: yield this.prepareForUpdate(e, t, n, a);
							});
						}
						prepareForCrete(e, t, n, r) {
							return i(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.hasDefaultValue())
										yield this.setValue(this.getDefaultValue(), t, n, !0, r);
									else if (this.isRequired())
										this.isUserField()
											? this.addValidationError(
													n,
													e,
													"missing_required_field_value",
													r
											  )
											: yield this.setValue(e, t, n, !0, r);
									else if (
										"object-list" === this.getType() ||
										"basic-values-list" === this.getType()
									)
										yield this.setValue([], t, n, !0, r);
									else {
										if (
											"object" !== this.getType() ||
											!this.hasFieldsWithDefaultValue()
										)
											return;
										yield this.setValue({}, t, n, !0, r);
									}
								else yield this.setValue(e, t, n, !0, r);
							});
						}
						prepareForUpdate(e, t, n, r) {
							return i(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.isSystemField()) {
										if ("updatedat" !== this.getType()) return;
										yield this.setValue(e, t, n, !1, r);
									} else
										null === e && this.isRequired()
											? this.addValidationError(
													n,
													e,
													"invalid_required_field_value",
													r
											  )
											: yield this.setValue(e, t, n, !1, r);
								else {
									if (this.isReadOnly() && this.isUserField()) return;
									yield this.setValue(e, t, n, !1, r);
								}
							});
						}
					});
			},
			831: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Model = void 0);
				const r = i(687),
					a = i(866),
					o = i(419),
					s = i(990);
				t.Model = class {
					constructor(e, t, i) {
						(this.meta = e),
							(this.parent = t),
							(this.db = i),
							(this.fields = new Map()),
							(this.timestamp = null);
						const { fields: n } = e;
						for (const e of n) {
							const t = (0, a.createField)(e, this);
							t && this.fields.set(e.name, t);
						}
					}
					getDb() {
						return this.db;
					}
					getName() {
						return this.meta.name;
					}
					getSchema() {
						return this.meta.schema;
					}
					getFields() {
						return this.fields;
					}
					getTimestamp() {
						return this.parent
							? this.parent.getTimestamp()
							: (this.timestamp || (this.timestamp = new Date()),
							  this.timestamp);
					}
					resetTimestamp() {
						this.parent
							? this.parent.resetTimestamp()
							: (this.timestamp = new Date());
					}
					prepareFieldValues(e, t = !0, i, r = -1) {
						return n(this, void 0, void 0, function* () {
							const n = {},
								a = null != i ? i : {};
							for (const [i, o] of this.fields)
								yield o.prepare(e[i], n, a, t, r);
							return n;
						});
					}
					createOne(e) {
						var t;
						return n(this, void 0, void 0, function* () {
							if ((this.resetTimestamp(), !e))
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'create' method expects an input object to insert into the database"
								);
							if (!(0, o.isObject)(e))
								throw new s.ClientError(
									"invalid_value",
									"The 'data' to create in the database table/collection needs to be a JSON object"
								);
							const i = new r.DBAction(this);
							i.setMethod("create");
							const n = {},
								a = yield this.prepareFieldValues(e, !0, n);
							if (
								(null === (t = n.errors) || void 0 === t ? void 0 : t.length) >
								0
							)
								throw new s.ClientError(
									"validation_errors",
									"The input data provided has failed to pass validation rules",
									n.errors
								);
							return i.setCreateData(a), a;
						});
					}
				};
			},
			264: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BasicValuesListField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || !this.isReadOnly())
								if (r || null !== e || !1 !== this.isRequired()) {
									if (!1 === Array.isArray(e))
										return this.addValidationError(
											i,
											e,
											"not_array_of_basic_values",
											a
										);
									if (0 === e.length && this.isRequired())
										return this.addValidationError(
											i,
											e,
											"invalid_required_field_value",
											a
										);
									for (const t of e)
										if (
											("object" == typeof t && !1 === Array.isArray(t)) ||
											Array.isArray(t)
										)
											return this.addValidationError(
												i,
												t,
												"unsopported_bvl_value",
												a
											);
									t[this.getName()] = e;
								} else t[this.getName()] = [];
						});
					}
				}
				t.BasicValuesListField = a;
			},
			433: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BinaryField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || !this.isReadOnly()) {
								if (r || null !== e || !1 !== this.isRequired())
									return e && !1 === Buffer.isBuffer(e)
										? this.addValidationError(i, e, "not_buffer_value", a)
										: void (t[this.getName()] = e);
								t[this.getName()] = null;
							}
						});
					}
				}
				t.BinaryField = a;
			},
			984: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BooleanField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || !this.isReadOnly()) {
								if (r || null !== e || !1 !== this.isRequired())
									return "boolean" != typeof e
										? this.addValidationError(i, e, "not_boolean_value", a)
										: void (t[this.getName()] = e);
								t[this.getName()] = null;
							}
						});
					}
				}
				t.BooleanField = a;
			},
			199: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.CreatedAtField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							r && (t[this.getName()] = this.model.getTimestamp());
						});
					}
				}
				t.CreatedAtField = a;
			},
			977: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (r && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const n = a.getDtmFromString(e.toString());
							if (!n || !n.isValid)
								return this.addValidationError(i, e, "not_date_value", o);
							t[this.getName()] = n.toJSDate();
						});
					}
				}
				t.DateField = o;
			},
			288: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateTimeField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (r && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const n = a.getDtmFromString(e.toString());
							if (!n || !n.isValid)
								return this.addValidationError(i, e, "not_datetime_value", o);
							t[this.getName()] = n.toJSDate();
						});
					}
				}
				t.DateTimeField = o;
			},
			126: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DecimalField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(i, e, "not_decimal_value", o);
							const n = this.meta.decimal,
								s = a
									.createDecimal(e)
									.toDecimalPlaces(n.decimalDigits, 4)
									.toNumber();
							t[this.getName()] = s;
						});
					}
				}
				t.DecimalField = o;
			},
			86: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EmailField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_text_value", o);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										i,
										n,
										"invalid_required_field_value",
										o
								  )
								: n.length > 320
								? this.addValidationError(
										i,
										n,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isEmail(n)
								? this.addValidationError(i, n, "invalid_email_address", o)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.EmailField = o;
			},
			206: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EncryptedTextField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (
								(r ||
									null !== e ||
									!1 !== this.isRequired() ||
									(t[this.getName()] = null),
								("object" == typeof e && !1 === Array.isArray(e)) ||
									Array.isArray(e))
							)
								return this.addValidationError(i, e, "not_text_value", o);
							let n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									i,
									n,
									"invalid_required_field_value",
									o
								);
							const s = this.meta.encryptedText;
							if (n.length > s.maxLength)
								return this.addValidationError(
									i,
									n,
									"max_length_threshold_exceeded",
									o
								);
							null != n &&
								"" !== n &&
								((n = yield a.encryptText(n)), (t[this.getName()] = n));
						});
					}
				}
				t.EncryptedTextField = o;
			},
			81: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EnumField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					isValueFromList(e, t) {
						const i = e.length;
						for (let n = 0; n < i; n++) if (e[n] === t) return !0;
						return !1;
					}
					setValue(e, t, i, r = !0, a = -1) {
						var o, s;
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(
									i,
									e,
									"not_enumeration_value",
									a
								);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									i,
									n,
									"invalid_required_field_value",
									a
								);
							const u =
								null !==
									(s =
										null === (o = this.meta.enum) || void 0 === o
											? void 0
											: o.selectList) && void 0 !== s
									? s
									: [];
							if (!this.isValueFromList(u, n))
								return this.addValidationError(
									i,
									e,
									"invalid_enumeration_value",
									a
								);
							t[this.getName()] = n;
						});
					}
				}
				t.EnumField = a;
			},
			848: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.GeoPointField = void 0);
				const r = i(111),
					a = i(307);
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (!Array.isArray(e) || 2 !== e.length)
								return this.addValidationError(i, e, "not_geopoint_value"), o;
							if ("number" != typeof e[0] || !isFinite(e[0]))
								return this.addValidationError(
									i,
									e,
									"invalid_longitude_value",
									o
								);
							if ("number" != typeof e[1] || !isFinite(e[1]))
								return this.addValidationError(
									i,
									e,
									"invalid_latitude_value",
									o
								);
							const n = e[0],
								s = e[1];
							if (n < -180 || n > 180)
								return this.addValidationError(
									i,
									e,
									"invalid_longitude_value",
									o
								);
							if (s < -90 || s > 90)
								return this.addValidationError(
									i,
									e,
									"invalid_latitude_value",
									o
								);
							switch (this.getDBType()) {
								case a.DBTYPE.MONGODB:
									t[this.getName()] = { type: "Point", coordinates: e };
									break;
								case a.DBTYPE.POSTGRESQL:
								case a.DBTYPE.MYSQL:
									t[this.getName()] = `POINT(${n}, ${s})`;
									break;
								case a.DBTYPE.SQLSERVER:
									t[this.getName()] = `geography::Point(${n}, ${s}, 4326)`;
									break;
								case a.DBTYPE.ORACLE:
									t[
										this.getName()
									] = `SDO_GEOMETRY(\n\t\t\t\t\t2001,            \n\t\t\t\t\tNULL,           \n\t\t\t\t\tSDO_POINT_TYPE(${n}, ${s}, NULL), \n\t\t\t\t\tNULL,            \n\t\t\t\t\tNULL             \n\t\t\t\t)`;
							}
						});
					}
				}
				t.GeoPointField = o;
			},
			677: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IdField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {});
					}
				}
				t.IdField = a;
			},
			736: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IntegerField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(i, e, "not_integer_value", o);
							const n = a.createDecimal(e).toDecimalPlaces(0).toNumber();
							t[this.getName()] = n;
						});
					}
				}
				t.IntegerField = o;
			},
			382: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JSONField = void 0);
				const r = i(111),
					a = i(307);
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || !this.isReadOnly())
								if (r || null !== e || !1 !== this.isRequired()) {
									if ("object" != typeof e && !1 === Array.isArray(e))
										return this.addValidationError(i, e, "not_json_value", o);
									switch (this.getDBType()) {
										case a.DBTYPE.MONGODB:
											t[this.getName()] = e;
											break;
										case a.DBTYPE.POSTGRESQL:
										case a.DBTYPE.MYSQL:
										case a.DBTYPE.SQLSERVER:
										case a.DBTYPE.ORACLE:
											t[this.getName()] = JSON.stringify(e);
									}
								} else t[this.getName()] = null;
						});
					}
				}
				t.JSONField = o;
			},
			745: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.LinkField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_text_value", o);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										i,
										n,
										"invalid_required_field_value",
										o
								  )
								: n.length > 2048
								? this.addValidationError(
										i,
										n,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isLink(n)
								? this.addValidationError(i, n, "invalid_URL", o)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.LinkField = o;
			},
			175: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectField = void 0);
				const r = i(831),
					a = i(111),
					o = i(990);
				class s extends a.Field {
					constructor(e, t) {
						super(e, t);
						const i = t.getDb().getModelMetaByIId(e.object.iid);
						if (!i)
							throw new o.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new r.Model(i, t, t.getDb())),
							t
								.getDb()
								.addSubModel(
									i.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
					hasFieldsWithDefaultValue() {
						if (!this.subModel) return !1;
						const e = this.subModel.getFields();
						for (const t of e.values()) {
							if (t.hasDefaultValue()) return !0;
							if ("object" === t.getType())
								return t.hasFieldsWithDefaultValue();
						}
						return !1;
					}
					hasRequiredFields() {
						if (!this.subModel) return !1;
						const e = this.subModel.getFields();
						for (const t of e.values()) {
							if (t.isRequired()) return !0;
							if ("object" === t.getType()) return t.hasRequiredFields();
						}
						return !1;
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || null !== e || !1 !== this.isRequired())
								return "object" != typeof e || Array.isArray(e)
									? this.addValidationError(i, e, "not_object_value", a)
									: void (t[this.getName()] = {});
							t[this.getName()] = null;
						});
					}
					prepare(e, t, i, r = !0, a = -1) {
						const o = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return n(this, void 0, void 0, function* () {
							yield o.prepare.call(this, e, t, i, r);
							const n = yield this.subModel.prepareFieldValues(
								e || {},
								r,
								i,
								a
							);
							t[this.getName()] = n;
						});
					}
				}
				t.ObjectField = s;
			},
			666: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectListField = void 0);
				const r = i(831),
					a = i(111),
					o = i(990);
				class s extends a.Field {
					constructor(e, t) {
						super(e, t);
						const i = t.getDb().getModelMetaByIId(e.objectList.iid);
						if (!i)
							throw new o.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new r.Model(i, t, t.getDb())),
							t
								.getDb()
								.addSubModel(
									i.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (r || null !== e || !1 !== this.isRequired()) {
								if (!Array.isArray(e))
									return this.addValidationError(i, e, "not_array_value", a);
								for (const t of e)
									if ("object" != typeof t || Array.isArray(t))
										return this.addValidationError(
											i,
											t,
											"invalid_object_array_entry",
											a
										);
								t[this.getName()] = [];
							} else t[this.getName()] = [];
						});
					}
					prepare(e, t, i, r = !0, a = -1) {
						const o = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return n(this, void 0, void 0, function* () {
							yield o.prepare.call(this, e, t, i, r);
							for (let n = 0; n < e.length; n++) {
								const a = e[n],
									o = yield this.subModel.prepareFieldValues(a, r, i, n);
								t[this.getName()].push(o);
							}
						});
					}
				}
				t.ObjectListField = s;
			},
			335: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.PhoneField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_text_value", o);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										i,
										n,
										"invalid_required_field_value",
										o
								  )
								: n.length > 16
								? this.addValidationError(
										i,
										n,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isMobilePhone(n)
								? this.addValidationError(i, n, "invalid_phone_number", o)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.PhoneField = o;
			},
			620: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ReferenceField = void 0);
				const r = i(111),
					a = i(307),
					o = global.helper;
				class s extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_reference_value", s);
							const n = e.toString().trim();
							if (!n && this.isRequired())
								return this.addValidationError(
									i,
									n,
									"invalid_required_field_value",
									s
								);
							switch (this.getDBType()) {
								case a.DBTYPE.MONGODB:
									if (!o.isValidId(n))
										return this.addValidationError(
											i,
											n,
											"invalid_mongodb_id",
											s
										);
									t[this.getName()] = o.objectId(n);
									break;
								case a.DBTYPE.POSTGRESQL:
								case a.DBTYPE.MYSQL:
								case a.DBTYPE.SQLSERVER:
								case a.DBTYPE.ORACLE:
									t[this.getName()] = e;
							}
						});
					}
				}
				t.ReferenceField = s;
			},
			337: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.RichTextField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_text_value", a);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									i,
									n,
									"invalid_required_field_value",
									a
								);
							t[this.getName()] = n;
						});
					}
				}
				t.RichTextField = a;
			},
			811: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TextField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(i, e, "not_text_value", a);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									i,
									n,
									"invalid_required_field_value",
									a
								);
							const o = this.meta.text;
							if (n.length > o.maxLength)
								return this.addValidationError(
									i,
									n,
									"max_length_threshold_exceeded",
									a
								);
							t[this.getName()] = n;
						});
					}
				}
				t.TextField = a;
			},
			321: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TimeField = void 0);
				const r = i(111),
					a = global.helper;
				class o extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!r && this.isReadOnly()) return;
							if (!r && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							const n = a.getTimeFromString(e.toString());
							if (!n) return this.addValidationError(i, e, "not_time_value", o);
							t[this.getName()] = n;
						});
					}
				}
				t.TimeField = o;
			},
			300: function (e, t, i) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, i, n) {
						return new (i || (i = Promise))(function (r, a) {
							function o(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? r(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.UpdatedAtField = void 0);
				const r = i(111);
				class a extends r.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, i, r = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							t[this.getName()] = this.model.getTimestamp();
						});
					}
				}
				t.UpdatedAtField = a;
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
							(this.specifics = i);
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
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DBTYPE = void 0),
					(t.DBTYPE = {
						MONGODB: "MongoDB",
						POSTGRESQL: "PostgreSQL",
						MYSQL: "MySQL",
						SQLSERVER: "SQL Server",
						ORACLE: "Oracle",
					});
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
