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
						getAdapter(e, t, n) {
							switch (e) {
								case "database":
									return this.adapterManager.getDatabaseAdapter(
										t,
										null != n && n
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
			779: (e, t, n) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.AgnostServerSideClient = void 0);
				const r = n(602),
					i = n(120),
					a = n(760),
					s = n(634);
				class o extends r.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					storage(e) {
						const t = this.managers.get(`storage-${e}`);
						if (t) return t;
						{
							const t = new i.Storage(this.metaManager, this.adapterManager, e);
							return this.managers.set(`storage-${e}`, t), t;
						}
					}
					queue(e) {
						const t = this.managers.get(`queue-${e}`);
						if (t) return t;
						{
							const t = new a.Queue(this.metaManager, this.adapterManager, e);
							return this.managers.set(`queue-${e}`, t), t;
						}
					}
					task(e) {
						const t = this.managers.get(`task-${e}`);
						if (t) return t;
						{
							const t = new s.Task(this.metaManager, this.adapterManager, e);
							return this.managers.set(`task-${e}`, t), t;
						}
					}
				}
				t.AgnostServerSideClient = o;
			},
			341: function (e, t, n) {
				var r =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, n, r) {
									void 0 === r && (r = n);
									var i = Object.getOwnPropertyDescriptor(t, n);
									(i &&
										!("get" in i
											? !t.__esModule
											: i.writable || i.configurable)) ||
										(i = {
											enumerable: !0,
											get: function () {
												return t[n];
											},
										}),
										Object.defineProperty(e, r, i);
							  }
							: function (e, t, n, r) {
									void 0 === r && (r = n), (e[r] = t[n]);
							  }),
					i =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var n in e)
								"default" === n ||
									Object.prototype.hasOwnProperty.call(t, n) ||
									r(t, e, n);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task =
						t.Queue =
						t.Storage =
						t.AgnostServerSideClient =
						t.APIBase =
						t.createServerSideClient =
							void 0);
				const a = n(602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return a.APIBase;
					},
				});
				const s = n(779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return s.AgnostServerSideClient;
					},
				});
				const o = n(120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return o.Storage;
					},
				});
				const u = n(760);
				Object.defineProperty(t, "Queue", {
					enumerable: !0,
					get: function () {
						return u.Queue;
					},
				});
				const d = n(634);
				Object.defineProperty(t, "Task", {
					enumerable: !0,
					get: function () {
						return d.Task;
					},
				}),
					(t.createServerSideClient = (e, t) =>
						new s.AgnostServerSideClient(e, t)),
					i(n(307), t);
			},
			760: function (e, t, n) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, n, r) {
						return new (n || (n = Promise))(function (i, a) {
							function s(e) {
								try {
									u(r.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof n
											? t
											: new n(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const i = n(602),
					a = n(990);
				class s extends i.APIBase {
					constructor(e, t, n) {
						if (
							(super(e, t),
							(this.name = n),
							(this.meta = this.getMetadata("queue", n)),
							!this.meta)
						)
							throw new a.ClientError(
								"queue_not_found",
								`Cannot find the queue object identified by name '${n}'`
							);
						if (
							((this.adapter = this.getAdapter("queue", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${n}'`
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
				t.Queue = s;
			},
			120: function (e, t, n) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, n, r) {
						return new (n || (n = Promise))(function (i, a) {
							function s(e) {
								try {
									u(r.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof n
											? t
											: new n(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const i = n(602),
					a = n(990),
					s = n(419);
				class o extends i.APIBase {
					constructor(e, t, n) {
						if (
							(super(e, t),
							(this.name = n),
							(this.meta = this.getMetadata("storage", n)),
							!this.meta)
						)
							throw new a.ClientError(
								"storage_not_found",
								`Cannot find the storage object identified by name '${n}'`
							);
						if (
							((this.adapter = this.getAdapter("storage", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the storage named '${n}'`
							);
					}
					createBucket(e, t = !0, n, i) {
						return r(this, void 0, void 0, function* () {
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
							if (n && !(0, s.isObject)(n))
								throw new a.ClientError(
									"invalid_value",
									"Bucket tags need to be a JSON object"
								);
							return yield this.adapter.createBucket(this.meta, e, t, n, i);
						});
					}
					listBuckets(e) {
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
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
						return r(this, void 0, void 0, function* () {
							return yield this.adapter.getStats(this.meta);
						});
					}
				}
				t.Storage = o;
			},
			634: function (e, t, n) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, n, r) {
						return new (n || (n = Promise))(function (i, a) {
							function s(e) {
								try {
									u(r.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(r.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof n
											? t
											: new n(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((r = r.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const i = n(602),
					a = n(990);
				class s extends i.APIBase {
					constructor(e, t, n) {
						if (
							(super(e, t),
							(this.name = n),
							(this.meta = this.getMetadata("task", n)),
							!this.meta)
						)
							throw new a.ClientError(
								"cronjob_not_found",
								`Cannot find the cron job object identified by name '${n}'`
							);
						if (
							((this.adapter = this.getAdapter("task", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${n}'`
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
				t.Task = s;
			},
			990: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ClientError = void 0);
				class n extends Error {
					constructor(e, t, n) {
						super(t),
							(this.origin = "client_error"),
							(this.code = e),
							(this.message = t),
							(this.details = n);
					}
				}
				t.ClientError = n;
			},
			419: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.isPositiveInteger =
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
					});
			},
			307: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
			},
		},
		t = {},
		n = (function n(r) {
			var i = t[r];
			if (void 0 !== i) return i.exports;
			var a = (t[r] = { exports: {} });
			return e[r].call(a.exports, a, a.exports, n), a.exports;
		})(341);
	module.exports = n;
})();
