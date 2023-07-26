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
				const r = i(602),
					a = i(120),
					n = i(760),
					o = i(634),
					s = i(419),
					u = i(990);
				class l extends r.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					storage(e) {
						if (!(0, s.isString)(e))
							throw new u.ClientError(
								"invalid_value",
								"Storage name needs to be a string value"
							);
						const t = this.managers.get(`storage-${e}`);
						if (t) return t;
						{
							const t = new a.Storage(this.metaManager, this.adapterManager, e);
							return this.managers.set(`storage-${e}`, t), t;
						}
					}
					queue(e) {
						if (!(0, s.isString)(e))
							throw new u.ClientError(
								"invalid_value",
								"Queue name needs to be a string value"
							);
						const t = this.managers.get(`queue-${e}`);
						if (t) return t;
						{
							const t = new n.Queue(this.metaManager, this.adapterManager, e);
							return this.managers.set(`queue-${e}`, t), t;
						}
					}
					task(e) {
						if (!(0, s.isString)(e))
							throw new u.ClientError(
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
				}
				t.AgnostServerSideClient = l;
			},
			341: function (e, t, i) {
				var r =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, i, r) {
									void 0 === r && (r = i);
									var a = Object.getOwnPropertyDescriptor(t, i);
									(a &&
										!("get" in a
											? !t.__esModule
											: a.writable || a.configurable)) ||
										(a = {
											enumerable: !0,
											get: function () {
												return t[i];
											},
										}),
										Object.defineProperty(e, r, a);
							  }
							: function (e, t, i, r) {
									void 0 === r && (r = i), (e[r] = t[i]);
							  }),
					a =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var i in e)
								"default" === i ||
									Object.prototype.hasOwnProperty.call(t, i) ||
									r(t, e, i);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task =
						t.Queue =
						t.File =
						t.Bucket =
						t.Storage =
						t.AgnostServerSideClient =
						t.APIBase =
						t.createServerSideClient =
							void 0);
				const n = i(602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return n.APIBase;
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
				const h = i(634);
				Object.defineProperty(t, "Task", {
					enumerable: !0,
					get: function () {
						return h.Task;
					},
				}),
					(t.createServerSideClient = (e, t) =>
						new o.AgnostServerSideClient(e, t)),
					a(i(307), t);
			},
			414: function (e, t, i) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, i, r) {
						return new (i || (i = Promise))(function (a, n) {
							function o(e) {
								try {
									u(r.next(e));
								} catch (e) {
									n(e);
								}
							}
							function s(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									n(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? a(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Bucket = void 0);
				const a = i(781),
					n = i(979),
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
						return new n.File(this.meta, this.adapter, this.name, e);
					}
					exists() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.bucketExists(this.meta, this.name);
						});
					}
					getInfo(e = !1) {
						return r(this, void 0, void 0, function* () {
							if (!(0, s.isBoolean)(e))
								throw new o.ClientError(
									"invalid_value",
									"Detailed parameter needs to be a boolean value"
								);
							return yield this.adapter.getBucketInfo(this.meta, this.name, e);
						});
					}
					rename(e) {
						return r(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new o.ClientError(
									"invalid_value",
									"New name needs to be a string value"
								);
							return yield this.adapter.renameBucket(this.meta, this.name, e);
						});
					}
					empty() {
						return r(this, void 0, void 0, function* () {
							yield this.adapter.emptyBucket(this.meta, this.name);
						});
					}
					delete() {
						return r(this, void 0, void 0, function* () {
							yield this.adapter.deleteBucket(this.meta, this.name);
						});
					}
					makePublic(e = !1) {
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllBucketTags(
								this.meta,
								this.name
							);
						});
					}
					updateInfo(e, t, i, a = !1) {
						return r(this, void 0, void 0, function* () {
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
							if (!(0, s.isBoolean)(a))
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
								a
							);
						});
					}
					deleteFiles(e) {
						return r(this, void 0, void 0, function* () {
							if (!(0, s.isArray)(e))
								throw new o.ClientError(
									"invalid_value",
									"File paths parameter needs to be an array of string values"
								);
							yield this.adapter.deleteBucketFiles(this.meta, this.name, e);
						});
					}
					listFiles(e) {
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
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
							if ("stream" in e && !(e.stream instanceof a.Readable))
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
			979: function (e, t, i) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, i, r) {
						return new (i || (i = Promise))(function (a, n) {
							function o(e) {
								try {
									u(r.next(e));
								} catch (e) {
									n(e);
								}
							}
							function s(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									n(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? a(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.File = void 0);
				const a = i(781),
					n = i(990),
					o = i(419);
				t.File = class {
					constructor(e, t, i, r) {
						(this.path = r),
							(this.bucketName = i),
							(this.meta = e),
							(this.adapter = t);
					}
					exists() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.fileExists(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					getInfo() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.getFileInfo(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					delete() {
						return r(this, void 0, void 0, function* () {
							yield this.adapter.deleteFile(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePublic() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePublic(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePrivate() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePrivate(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					createReadStream() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.createFileReadStream(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					setTag(e, t) {
						return r(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new n.ClientError(
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
						return r(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new n.ClientError(
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
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllFileTags(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					copyTo(e) {
						return r(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new n.ClientError(
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
						return r(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new n.ClientError(
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
						return r(this, void 0, void 0, function* () {
							if (!(0, o.valueExists)(e) || !(0, o.isObject)(e))
								throw new n.ClientError(
									"invalid_value",
									"File data to upload needs to be provided"
								);
							if (!(0, o.isString)(e.mimeType))
								throw new n.ClientError(
									"invalid_value",
									"File mime-type needs to be a string value"
								);
							if (!(0, o.isPositiveInteger)(e.size))
								throw new n.ClientError(
									"invalid_value",
									"File size needs to be a positive integer value value"
								);
							if ("stream" in e && !(e.stream instanceof a.Readable))
								throw new n.ClientError(
									"invalid_value",
									"File stream needs to be a Readable stream"
								);
							if ("localPath" in e && !(0, o.isString)(e.localPath))
								throw new n.ClientError(
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
						return r(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new n.ClientError(
									"invalid_value",
									"New path parameter needs to be a string value"
								);
							if (!(0, o.isObject)(i))
								throw new n.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, o.isBoolean)(t))
								throw new n.ClientError(
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
				var r =
					(this && this.__awaiter) ||
					function (e, t, i, r) {
						return new (i || (i = Promise))(function (a, n) {
							function o(e) {
								try {
									u(r.next(e));
								} catch (e) {
									n(e);
								}
							}
							function s(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									n(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? a(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const a = i(602),
					n = i(990);
				class o extends a.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("queue", i)),
							!this.meta)
						)
							throw new n.ClientError(
								"queue_not_found",
								`Cannot find the queue object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("queue", this.name)),
							!this.adapter)
						)
							throw new n.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${i}'`
							);
					}
					submitMessage(e, t) {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.sendMessage(
								this.meta,
								e,
								null != t ? t : 0
							);
						});
					}
					getMessageStatus(e) {
						return r(this, void 0, void 0, function* () {
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
				var r =
					(this && this.__awaiter) ||
					function (e, t, i, r) {
						return new (i || (i = Promise))(function (a, n) {
							function o(e) {
								try {
									u(r.next(e));
								} catch (e) {
									n(e);
								}
							}
							function s(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									n(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? a(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const a = i(602),
					n = i(990),
					o = i(414),
					s = i(419);
				class u extends a.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("storage", i)),
							!this.meta)
						)
							throw new n.ClientError(
								"storage_not_found",
								`Cannot find the storage object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("storage", this.name)),
							!this.adapter)
						)
							throw new n.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the storage named '${i}'`
							);
					}
					bucket(e) {
						if (!(0, s.isString)(e))
							throw new n.ClientError(
								"invalid_value",
								"Bucket name needs to be a string value"
							);
						return new o.Bucket(this.meta, this.adapter, e.trim());
					}
					createBucket(e, t = !0, i, a) {
						return r(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new n.ClientError(
									"invalid_value",
									"Bucket name needs to be a string value"
								);
							if (!(0, s.isBoolean)(t))
								throw new n.ClientError(
									"invalid_value",
									"Public flag needs to be a boolean value"
								);
							if (i && !(0, s.isObject)(i))
								throw new n.ClientError(
									"invalid_value",
									"Bucket tags need to be a JSON object"
								);
							return yield this.adapter.createBucket(
								this.meta,
								e.trim(),
								t,
								i,
								a
							);
						});
					}
					listBuckets(e) {
						return r(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, s.isObject)(e))
									throw new n.ClientError(
										"invalid_value",
										"Bucket listing options need to be a JSON object"
									);
								if ((0, s.valueExists)(e.search) && !(0, s.isString)(e.search))
									throw new n.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, s.valueExists)(e.page) &&
									!(0, s.isPositiveInteger)(e.page)
								)
									throw new n.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.limit) &&
									!(0, s.isPositiveInteger)(e.limit)
								)
									throw new n.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.returnCountInfo) &&
									!(0, s.isBoolean)(e.returnCountInfo)
								)
									throw new n.ClientError(
										"invalid_value",
										"Return count info option needs to be a boolean value"
									);
							}
							return yield this.adapter.listBuckets(this.meta, e);
						});
					}
					listFiles(e) {
						return r(this, void 0, void 0, function* () {
							if (e) {
								if (!(0, s.isObject)(e))
									throw new n.ClientError(
										"invalid_value",
										"File listing options need to be a JSON object"
									);
								if ((0, s.valueExists)(e.search) && !(0, s.isString)(e.search))
									throw new n.ClientError(
										"invalid_value",
										"Search parameter needs to be a string value"
									);
								if (
									(0, s.valueExists)(e.page) &&
									!(0, s.isPositiveInteger)(e.page)
								)
									throw new n.ClientError(
										"invalid_value",
										"Page number needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.limit) &&
									!(0, s.isPositiveInteger)(e.limit)
								)
									throw new n.ClientError(
										"invalid_value",
										"Page limit (size) needs to be a positive integer value"
									);
								if (
									(0, s.valueExists)(e.returnCountInfo) &&
									!(0, s.isBoolean)(e.returnCountInfo)
								)
									throw new n.ClientError(
										"invalid_value",
										"Return count info option needs to be a boolean value"
									);
							}
							return yield this.adapter.listFiles(this.meta, e);
						});
					}
					getStats() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.getStats(this.meta);
						});
					}
				}
				t.Storage = u;
			},
			634: function (e, t, i) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, i, r) {
						return new (i || (i = Promise))(function (a, n) {
							function o(e) {
								try {
									u(r.next(e));
								} catch (e) {
									n(e);
								}
							}
							function s(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									n(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? a(e.value)
									: ((t = e.value),
									  t instanceof i
											? t
											: new i(function (e) {
													e(t);
											  })).then(o, s);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const a = i(602),
					n = i(990);
				class o extends a.APIBase {
					constructor(e, t, i) {
						if (
							(super(e, t),
							(this.name = i),
							(this.meta = this.getMetadata("task", i)),
							!this.meta)
						)
							throw new n.ClientError(
								"cronjob_not_found",
								`Cannot find the cron job object identified by name '${i}'`
							);
						if (
							((this.adapter = this.getAdapter("task", this.name)),
							!this.adapter)
						)
							throw new n.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${i}'`
							);
					}
					runOnce() {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.triggerCronJob(this.meta);
						});
					}
					getTaskStatus(e) {
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.getTaskTrackingRecord(this.meta.iid, e);
						});
					}
				}
				t.Task = o;
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
		i = (function i(r) {
			var a = t[r];
			if (void 0 !== a) return a.exports;
			var n = (t[r] = { exports: {} });
			return e[r].call(n.exports, n, n.exports, i), n.exports;
		})(341);
	module.exports = i;
})();
