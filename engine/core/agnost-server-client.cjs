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
						getAdapter(e, t, r) {
							switch (e) {
								case "database":
									return this.adapterManager.getDatabaseAdapter(
										t,
										null != r && r
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
			779: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.AgnostServerSideClient = void 0);
				const a = r(602),
					n = r(120),
					s = r(760),
					i = r(634);
				class o extends a.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					storage(e) {
						const t = this.managers.get(`storage-${e}`);
						if (t) return t;
						{
							const t = new n.Storage(this.metaManager, this.adapterManager, e);
							return this.managers.set(`storage-${e}`, t), t;
						}
					}
					queue(e) {
						const t = this.managers.get(`queue-${e}`);
						if (t) return t;
						{
							const t = new s.Queue(this.metaManager, this.adapterManager, e);
							return this.managers.set(`queue-${e}`, t), t;
						}
					}
					task(e) {
						const t = this.managers.get(`task-${e}`);
						if (t) return t;
						{
							const t = new i.Task(this.metaManager, this.adapterManager, e);
							return this.managers.set(`task-${e}`, t), t;
						}
					}
				}
				t.AgnostServerSideClient = o;
			},
			341: function (e, t, r) {
				var a =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, r, a) {
									void 0 === a && (a = r);
									var n = Object.getOwnPropertyDescriptor(t, r);
									(n &&
										!("get" in n
											? !t.__esModule
											: n.writable || n.configurable)) ||
										(n = {
											enumerable: !0,
											get: function () {
												return t[r];
											},
										}),
										Object.defineProperty(e, a, n);
							  }
							: function (e, t, r, a) {
									void 0 === a && (a = r), (e[a] = t[r]);
							  }),
					n =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var r in e)
								"default" === r ||
									Object.prototype.hasOwnProperty.call(t, r) ||
									a(t, e, r);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task =
						t.Queue =
						t.Storage =
						t.AgnostServerSideClient =
						t.APIBase =
						t.createServerSideClient =
							void 0);
				const s = r(602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return s.APIBase;
					},
				});
				const i = r(779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return i.AgnostServerSideClient;
					},
				});
				const o = r(120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return o.Storage;
					},
				});
				const u = r(760);
				Object.defineProperty(t, "Queue", {
					enumerable: !0,
					get: function () {
						return u.Queue;
					},
				});
				const d = r(634);
				Object.defineProperty(t, "Task", {
					enumerable: !0,
					get: function () {
						return d.Task;
					},
				}),
					(t.createServerSideClient = (e, t) =>
						new i.AgnostServerSideClient(e, t)),
					n(r(307), t);
			},
			760: function (e, t, r) {
				var a =
					(this && this.__awaiter) ||
					function (e, t, r, a) {
						return new (r || (r = Promise))(function (n, s) {
							function i(e) {
								try {
									u(a.next(e));
								} catch (e) {
									s(e);
								}
							}
							function o(e) {
								try {
									u(a.throw(e));
								} catch (e) {
									s(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? n(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(i, o);
							}
							u((a = a.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const n = r(602),
					s = r(990);
				class i extends n.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("queue", r)),
							!this.meta)
						)
							throw new s.ClientError(
								"queue_not_found",
								`Cannot find the queue object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("queue", this.name)),
							!this.adapter)
						)
							throw new s.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${r}'`
							);
					}
					submitMessage(e, t) {
						return a(this, void 0, void 0, function* () {
							return yield this.adapter.sendMessage(
								this.meta,
								e,
								null != t ? t : 0
							);
						});
					}
					getMessageStatus(e) {
						return a(this, void 0, void 0, function* () {
							return yield this.adapter.getMessageTrackingRecord(
								this.meta.iid,
								e
							);
						});
					}
				}
				t.Queue = i;
			},
			120: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const a = r(602),
					n = r(990);
				class s extends a.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("storage", r)),
							!this.meta)
						)
							throw new n.ClientError(
								"storage_not_found",
								`Cannot find the storage object identified by name '${r}'`
							);
					}
				}
				t.Storage = s;
			},
			634: function (e, t, r) {
				var a =
					(this && this.__awaiter) ||
					function (e, t, r, a) {
						return new (r || (r = Promise))(function (n, s) {
							function i(e) {
								try {
									u(a.next(e));
								} catch (e) {
									s(e);
								}
							}
							function o(e) {
								try {
									u(a.throw(e));
								} catch (e) {
									s(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? n(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(i, o);
							}
							u((a = a.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const n = r(602),
					s = r(990);
				class i extends n.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("task", r)),
							!this.meta)
						)
							throw new s.ClientError(
								"cronjob_not_found",
								`Cannot find the cron job object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("task", this.name)),
							!this.adapter)
						)
							throw new s.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${r}'`
							);
					}
					runOnce() {
						return a(this, void 0, void 0, function* () {
							return yield this.adapter.triggerCronJob(this.meta);
						});
					}
					getTaskStatus(e) {
						return a(this, void 0, void 0, function* () {
							return yield this.adapter.getTaskTrackingRecord(this.meta.iid, e);
						});
					}
				}
				t.Task = i;
			},
			990: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ClientError = void 0);
				class r extends Error {
					constructor(e, t, r) {
						super(t),
							(this.origin = "client_error"),
							(this.code = e),
							(this.message = t),
							(this.details = r);
					}
				}
				t.ClientError = r;
			},
			307: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
			},
		},
		t = {},
		r = (function r(a) {
			var n = t[a];
			if (void 0 !== n) return n.exports;
			var s = (t[a] = { exports: {} });
			return e[a].call(s.exports, s, s.exports, r), s.exports;
		})(341);
	module.exports = r;
})();
