(() => {
	"use strict";
	var e = {
			7602: (e, t) => {
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
								case "function":
									return this.metaManager.getFunctionByName(t);
								case "cache":
									return this.metaManager.getCacheByName(t);
								default:
									return null;
							}
						}
						getAdapter(e, t) {
							switch (e) {
								case "database":
									return this.adapterManager.getDatabaseAdapter2(t);
								case "queue":
									return this.adapterManager.getQueueAdapter(t);
								case "task":
									return this.adapterManager.getTaskAdapter(t);
								case "storage":
									return this.adapterManager.getStorageAdapter(t);
								case "function":
									return this.adapterManager.getFunctionAdapter();
								case "cache":
									return this.adapterManager.getCacheAdapter2(t);
								case "realtime":
									return this.adapterManager.getRealtimeAdapter();
								default:
									return null;
							}
						}
					});
			},
			2779: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.AgnostServerSideClient = void 0);
				const n = r(7602),
					i = r(6120),
					a = r(6760),
					s = r(9634),
					o = r(665),
					u = r(9949),
					l = r(2847),
					d = r(4079),
					c = r(9419),
					p = r(990);
				class h extends n.APIBase {
					constructor(e, t) {
						super(e, t), (this.managers = new Map());
					}
					clearClientCache() {
						this.managers.clear();
					}
					storage(e) {
						if (!(0, c.isString)(e))
							throw new p.ClientError(
								"invalid_value",
								"Storage name needs to be a string value"
							);
						const t = this.managers.get(`storage-${e}`);
						if (t) return t;
						{
							const t = new i.Storage(this.metaManager, this.adapterManager, e);
							return this.managers.set(`storage-${e}`, t), t;
						}
					}
					queue(e) {
						if (!(0, c.isString)(e))
							throw new p.ClientError(
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
						if (!(0, c.isString)(e))
							throw new p.ClientError(
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
						if (!(0, c.isString)(e))
							throw new p.ClientError(
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
					func(e) {
						if (!(0, c.isString)(e))
							throw new p.ClientError(
								"invalid_value",
								"Function name needs to be a string value"
							);
						const t = this.managers.get(`func-${e}`);
						if (t) return t;
						{
							const t = new u.Func(this.metaManager, this.adapterManager, e);
							return this.managers.set(`func-${e}`, t), t;
						}
					}
					cache(e) {
						if (!(0, c.isString)(e))
							throw new p.ClientError(
								"invalid_value",
								"Cache name needs to be a string value"
							);
						const t = this.managers.get(`cache-${e}`);
						if (t) return t;
						{
							const t = new d.Cache(this.metaManager, this.adapterManager, e);
							return this.managers.set(`cache-${e}`, t), t;
						}
					}
					get realtime() {
						const e = this.managers.get("realtime");
						if (e) return e;
						{
							const e = new l.Realtime(this.adapterManager);
							return this.managers.set("realtime", e), e;
						}
					}
				}
				t.AgnostServerSideClient = h;
			},
			6098: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Expression = void 0);
				const n = r(9307);
				t.Expression = class {
					getFunctionName() {
						return null;
					}
					getReturnType() {
						return n.ReturnType.UNDEFINED;
					}
					validate(e) {}
					validateForPull(e) {}
					hasJoinFieldValues() {
						return !1;
					}
					getReturnTypeText(e) {
						switch (e) {
							case n.ReturnType.NUMBER:
								return "numeric";
							case n.ReturnType.TEXT:
								return "string";
							case n.ReturnType.BOOLEAN:
								return "boolean";
							case n.ReturnType.OBJECT:
								return "object";
							case n.ReturnType.DATETIME:
								return "datetime";
							case n.ReturnType.NULL:
								return "null";
							case n.ReturnType.BINARY:
								return "binary";
							case n.ReturnType.JSON:
								return "json";
							case n.ReturnType.ID:
								return "id";
							case n.ReturnType.ARRAY:
								return "array";
							case n.ReturnType.GEOPOINT:
								return "geopoint";
							case n.ReturnType.UNDEFINED:
								return "undefined";
							case n.ReturnType.ANY:
								return "any";
							case n.ReturnType.PRIMITIVE:
								return "number, string, boolean or date";
							case n.ReturnType.DATE:
								return "date";
							case n.ReturnType.TIME:
								return "time";
							case n.ReturnType.STATICBOOLEAN:
								return "constant boolean";
							default:
								return e;
						}
					}
				};
			},
			7853: function (e, t, r) {
				var n =
					(this && this.__importDefault) ||
					function (e) {
						return e && e.__esModule ? e : { default: e };
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.FunctionManager = void 0);
				const i = n(r(5581)),
					a = n(r(7013)),
					s = n(r(3188)),
					o = n(r(9225)),
					u = n(r(9080)),
					l = n(r(4021)),
					d = n(r(2998)),
					c = n(r(273)),
					p = n(r(756)),
					h = n(r(2897)),
					f = n(r(9335)),
					y = n(r(711)),
					m = n(r(3510)),
					g = n(r(2327)),
					T = n(r(9674)),
					v = n(r(5850)),
					E = n(r(1946)),
					R = n(r(3115)),
					b = n(r(5616)),
					w = n(r(7934)),
					M = n(r(6489)),
					_ = n(r(2237)),
					O = n(r(9660)),
					P = n(r(3481)),
					$ = n(r(789)),
					B = n(r(6587)),
					S = n(r(7267)),
					D = n(r(6835)),
					A = n(r(5191)),
					Q = n(r(2115)),
					C = n(r(6509)),
					N = n(r(4207)),
					x = n(r(6032)),
					j = n(r(2228)),
					L = n(r(6683)),
					F = n(r(587)),
					I = n(r(5102)),
					Y = n(r(4175)),
					k = n(r(929)),
					U = n(r(1021)),
					V = n(r(1401)),
					G = n(r(6222)),
					q = n(r(5331)),
					J = n(r(3236)),
					X = n(r(2970)),
					K = n(r(6903)),
					W = n(r(1421)),
					H = n(r(8354)),
					z = n(r(9135)),
					Z = n(r(7665)),
					ee = n(r(3221)),
					te = n(r(6308)),
					re = n(r(2734)),
					ne = n(r(8374)),
					ie = n(r(6743)),
					ae = n(r(3725)),
					se = n(r(1357)),
					oe = n(r(2415)),
					ue = n(r(923)),
					le = n(r(8949)),
					de = n(r(6336)),
					ce = n(r(5365)),
					pe = n(r(4210)),
					he = n(r(4410)),
					fe = n(r(7821)),
					ye = n(r(4232)),
					me = n(r(4617)),
					ge = n(r(5160)),
					Te = n(r(1723)),
					ve = n(r(3057)),
					Ee = n(r(6923)),
					Re = n(r(8051)),
					be = n(r(4184)),
					we = n(r(6768)),
					Me = n(r(6735)),
					_e = n(r(107)),
					Oe = n(r(4997));
				t.FunctionManager = {
					$abs: i.default,
					$add: a.default,
					$and: s.default,
					$ceil: o.default,
					$charindex: u.default,
					$concat: l.default,
					$divide: d.default,
					$endswith: c.default,
					$eq: p.default,
					$exists: h.default,
					$floor: f.default,
					$gt: y.default,
					$gte: m.default,
					$in: g.default,
					$includes: T.default,
					$left: v.default,
					$length: E.default,
					$lower: R.default,
					$lt: b.default,
					$lte: w.default,
					$ltrim: M.default,
					$mod: _.default,
					$multiply: O.default,
					$neq: P.default,
					$nin: $.default,
					$not: B.default,
					$or: S.default,
					$right: D.default,
					$round: A.default,
					$rtrim: Q.default,
					$sqrt: C.default,
					$startswith: N.default,
					$substring: x.default,
					$subtract: j.default,
					$trim: L.default,
					$upper: F.default,
					$size: I.default,
					$exp: Y.default,
					$ln: k.default,
					$log: U.default,
					$log10: V.default,
					$pow: G.default,
					$sin: q.default,
					$cos: J.default,
					$tan: X.default,
					$sinh: K.default,
					$cosh: W.default,
					$tanh: H.default,
					$asin: z.default,
					$acos: Z.default,
					$atan: ee.default,
					$atan2: te.default,
					$asinh: re.default,
					$acosh: ne.default,
					$atanh: ie.default,
					$radians: ae.default,
					$degrees: se.default,
					$dateadd: oe.default,
					$datediff: ue.default,
					$hour: le.default,
					$minute: de.default,
					$second: ce.default,
					$year: pe.default,
					$month: he.default,
					$dayofmonth: fe.default,
					$dayofweek: ye.default,
					$dayofyear: me.default,
					$strtodate: ge.default,
					$now: Te.default,
					$todecimal: ve.default,
					$toboolean: Ee.default,
					$tointeger: Re.default,
					$todate: be.default,
					$tostring: we.default,
					$toobjectid: Me.default,
					$distance: _e.default,
					$point: Oe.default,
				};
			},
			5145: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Function = void 0);
				const n = r(6098),
					i = r(9307),
					a = r(990);
				class s extends n.Expression {
					constructor(e, t) {
						super(),
							(this.name = e),
							(this.definition = t),
							(this.parameters = []);
					}
					getFunctionName() {
						return this.name;
					}
					getExpressionType() {
						return i.ExpressionType.FUNCTION;
					}
					getReturnType() {
						return this.definition.returnType;
					}
					addParam(e) {
						this.parameters.push(e);
					}
					validate(e) {
						const t = this.parameters.length;
						if ("n/a" === this.definition.mapping[e])
							throw new a.ClientError(
								"unsupported_function",
								`Function '${this.name}' cannot be used to define queries in ${e} databases.`
							);
						if (-1 === this.definition.paramCount && t < 2)
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${this.name}' expects at least two input parameters.`
							);
						if (
							t !== this.definition.paramCount &&
							-1 !== this.definition.paramCount &&
							"now" !== this.name
						)
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${this.name}' expects ${this.definition.paramCount} input parameter(s) but received ${t}.`
							);
						for (let t = 0; t < this.parameters.length; t++) {
							const r = this.parameters[t],
								n = r.getReturnType(),
								s = Array.isArray(this.definition.params)
									? this.definition.params[t]
									: this.definition.params;
							if (
								s !== i.ReturnType.ANY &&
								((s !== i.ReturnType.DATE && s !== i.ReturnType.DATETIME) ||
									(n !== i.ReturnType.DATE && n !== i.ReturnType.DATETIME))
							) {
								if (s === i.ReturnType.PRIMITIVE) {
									if (
										[
											i.ReturnType.OBJECT,
											i.ReturnType.ARRAY,
											i.ReturnType.BINARY,
											i.ReturnType.JSON,
										].includes(n)
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a '${this.getReturnTypeText(
												s
											)}' input for parameter #${
												t + 1
											} but received '${this.getReturnTypeText(n)}'.`
										);
								} else if (s === i.ReturnType.STATICBOOLEAN) {
									if (
										n !== i.ReturnType.BOOLEAN &&
										r.getExpressionType() !== i.ExpressionType.STATIC
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a 'constant boolean' input for parameter #${
												t + 1
											} but received ${this.getReturnTypeText(n)}.`
										);
								} else if (s !== n)
									throw new a.ClientError(
										"invalid_parameter",
										`Function '${
											this.name
										}' expects a '${this.getReturnTypeText(
											s
										)}' input for parameter #${
											t + 1
										} but received '${this.getReturnTypeText(n)}'.`
									);
								r.validate(e);
							}
						}
					}
					validateForPull(e) {
						if (!i.UpdatePullFunctions.includes(`$${this.name}`))
							throw new a.ClientError(
								"unsupported_function",
								`Function '${this.name}' cannot be used to define $pull update queries.`
							);
						const t = this.parameters.length;
						if ("n/a" === this.definition.mapping[e])
							throw new a.ClientError(
								"unsupported_function",
								`Function '${this.name}' cannot be used to define queries in ${e} databases.`
							);
						if (-1 === this.definition.paramCount && t < 2)
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${this.name}' expects at least two input parameters.`
							);
						if (
							t !== this.definition.paramCount &&
							-1 !== this.definition.paramCount
						)
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${this.name}' expects ${this.definition.paramCount} input parameter(s) but received ${t}.`
							);
						for (let t = 0; t < this.parameters.length; t++) {
							const r = this.parameters[t],
								n = r.getReturnType(),
								s = Array.isArray(this.definition.params)
									? this.definition.params[t]
									: this.definition.params;
							if (
								(0 !== t ||
									(r.getExpressionType() !== i.ExpressionType.FIELD &&
										r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD)) &&
								s !== i.ReturnType.ANY
							) {
								if (s === i.ReturnType.PRIMITIVE) {
									if (
										[
											i.ReturnType.OBJECT,
											i.ReturnType.ARRAY,
											i.ReturnType.BINARY,
											i.ReturnType.JSON,
										].includes(n)
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a '${this.getReturnTypeText(
												s
											)}' input for parameter #${
												t + 1
											} but received '${this.getReturnTypeText(n)}'.`
										);
								} else if (s === i.ReturnType.STATICBOOLEAN) {
									if (
										n !== i.ReturnType.BOOLEAN &&
										r.getExpressionType() !== i.ExpressionType.STATIC
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a 'constant boolean' input for parameter #${
												t + 1
											} but received ${this.getReturnTypeText(n)}.`
										);
								} else if (s !== n)
									throw new a.ClientError(
										"invalid_parameter",
										`Function '${
											this.name
										}' expects a '${this.getReturnTypeText(
											s
										)}' input for parameter #${
											t + 1
										} but received '${this.getReturnTypeText(n)}'.`
									);
								r.validateForPull(e);
							}
						}
					}
					getQuery(e, t) {
						const r = this.definition.mapping[e];
						switch (e) {
							case i.DBTYPE.MONGODB:
								if (1 === this.parameters.length)
									return { [r]: this.parameters[0].getQuery(e, t) };
								{
									const n = [];
									for (const r of this.parameters) n.push(r.getQuery(e, t));
									return { [r]: n };
								}
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL: {
								const n = [];
								for (const r of this.parameters) n.push(r.getQuery(e, t));
								return `${r}(${n.join(", ")})`;
							}
							default:
								return null;
						}
					}
					getPullQuery(e, t) {
						if (e === i.DBTYPE.MONGODB) {
							const r = this.definition.mapping[e];
							if (1 === this.parameters.length)
								return { [r]: this.parameters[0].getPullQuery(e, t) };
							{
								const n = [];
								for (const r of this.parameters) n.push(r.getPullQuery(e, t));
								return { [r]: n };
							}
						}
						return null;
					}
					hasJoinFieldValues() {
						for (const e of this.parameters)
							if (e.hasJoinFieldValues()) return !0;
						return !1;
					}
				}
				t.Function = s;
			},
			5581: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("abs", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$abs", PostgreSQL: "ABS", MySQL: "ABS" },
						});
					}
				}
				t.default = a;
			},
			7665: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("acos", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$acos", PostgreSQL: "ACOS", MySQL: "ACOS" },
						});
					}
				}
				t.default = a;
			},
			8374: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("acosh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$acosh", PostgreSQL: "ACOSH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			7013: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("add", {
							paramCount: -1,
							returnType: i.ReturnType.NUMBER,
							params: i.ReturnType.NUMBER,
							mapping: { MongoDB: "$add", PostgreSQL: "+", MySQL: "+" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r.join(" + ")})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			3188: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("and", {
							paramCount: -1,
							returnType: i.ReturnType.BOOLEAN,
							params: i.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$and", PostgreSQL: "AND", MySQL: "AND" },
						});
					}
					getPullQuery(e, t) {
						if (t) {
							const r = [];
							for (const n of this.parameters) r.push(n.getPullQuery(e, t));
							return Object.assign({}, ...r);
						}
						return super.getPullQuery(e, t);
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r.join(" AND ")})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			9135: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("asin", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$asin", PostgreSQL: "ASIN", MySQL: "ASIN" },
						});
					}
				}
				t.default = a;
			},
			2734: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("asinh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$asinh", PostgreSQL: "ASINH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			3221: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("atan", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$atan", PostgreSQL: "ATAN", MySQL: "ATAN" },
						});
					}
				}
				t.default = a;
			},
			6308: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("atan2", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$atan2",
								PostgreSQL: "ATAN2",
								MySQL: "ATAN2",
							},
						});
					}
				}
				t.default = a;
			},
			6743: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("atanh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$atanh", PostgreSQL: "ATANH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			9225: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("ceil", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$ceil", PostgreSQL: "CEIL", MySQL: "CEIL" },
						});
					}
				}
				t.default = a;
			},
			9080: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("charIndex", {
							paramCount: 3,
							returnType: i.ReturnType.NUMBER,
							params: [
								i.ReturnType.TEXT,
								i.ReturnType.TEXT,
								i.ReturnType.NUMBER,
							],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return this.parameters[2]
									? {
											$indexOfCP: [
												this.parameters[0].getQuery(e, t),
												this.parameters[1].getQuery(e, t),
												this.parameters[2].getQuery(e, t),
											],
									  }
									: {
											$indexOfCP: [
												this.parameters[0].getQuery(e, t),
												this.parameters[1].getQuery(e, t),
											],
									  };
							case i.DBTYPE.MYSQL:
								return this.parameters[2]
									? `CASE \n          WHEN ${this.parameters[0].getQuery(
											e,
											t
									  )} IS NULL OR ${this.parameters[1].getQuery(
											e,
											t
									  )} IS NULL THEN -1\n          ELSE LOCATE(${this.parameters[1].getQuery(
											e,
											t
									  )}, ${this.parameters[0].getQuery(
											e,
											t
									  )}, (${this.parameters[2].getQuery(
											e,
											t
									  )} + 1)) - 1\n      END`
									: `CASE \n          WHEN ${this.parameters[0].getQuery(
											e,
											t
									  )} IS NULL OR ${this.parameters[1].getQuery(
											e,
											t
									  )} IS NULL THEN -1\n          ELSE LOCATE(${this.parameters[1].getQuery(
											e,
											t
									  )}, ${this.parameters[0].getQuery(e, t)}) - 1\n      END`;
							case i.DBTYPE.POSTGRESQL:
								return this.parameters[2]
									? `POSITION(${this.parameters[1].getQuery(
											e,
											t
									  )} IN SUBSTRING(${this.parameters[0].getQuery(
											e,
											t
									  )} FROM (${this.parameters[2].getQuery(e, t)} + 1))) - 1`
									: `POSITION(${this.parameters[1].getQuery(
											e,
											t
									  )} IN ${this.parameters[0].getQuery(e, t)}) - 1`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			4021: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("concat", {
							paramCount: -1,
							returnType: i.ReturnType.TEXT,
							params: i.ReturnType.PRIMITIVE,
							mapping: {
								MongoDB: "$concat",
								PostgreSQL: "||",
								MySQL: "CONCAT",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r.join(" || ")})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			3236: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("cos", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$cos", PostgreSQL: "COS", MySQL: "COS" },
						});
					}
				}
				t.default = a;
			},
			1421: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("cosh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$cosh", PostgreSQL: "COSH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			2415: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("dateAdd", {
							paramCount: 3,
							returnType: i.ReturnType.DATE,
							params: [
								i.ReturnType.DATE,
								i.ReturnType.NUMBER,
								i.ReturnType.TEXT,
							],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "TIMESTAMPADD",
							},
						});
					}
					validate(e) {
						super.validate(e);
						const t = [
								"year",
								"quarter",
								"week",
								"month",
								"day",
								"hour",
								"minute",
								"second",
							],
							r = this.parameters[2]
								.getQuery(e)
								.replaceAll("'", "")
								.toLowerCase();
						if (!t.includes(r))
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${
									this.name
								}' expects unit of measure parameter either one of the following '${t.join(
									", "
								)}'.`
							);
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$dateAdd: {
										startDate: this.parameters[0].getQuery(e, t),
										amount: this.parameters[1].getQuery(e, t),
										unit: this.parameters[2].getQuery(e, t),
									},
								};
							case i.DBTYPE.POSTGRESQL: {
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r[0]}::TIMESTAMP + (${
									r[1]
								} || ' ' || ${r[2].toUpperCase()})::INTERVAL)`;
							}
							case i.DBTYPE.MYSQL: {
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `TIMESTAMPADD(${r[2]
									.replaceAll("'", "")
									.toUpperCase()}, ${r[1]}, ${r[0]})`;
							}
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			923: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("dateDiff", {
							paramCount: 3,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE, i.ReturnType.DATE, i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "TIMESTAMPDIFF",
							},
						});
					}
					validate(e) {
						super.validate(e);
						const t = [
								"year",
								"quarter",
								"week",
								"month",
								"day",
								"hour",
								"minute",
								"second",
							],
							r = this.parameters[2]
								.getQuery(e)
								.replaceAll("'", "")
								.toLowerCase();
						if (!t.includes(r))
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${
									this.name
								}' expects unit of measure parameter either one of the following '${t.join(
									", "
								)}'.`
							);
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$dateDiff: {
										startDate: this.parameters[0].getQuery(e, t),
										endDate: this.parameters[1].getQuery(e, t),
										unit: this.parameters[2].getQuery(e, t),
									},
								};
							case i.DBTYPE.POSTGRESQL: {
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								switch (
									this.parameters[2]
										.getQuery(e)
										.replaceAll("'", "")
										.toLowerCase()
								) {
									case "year":
										return `EXTRACT(YEAR FROM AGE(${r[1]}::TIMESTAMP, ${r[0]}::TIMESTAMP))`;
									case "quarter":
										return `FLOOR((EXTRACT(YEAR FROM AGE(${r[1]}::TIMESTAMP, ${r[0]}::TIMESTAMP)) * 12 + EXTRACT(MONTH FROM AGE( ${r[1]}::TIMESTAMP,  ${r[0]}::TIMESTAMP)))/3)`;
									case "week":
										return `FLOOR(EXTRACT(EPOCH FROM (${r[1]}::TIMESTAMP - ${r[0]}::TIMESTAMP)) / (60*60*24*7))`;
									case "month":
										return `(EXTRACT(YEAR FROM AGE(${r[1]}::TIMESTAMP, ${r[0]}::TIMESTAMP)) * 12 + EXTRACT(MONTH FROM AGE(${r[1]}::TIMESTAMP, ${r[0]}::TIMESTAMP)))`;
									case "day":
										return `EXTRACT(DAY FROM (${r[1]}::TIMESTAMP - ${r[0]}::TIMESTAMP))`;
									case "hour":
										return `FLOOR(EXTRACT(EPOCH FROM (${r[1]}::TIMESTAMP - ${r[0]}::TIMESTAMP)) / (60*60))`;
									case "minute":
										return `FLOOR(EXTRACT(EPOCH FROM (${r[1]}::TIMESTAMP - ${r[0]}::TIMESTAMP)) / 60)`;
									case "second":
										return `FLOOR(EXTRACT(EPOCH FROM (${r[1]}::TIMESTAMP - ${r[0]}::TIMESTAMP)))`;
									default:
										return null;
								}
							}
							case i.DBTYPE.MYSQL: {
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `TIMESTAMPDIFF(${r[2]
									.replaceAll("'", "")
									.toUpperCase()}, ${r[0]}, ${r[1]})`;
							}
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			7821: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("dayOfMonth", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$dayOfMonth",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(DAY FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::DATE)`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(DAY FROM ${this.parameters[0].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			4232: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("dayOfWeek", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$dayOfWeek",
								PostgreSQL: "$custom",
								MySQL: "DAYOFWEEK",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `(EXTRACT(DOW FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::DATE) + 1)`;
							case i.DBTYPE.MYSQL:
								return `DAYOFWEEK(${this.parameters[0].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			4617: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("dayOfYear", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$dayOfYear",
								PostgreSQL: "$custom",
								MySQL: "DAYOFYEAR",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(DOY FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::DATE)`;
							case i.DBTYPE.MYSQL:
								return `DAYOFYEAR(${this.parameters[0].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			1357: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("degrees", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$radiansToDegrees",
								PostgreSQL: "DEGREES",
								MySQL: "DEGREES",
							},
						});
					}
				}
				t.default = a;
			},
			107: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("distance", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.GEOPOINT, i.ReturnType.GEOPOINT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getCoordinates(e) {
						return !1 === Array.isArray(e) && "object" == typeof e
							? e.coordinates
							: e + ".coordinates";
					}
					getQuery(e, t) {
						const r = this.parameters[0].getQuery(e, t),
							n = this.parameters[1].getQuery(e, t);
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$let: {
										vars: {
											lon1: { $arrayElemAt: [this.getCoordinates(r), 0] },
											lat1: { $arrayElemAt: [this.getCoordinates(r), 1] },
											lon2: { $arrayElemAt: [this.getCoordinates(n), 0] },
											lat2: { $arrayElemAt: [this.getCoordinates(n), 1] },
											pi: 3.141592653589793,
											multiplier: 1e3,
										},
										in: {
											$multiply: [
												{
													$multiply: [
														2,
														{
															$atan2: [
																{
																	$sqrt: {
																		$add: [
																			{
																				$pow: [
																					{
																						$sin: {
																							$divide: [
																								{
																									$divide: [
																										{
																											$multiply: [
																												{
																													$subtract: [
																														"$$lat2",
																														"$$lat1",
																													],
																												},
																												"$$pi",
																											],
																										},
																										180,
																									],
																								},
																								2,
																							],
																						},
																					},
																					2,
																				],
																			},
																			{
																				$multiply: [
																					{
																						$multiply: [
																							{
																								$cos: {
																									$divide: [
																										{
																											$multiply: [
																												"$$lat1",
																												"$$pi",
																											],
																										},
																										180,
																									],
																								},
																							},
																							{
																								$cos: {
																									$divide: [
																										{
																											$multiply: [
																												"$$lat2",
																												"$$pi",
																											],
																										},
																										180,
																									],
																								},
																							},
																						],
																					},
																					{
																						$pow: [
																							{
																								$sin: {
																									$divide: [
																										{
																											$divide: [
																												{
																													$multiply: [
																														{
																															$subtract: [
																																"$$lon2",
																																"$$lon1",
																															],
																														},
																														"$$pi",
																													],
																												},
																												180,
																											],
																										},
																										2,
																									],
																								},
																							},
																							2,
																						],
																					},
																				],
																			},
																		],
																	},
																},
																{
																	$sqrt: {
																		$subtract: [
																			1,
																			{
																				$add: [
																					{
																						$pow: [
																							{
																								$sin: {
																									$divide: [
																										{
																											$divide: [
																												{
																													$multiply: [
																														{
																															$subtract: [
																																"$$lat2",
																																"$$lat1",
																															],
																														},
																														"$$pi",
																													],
																												},
																												180,
																											],
																										},
																										2,
																									],
																								},
																							},
																							2,
																						],
																					},
																					{
																						$multiply: [
																							{
																								$multiply: [
																									{
																										$cos: {
																											$divide: [
																												{
																													$multiply: [
																														"$$lat1",
																														"$$pi",
																													],
																												},
																												180,
																											],
																										},
																									},
																									{
																										$cos: {
																											$divide: [
																												{
																													$multiply: [
																														"$$lat2",
																														"$$pi",
																													],
																												},
																												180,
																											],
																										},
																									},
																								],
																							},
																							{
																								$pow: [
																									{
																										$sin: {
																											$divide: [
																												{
																													$divide: [
																														{
																															$multiply: [
																																{
																																	$subtract: [
																																		"$$lon2",
																																		"$$lon1",
																																	],
																																},
																																"$$pi",
																															],
																														},
																														180,
																													],
																												},
																												2,
																											],
																										},
																									},
																									2,
																								],
																							},
																						],
																					},
																				],
																			},
																		],
																	},
																},
															],
														},
													],
												},
												"$$multiplier",
											],
										},
									},
								};
							case i.DBTYPE.POSTGRESQL:
								return `(6371008.8 * 2 * ASIN(\n\t\t\t\t\tSQRT(\n\t\t\t\t\t\tPOW(SIN(RADIANS((${n}::POINT)[1] - (${r}::POINT)[1]) / 2), 2) +\n\t\t\t\t\t\tCOS(RADIANS((${r}::POINT)[1])) * COS(RADIANS((${n}::POINT)[1])) *\n\t\t\t\t\t\tPOW(SIN(RADIANS((${n}::POINT)[0] - (${r}::POINT)[0]) / 2), 2)\n\t\t\t\t\t)\n\t\t\t\t))`;
							case i.DBTYPE.MYSQL:
								return `ST_Distance_Sphere(${r}, ${n})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			2998: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("divide", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: { MongoDB: "$divide", PostgreSQL: "/", MySQL: "/" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r[0]} / ${r[1]})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			273: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("endsWith", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.TEXT, i.ReturnType.PRIMITIVE],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$cond: {
										if: {
											$lt: [
												{
													$subtract: [
														{ $strLenCP: this.parameters[0].getQuery(e, t) },
														{ $strLenCP: this.parameters[1].getQuery(e, t) },
													],
												},
												0,
											],
										},
										then: !1,
										else: {
											$eq: [
												{
													$indexOfCP: [
														this.parameters[0].getQuery(e, t),
														this.parameters[1].getQuery(e, t),
														{
															$subtract: [
																{
																	$strLenCP: this.parameters[0].getQuery(e, t),
																},
																{
																	$strLenCP: this.parameters[1].getQuery(e, t),
																},
															],
														},
													],
												},
												{
													$subtract: [
														{ $strLenCP: this.parameters[0].getQuery(e, t) },
														{ $strLenCP: this.parameters[1].getQuery(e, t) },
													],
												},
											],
										},
									},
								};
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} LIKE '%' || ${this.parameters[1].getQuery(e, t)}`;
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} LIKE CONCAT('%', ${this.parameters[1].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			756: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("eq", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$eq", PostgreSQL: "=", MySQL: "=" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? this.parameters[1].getPullQuery(e, t)
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$eq: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return (
									console.log(
										"****getQuery",
										this.parameters[0].getQuery(e, t)
									),
									console.log(
										"****getQuery",
										this.parameters[1].getQuery(e, t)
									),
									`${this.parameters[0].getQuery(
										e,
										t
									)} = ${this.parameters[1].getQuery(e, t)}`
								);
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			2897: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("exists", {
							paramCount: 1,
							returnType: i.ReturnType.BOOLEAN,
							params: i.ReturnType.ANY,
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "EXISTS",
								MySQL: "EXISTS",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$ne: [
										{ $type: this.parameters[0].getQuery(e, t) },
										"missing",
									],
								};
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = this.parameters[0].getQuery(e, t);
								return r.startsWith("'") && r.endsWith("'")
									? `EXISTS(${r.slice(1, -1)})`
									: `EXISTS(${r})`;
							default:
								return null;
						}
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $exists: !0 }
							: { [this.parameters[0].getPullQuery(e, t)]: { $exists: !0 } };
					}
				}
				t.default = s;
			},
			4175: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("exp", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$exp", PostgreSQL: "EXP", MySQL: "EXP" },
						});
					}
				}
				t.default = a;
			},
			9335: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("floor", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$floor",
								PostgreSQL: "FLOOR",
								MySQL: "FLOOR",
							},
						});
					}
				}
				t.default = a;
			},
			711: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("gt", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$gt", PostgreSQL: ">", MySQL: ">" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $gt: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$gt: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} > ${this.parameters[1].getQuery(e, t)}`;
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			3510: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("gte", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$gte", PostgreSQL: ">=", MySQL: ">=" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $gte: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$gte: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} >= ${this.parameters[1].getQuery(e, t)}`;
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			8949: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("hour", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$hour",
								PostgreSQL: "EXTRACT",
								MySQL: "EXTRACT",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(HOUR FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::TIMESTAMP)`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(HOUR FROM ${this.parameters[0].getQuery(
									e,
									t
								)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			2327: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("in", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.ARRAY],
							mapping: { MongoDB: "$custom", PostgreSQL: "IN", MySQL: "IN" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$in: [
										this.parameters[0].getQuery(e, t),
										{ $ifNull: [this.parameters[1].getQuery(e, t), []] },
									],
								};
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} IN (${this.parameters[1].getQuery(e, t)})`;
							default:
								return null;
						}
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $in: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$in: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
				}
				t.default = s;
			},
			9674: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("includes", {
							paramCount: 3,
							returnType: i.ReturnType.BOOLEAN,
							params: [
								i.ReturnType.TEXT,
								i.ReturnType.TEXT,
								i.ReturnType.STATICBOOLEAN,
							],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$regexMatch: {
										input: this.parameters[0].getQuery(e, t),
										regex: this.parameters[1].getQuery(e, t),
										options:
											!1 === this.parameters[2].getQuery(e, t) ? "i" : void 0,
									},
								};
							case i.DBTYPE.POSTGRESQL:
								return !1 === this.parameters[2].getQuery(e, t)
									? `${this.parameters[0].getQuery(
											e,
											t
									  )} ILIKE '%' || ${this.parameters[1].getQuery(e, t)} || '%'`
									: `${this.parameters[0].getQuery(
											e,
											t
									  )} LIKE '%' || ${this.parameters[1].getQuery(e, t)} || '%'`;
							case i.DBTYPE.MYSQL:
								return 0 === this.parameters[2].getQuery(e, t)
									? `LOWER(${this.parameters[0].getQuery(
											e,
											t
									  )}) LIKE LOWER(CONCAT('%', ${this.parameters[1].getQuery(
											e,
											t
									  )}, '%'))`
									: `${this.parameters[0].getQuery(
											e,
											t
									  )} LIKE CONCAT('%', ${this.parameters[1].getQuery(
											e,
											t
									  )}, '%')`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			5850: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("left", {
							paramCount: 2,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT, i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "LEFT",
								MySQL: "LEFT",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$substrCP: [
										this.parameters[0].getQuery(e, t),
										0,
										this.parameters[1].getQuery(e, t),
									],
								};
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			1946: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("length", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$strLenCP",
								PostgreSQL: "CHAR_LENGTH",
								MySQL: "CHAR_LENGTH",
							},
						});
					}
				}
				t.default = a;
			},
			929: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("ln", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$ln", PostgreSQL: "LN", MySQL: "LN" },
						});
					}
				}
				t.default = a;
			},
			1021: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("log", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: { MongoDB: "$log", PostgreSQL: "LOG", MySQL: "n/a" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `LOG(${r[1]}, ${r[0]})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			1401: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("log10", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$log10",
								PostgreSQL: "LOG10",
								MySQL: "LOG10",
							},
						});
					}
				}
				t.default = a;
			},
			3115: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("lower", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$toLower",
								PostgreSQL: "LOWER",
								MySQL: "LOWER",
							},
						});
					}
				}
				t.default = a;
			},
			5616: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("lt", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$lt", PostgreSQL: "<", MySQL: "<" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $lt: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$lt: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} < ${this.parameters[1].getQuery(e, t)}`;
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			7934: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("lte", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$lte", PostgreSQL: "<=", MySQL: "<=" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $lte: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$lte: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} <= ${this.parameters[1].getQuery(e, t)}`;
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			6489: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("ltrim", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "LTRIM",
								MySQL: "LTRIM",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return { $ltrim: { input: this.parameters[0].getQuery(e, t) } };
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			6336: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("minute", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$minute",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(MINUTE FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::TIMESTAMP)`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(MINUTE FROM ${this.parameters[0].getQuery(
									e,
									t
								)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			2237: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("mod", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: { MongoDB: "$mod", PostgreSQL: "MOD", MySQL: "MOD" },
						});
					}
				}
				t.default = a;
			},
			4410: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("month", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$month",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(MONTH FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::DATE)`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(MONTH FROM ${this.parameters[0].getQuery(
									e,
									t
								)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			9660: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("multiply", {
							paramCount: -1,
							returnType: i.ReturnType.NUMBER,
							params: i.ReturnType.NUMBER,
							mapping: { MongoDB: "$multiply", PostgreSQL: "*", MySQL: "*" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r.join(" * ")})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			3481: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("neq", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$ne", PostgreSQL: "!=", MySQL: "!=" },
						});
					}
					validate(e) {
						super.validate(e);
						const t = this.parameters[0],
							r = this.parameters[1];
						if (
							!(
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.NUMBER) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.NUMBER) ||
								(t.getReturnType() === i.ReturnType.ID &&
									r.getReturnType() === i.ReturnType.TEXT) ||
								(r.getReturnType() === i.ReturnType.ID &&
									t.getReturnType() === i.ReturnType.TEXT)
							) &&
							((t.getReturnType() !== i.ReturnType.DATE &&
								t.getReturnType() !== i.ReturnType.DATETIME) ||
								(r.getReturnType() !== i.ReturnType.DATE &&
									r.getReturnType() !== i.ReturnType.DATETIME)) &&
							t.getReturnType() !== r.getReturnType()
						)
							throw new a.ClientError(
								"invalid_field",
								`The first and second parameters of the '${this.name}' function needs to have the same return type.`
							);
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $ne: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$ne: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} != ${this.parameters[1].getQuery(e, t)}`;
							default:
								return null;
						}
					}
				}
				t.default = s;
			},
			789: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307),
					a = r(990);
				class s extends n.Function {
					constructor() {
						super("nin", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.PRIMITIVE, i.ReturnType.ARRAY],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "NOT IN",
								MySQL: "NOT IN",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$not: [
										{
											$in: [
												this.parameters[0].getQuery(e, t),
												{ $ifNull: [this.parameters[1].getQuery(e, t), []] },
											],
										},
									],
								};
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} NOT IN (${this.parameters[1].getQuery(e, t)})`;
							default:
								return null;
						}
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== i.ExpressionType.FIELD &&
							t.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== i.ExpressionType.STATIC &&
							r.getExpressionType() !== i.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_value",
								`The second parameter of the '${this.name}' function when used for a $pull update operation or array filter condition can only be a static value (e.g., number, text, boolean)`
							);
					}
					getPullQuery(e, t) {
						return t
							? { $nin: this.parameters[1].getPullQuery(e, t) }
							: {
									[this.parameters[0].getPullQuery(e, t)]: {
										$nin: this.parameters[1].getPullQuery(e, t),
									},
							  };
					}
				}
				t.default = s;
			},
			6587: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("not", {
							paramCount: 1,
							returnType: i.ReturnType.BOOLEAN,
							params: i.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$not", PostgreSQL: "NOT", MySQL: "NOT" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `NOT (${this.parameters[0].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			1723: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("now", {
							paramCount: 0,
							returnType: i.ReturnType.DATETIME,
							params: i.ReturnType.ANY,
							mapping: {
								MongoDB: "$currentDate",
								PostgreSQL: "NOW",
								MySQL: "NOW",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return { $currentDate: { format: "iso" } };
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return "NOW()";
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			7267: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("or", {
							paramCount: -1,
							returnType: i.ReturnType.BOOLEAN,
							params: i.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$or", PostgreSQL: "OR", MySQL: "OR" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r.join(" OR ")})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			4997: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("point", {
							paramCount: 2,
							returnType: i.ReturnType.GEOPOINT,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									type: "Point",
									coordinates: [
										this.parameters[0].getQuery(e, t),
										this.parameters[1].getQuery(e, t),
									],
								};
							case i.DBTYPE.POSTGRESQL:
								return `'${this.parameters[0].getQuery(
									e,
									t
								)},${this.parameters[1].getQuery(e, t)}'::POINT`;
							case i.DBTYPE.MYSQL:
								return `POINT(${this.parameters[0].getQuery(
									e,
									t
								)} ${this.parameters[1].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			6222: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("pow", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: { MongoDB: "$pow", PostgreSQL: "POW", MySQL: "POW" },
						});
					}
				}
				t.default = a;
			},
			3725: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("radians", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$degreesToRadians",
								PostgreSQL: "RADIANS",
								MySQL: "RADIANS",
							},
						});
					}
				}
				t.default = a;
			},
			6835: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("right", {
							paramCount: 2,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT, i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "RIGHT",
								MySQL: "RIGHT",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$cond: {
										if: {
											$gt: [
												this.parameters[1].getQuery(e, t),
												{ $strLenCP: this.parameters[0].getQuery(e, t) },
											],
										},
										then: this.parameters[0].getQuery(e, t),
										else: {
											$substrCP: [
												this.parameters[0].getQuery(e, t),
												{
													$subtract: [
														{ $strLenCP: this.parameters[0].getQuery(e, t) },
														this.parameters[1].getQuery(e, t),
													],
												},
												this.parameters[1].getQuery(e, t),
											],
										},
									},
								};
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			5191: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("round", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: {
								MongoDB: "$round",
								PostgreSQL: "ROUND",
								MySQL: "ROUND",
							},
						});
					}
				}
				t.default = a;
			},
			2115: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("rtrim", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "RTRIM",
								MySQL: "RTRIM",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return { $rtrim: { input: this.parameters[0].getQuery(e, t) } };
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			5365: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("second", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$second",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `FLOOR(EXTRACT(SECOND FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::TIMESTAMP))`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(SECOND FROM ${this.parameters[0].getQuery(
									e,
									t
								)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			5331: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("sin", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$sin", PostgreSQL: "SIN", MySQL: "SIN" },
						});
					}
				}
				t.default = a;
			},
			6903: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("sinh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$sinh", PostgreSQL: "SINH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			5102: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("size", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.ARRAY],
							mapping: { MongoDB: "$custom", PostgreSQL: "n/a", MySQL: "n/a" },
						});
					}
					getQuery(e, t) {
						if (e === i.DBTYPE.MONGODB)
							return {
								$size: { $ifNull: [this.parameters[0].getQuery(e, t), []] },
							};
					}
				}
				t.default = a;
			},
			6509: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("sqrt", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$sqrt", PostgreSQL: "SQRT", MySQL: "SQRT" },
						});
					}
				}
				t.default = a;
			},
			4207: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("startsWith", {
							paramCount: 2,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.TEXT, i.ReturnType.PRIMITIVE],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$eq: [
										{
											$indexOfCP: [
												this.parameters[0].getQuery(e, t),
												this.parameters[1].getQuery(e, t),
											],
										},
										0,
									],
								};
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} LIKE ${this.parameters[1].getQuery(e, t)} || '%'`;
							case i.DBTYPE.MYSQL:
								return `${this.parameters[0].getQuery(
									e,
									t
								)} LIKE CONCAT(${this.parameters[1].getQuery(e, t)}, '%')`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			5160: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("strToDate", {
							paramCount: 1,
							returnType: i.ReturnType.DATE,
							params: i.ReturnType.TEXT,
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "TO_TIMESTAMP",
								MySQL: "STR_TO_DATE",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return {
									$dateFromString: {
										dateString: this.parameters[0].getQuery(e, t),
										format: "%Y-%m-%d %H:%M:%S",
									},
								};
							case i.DBTYPE.POSTGRESQL:
								return `TO_TIMESTAMP(${this.parameters[0].getQuery(
									e,
									t
								)}, 'YYYY-MM-DD HH24:MI:SS')::TIMESTAMP`;
							case i.DBTYPE.MYSQL:
								return `STR_TO_DATE(${this.parameters[0].getQuery(
									e,
									t
								)}, '%Y-%m-%d %H:%i:%s')`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			6032: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("substring", {
							paramCount: 3,
							returnType: i.ReturnType.TEXT,
							params: [
								i.ReturnType.TEXT,
								i.ReturnType.NUMBER,
								i.ReturnType.NUMBER,
							],
							mapping: {
								MongoDB: "$substrCP",
								PostgreSQL: "SUBSTRING",
								MySQL: "SUBSTRING",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `SUBSTRING(${this.parameters[0].getQuery(
									e,
									t
								)} FROM ${this.parameters[1].getQuery(
									e,
									t
								)} + 1 FOR ${this.parameters[2].getQuery(e, t)})`;
							case i.DBTYPE.MYSQL:
								return `SUBSTRING(${this.parameters[0].getQuery(
									e,
									t
								)}, ${this.parameters[1].getQuery(
									e,
									t
								)} + 1, ${this.parameters[2].getQuery(e, t)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			2228: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("subtract", {
							paramCount: 2,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER, i.ReturnType.NUMBER],
							mapping: { MongoDB: "$subtract", PostgreSQL: "-", MySQL: "-" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								const r = [];
								for (const n of this.parameters) r.push(n.getQuery(e, t));
								return `(${r[0]} - ${r[1]})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			2970: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("tan", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$tan", PostgreSQL: "TAN", MySQL: "TAN" },
						});
					}
				}
				t.default = a;
			},
			8354: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("tanh", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.NUMBER],
							mapping: { MongoDB: "$tanh", PostgreSQL: "TANH", MySQL: "n/a" },
						});
					}
				}
				t.default = a;
			},
			6923: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toBoolean", {
							paramCount: 1,
							returnType: i.ReturnType.BOOLEAN,
							params: [i.ReturnType.ANY],
							mapping: {
								MongoDB: "$toBool",
								PostgreSQL: "$custom",
								MySQL: "n/a",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(e, t)}::BOOLEAN`;
							case i.DBTYPE.MYSQL: {
								const r = this.parameters[0].getQuery(e, t);
								return `(${r} IS NOT NULL AND ${r} <> 0)`;
							}
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			4184: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toDate", {
							paramCount: 1,
							returnType: i.ReturnType.DATE,
							params: [i.ReturnType.ANY],
							mapping: {
								MongoDB: "$toDate",
								PostgreSQL: "$custom",
								MySQL: "CAST",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(e, t)}::TIMESTAMP`;
							case i.DBTYPE.MYSQL:
								return `CAST(${this.parameters[0].getQuery(e, t)} AS DATETIME)`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			3057: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toDecimal", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.ANY],
							mapping: {
								MongoDB: "$toDecimal",
								PostgreSQL: "CAST",
								MySQL: "CAST",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(e, t)}::DECIMAL`;
							case i.DBTYPE.MYSQL:
								return `CAST(${this.parameters[0].getQuery(e, t)} AS DECIMAL)`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			8051: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toInteger", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.ANY],
							mapping: { MongoDB: "$toInt", PostgreSQL: "CAST", MySQL: "CAST" },
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(e, t)}::INTEGER`;
							case i.DBTYPE.MYSQL:
								return `CAST(${this.parameters[0].getQuery(e, t)} AS SIGNED)`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			6735: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toObjectId", {
							paramCount: 1,
							returnType: i.ReturnType.ID,
							params: [i.ReturnType.ANY],
							mapping: {
								MongoDB: "$toObjectId",
								PostgreSQL: "n/a",
								MySQL: "n/a",
							},
						});
					}
				}
				t.default = a;
			},
			6768: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("toString", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.ANY],
							mapping: {
								MongoDB: "$toString",
								PostgreSQL: "CAST",
								MySQL: "CAST",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `${this.parameters[0].getQuery(e, t)}::TEXT`;
							case i.DBTYPE.MYSQL:
								return `CAST(${this.parameters[0].getQuery(e, t)} AS CHAR)`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			6683: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("trim", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$custom",
								PostgreSQL: "TRIM",
								MySQL: "TRIM",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return { $trim: { input: this.parameters[0].getQuery(e, t) } };
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return super.getQuery(e, t);
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			587: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("upper", {
							paramCount: 1,
							returnType: i.ReturnType.TEXT,
							params: [i.ReturnType.TEXT],
							mapping: {
								MongoDB: "$toUpper",
								PostgreSQL: "UPPER",
								MySQL: "UPPER",
							},
						});
					}
				}
				t.default = a;
			},
			4210: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const n = r(5145),
					i = r(9307);
				class a extends n.Function {
					constructor() {
						super("year", {
							paramCount: 1,
							returnType: i.ReturnType.NUMBER,
							params: [i.ReturnType.DATE],
							mapping: {
								MongoDB: "$year",
								PostgreSQL: "$custom",
								MySQL: "$custom",
							},
						});
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return super.getQuery(e, t);
							case i.DBTYPE.POSTGRESQL:
								return `EXTRACT(YEAR FROM ${this.parameters[0].getQuery(
									e,
									t
								)}::DATE)`;
							case i.DBTYPE.MYSQL:
								return `EXTRACT(YEAR FROM ${this.parameters[0].getQuery(
									e,
									t
								)})`;
							default:
								return null;
						}
					}
				}
				t.default = a;
			},
			3819: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayFilterFieldValue = void 0);
				const n = r(3100),
					i = r(9307);
				class a extends n.FieldValue {
					constructor(e, t, r, n) {
						super(e, t, r, n);
					}
					getExpressionType() {
						return i.ExpressionType.ARRAY_FIELD;
					}
					validateForPull(e) {}
				}
				t.ArrayFilterFieldValue = a;
			},
			4167: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayValue = void 0);
				const n = r(6098),
					i = r(9307);
				class a extends n.Expression {
					constructor() {
						super(), (this.array = []);
					}
					getExpressionType() {
						return i.ExpressionType.STATIC;
					}
					getReturnType() {
						return i.ReturnType.ARRAY;
					}
					addEntry(e) {
						this.array.push(e);
					}
					validate(e) {
						for (const t of this.array) t.validate(e);
					}
					validateForPull(e) {
						for (const t of this.array) t.validateForPull(e);
					}
					getQuery(e, t) {
						const r = [];
						for (const n of this.array) r.push(n.getQuery(e, t));
						switch (e) {
							case i.DBTYPE.MONGODB:
								return r;
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return `${r.join(", ")}`;
							default:
								return r;
						}
					}
					getPullQuery(e, t) {
						const r = [];
						for (const n of this.array) r.push(n.getPullQuery(e, t));
						return r;
					}
					hasJoinFieldValues() {
						for (const e of this.array) if (e.hasJoinFieldValues()) return !0;
						return !1;
					}
				}
				t.ArrayValue = a;
			},
			3100: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.FieldValue = void 0);
				const n = r(6098),
					i = r(9307),
					a = r(990);
				class s extends n.Expression {
					constructor(e, t, r, n) {
						super(),
							(this.field = e),
							(this.fieldPath = t),
							(this.joinType = r),
							(this.joinModel = n);
					}
					getExpressionType() {
						return i.ExpressionType.FIELD;
					}
					getReturnType() {
						switch (this.field.getType()) {
							case "id":
							case "reference":
								return i.ReturnType.ID;
							case "text":
							case "rich-text":
							case "encrypted-text":
							case "email":
							case "link":
							case "phone":
							case "enum":
								return i.ReturnType.TEXT;
							case "createdat":
							case "updatedat":
							case "datetime":
								return i.ReturnType.DATETIME;
							case "date":
								return i.ReturnType.DATE;
							case "time":
								return i.ReturnType.TIME;
							case "boolean":
								return i.ReturnType.BOOLEAN;
							case "integer":
							case "decimal":
								return i.ReturnType.NUMBER;
							case "geo-point":
								return i.ReturnType.GEOPOINT;
							case "binary":
								return i.ReturnType.BINARY;
							case "json":
								return i.ReturnType.JSON;
							case "basic-values-list":
							case "object-list":
							case "join":
								return i.ReturnType.ARRAY;
							case "object":
								return i.ReturnType.OBJECT;
							case "array-filter":
								return i.ReturnType.ANY;
							default:
								return i.ReturnType.UNDEFINED;
						}
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return "none" === this.joinType && t
									? `$${t(this.fieldPath)}`
									: "complex" === this.joinType && t
									? `$${this.field.getQueryPath()}`
									: `$${this.fieldPath}`;
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
								return "none" === this.joinType
									? "$$dummy" !== this.field.getModel().getName()
										? `${this.field
												.getModel()
												.getName()}.${this.field.getName()}`
										: this.field.getName()
									: this.fieldPath;
							default:
								return this.fieldPath;
						}
					}
					getPullQuery(e, t) {
						return this.field.getName();
					}
					hasJoinFieldValues() {
						return "simple" === this.joinType || "complex" === this.joinType;
					}
					validateForPull(e) {
						if ("sub-model-list" !== this.field.getModel().getType())
							throw new a.ClientError(
								"invalid_field",
								`Only fields of a sub-model list object can be used in $pull update operator. '${
									this.fieldPath
								}' is a field of model '${this.field
									.getModel()
									.getName()}' which has a type of '${this.field
									.getModel()
									.getType()}'`
							);
					}
				}
				t.FieldValue = s;
			},
			7523: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.StaticValue = void 0);
				const n = r(6098),
					i = r(9307);
				class a extends n.Expression {
					constructor(e) {
						super(), (this.value = e);
					}
					getExpressionType() {
						return i.ExpressionType.STATIC;
					}
					getReturnType() {
						return null === this.value
							? i.ReturnType.NULL
							: "string" == typeof this.value
							? i.ReturnType.TEXT
							: "number" == typeof this.value
							? i.ReturnType.NUMBER
							: i.ReturnType.BOOLEAN;
					}
					getQuery(e, t) {
						switch (e) {
							case i.DBTYPE.MONGODB:
								return this.value;
							case i.DBTYPE.POSTGRESQL:
								return null === this.value
									? "NULL"
									: "string" == typeof this.value
									? `'${this.value}'`
									: this.value;
							case i.DBTYPE.MYSQL:
								return null === this.value
									? "NULL"
									: "string" == typeof this.value
									? `'${this.value}'`
									: "boolean" == typeof this.value
									? this.value
										? 1
										: 0
									: this.value;
							default:
								return this.value;
						}
					}
					getPullQuery(e, t) {
						return this.getQuery(e);
					}
				}
				t.StaticValue = a;
			},
			341: function (e, t, r) {
				var n =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, r, n) {
									void 0 === n && (n = r);
									var i = Object.getOwnPropertyDescriptor(t, r);
									(i &&
										!("get" in i
											? !t.__esModule
											: i.writable || i.configurable)) ||
										(i = {
											enumerable: !0,
											get: function () {
												return t[r];
											},
										}),
										Object.defineProperty(e, n, i);
							  }
							: function (e, t, r, n) {
									void 0 === n && (n = r), (e[n] = t[r]);
							  }),
					i =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var r in e)
								"default" === r ||
									Object.prototype.hasOwnProperty.call(t, r) ||
									n(t, e, r);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Realtime =
						t.CacheBase =
						t.Cache =
						t.Func =
						t.Expression =
						t.DBAction =
						t.Field =
						t.ModelBase =
						t.Model =
						t.DatabaseBase =
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
				const a = r(7602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return a.APIBase;
					},
				});
				const s = r(2779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return s.AgnostServerSideClient;
					},
				});
				const o = r(6120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return o.Storage;
					},
				});
				const u = r(8414);
				Object.defineProperty(t, "Bucket", {
					enumerable: !0,
					get: function () {
						return u.Bucket;
					},
				});
				const l = r(5979);
				Object.defineProperty(t, "File", {
					enumerable: !0,
					get: function () {
						return l.File;
					},
				});
				const d = r(6760);
				Object.defineProperty(t, "Queue", {
					enumerable: !0,
					get: function () {
						return d.Queue;
					},
				});
				const c = r(9634);
				Object.defineProperty(t, "Task", {
					enumerable: !0,
					get: function () {
						return c.Task;
					},
				});
				const p = r(9949);
				Object.defineProperty(t, "Func", {
					enumerable: !0,
					get: function () {
						return p.Func;
					},
				});
				const h = r(2847);
				Object.defineProperty(t, "Realtime", {
					enumerable: !0,
					get: function () {
						return h.Realtime;
					},
				});
				const f = r(665);
				Object.defineProperty(t, "Database", {
					enumerable: !0,
					get: function () {
						return f.Database;
					},
				});
				const y = r(5421);
				Object.defineProperty(t, "DatabaseBase", {
					enumerable: !0,
					get: function () {
						return y.DatabaseBase;
					},
				});
				const m = r(9831);
				Object.defineProperty(t, "Model", {
					enumerable: !0,
					get: function () {
						return m.Model;
					},
				});
				const g = r(892);
				Object.defineProperty(t, "ModelBase", {
					enumerable: !0,
					get: function () {
						return g.ModelBase;
					},
				});
				const T = r(1111);
				Object.defineProperty(t, "Field", {
					enumerable: !0,
					get: function () {
						return T.Field;
					},
				});
				const v = r(1687);
				Object.defineProperty(t, "DBAction", {
					enumerable: !0,
					get: function () {
						return v.DBAction;
					},
				});
				const E = r(4079);
				Object.defineProperty(t, "Cache", {
					enumerable: !0,
					get: function () {
						return E.Cache;
					},
				});
				const R = r(9);
				Object.defineProperty(t, "CacheBase", {
					enumerable: !0,
					get: function () {
						return R.CacheBase;
					},
				});
				const b = r(6098);
				Object.defineProperty(t, "Expression", {
					enumerable: !0,
					get: function () {
						return b.Expression;
					},
				});
				const w = (e, t) => new s.AgnostServerSideClient(e, t);
				t.createServerSideClient = w;
				const M = w(global.META, global.ADAPTERS);
				(t.agnost = M), i(r(9307), t), i(r(2548), t);
			},
			8414: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Bucket = void 0);
				const i = r(2781),
					a = r(5979),
					s = r(990),
					o = r(9419);
				t.Bucket = class {
					constructor(e, t, r) {
						(this.name = r), (this.meta = e), (this.adapter = t);
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
					updateInfo(e, t, r, i = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new s.ClientError(
									"invalid_value",
									"New name parameter needs to be a string value"
								);
							if (!(0, o.isObject)(r))
								throw new s.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, o.isBoolean)(t))
								throw new s.ClientError(
									"invalid_value",
									"isPublic parameter needs to be a boolean value"
								);
							if (!(0, o.isBoolean)(i))
								throw new s.ClientError(
									"invalid_value",
									"includeFiles parameter needs to be a boolean value"
								);
							return yield this.adapter.updateBucketInfo(
								this.meta,
								this.name,
								e,
								t,
								r,
								i
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
							if ("stream" in e && !(e.stream instanceof i.Readable))
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
			4079: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Cache = void 0);
				const i = r(9);
				t.Cache = class {
					constructor(e, t, r) {
						this.cacheBase = new i.CacheBase(e, t, r);
					}
					getKeyValue(e, t = !1) {
						return n(this, void 0, void 0, function* () {
							return yield this.cacheBase.getKeyValue(e, t);
						});
					}
					setKeyValue(e, t, r) {
						return n(this, void 0, void 0, function* () {
							yield this.cacheBase.setKeyValue(e, t, r);
						});
					}
					deleteKey(e) {
						return n(this, void 0, void 0, function* () {
							yield this.cacheBase.deleteKey(e);
						});
					}
					incrementKeyValue(e, t = 1, r) {
						return n(this, void 0, void 0, function* () {
							return yield this.cacheBase.incrementKeyValue(e, t, r);
						});
					}
					decrementKeyValue(e, t = 1, r) {
						return n(this, void 0, void 0, function* () {
							return yield this.cacheBase.decrementKeyValue(e, t, r);
						});
					}
					expireKey(e, t) {
						return n(this, void 0, void 0, function* () {
							yield this.cacheBase.expireKey(e, t);
						});
					}
					listKeys(e, t, r = !1) {
						return n(this, void 0, void 0, function* () {
							return yield this.cacheBase.listKeys(e, t, r);
						});
					}
					getClient() {
						return this.cacheBase.getClient();
					}
				};
			},
			9: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.CacheBase = void 0);
				const i = r(7602),
					a = r(990),
					s = r(9419),
					o = global.helper;
				class u extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("cache", r)),
							!this.meta)
						)
							throw new a.ClientError(
								"cache_not_found",
								`Cannot find the cache identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("cache", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the cache named '${r}'`
							);
					}
					getAdapterObj(e = !1) {
						return e && this.adapter.slaves && this.adapter.slaves.length > 0
							? this.adapter.slaves[
									o.randomInt(1, this.adapter.slaves.length) - 1
							  ].adapter
							: this.adapter.adapter;
					}
					getKeyValue(e, t = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isKey)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Key needs to be a string or numeric value"
								);
							if (!(0, s.isBoolean)(t))
								throw new a.ClientError(
									"invalid_parameter",
									"Use read replica needs to be a boolean value"
								);
							return yield this.getAdapterObj(t).getKeyValue(this.meta, e);
						});
					}
					setKeyValue(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isKey)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Key needs to be a string or numeric value"
								);
							if (r && !(0, s.isPositiveInteger)(r))
								throw new a.ClientError(
									"invalid_parameter",
									"Time to live needs to be positive integer"
								);
							yield this.getAdapterObj(!1).setKeyValue(
								this.meta,
								e,
								t,
								null != r ? r : void 0
							);
						});
					}
					deleteKey(e) {
						return n(this, void 0, void 0, function* () {
							let t = null;
							t = Array.isArray(e) ? e : [e];
							for (const e of t)
								if (!(0, s.isKey)(e))
									throw new a.ClientError(
										"invalid_parameter",
										"Key needs to be a string or numeric value"
									);
							yield this.getAdapterObj(!1).deleteKey(this.meta, t);
						});
					}
					incrementKeyValue(e, t = 1, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isKey)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Key needs to be a string or numeric value"
								);
							if (!(0, s.isInteger)(t))
								throw new a.ClientError(
									"invalid_parameter",
									"Increment needs to be an integer"
								);
							if (r && !(0, s.isPositiveInteger)(r))
								throw new a.ClientError(
									"invalid_parameter",
									"Time to live needs to be positive integer"
								);
							return yield this.getAdapterObj(!1).incrementKeyValue(
								this.meta,
								e,
								t,
								r
							);
						});
					}
					decrementKeyValue(e, t = 1, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isKey)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Key needs to be a string or numeric value"
								);
							if (!(0, s.isInteger)(t))
								throw new a.ClientError(
									"invalid_parameter",
									"Increment needs to be an integer"
								);
							if (r && !(0, s.isPositiveInteger)(r))
								throw new a.ClientError(
									"invalid_parameter",
									"Time to live needs to be positive integer"
								);
							return yield this.getAdapterObj(!1).decrementKeyValue(
								this.meta,
								e,
								t,
								r
							);
						});
					}
					expireKey(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isKey)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Key needs to be a string or numeric value"
								);
							if (t && !(0, s.isPositiveInteger)(t))
								throw new a.ClientError(
									"invalid_parameter",
									"Time to live needs to be positive integer"
								);
							return yield this.getAdapterObj(!1).expireKey(this.meta, e, t);
						});
					}
					listKeys(e, t, r = !1) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_parameter",
									"Pattern needs to be a string value"
								);
							if (!(0, s.isPositiveInteger)(t))
								throw new a.ClientError(
									"invalid_parameter",
									"Count needs to be a number value"
								);
							if (!(0, s.isBoolean)(r))
								throw new a.ClientError(
									"invalid_parameter",
									"Use read replica needs to be a boolean value"
								);
							return yield this.getAdapterObj(r).listKeys(this.meta, e, t);
						});
					}
					getClient() {
						return this.getAdapterObj(!1).getDriver();
					}
				}
				t.CacheBase = u;
			},
			665: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Database = void 0);
				const i = r(5421),
					a = r(9831);
				t.Database = class {
					constructor(e, t, r) {
						this.dbBase = new i.DatabaseBase(e, t, r);
					}
					model(e) {
						const t = this.dbBase.model(e);
						return new a.Model(t);
					}
					beginTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.dbBase.beginTransaction();
						});
					}
					commitTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.dbBase.commitTransaction();
						});
					}
					rollbackTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.dbBase.rollbackTransaction();
						});
					}
					getClient() {
						return this.dbBase.getClient();
					}
					getActualDbName() {
						return this.dbBase.getActualDbName();
					}
				};
			},
			5421: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DatabaseBase = void 0);
				const i = r(7602),
					a = r(892),
					s = r(990),
					o = r(9307),
					u = global.helper,
					l = global.META;
				class d extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.models = new Map()),
							(this.subModels = new Map()),
							(this.name = r),
							(this.meta = this.getMetadata("database", r)),
							!this.meta)
						)
							throw new s.ClientError(
								"database_not_found",
								`Cannot find the database object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("database", this.name)),
							!this.adapter)
						)
							throw new s.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the database named '${r}'`
							);
						const { models: n } = this.meta,
							i = n.filter((e) => "model" === e.type);
						for (const e of i) {
							const t = new a.ModelBase(e, null, this);
							this.addModel(e.name, t);
						}
					}
					addModel(e, t) {
						const r = t.getSchema();
						r ? this.models.set(`${r}.${e}`, t) : this.models.set(e, t);
					}
					addSubModel(e, t) {
						const r = t.getSchema();
						r ? this.subModels.set(`${r}.${e}`, t) : this.subModels.set(e, t);
					}
					getMetaObj() {
						return this.meta;
					}
					getAdapterObj(e = !1) {
						return e && this.adapter.slaves && this.adapter.slaves.length > 0
							? this.adapter.slaves[
									u.randomInt(1, this.adapter.slaves.length) - 1
							  ].adapter
							: this.adapter.adapter;
					}
					getName() {
						return this.meta.name;
					}
					getType() {
						return this.meta.type;
					}
					isSQLDB() {
						return o.SQLdatabaseTypes.includes(this.meta.type);
					}
					getModelMetaByIId(e) {
						const { models: t } = this.meta;
						return t.find((t) => t.iid === e);
					}
					getModelByIId(e) {
						const t = this.getModelMetaByIId(e);
						return this.model(t.name);
					}
					model(e) {
						const t = this.models.get(e);
						if (!t)
							throw new s.ClientError(
								"model_not_found",
								`Cannot find the model identified by name '${e}' in database '${this.meta.name}'`
							);
						return t;
					}
					beginTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).beginTransaction(this.meta);
						});
					}
					commitTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).commitTransaction(this.meta);
						});
					}
					rollbackTransaction() {
						return n(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).rollbackTransaction(this.meta);
						});
					}
					getClient() {
						return this.getAdapterObj(!1).getDriver();
					}
					getAssignUniqueName() {
						var e;
						return (
							null === (e = this.meta.assignUniqueName) || void 0 === e || e
						);
					}
					getActualDbName() {
						return this.getAssignUniqueName()
							? `${l.getEnvId()}_${this.meta.iid}`
							: this.meta.name;
					}
				}
				t.DatabaseBase = d;
			},
			5979: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.File = void 0);
				const i = r(2781),
					a = r(990),
					s = r(9419);
				t.File = class {
					constructor(e, t, r, n) {
						(this.path = n),
							(this.bucketName = r),
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
							if ("stream" in e && !(e.stream instanceof i.Readable))
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
					updateInfo(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"New path parameter needs to be a string value"
								);
							if (!(0, s.isObject)(r))
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
								r
							);
						});
					}
				};
			},
			9949: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Func = void 0);
				const i = r(7602),
					a = r(990);
				class s extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("function", r)),
							!this.meta)
						)
							throw new a.ClientError(
								"function_not_found",
								`Cannot find the function identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("function", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the function named '${r}'`
							);
					}
					run(...e) {
						return n(this, void 0, void 0, function* () {
							return yield this.adapter.run(this.name, ...e);
						});
					}
				}
				t.Func = s;
			},
			6760: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const i = r(7602),
					a = r(990);
				class s extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("queue", r)),
							!this.meta)
						)
							throw new a.ClientError(
								"queue_not_found",
								`Cannot find the queue object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("queue", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the queue named '${r}'`
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
			2847: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Realtime = void 0);
				const i = r(7602),
					a = r(990),
					s = r(9419);
				class o extends i.APIBase {
					constructor(e) {
						if (
							(super(null, e),
							(this.adapter = this.getAdapter("realtime", null)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								"Cannot find the adapter for realtime"
							);
					}
					broadcast(e, t) {
						if (!(0, s.checkRequired)(e, !0))
							throw new a.ClientError(
								"invalid_value",
								"The 'event name' needs to be a string value"
							);
						this.adapter.broadcast(e, t);
					}
					send(e, t, r) {
						if (!(0, s.checkRequired)(e, !0))
							throw new a.ClientError(
								"invalid_value",
								"The 'channel name' needs to be a string value"
							);
						if (!(0, s.checkRequired)(t, !0))
							throw new a.ClientError(
								"invalid_value",
								"The 'event name' needs to be a string value"
							);
						this.adapter.send(e, t, r);
					}
					getMembers(e) {
						return n(this, void 0, void 0, function* () {
							if (!(0, s.checkRequired)(e, !0))
								throw new a.ClientError(
									"invalid_value",
									"The 'channel name' needs to be a string value"
								);
							return yield this.adapter.getMembers(e);
						});
					}
				}
				t.Realtime = o;
			},
			6120: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const i = r(7602),
					a = r(990),
					s = r(8414),
					o = r(9419);
				class u extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("storage", r)),
							!this.meta)
						)
							throw new a.ClientError(
								"storage_not_found",
								`Cannot find the storage object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("storage", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the storage named '${r}'`
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
					createBucket(e, t = !0, r, i) {
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
							if (r && !(0, o.isObject)(r))
								throw new a.ClientError(
									"invalid_value",
									"Bucket tags need to be a JSON object"
								);
							return yield this.adapter.createBucket(
								this.meta,
								e.trim(),
								t,
								r,
								i
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
				t.Storage = u;
			},
			9634: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const i = r(7602),
					a = r(990);
				class s extends i.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.name = r),
							(this.meta = this.getMetadata("task", r)),
							!this.meta)
						)
							throw new a.ClientError(
								"cronjob_not_found",
								`Cannot find the cron job object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("task", this.name)),
							!this.adapter)
						)
							throw new a.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the cron job named '${r}'`
							);
					}
					run() {
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
			1687: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DBAction = void 0);
				const i = r(892),
					a = r(1779),
					s = r(8054),
					o = r(7523),
					u = r(3100),
					l = r(3819),
					d = r(4167),
					c = r(7853),
					p = r(9307),
					h = r(9419),
					f = r(990);
				class y {
					constructor(e) {
						(this.model = e),
							(this.definition = {
								method: null,
								createData: null,
								updateData: null,
								select: null,
								omit: null,
								id: null,
								skip: null,
								limit: null,
								lookup: null,
								join: null,
								where: null,
								sort: null,
								arrayFilters: null,
								useReadReplica: !1,
								groupBy: null,
								computations: null,
								having: null,
								searchField: null,
								searchText: null,
							});
					}
					getCreateData() {
						return this.definition.createData;
					}
					getWhere() {
						return this.definition.where;
					}
					getSort() {
						return this.definition.sort;
					}
					setMethod(e) {
						this.definition.method = e;
					}
					setId(e) {
						if (!(0, h.isValidId)(e, this.model.getDb().getType()))
							throw new f.ClientError(
								"invalid_value",
								`Not a valid record identifier '${e}'`
							);
						this.definition.id = e;
					}
					setSearchField(e) {
						if ("object" == typeof e)
							throw new f.ClientError(
								"invalid_parameter",
								"The 'searchText' method expects the search field name as string paramter to query database records"
							);
						const t = this.getFieldObject(e, null);
						if (!t)
							throw new f.ClientError(
								"invalid_field",
								`'${e}' is not a valid field that can be used to perform full-text search.`
							);
						if (!t.field.isSearchable())
							throw new f.ClientError(
								"invalid_field",
								`'${e}' is not a valid searchable field that has a full-text index.`
							);
						this.definition.searchField = t;
					}
					setSearchText(e) {
						if ("object" == typeof e)
							throw new f.ClientError(
								"invalid_parameter",
								"The 'searchText' method expects the search string to query database records"
							);
						this.definition.searchText = e;
					}
					setWhere(e, t, r) {
						if (!e) return;
						const n = this.processWhereCondition(e, t, r);
						this.definition.where = n;
					}
					setSelect(e, t) {
						if (!e) return;
						if (!(0, h.isArray)(e))
							throw new f.ClientError(
								"invalid_value",
								'Select option needs to specify the names of the fields to return in an array of field names e.g., ["name", "email", "profile.age"]'
							);
						if (this.definition.omit)
							throw new f.ClientError(
								"invalid_value",
								"Either fields to include (select) or exclude (omit) can be specified not both"
							);
						if (0 === (e = e.filter((e) => "string" == typeof e && e)).length)
							return;
						const r = [],
							n = [];
						for (const i of e) {
							const e = this.getFieldObject(i, t);
							e ? r.push(Object.assign({ fieldName: i }, e)) : n.push(i);
						}
						if (n.length > 0)
							throw new f.ClientError(
								"invalid_field",
								`Select option needs to specify the names of valid fields of the base model or fields of the joined/lookup models. The following fields cannot be specified in select option '${n.join(
									", "
								)}'`
							);
						this.definition.select = r;
					}
					setOmit(e, t) {
						if (!e) return;
						if (!(0, h.isArray)(e))
							throw new f.ClientError(
								"invalid_value",
								'Select option needs to specify the names of the fields to return in an array of field names e.g., ["name", "email", "profile.age"]'
							);
						if (this.definition.select)
							throw new f.ClientError(
								"invalid_value",
								"Either fields to include (select) or exclude (omit) can be specified not both"
							);
						if (0 === (e = e.filter((e) => "string" == typeof e && e)).length)
							return;
						const r = [],
							n = [];
						for (const i of e) {
							const e = this.getFieldObject(i, t);
							e ? r.push(Object.assign({ fieldName: i }, e)) : n.push(i);
						}
						if (n.length > 0)
							throw new f.ClientError(
								"invalid_field",
								`Omit option needs to specify the names of valid fields of the base model or fields of the joined models. The following fields cannot be specified in omit option '${n.join(
									", "
								)}'`
							);
						this.definition.omit = r;
					}
					getFieldObject(e, t) {
						const r = e.split(".").filter((e) => !e.startsWith("$"));
						if (1 === r.length) {
							const r = this.model.getField(e);
							if (r)
								return {
									fieldPath: e,
									field: r,
									joinType: "none",
									joinModel: this.model,
								};
							{
								const r = this.getJoinDefinition(e, t);
								if (r) {
									const t = this.model.getDb().model(r.from);
									if (t)
										return {
											fieldPath: e,
											field: new a.JoinField({ name: r.as }, t),
											joinType: "complex",
											joinModel: t,
										};
								}
								return null;
							}
						}
						{
							let n = this.model,
								i = "none";
							for (let a = 0; a < r.length; a++) {
								const s = r[a],
									o = n.getField(s);
								if (o) {
									const s = o.getType();
									if (a === r.length - 1)
										return {
											fieldPath: e,
											field: o,
											joinType: i,
											joinModel: n,
										};
									if ("object" === s || "object-list" === s)
										n = o.getSubModel();
									else {
										if (
											"reference" !== s ||
											!this.isFieldInJoinDefinition(o.getQueryPath(), t)
										)
											return null;
										(n = this.model.getDb().getModelByIId(o.getRefModelIId())),
											(i = "complex" === i ? i : "simple");
									}
								} else {
									if (0 !== a) return null;
									{
										const e = this.getJoinDefinition(s, t);
										if (!e) return null;
										{
											const t = this.model.getDb().model(e.from);
											if (!t) return null;
											(n = t), (i = "complex");
										}
									}
								}
							}
							return null;
						}
					}
					isFieldInJoinDefinition(e, t) {
						if (!t) return !1;
						if ("string" == typeof t && e === t) return !0;
						if ("object" == typeof t && !Array.isArray(t) && t.as === e)
							return !0;
						if (Array.isArray(t))
							for (const r of t) {
								if ("string" == typeof r && e === r) return !0;
								if ("object" == typeof r && !Array.isArray(r) && r.as === e)
									return !0;
							}
						return !1;
					}
					getJoinDefinition(e, t) {
						if (!t) return null;
						if ("string" == typeof t && e === t) return null;
						if ("object" == typeof t && !Array.isArray(t) && t.as === e)
							return t;
						if (Array.isArray(t))
							for (const r of t) {
								if ("string" == typeof r && e === r) return null;
								if ("object" == typeof r && !Array.isArray(r) && r.as === e)
									return r;
							}
						return null;
					}
					checkJoinAndLookupDuplicates() {
						if (this.definition.lookup && this.definition.join)
							for (const e of this.definition.lookup)
								for (const t of this.definition.join)
									if (e.as.toLowerCase() === t.as.toLowerCase())
										throw new f.ClientError(
											"invalid_join_or_lookup",
											`Not a valid join/lookup definition. The alias '${e.as}' has been used in both lookup and join definitions. The alias names need to be unique across lookup and join definitions.`
										);
					}
					setLookup(e) {
						if (!e) return;
						const t = [];
						if ("string" == typeof e)
							this.processStringBasedJoin(e, e, t, "lookup");
						else if ("object" != typeof e || Array.isArray(e)) {
							if (!Array.isArray(e))
								throw new f.ClientError(
									"invalid_join_or_lookup",
									"Not a valid join/lookup definition."
								);
							for (const r of e)
								if ("string" == typeof r)
									this.processStringBasedJoin(r, e, t, "lookup");
								else {
									if ("object" != typeof r || Array.isArray(r))
										throw new f.ClientError(
											"invalid_join_or_lookup",
											"Not a valid join/lookup definition. The join/lookup array needs to include either reference field names as string or complex join/lookup definition as JSON object with 'as', 'from' and 'where' values."
										);
									this.processObjectBasedJoin(r, e, t, "lookup");
								}
						} else this.processObjectBasedJoin(e, e, t, "lookup");
						this.definition.lookup = t;
					}
					setJoin(e) {
						if (!e) return;
						const t = [];
						if ("string" == typeof e)
							this.processStringBasedJoin(e, e, t, "join");
						else if ("object" != typeof e || Array.isArray(e)) {
							if (!Array.isArray(e))
								throw new f.ClientError(
									"invalid_join_or_lookup",
									"Not a valid join/lookup definition."
								);
							for (const r of e)
								if ("string" == typeof r)
									this.processStringBasedJoin(r, e, t, "join");
								else {
									if ("object" != typeof r || Array.isArray(r))
										throw new f.ClientError(
											"invalid_join_or_lookup",
											"Not a valid join/lookup definition. The join/lookup array needs to include either reference field names as string or complex join/lookup definition as JSON object with 'as', 'from' and 'where' values."
										);
									this.processObjectBasedJoin(r, e, t, "join");
								}
						} else this.processObjectBasedJoin(e, e, t, "join");
						this.definition.join = t;
					}
					processStringBasedJoin(e, t, r, n) {
						const i = this.getFieldObject(e, t);
						if (!i || "reference" !== i.field.getType())
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`'${e}' is not a valid reference field to join/lookup. You can either join/lookup reference fields or define join/lookup queries.`
							);
						const a = this.model
							.getDb()
							.getModelByIId(i.field.getRefModelIId());
						if (r.find((t) => t.as.toLowerCase() === e.toLowerCase()))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`There is already a join/lookup definition with the alias '${e}'.`
							);
						r.push({
							type: n,
							fieldPath: i.fieldPath,
							field: i.field,
							joinType: "simple",
							joinModel: a,
							where: null,
							as: e,
							from: a.getName(),
						});
					}
					processObjectBasedJoin(e, t, r, n) {
						if (!e.as || !e.from || !e.where)
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'from', 'as' and 'where' parameters of a join/lookup definition need to be specified."
							);
						if (!(0, h.isString)(e.as))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'as' parameter of the join/lookup definition needs to be string value."
							);
						if (e.as.includes("."))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'as' parameter of the join/lookup definition cannot include '.'(dot) characters."
							);
						if (this.model.getField(e.as))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`The 'as' parameter should not conflict with an existing field of the base model. There is already a field named '${
									e.as
								}' in model '${this.model.getName()}'`
							);
						if (!(0, h.isString)(e.from))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'from' parameter of the join/lookup definition needs to be string value."
							);
						if (!this.model.getDb().model(e.from))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`The 'from' parameter should match to the model to join/lookup. There no model named '${this.model.getName()}' in datababase '${this.model
									.getDb()
									.getName()}'`
							);
						if (!(0, h.isObject)(e.where))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'where' parameter of the join/lookup definition needs to define the query structure as a JSON object."
							);
						const i = this.getFieldObject(e.as, t);
						if (!i || "complex" !== i.joinType || "join" !== i.field.getType())
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`Join/lookup from '${e.from}' as '${e.as}' is not a valid join/lookup definition. You can either join/lookup reference fields or define join/lookup queries.`
							);
						const a = this.processWhereCondition(
							e.where,
							t,
							p.ConditionType.QUERY
						);
						if (!a)
							throw new f.ClientError(
								"invalid_join_or_lookup",
								"The 'where' condition of the join/lookup definition is missing."
							);
						if (r.find((t) => t.as.toLowerCase() === e.as.toLowerCase()))
							throw new f.ClientError(
								"invalid_join_or_lookup",
								`There is already a join/lookup definition with the alias '${e.as}'.`
							);
						if ("lookup" === n) {
							if (
								((i.skip = null),
								(i.limit = null),
								(i.sort = null),
								null !== e.skip && void 0 !== e.skip)
							) {
								if (!(0, h.isInteger)(e.skip) || e.skip < 0)
									throw new f.ClientError(
										"invalid_value",
										`Skip count can be zero or positive integer in lookup definition with alias '${e.as}'`
									);
								i.skip = e.skip;
							}
							if (e.limit) {
								if (!(0, h.isPositiveInteger)(e.limit))
									throw new f.ClientError(
										"invalid_value",
										`Limit needs to be a positive integer value in lookup definition with alias '${e.as}'`
									);
								i.limit = e.limit;
							}
							if (e.sort) {
								const t = new y(i.joinModel);
								t.setSort(e.sort, e), (i.sort = t.getSort());
							}
						}
						r.push(
							Object.assign(Object.assign({}, i), {
								where: a,
								as: e.as,
								from: e.from,
								type: n,
							})
						);
					}
					processWhereCondition(e, t, r) {
						if (!e) return null;
						const n = Object.entries(e);
						if (0 === n.length) return null;
						if (n.length > 1) {
							const e = new c.FunctionManager.$and();
							for (const [i, a] of n) {
								const n = this.processExpression(i, a, t, r);
								e.addParam(n);
							}
							return (
								r === p.ConditionType.QUERY
									? e.validate(this.model.getDb().getType())
									: e.validateForPull(this.model.getDb().getType()),
								e
							);
						}
						{
							const [e, i] = n[0];
							return this.processExpression(e, i, t, r);
						}
					}
					processExpression(e, t, r, n) {
						const i = c.FunctionManager[e.toLowerCase()];
						if (i) {
							const e = new i();
							if (Array.isArray(t))
								for (const i of t) {
									const t = this.parseValue(i, r, n);
									e.addParam(t);
								}
							else {
								const i = this.parseValue(t, r, n);
								e.addParam(i);
							}
							return (
								n === p.ConditionType.QUERY
									? e.validate(this.model.getDb().getType())
									: e.validateForPull(this.model.getDb().getType()),
								e
							);
						}
						{
							const i = this.getFieldObject(e, r);
							if (i && "join" !== i.field.getType()) {
								const i = new c.FunctionManager.$eq(),
									a = this.parseValue(e, r, n),
									s = this.parseValue(t, r, n);
								return (
									i.addParam(a),
									i.addParam(s),
									n === p.ConditionType.QUERY
										? i.validate(this.model.getDb().getType())
										: i.validateForPull(this.model.getDb().getType()),
									i
								);
							}
							if (
								i ||
								"string" != typeof e ||
								n !== p.ConditionType.ARRAY_FILTER
							)
								throw new f.ClientError(
									"invalid_expression",
									`There is no comparison operator, logical operator, function or model field named '${e}'. You can use predefined functions, base model fields or joined model fields in your query expressions.`
								);
							{
								const i = new c.FunctionManager.$eq(),
									a = new l.ArrayFilterFieldValue(
										new s.ArrayFilterField({ name: e }, this.model, e),
										e,
										"none",
										this.model
									),
									o = this.parseValue(t, r, n);
								return (
									i.addParam(a),
									i.addParam(o),
									i.validateForPull(this.model.getDb().getType()),
									i
								);
							}
						}
					}
					parseValue(e, t, r) {
						if ("boolean" == typeof e || "number" == typeof e || null === e)
							return new o.StaticValue(e);
						if ("string" == typeof e) {
							const n = this.getFieldObject(e, t);
							return n
								? new u.FieldValue(
										n.field,
										n.fieldPath,
										n.joinType,
										n.JoinModel
								  )
								: "string" == typeof e && r === p.ConditionType.ARRAY_FILTER
								? new l.ArrayFilterFieldValue(
										new s.ArrayFilterField({ name: e }, this.model, e),
										e,
										"none",
										this.model
								  )
								: new o.StaticValue(e);
						}
						if ("object" != typeof e || Array.isArray(e)) {
							if (Array.isArray(e)) {
								const n = new d.ArrayValue();
								for (const i of e) {
									const e = this.parseValue(i, t, r);
									n.addEntry(e);
								}
								return n;
							}
							throw new f.ClientError(
								"invalid_parameter",
								`Not a valid function or operator parameter '${e}' to specify in a where condition.`
							);
						}
						{
							const n = Object.entries(e);
							if (0 === n.length)
								throw new f.ClientError(
									"invalid_parameter",
									`Not a valid function or opeartor parameter '${e}' to specify in a where condition.`
								);
							if (n.length > 1)
								throw new f.ClientError(
									"invalid_parameter",
									`Not a valid query expression. Query expression objects have a single { key: value } pair. The provided expression '${JSON.stringify(
										e
									)}' has ${n.length} keys.`
								);
							const [i, a] = n[0];
							return this.processExpression(i, a, t, r);
						}
					}
					setSort(e, t) {
						if (!e) return;
						if (!(0, h.isObject)(e))
							throw new f.ClientError(
								"invalid_value",
								'Sort definition needs to specify the fields and  their sorting order e.g., {"field1": "asc", "field2": "desc"}'
							);
						const r = [],
							n = Object.keys(e);
						for (const i of n) {
							const n = this.getFieldObject(i, t);
							if (!n)
								throw new f.ClientError(
									"invalid_field",
									`'${i}' is not a valid field that can be used to sort query results. Only base model and joined model fields can be used in sort definitions.`
								);
							const a = e[i];
							if ("asc" !== a && "desc" !== a)
								throw new f.ClientError(
									"invalid_field",
									`Sorting order '${a}' is not a valid ordering type for '${i}'. Ordering can be either 'asc' or 'desc'.`
								);
							r.push(Object.assign({ fieldName: i, order: a }, n));
						}
						r.length > 0 && (this.definition.sort = r);
					}
					setSkip(e) {
						if (null != e) {
							if (!(0, h.isInteger)(e) || e < 0)
								throw new f.ClientError(
									"invalid_value",
									"Skip count can be zero or positive integer"
								);
							this.definition.skip = e;
						}
					}
					setLimit(e) {
						if (e) {
							if (!(0, h.isPositiveInteger)(e))
								throw new f.ClientError(
									"invalid_value",
									"Limit needs to be a positive integer value"
								);
							this.definition.limit = e;
						}
					}
					setReadReplica(e) {
						if (e) {
							if (!(0, h.isBoolean)(e))
								throw new f.ClientError(
									"invalid_value",
									"Use read replica needs to be a boolean (true or fale) value"
								);
							this.definition.useReadReplica = e;
						}
					}
					setCreateData(e) {
						var t, r;
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new f.ClientError(
									"invalid_value",
									"The data to create in the database table/collection needs to be provided"
								);
							if (!(0, h.isObject)(e) && !(0, h.isArray)(e))
								throw new f.ClientError(
									"invalid_value",
									"The data to create in the database table/collection needs to be a single or an array of JSON objects"
								);
							if ((0, h.isObject)(e)) {
								const r = {},
									n = yield this.model.prepareFieldValues(e, !0, r);
								if (
									(null === (t = r.errors) || void 0 === t
										? void 0
										: t.length) > 0
								)
									throw new f.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										r.errors
									);
								this.definition.createData = n;
							} else {
								const t = [],
									n = [];
								for (let i = 0; i < e.length; i++) {
									const a = {},
										s = e[i];
									if (!s) continue;
									const o = yield this.model.prepareFieldValues(s, !0, a);
									(null === (r = a.errors) || void 0 === r
										? void 0
										: r.length) > 0
										? n.push({ entry: i, errors: a.errors })
										: t.push(o);
								}
								if (n.length > 0)
									throw new f.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										n
									);
								this.definition.createData = t;
							}
						});
					}
					setUpdates(e, t) {
						var r;
						return n(this, void 0, void 0, function* () {
							if (0 === Object.keys(e).length)
								throw new f.ClientError(
									"invalid_value",
									"The updates object needs to define at least one key-value pair"
								);
							const n = { main: {}, sub: {} },
								i = [];
							for (const [r, a] of Object.entries(e)) {
								const e = this.getFieldObject(r, t);
								if (!e)
									throw new f.ClientError(
										"invalid_field",
										`There is no field named '${r}' in model '${this.model.getName()}'`
									);
								if ("none" !== e.joinType)
									throw new f.ClientError(
										"invalid_field",
										`Field '${r}' is a field of a joined model. Only fields of model '${this.model.getName()}' can be updated.`
									);
								if (e.field.isSystemField())
									throw new f.ClientError(
										"invalid_field",
										`Field '${r}' is a system managed field. System managed fields cannot be upddate manually.'`
									);
								if (e.field.isReadOnly())
									throw new f.ClientError(
										"invalid_field",
										`Field '${r}' is a a read-only field. Read-only fields cannot be upddated.'`
									);
								if (null === a) {
									if (e.field.isRequired())
										throw new f.ClientError(
											"invalid_value",
											`Field '${r}' is a a required field. Null value cannot be assigned to a required field.`
										);
									yield this.setValue(n, e, null);
								} else if (
									("object" != typeof a && !Array.isArray(a)) ||
									a instanceof Date ||
									(Array.isArray(a) &&
										"basic-values-list" === e.field.getType()) ||
									(Array.isArray(a) && "geo-point" === e.field.getType())
								)
									yield this.setValue(n, e, a);
								else {
									if ("object" != typeof a || Array.isArray(a))
										throw new f.ClientError(
											"invalid_value",
											`Unrecognized value '${a}' in update operation. Update instruction should be key-value paris where the value can be the value to set for the field or udpate instruction object e.g., { $inc: 4 }`
										);
									yield this.processUpdateInstruction(e, a, n, i);
								}
							}
							const a = {},
								s = yield this.model.prepareFieldValues(n.main, !1, a);
							if (
								(null === (r = a.errors) || void 0 === r ? void 0 : r.length) >
								0
							)
								throw new f.ClientError(
									"validation_errors",
									"The field update data provided has failed to pass validation rules",
									a.errors
								);
							this.definition.updateData = {
								set: Object.assign(Object.assign({}, s), n.sub),
								others: i,
							};
						});
					}
					setValue(e, t, r) {
						var i;
						return n(this, void 0, void 0, function* () {
							if (t.field.getModel().getIid() !== this.model.getIid()) {
								const n = {},
									a = {};
								if (
									(yield t.field.prepare(r, n, a, !1),
									(null === (i = a.errors) || void 0 === i
										? void 0
										: i.length) > 0)
								)
									throw new f.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										a.errors
									);
								e.sub[t.fieldPath] = n[t.field.getName()];
							} else e.main[t.fieldPath] = r;
						});
					}
					processUpdateInstruction(e, t, r, i) {
						return n(this, void 0, void 0, function* () {
							const n = Object.keys(t);
							if (n.length > 0) {
								const i = n[0];
								if (
									!p.UpdateOperators.includes(i.toLowerCase()) &&
									("json" === e.field.getType() ||
										"binary" === e.field.getType())
								)
									return void (yield this.setValue(r, e, t));
							} else if ("json" === e.field.getType() || "binary" === e.field.getType()) return void (yield this.setValue(r, e, t));
							if (n.length > 1)
								throw new f.ClientError(
									"invalid_update_instruction",
									"Update instruction should be single key-value pair where the value can be the udpate instruction object e.g., { $inc: 4 }"
								);
							const a = n[0],
								s = t[a];
							if (!p.UpdateOperators.includes(a.toLowerCase()))
								throw new f.ClientError(
									"invalid_update_instruction",
									`Update type '${a}' is not valid. Allowed update operators are '${p.UpdateOperators.join(
										", "
									)}'.`
								);
							switch (a.toLowerCase()) {
								case "$set":
									yield this.processSetInstruction(e, s, r);
									break;
								case "$unset":
									this.processUnsetInstruction(e, i);
									break;
								case "$inc":
								case "$mul":
								case "$min":
								case "$max":
									this.processNumericInstruction(e, a, s, i);
									break;
								case "$push":
									yield this.processPushInstruction(e, s, i);
									break;
								case "$pull":
									this.processPullInstruction(e, s, i);
									break;
								case "$pop":
								case "$shift":
									this.processPopShiftInstruction(e, a, i);
							}
						});
					}
					processSetInstruction(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (
								"object" == typeof t &&
								"json" !== e.field.getType() &&
								"binary" !== e.field.getType() &&
								"geo-point" !== e.field.getType()
							)
								throw new f.ClientError(
									"invalid_value",
									"Update type '$set' can have a primitive data value such as number, string, boolean but not an object."
								);
							if (null == t && e.field.isRequired())
								throw new f.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is a a required field. Null value cannot be assigned to a required field.`
								);
							yield this.setValue(r, e, t);
						});
					}
					processUnsetInstruction(e, t) {
						if (e.field.isRequired())
							throw new f.ClientError(
								"invalid_update_instruction",
								`Field '${e.fieldPath}' is a a required field and its value cannot be unset.`
							);
						if (this.model.getDb().getType() !== p.DBTYPE.MONGODB)
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '$unset' cannot be used in '${this.model
									.getDb()
									.getType()}' databases.`
							);
						t.push({
							fieldName: e.fieldPath,
							field: e.field,
							type: "$unset",
							value: "",
						});
					}
					processNumericInstruction(e, t, r, n) {
						if (!["integer", "decimal"].includes(e.field.getType()))
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '${t}' is used to update numeric field values and it cannot be used to update field '${
									e.fieldPath
								}' which has '${e.field.getType()}' type.`
							);
						if ("number" != typeof r)
							throw new f.ClientError(
								"invalid_value",
								`Update type '${t}' needs to have a numeric value.`
							);
						if (
							"number" == typeof r &&
							"integer" === e.field.getType() &&
							!(0, h.isInteger)(r)
						)
							throw new f.ClientError(
								"invalid_value",
								`Update type '${t}' needs to have an integer value to update field '${e.fiendName}' which has 'integer' type.`
							);
						n.push({
							fieldName: e.fieldPath,
							field: e.field,
							type: t.toLowerCase(),
							value: r,
						});
					}
					processPushInstruction(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (this.model.getDb().getType() !== p.DBTYPE.MONGODB)
								throw new f.ClientError(
									"invalid_update_instruction",
									`Update type '$push' cannot be used in '${this.model
										.getDb()
										.getType()}' databases.`
								);
							if (
								!["object-list", "basic-values-list"].includes(
									e.field.getType()
								)
							)
								throw new f.ClientError(
									"invalid_update_instruction",
									`Update type '$push' is used to manage array fields (e.g., basic values list or object-list) and it cannot be used to update field '${
										e.fieldPath
									}' which has '${e.field.getType()}' type.`
								);
							if (!t && "object-list" === e.field.getType())
								throw new f.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is an object-list field. You cannot add a null value to this field.`
								);
							if ("object-list" === e.field.getType()) {
								if ("object" != typeof t)
									throw new f.ClientError(
										"invalid_value",
										`Field '${
											e.fieldPath
										}' is an object-list field. You can only push a new object(s) of type '${e.field
											.getSubModel()
											.getName()}' to this array.`
									);
								let n = [];
								if (
									("object" != typeof t || Array.isArray(t)
										? (n = t)
										: n.push(t),
									n.length > 0)
								) {
									const t = new y(e.field.getSubModel());
									yield t.setCreateData(n),
										r.push({
											fieldName: e.fieldPath,
											field: e.field,
											type: "$push",
											value: { $each: t.getCreateData() },
										});
								}
							}
							if ("basic-values-list" === e.field.getType()) {
								if ("object" == typeof t && !Array.isArray(t))
									throw new f.ClientError(
										"invalid_value",
										`Field '${e.fieldPath}' is a basic values list field. You can only add basic values (e.g., number, text, boolean) or array of basic values to this field.`
									);
								if (Array.isArray(t))
									for (const r of t)
										if (
											("object" == typeof r && !1 === Array.isArray(r)) ||
											Array.isArray(r)
										)
											throw new f.ClientError(
												"invalid_value",
												`Field '${e.fieldPath}' is a basic values list field. You can only add basic values (e.g., number, text, boolean) or array of basic values to this field.`
											);
								r.push({
									fieldName: e.fieldPath,
									field: e.field,
									type: "$push",
									value: Array.isArray(t) ? { $each: t } : t,
								});
							}
						});
					}
					processPopShiftInstruction(e, t, r) {
						if (this.model.getDb().getType() !== p.DBTYPE.MONGODB)
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '$${t}' cannot be used in '${this.model
									.getDb()
									.getType()}' databases.`
							);
						if (
							!["object-list", "basic-values-list"].includes(e.field.getType())
						)
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '${t}' is used to manage array fields (e.g., basic values list or object-list) and it cannot be used to update field '${
									e.fieldPath
								}' which has '${e.field.getType()}' type.`
							);
						r.push({
							fieldName: e.fieldPath,
							field: e.field,
							type: "$pop",
							value: "$pop" === t ? 1 : -1,
						});
					}
					processPullInstruction(e, t, r) {
						if (this.model.getDb().getType() !== p.DBTYPE.MONGODB)
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '$pull' cannot be used in '${this.model
									.getDb()
									.getType()}' databases.`
							);
						if (
							!["object-list", "basic-values-list"].includes(e.field.getType())
						)
							throw new f.ClientError(
								"invalid_update_instruction",
								`Update type '$pull' is used to manage array fields (e.g., basic values list or object-list) and it cannot be used to update field '${
									e.fieldPath
								}' which has '${e.field.getType()}' type.`
							);
						if (!t)
							throw new f.ClientError(
								"invalid_update_instruction",
								"Update type '$pull' requires a condition to identify the array values to pull (remove)."
							);
						if ("object-list" === e.field.getType()) {
							const n = new y(e.field.getSubModel());
							n.setWhere(t, null, p.ConditionType.PULL_CONDITION),
								r.push({
									fieldName: e.fieldPath,
									field: e.field,
									type: "$pull",
									value: n.getWhere(),
									exp: !0,
									includeFields: !0,
								});
						} else {
							if (Array.isArray(t))
								throw new f.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is a basic values list field. You can only remove basic values (e.g., number, text, boolean) values from this field.`
								);
							if ("object" == typeof t) {
								const n = new y(this.model);
								n.setWhere(t, null, p.ConditionType.PULL_CONDITION),
									r.push({
										fieldName: e.fieldPath,
										field: e.field,
										type: "$pull",
										value: n.getWhere(),
										exp: !0,
										includeFields: !1,
									});
							} else
								r.push({
									fieldName: e.fieldPath,
									field: e.field,
									type: "$pull",
									exp: !1,
									includeFields: !1,
									value: t,
								});
						}
					}
					setArrayFilters(e) {
						if (!e || this.model.getDb().getType() !== p.DBTYPE.MONGODB) return;
						if (!Array.isArray(e))
							throw new f.ClientError(
								"invalid_value",
								"Array filters need to be an array of conditions and can only be used in MongoDB databases."
							);
						const t = [];
						for (const r of e) {
							const e = new y(this.model);
							e.setWhere(r, null, p.ConditionType.ARRAY_FILTER),
								t.push(e.getWhere());
						}
						this.definition.arrayFilters = t;
					}
					setGroupBy(e, t) {
						if (!e) return;
						const r = [];
						if ("string" == typeof e) this.processStringBasedGrouping(e, t, r);
						else if ("object" != typeof e || Array.isArray(e)) {
							if (!Array.isArray(e))
								throw new f.ClientError(
									"invalid_grouping",
									"Not a valid grouping definition."
								);
							for (const n of e)
								if ("string" == typeof n)
									this.processStringBasedGrouping(n, t, r);
								else {
									if ("object" != typeof n || Array.isArray(n))
										throw new f.ClientError(
											"invalid_grouping",
											"Not a valid grouping definition. The grouping array needs to include either field names as string or group by definitions as JSON object with 'as' and 'expression' values."
										);
									this.processObjectBasedGrouping(n, t, r);
								}
						} else this.processObjectBasedGrouping(e, t, r);
						this.definition.groupBy = r;
					}
					processStringBasedGrouping(e, t, r) {
						const n = this.getFieldObject(e, t);
						if (!n)
							throw new f.ClientError(
								"invalid_grouping_entry",
								`'${e}' is not a valid field to group database records.`
							);
						if (r.find((e) => e.as === n.field.getName))
							throw new f.ClientError(
								"invalid_grouping_entry",
								`There is already a grouping with the alias '${e}'.`
							);
						if (e.includes(".")) {
							const t = e.split("."),
								r = t[t.length - 1];
							throw new f.ClientError(
								"invalid_grouping_entry",
								`You are trying to group records by joined model '${e}' using the dot notation (e.g., modelname.fieldname) which is not allowed. Instead try grouping using {as: '${r}' , expression: '${e}'}`
							);
						}
						r.push({
							as: e,
							expression: new u.FieldValue(
								n.field,
								n.fieldPath,
								n.joinType,
								n.joinModel
							),
						});
					}
					processObjectBasedGrouping(e, t, r) {
						if (!e.as || !e.expression)
							throw new f.ClientError(
								"invalid_grouping_entry",
								"The 'as' and 'expression' parameters of a group definition needs to be specified."
							);
						if (!(0, h.isString)(e.as))
							throw new f.ClientError(
								"invalid_grouping_entry",
								"The 'as' parameter of the group definition needs to be string value."
							);
						if (e.as.includes("."))
							throw new f.ClientError(
								"invalid_grouping_entry",
								"The 'as' parameter of the group definition cannot include '.'(dot) characters."
							);
						if (
							!(0, h.isObject)(e.expression) &&
							!(0, h.isString)(e.expression)
						)
							throw new f.ClientError(
								"invalid_grouping_entry",
								"The 'expression' parameter of the group definition needs to define the grouping expression as a JSON object or a field name."
							);
						let n = null;
						if (
							((n = (0, h.isObject)(e.expression)
								? this.processWhereCondition(
										e.expression,
										t,
										p.ConditionType.QUERY
								  )
								: this.parseValue(e.expression, t, p.ConditionType.QUERY)),
							!n)
						)
							throw new f.ClientError(
								"invalid_grouping_entry",
								"The 'expression' of the group definition is missing."
							);
						if (r.find((t) => t.as === e.as))
							throw new f.ClientError(
								"invalid_grouping_entry",
								`There is already a grouping with the alias '${e.as}'.`
							);
						r.push({ as: e.as, expression: n });
					}
					setComputations(e, t) {
						var r;
						const n = [],
							i = [];
						if ("object" == typeof e && !Array.isArray(e) && e) n.push(e);
						else {
							if (!Array.isArray(e))
								throw new f.ClientError(
									"invalid_computations",
									"The computations definition needs to be either a single computation object or an array of computation objects."
								);
							n.push(...e);
						}
						if (0 === n.length)
							throw new f.ClientError(
								"invalid_computations",
								"At least one computation needs to be defined for the aggreation operation."
							);
						for (const e of n) {
							if (!(0, h.isString)(e.as))
								throw new f.ClientError(
									"invalid_computation_entry",
									"The 'as' parameter of the computation definition needs to be string value."
								);
							if (e.as.includes("."))
								throw new f.ClientError(
									"invalid_computation_entry",
									"The 'as' parameter of the computation definition cannot include '.'(dot) characters."
								);
							if (!(0, h.isObject)(e.compute))
								throw new f.ClientError(
									"invalid_computations",
									"The 'compute' parameter of the computation definition needs to define the calculation expression as a JSON object."
								);
							const n = Object.keys(e.compute);
							if (n.length > 1 || 0 === n.length)
								throw new f.ClientError(
									"invalid_computation_entry",
									"The 'compute' parameter needs to be in following format: {$computeOperator : <expression>}. The compute operator can be any of the following: $'{ComputeOperators.join(\n\t\t\t\t\t\t\", \"\n\t\t\t\t\t)}'"
								);
							const a = n[0].toLowerCase();
							if (!p.ComputeOperators.includes(a))
								throw new f.ClientError(
									"invalid_computation_operator",
									`Computation type '${a}' is not valid. Allowed computation operators are '${p.ComputeOperators.join(
										", "
									)}'.`
								);
							let s = null;
							if ("$count" !== a) {
								s = this.parseValue(e.compute[n[0]], t, p.ConditionType.QUERY);
								const r = s.getReturnType();
								if (
									"$countif" === a &&
									r !== p.ReturnType.BOOLEAN &&
									r !== p.ReturnType.STATICBOOLEAN
								)
									throw new f.ClientError(
										"invalid_computation_operator",
										`Computation type '${a}' expects a boolean computation but received a computation which returns '${s.getReturnTypeText(
											r
										)}'.`
									);
								if ("$countif" !== a && r !== p.ReturnType.NUMBER)
									throw new f.ClientError(
										"invalid_computation_operator",
										`Computation type '${a}' expects a numeric computation but received a computation which returns '${s.getReturnTypeText(
											r
										)}'.`
									);
							}
							if (
								i.find((t) => t.as === e.as) ||
								(null === (r = this.definition.groupBy) || void 0 === r
									? void 0
									: r.find((t) => t.as === e.as))
							)
								throw new f.ClientError(
									"invalid_computation_entry",
									`There is already a computation or grouping with the alias '${e.as}'.`
								);
							i.push({ as: e.as, operator: a, compute: s });
						}
						this.definition.computations = i;
					}
					setGroupSort(e) {
						if (!e) return;
						const t = this.createGroupingModel(),
							r = new y(t);
						r.setSort(e, null), (this.definition.sort = r.getSort());
					}
					setHaving(e) {
						if (!e) return;
						const t = this.createGroupingModel(),
							r = new y(t);
						r.setWhere(e, null, p.ConditionType.QUERY),
							(this.definition.having = r.getWhere());
					}
					createGroupingModel() {
						const e = [];
						if (this.definition.groupBy)
							for (const t of this.definition.groupBy)
								e.push({ name: t.as, type: "text" });
						if (this.definition.computations)
							for (const t of this.definition.computations)
								e.push({ name: t.as, type: "integer" });
						return new i.ModelBase(
							{ name: "$$dummy", type: "model", fields: e },
							null,
							this.model.getDb()
						);
					}
					execute() {
						return n(this, void 0, void 0, function* () {
							let e = null;
							const t = this.model.getDb();
							switch (this.definition.method) {
								case "createOne":
									e = yield t
										.getAdapterObj(!1)
										.createOne(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition.createData
										);
									break;
								case "createMany":
									e = yield t
										.getAdapterObj(!1)
										.createMany(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition.createData
										);
									break;
								case "deleteById":
									e = yield t
										.getAdapterObj(!1)
										.deleteById(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "deleteOne":
									e = yield t
										.getAdapterObj(!1)
										.deleteOne(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "deleteMany":
									e = yield t
										.getAdapterObj(!1)
										.deleteMany(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "findById":
									e = yield t
										.getAdapterObj(this.definition.useReadReplica)
										.findById(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "findOne":
									e = yield t
										.getAdapterObj(this.definition.useReadReplica)
										.findOne(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "findMany":
									e = yield t
										.getAdapterObj(this.definition.useReadReplica)
										.findMany(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "updateById":
									e = yield t
										.getAdapterObj(!1)
										.updateById(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "updateOne":
									e = yield t
										.getAdapterObj(!1)
										.updateOne(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "updateMany":
									e = yield t
										.getAdapterObj(!1)
										.updateMany(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "aggregate":
									e = yield t
										.getAdapterObj(!1)
										.aggregate(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "searchText":
									e = yield t
										.getAdapterObj(!1)
										.searchText(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
									break;
								case "getSQLQuery":
									e = yield t
										.getAdapterObj(!1)
										.getSQLQuery(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
							}
							return e;
						});
					}
				}
				t.DBAction = y;
			},
			5866: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.createField = void 0);
				const n = r(1264),
					i = r(7433),
					a = r(7984),
					s = r(6199),
					o = r(7781),
					u = r(1990),
					l = r(1126),
					d = r(86),
					c = r(5206),
					p = r(6081),
					h = r(2848),
					f = r(9677),
					y = r(736),
					m = r(2382),
					g = r(3745),
					T = r(9175),
					v = r(6666),
					E = r(335),
					R = r(1620),
					b = r(9337),
					w = r(8811),
					M = r(8321),
					_ = r(300);
				t.createField = function (e, t) {
					switch (e.type) {
						case "id":
							return new f.IdField(e, t);
						case "text":
							return new w.TextField(e, t);
						case "rich-text":
							return new b.RichTextField(e, t);
						case "encrypted-text":
							return new c.EncryptedTextField(e, t);
						case "email":
							return new d.EmailField(e, t);
						case "link":
							return new g.LinkField(e, t);
						case "phone":
							return new E.PhoneField(e, t);
						case "boolean":
							return new a.BooleanField(e, t);
						case "integer":
							return new y.IntegerField(e, t);
						case "decimal":
							return new l.DecimalField(e, t);
						case "createdat":
							return new s.CreatedAtField(e, t);
						case "updatedat":
							return new _.UpdatedAtField(e, t);
						case "datetime":
							return new u.DateTimeField(e, t);
						case "date":
							return new o.DateField(e, t);
						case "time":
							return new M.TimeField(e, t);
						case "enum":
							return new p.EnumField(e, t);
						case "geo-point":
							return new h.GeoPointField(e, t);
						case "binary":
							return new i.BinaryField(e, t);
						case "json":
							return new m.JSONField(e, t);
						case "reference":
							return new R.ReferenceField(e, t);
						case "basic-values-list":
							return new n.BasicValuesListField(e, t);
						case "object-list":
							return new v.ObjectListField(e, t);
						case "object":
							return new T.ObjectField(e, t);
					}
				};
			},
			1111: function (e, t) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
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
						getModel() {
							return this.model;
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
						isSQLDB() {
							return this.model.getDb().isSQLDB();
						}
						hasDefaultValue() {
							return (
								null !== this.meta.defaultValue &&
								void 0 !== this.meta.defaultValue &&
								"" !== this.meta.defaultValue
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
						isSearchable() {
							return !1;
						}
						getLanguage() {
							return "MySQL" === this.getDBType()
								? "utf8mb4_unicode_ci"
								: "english";
						}
						getSubModel() {
							return null;
						}
						getRefModelIId() {
							return "";
						}
						setValue(e, t, n, i = !0, a = -1) {
							return r(this, void 0, void 0, function* () {});
						}
						addValidationError(e, t, r, n = -1, i = !0) {
							const a = {};
							(a.origin = i ? "client_error" : "server_error"),
								(a.code = r),
								(a.details = {}),
								(a.details.field = this.getQueryPath()),
								n >= 0 && (a.details.index = n),
								void 0 !== t && (a.details.value = t);
							const s = e.errors;
							s ? s.push(a) : ((e.errors = []), e.errors.push(a));
						}
						prepare(e, t, n, i = !0, a = -1) {
							return r(this, void 0, void 0, function* () {
								i
									? yield this.prepareForCrete(e, t, n, a)
									: yield this.prepareForUpdate(e, t, n, a);
							});
						}
						prepareForCrete(e, t, n, i) {
							return r(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.hasDefaultValue())
										yield this.setValue(this.getDefaultValue(), t, n, !0, i);
									else if (this.isRequired())
										this.isUserField()
											? this.addValidationError(
													n,
													e,
													"missing_required_field_value",
													i
											  )
											: yield this.setValue(e, t, n, !0, i);
									else if (
										"object-list" === this.getType() ||
										"basic-values-list" === this.getType()
									)
										yield this.setValue([], t, n, !0, i);
									else if (
										"object" === this.getType() &&
										this.hasFieldsWithDefaultValue()
									)
										yield this.setValue({}, t, n, !0, i);
									else {
										if (!this.isSQLDB() && (this.isSQLDB() || null !== e))
											return;
										yield this.setValue(null, t, n, !0, i);
									}
								else yield this.setValue(e, t, n, !0, i);
							});
						}
						prepareForUpdate(e, t, n, i) {
							return r(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.isSystemField()) {
										if ("updatedat" !== this.getType()) return;
										yield this.setValue(e, t, n, !1, i);
									} else
										null === e &&
											(!1 === this.isRequired()
												? yield this.setValue(e, t, n, !1, i)
												: this.addValidationError(
														n,
														e,
														"invalid_required_field_value",
														i
												  ));
								else {
									if (this.isReadOnly() && this.isUserField()) return;
									yield this.setValue(e, t, n, !1, i);
								}
							});
						}
					});
			},
			9831: function (e, t) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Model = void 0),
					(t.Model = class {
						constructor(e) {
							this.modelBase = e;
						}
						createOne(e) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.createOne(e);
							});
						}
						createMany(e) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.createMany(e);
							});
						}
						findById(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.findById(e, t);
							});
						}
						findOne(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.findOne(e, t);
							});
						}
						findMany(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.findMany(e, t);
							});
						}
						deleteById(e) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.deleteById(e);
							});
						}
						deleteOne(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.deleteOne(e, t);
							});
						}
						deleteMany(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.deleteMany(e, t);
							});
						}
						updateById(e, t, n) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.updateById(e, t, n);
							});
						}
						updateOne(e, t, n) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.updateOne(e, t, n);
							});
						}
						updateMany(e, t, n) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.updateMany(e, t, n);
							});
						}
						aggregate(e) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.aggregate(e);
							});
						}
						searchText(e, t, n) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.searchText(e, t, n);
							});
						}
						getSQLQuery(e) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.getSQLQuery(e);
							});
						}
					});
			},
			892: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ModelBase = void 0);
				const i = r(1687),
					a = r(5866),
					s = r(9419),
					o = r(990),
					u = r(9307);
				t.ModelBase = class {
					constructor(e, t, r) {
						(this.meta = e),
							(this.parent = t),
							(this.db = r),
							(this.fields = new Map()),
							(this.timestamp = null);
						const { fields: n } = e;
						for (const e of n) {
							const t = (0, a.createField)(e, this);
							t && this.fields.set(e.name, t);
						}
					}
					getMetaObj() {
						return this.meta;
					}
					getDb() {
						return this.db;
					}
					getName() {
						return this.meta.name;
					}
					getIid() {
						return this.meta.iid;
					}
					getSchema() {
						return this.meta.schema;
					}
					getFields() {
						return this.fields;
					}
					getField(e) {
						return this.fields.get(e);
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
					getType() {
						return this.meta.type;
					}
					hasSearchIndex() {
						for (const [e, t] of this.fields) if (t.isSearchable()) return !0;
						return !1;
					}
					mergeArrays(e, t) {
						return e || t
							? ((e = Array.isArray(e) ? e : [e]),
							  (t = Array.isArray(t) ? t : [t]),
							  [...e, ...t])
							: null;
					}
					prepareFieldValues(e, t = !0, r, i = -1) {
						return n(this, void 0, void 0, function* () {
							const n = {},
								a = null != r ? r : {};
							for (const [r, s] of this.fields)
								yield s.prepare(e[r], n, a, t, i),
									t &&
										void 0 === n[r] &&
										"id" !== s.getType() &&
										this.db.isSQLDB() &&
										(n[r] = null);
							return n;
						});
					}
					createOne(e) {
						return n(this, void 0, void 0, function* () {
							if ((this.resetTimestamp(), !e))
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'createOne' method expects an input object to insert into the database"
								);
							if (!(0, s.isObject)(e))
								throw new o.ClientError(
									"invalid_value",
									"The 'data' to create in the database table/collection needs to be a JSON object"
								);
							const t = new i.DBAction(this);
							return (
								t.setMethod("createOne"),
								yield t.setCreateData(e),
								yield t.execute()
							);
						});
					}
					createMany(e) {
						return n(this, void 0, void 0, function* () {
							if ((this.resetTimestamp(), !e))
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'createOne' method expects an array of input objects to insert into the database"
								);
							if (!(0, s.isArray)(e))
								throw new o.ClientError(
									"invalid_value",
									"The 'data' to create in the database table/collection needs to be an array of JSON objects"
								);
							const t = new i.DBAction(this);
							return (
								t.setMethod("createMany"),
								yield t.setCreateData(e),
								yield t.execute()
							);
						});
					}
					findById(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'findById' method expects id of the record to fetch as input"
								);
							const r = new i.DBAction(this);
							return (
								r.setMethod("findById"),
								r.setId(e),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, t.lookup),
									r.setOmit(t.omit, t.lookup),
									r.setLookup(t.lookup)),
								yield r.execute()
							);
						});
					}
					findOne(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'findOne' method expects the where condition to query database records"
								);
							const r = new i.DBAction(this);
							return (
								r.setMethod("findOne"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, this.mergeArrays(t.join, t.lookup)),
									r.setOmit(t.omit, this.mergeArrays(t.join, t.lookup)),
									r.setLookup(t.lookup),
									r.setJoin(t.join),
									r.setSort(t.sort, t.join),
									r.setSkip(t.skip),
									r.checkJoinAndLookupDuplicates()),
								yield r.execute()
							);
						});
					}
					findMany(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'findMany' method expects the where condition to query database records"
								);
							const r = new i.DBAction(this);
							return (
								r.setMethod("findMany"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, this.mergeArrays(t.join, t.lookup)),
									r.setOmit(t.omit, this.mergeArrays(t.join, t.lookup)),
									r.setLookup(t.lookup),
									r.setJoin(t.join),
									r.setSort(t.sort, t.join),
									r.setSkip(t.skip),
									r.setLimit(t.limit),
									r.checkJoinAndLookupDuplicates()),
								yield r.execute()
							);
						});
					}
					deleteById(e) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'deleteById' method expects id of the record to delete as input"
								);
							const t = new i.DBAction(this);
							return t.setMethod("deleteById"), t.setId(e), yield t.execute();
						});
					}
					deleteOne(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'delete' method expects the where condition to query database records"
								);
							const r = new i.DBAction(this);
							return (
								r.setMethod("deleteOne"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t && r.setJoin(t.join),
								yield r.execute()
							);
						});
					}
					deleteMany(e, t) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'delete' method expects the where condition to query database records"
								);
							const r = new i.DBAction(this);
							return (
								r.setMethod("deleteMany"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t && r.setJoin(t.join),
								yield r.execute()
							);
						});
					}
					updateById(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'updateById' method expects id of the record to update as input"
								);
							if (!t)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'updateById' method expects the update definitions as input parameter"
								);
							if (!(0, s.isObject)(t))
								throw new o.ClientError(
									"invalid_value",
									"The 'updateById' method expects the update definitions as an object of key-value pairs"
								);
							this.resetTimestamp();
							const n = new i.DBAction(this);
							return (
								n.setMethod("updateById"),
								n.setId(e),
								yield n.setUpdates(t, null),
								r &&
									(n.setSelect(r.select, null),
									n.setOmit(r.omit, null),
									n.setArrayFilters(r.arrayFilters)),
								yield n.execute()
							);
						});
					}
					updateOne(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the where condition to query database records"
								);
							if (!t)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the update definitions as input parameter"
								);
							if (!(0, s.isObject)(t))
								throw new o.ClientError(
									"invalid_value",
									"The 'update' method expects the update definitions as an object of key-value pairs"
								);
							this.resetTimestamp();
							const n = new i.DBAction(this);
							return (
								n.setMethod("updateOne"),
								n.setWhere(
									e,
									null == r ? void 0 : r.join,
									u.ConditionType.QUERY
								),
								yield n.setUpdates(t, null),
								r &&
									(n.setSelect(r.select, null),
									n.setOmit(r.omit, null),
									n.setJoin(r.join),
									n.setArrayFilters(r.arrayFilters)),
								yield n.execute()
							);
						});
					}
					updateMany(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the where condition to query database records"
								);
							if (!t)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the update definitions as input parameter"
								);
							if (!(0, s.isObject)(t))
								throw new o.ClientError(
									"invalid_value",
									"The 'update' method expects the update definitions as an object of key-value pairs"
								);
							this.resetTimestamp();
							const n = new i.DBAction(this);
							return (
								n.setMethod("updateMany"),
								n.setWhere(
									e,
									null == r ? void 0 : r.join,
									u.ConditionType.QUERY
								),
								yield n.setUpdates(t, null),
								r && (n.setJoin(r.join), n.setArrayFilters(r.arrayFilters)),
								yield n.execute()
							);
						});
					}
					aggregate(e) {
						return n(this, void 0, void 0, function* () {
							if (!e || !e.computations)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'aggregate' method expects at least one computation to aggregate database records"
								);
							const t = new i.DBAction(this);
							return (
								t.setMethod("aggregate"),
								t.setWhere(e.where, e.join, u.ConditionType.QUERY),
								t.setJoin(e.join),
								t.setGroupBy(e.groupBy, e.join),
								t.setComputations(e.computations, e.join),
								t.setHaving(e.having),
								t.setGroupSort(e.sort),
								t.setSkip(e.skip),
								t.setLimit(e.limit),
								yield t.execute()
							);
						});
					}
					searchText(e, t, r) {
						return n(this, void 0, void 0, function* () {
							if (!e)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'searchText' method expects the full-text indexed (searchable) field name to query database records"
								);
							if (!t)
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'searchText' method expects the search string to query database records"
								);
							if (!this.hasSearchIndex())
								throw new o.ClientError(
									"not_searchable_model",
									"To run text search on a model records you need to have at least one 'searchable' text or rich-text field."
								);
							const n = new i.DBAction(this);
							return (
								n.setMethod("searchText"),
								n.setSearchField(e),
								n.setSearchText(t),
								r &&
									(n.setWhere(
										null == r ? void 0 : r.where,
										null == r ? void 0 : r.join,
										u.ConditionType.QUERY
									),
									n.setReadReplica(r.useReadReplica),
									n.setSelect(r.select, this.mergeArrays(r.join, r.lookup)),
									n.setOmit(r.omit, this.mergeArrays(r.join, r.lookup)),
									n.setLookup(r.lookup),
									n.setJoin(r.join),
									n.setSort(r.sort, r.join),
									n.setSkip(r.skip),
									n.setLimit(r.limit)),
								yield n.execute()
							);
						});
					}
					getSQLQuery(e) {
						return n(this, void 0, void 0, function* () {
							if (this.getDb().getType() === u.DBTYPE.MONGODB)
								throw new o.ClientError(
									"not_allowed",
									`Getting the SQL query string is not available for '${this.getDb().getType()}' databases.`
								);
							if (!e || !(0, s.isObject)(e))
								throw new o.ClientError(
									"missing_input_parameter",
									"The 'getSQLQuery' method expects the input parameters as a JSON object."
								);
							const t = new i.DBAction(this);
							return (
								t.setMethod("getSQLQuery"),
								t.setWhere(
									null == e ? void 0 : e.where,
									null == e ? void 0 : e.join,
									u.ConditionType.QUERY
								),
								t.setSelect(e.select, this.mergeArrays(e.join, e.lookup)),
								t.setOmit(e.omit, this.mergeArrays(e.join, e.lookup)),
								t.setLookup(e.lookup),
								t.setJoin(e.join),
								t.setSort(e.sort, e.join),
								t.setSkip(e.skip),
								t.setLimit(e.limit),
								t.checkJoinAndLookupDuplicates(),
								yield t.execute()
							);
						});
					}
				};
			},
			8054: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayFilterField = void 0);
				const n = r(1111);
				class i extends n.Field {
					constructor(e, t, r) {
						super(e, t), (this.fieldName = r);
					}
					getType() {
						return "array-filter";
					}
					getQueryPath() {
						return this.fieldName;
					}
					getName() {
						return this.fieldName;
					}
				}
				t.ArrayFilterField = i;
			},
			1264: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BasicValuesListField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || !this.isReadOnly())
								if (i || null !== e || !1 !== this.isRequired()) {
									if (!1 === Array.isArray(e))
										return this.addValidationError(
											r,
											e,
											"not_array_of_basic_values",
											a
										);
									if (0 === e.length && this.isRequired())
										return this.addValidationError(
											r,
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
												r,
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
			7433: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BinaryField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || !this.isReadOnly()) {
								if (null !== e || !1 !== this.isRequired())
									return e && !1 === Buffer.isBuffer(e)
										? this.addValidationError(r, e, "not_buffer_value", a)
										: void (t[this.getName()] = e);
								t[this.getName()] = null;
							}
						});
					}
				}
				t.BinaryField = a;
			},
			7984: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BooleanField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || !this.isReadOnly()) {
								if (null !== e || !1 !== this.isRequired())
									return "boolean" != typeof e
										? this.addValidationError(r, e, "not_boolean_value", a)
										: void (t[this.getName()] = e);
								t[this.getName()] = null;
							}
						});
					}
				}
				t.BooleanField = a;
			},
			6199: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.CreatedAtField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							i && (t[this.getName()] = this.model.getTimestamp());
						});
					}
				}
				t.CreatedAtField = a;
			},
			7781: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (i && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const n = a.getDtmFromString(e.toString());
							if (!n || !n.isValid)
								return this.addValidationError(r, e, "not_date_value", s);
							t[this.getName()] = n.toJSDate();
						});
					}
				}
				t.DateField = s;
			},
			1990: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateTimeField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (i && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const n = a.getDtmFromString(e.toString());
							if (!n || !n.isValid)
								return this.addValidationError(r, e, "not_datetime_value", s);
							t[this.getName()] = n.toJSDate();
						});
					}
				}
				t.DateTimeField = s;
			},
			1126: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DecimalField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(r, e, "not_decimal_value", s);
							const n = this.meta.decimal,
								o = a
									.createDecimal(e)
									.toDecimalPlaces(n.decimalDigits, 4)
									.toNumber();
							t[this.getName()] = o;
						});
					}
				}
				t.DecimalField = s;
			},
			86: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EmailField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", s);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										r,
										n,
										"invalid_required_field_value",
										s
								  )
								: n.length > 320
								? this.addValidationError(
										r,
										n,
										"max_length_threshold_exceeded",
										s
								  )
								: !1 === a.isEmail(n)
								? this.addValidationError(r, n, "invalid_email_address", s)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.EmailField = s;
			},
			5206: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EncryptedTextField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", s);
							let n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									r,
									n,
									"invalid_required_field_value",
									s
								);
							const o = this.meta.encryptedText;
							if (n.length > o.maxLength)
								return this.addValidationError(
									r,
									n,
									"max_length_threshold_exceeded",
									s
								);
							null != n &&
								"" !== n &&
								((n = yield a.encryptText(n)), (t[this.getName()] = n));
						});
					}
				}
				t.EncryptedTextField = s;
			},
			6081: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EnumField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					isValueFromList(e, t) {
						const r = e.length;
						for (let n = 0; n < r; n++) if (e[n] === t) return !0;
						return !1;
					}
					setValue(e, t, r, i = !0, a = -1) {
						var s, o;
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(
									r,
									e,
									"not_enumeration_value",
									a
								);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									r,
									n,
									"invalid_required_field_value",
									a
								);
							const u =
								null !==
									(o =
										null === (s = this.meta.enum) || void 0 === s
											? void 0
											: s.selectList) && void 0 !== o
									? o
									: [];
							if (!this.isValueFromList(u, n))
								return this.addValidationError(
									r,
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
			2848: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.GeoPointField = void 0);
				const i = r(1111),
					a = r(9307);
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (!Array.isArray(e) || 2 !== e.length)
								return this.addValidationError(r, e, "not_geopoint_value"), s;
							if ("number" != typeof e[0] || !isFinite(e[0]))
								return this.addValidationError(
									r,
									e,
									"invalid_longitude_value",
									s
								);
							if ("number" != typeof e[1] || !isFinite(e[1]))
								return this.addValidationError(
									r,
									e,
									"invalid_latitude_value",
									s
								);
							const n = e[0],
								o = e[1];
							if (n < -180 || n > 180)
								return this.addValidationError(
									r,
									e,
									"invalid_longitude_value",
									s
								);
							if (o < -90 || o > 90)
								return this.addValidationError(
									r,
									e,
									"invalid_latitude_value",
									s
								);
							switch (this.getDBType()) {
								case a.DBTYPE.MONGODB:
									t[this.getName()] = { type: "Point", coordinates: e };
									break;
								case a.DBTYPE.POSTGRESQL:
									t[this.getName()] = `${n},${o}`;
									break;
								case a.DBTYPE.MYSQL:
									t[this.getName()] = `POINT(${n} ${o})`;
									break;
								case a.DBTYPE.SQLSERVER:
									t[this.getName()] = `geography::Point(${n}, ${o}, 4326)`;
									break;
								case a.DBTYPE.ORACLE:
									t[
										this.getName()
									] = `SDO_GEOMETRY(\n\t\t\t\t\t2001,            \n\t\t\t\t\tNULL,           \n\t\t\t\t\tSDO_POINT_TYPE(${n}, ${o}, NULL), \n\t\t\t\t\tNULL,            \n\t\t\t\t\tNULL             \n\t\t\t\t)`;
							}
						});
					}
				}
				t.GeoPointField = s;
			},
			9677: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IdField = void 0);
				const i = r(1111),
					a = r(9307),
					s = r(9419);
				class o extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (e && i)
								if (this.getDBType() === a.DBTYPE.MONGODB) {
									const n = e.toString().trim();
									if (!(0, s.isValidId)(n, a.DBTYPE.MONGODB))
										return this.addValidationError(r, e, "invalid_id_value", o);
									t[this.getName()] = (0, s.objectId)(n);
								} else {
									if (!(0, s.isString)(e) && !(0, s.isInteger)(e))
										return this.addValidationError(r, e, "invalid_id_value", o);
									t[this.getName()] = e;
								}
						});
					}
				}
				t.IdField = o;
			},
			736: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IntegerField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(r, e, "not_integer_value", s);
							const n = a.createDecimal(e).toDecimalPlaces(0).toNumber();
							t[this.getName()] = n;
						});
					}
				}
				t.IntegerField = s;
			},
			1779: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JoinField = void 0);
				const n = r(1111);
				class i extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					getType() {
						return "join";
					}
					getQueryPath() {
						return this.getName();
					}
				}
				t.JoinField = i;
			},
			2382: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JSONField = void 0);
				const i = r(1111),
					a = r(9307);
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || !this.isReadOnly())
								if (null !== e || !1 !== this.isRequired()) {
									if ("object" != typeof e)
										return this.addValidationError(r, e, "not_json_value", s);
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
				t.JSONField = s;
			},
			3745: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.LinkField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", s);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										r,
										n,
										"invalid_required_field_value",
										s
								  )
								: n.length > 2048
								? this.addValidationError(
										r,
										n,
										"max_length_threshold_exceeded",
										s
								  )
								: !1 === a.isLink(n)
								? this.addValidationError(r, n, "invalid_URL", s)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.LinkField = s;
			},
			9175: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectField = void 0);
				const i = r(892),
					a = r(1111),
					s = r(990);
				class o extends a.Field {
					constructor(e, t) {
						super(e, t);
						const r = t.getDb().getModelMetaByIId(e.object.iid);
						if (!r)
							throw new s.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new i.ModelBase(r, t, t.getDb())),
							t
								.getDb()
								.addSubModel(
									r.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
					getSubModel() {
						return this.subModel;
					}
					isSearchable() {
						return this.subModel.hasSearchIndex();
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
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || null !== e || !1 !== this.isRequired())
								return !i && e
									? this.addValidationError(
											r,
											e,
											"direct_object_assignment_not_allowed",
											a
									  )
									: "object" != typeof e || Array.isArray(e)
									? this.addValidationError(r, e, "not_object_value", a)
									: void (i && (t[this.getName()] = {}));
							t[this.getName()] = null;
						});
					}
					prepare(e, t, r, i = !0, a = -1) {
						const s = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return n(this, void 0, void 0, function* () {
							if ((yield s.prepare.call(this, e, t, r, i), i)) {
								const n = yield this.subModel.prepareFieldValues(
									e || {},
									i,
									r,
									a
								);
								t[this.getName()] = n;
							}
						});
					}
				}
				t.ObjectField = o;
			},
			6666: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectListField = void 0);
				const i = r(892),
					a = r(1111),
					s = r(990);
				class o extends a.Field {
					constructor(e, t) {
						super(e, t);
						const r = t.getDb().getModelMetaByIId(e.objectList.iid);
						if (!r)
							throw new s.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new i.ModelBase(r, t, t.getDb())),
							t
								.getDb()
								.addSubModel(
									r.parentHierarchy.map((e) => e.name).join("."),
									this.subModel
								);
					}
					getSubModel() {
						return this.subModel;
					}
					isSearchable() {
						return this.subModel.hasSearchIndex();
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (i || null !== e || !1 !== this.isRequired()) {
								if (!i && Array.isArray(e))
									return this.addValidationError(
										r,
										e,
										"direct_array_assignment_not_allowed",
										a
									);
								if (!Array.isArray(e))
									return this.addValidationError(r, e, "not_array_value", a);
								for (const t of e)
									if ("object" != typeof t || Array.isArray(t))
										return this.addValidationError(
											r,
											t,
											"invalid_object_array_entry",
											a
										);
								i && (t[this.getName()] = []);
							} else t[this.getName()] = [];
						});
					}
					prepare(e, t, r, i = !0, a = -1) {
						const s = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return n(this, void 0, void 0, function* () {
							if ((yield s.prepare.call(this, e, t, r, i, a), i)) {
								e = e || [];
								for (let n = 0; n < e.length; n++) {
									const a = e[n],
										s = yield this.subModel.prepareFieldValues(a, i, r, n);
									t[this.getName()].push(s);
								}
							}
						});
					}
				}
				t.ObjectListField = o;
			},
			335: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.PhoneField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", s);
							const n = e.toString().trim();
							return "" === n && this.isRequired()
								? this.addValidationError(
										r,
										n,
										"invalid_required_field_value",
										s
								  )
								: n.length > 16
								? this.addValidationError(
										r,
										n,
										"max_length_threshold_exceeded",
										s
								  )
								: !1 === a.isMobilePhone(n)
								? this.addValidationError(r, n, "invalid_phone_number", s)
								: void (t[this.getName()] = n);
						});
					}
				}
				t.PhoneField = s;
			},
			1620: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ReferenceField = void 0);
				const i = r(1111),
					a = r(9307),
					s = global.helper;
				class o extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					getRefModelIId() {
						var e;
						return null === (e = this.meta.reference) || void 0 === e
							? void 0
							: e.iid;
					}
					setValue(e, t, r, i = !0, o = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_reference_value", o);
							const n = e.toString().trim();
							if (!n && this.isRequired())
								return this.addValidationError(
									r,
									n,
									"invalid_required_field_value",
									o
								);
							switch (this.getDBType()) {
								case a.DBTYPE.MONGODB:
									if (!s.isValidId(n))
										return this.addValidationError(
											r,
											n,
											"invalid_mongodb_id",
											o
										);
									t[this.getName()] = s.objectId(n);
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
				t.ReferenceField = o;
			},
			9337: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.RichTextField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					isSearchable() {
						var e;
						return null === (e = this.meta.richText) || void 0 === e
							? void 0
							: e.searchable;
					}
					getLanguage() {
						var e;
						return null === (e = this.meta.richText) || void 0 === e
							? void 0
							: e.language;
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", a);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									r,
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
			8811: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TextField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					isSearchable() {
						var e;
						return null === (e = this.meta.text) || void 0 === e
							? void 0
							: e.searchable;
					}
					getLanguage() {
						var e;
						return null === (e = this.meta.text) || void 0 === e
							? void 0
							: e.language;
					}
					setValue(e, t, r, i = !0, a = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", a);
							const n = e.toString();
							if ("" === n && this.isRequired())
								return this.addValidationError(
									r,
									n,
									"invalid_required_field_value",
									a
								);
							const s = this.meta.text;
							if (n.length > s.maxLength)
								return this.addValidationError(
									r,
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
			8321: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TimeField = void 0);
				const i = r(1111),
					a = global.helper;
				class s extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, s = -1) {
						return n(this, void 0, void 0, function* () {
							if (!i && this.isReadOnly()) return;
							if (null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							const n = a.getTimeFromString(e.toString());
							if (!n) return this.addValidationError(r, e, "not_time_value", s);
							t[this.getName()] = n;
						});
					}
				}
				t.TimeField = s;
			},
			300: function (e, t, r) {
				var n =
					(this && this.__awaiter) ||
					function (e, t, r, n) {
						return new (r || (r = Promise))(function (i, a) {
							function s(e) {
								try {
									u(n.next(e));
								} catch (e) {
									a(e);
								}
							}
							function o(e) {
								try {
									u(n.throw(e));
								} catch (e) {
									a(e);
								}
							}
							function u(e) {
								var t;
								e.done
									? i(e.value)
									: ((t = e.value),
									  t instanceof r
											? t
											: new r(function (e) {
													e(t);
											  })).then(s, o);
							}
							u((n = n.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.UpdatedAtField = void 0);
				const i = r(1111);
				class a extends i.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, i = !0, a = -1) {
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
				class r extends Error {
					constructor(e, t, r) {
						super(t),
							(this.origin = "client_error"),
							(this.code = e),
							(this.message = t),
							(this.specifics = r);
					}
				}
				t.ClientError = r;
			},
			9419: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.checkRequired =
						t.objectId =
						t.isValidId =
						t.isArray =
						t.isInteger =
						t.isPositiveInteger =
						t.valueExists =
						t.isKey =
						t.isString =
						t.isBoolean =
						t.isObject =
							void 0);
				const n = r(9307),
					i = global.helper;
				(t.isObject = function (e) {
					return "object" == typeof e && !Array.isArray(e) && null !== e;
				}),
					(t.isBoolean = function (e) {
						return "boolean" == typeof e;
					}),
					(t.isString = function (e) {
						return "string" == typeof e && "" !== e && 0 !== e.trim().length;
					}),
					(t.isKey = function (e) {
						return (
							("string" == typeof e && "" !== e && 0 !== e.trim().length) ||
							"number" == typeof e
						);
					}),
					(t.valueExists = function (e) {
						return null != e;
					}),
					(t.isPositiveInteger = function (e) {
						return !("number" != typeof e || !Number.isInteger(e)) && e > 0;
					}),
					(t.isInteger = function (e) {
						return !("number" != typeof e || !Number.isInteger(e));
					}),
					(t.isArray = function (e) {
						return Array.isArray(e);
					}),
					(t.isValidId = function (e, t) {
						if (!e) return !1;
						switch (t) {
							case n.DBTYPE.MONGODB:
								return !!i.isValidId(e.toString());
							case n.DBTYPE.POSTGRESQL:
							case n.DBTYPE.MYSQL:
							case n.DBTYPE.SQLSERVER:
							case n.DBTYPE.ORACLE:
								return !0;
							default:
								return !1;
						}
					}),
					(t.objectId = function (e) {
						return i.objectId(e);
					}),
					(t.checkRequired = function (e, t = !0) {
						return (
							null != e &&
							(!t || ("" !== e && ("string" != typeof e || "" !== e.trim())))
						);
					});
			},
			2548: (e, t) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
			},
			9307: (e, t) => {
				var r, n, i;
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ComputeOperators =
						t.NumericUpdateOperators =
						t.ArrayUpdateOperators =
						t.UpdateOperators =
						t.UpdatePullFunctions =
						t.ReturnType =
						t.ExpressionType =
						t.ConditionType =
						t.DBTYPE =
						t.SQLdatabaseTypes =
							void 0),
					(t.SQLdatabaseTypes = [
						"PostgreSQL",
						"MySQL",
						"SQL Server",
						"Oracle",
					]),
					(t.DBTYPE = {
						MONGODB: "MongoDB",
						POSTGRESQL: "PostgreSQL",
						MYSQL: "MySQL",
						SQLSERVER: "SQL Server",
						ORACLE: "Oracle",
					}),
					(function (e) {
						(e[(e.QUERY = 1)] = "QUERY"),
							(e[(e.PULL_CONDITION = 2)] = "PULL_CONDITION"),
							(e[(e.ARRAY_FILTER = 3)] = "ARRAY_FILTER");
					})(r || (t.ConditionType = r = {})),
					(function (e) {
						(e[(e.FIELD = 2)] = "FIELD"),
							(e[(e.STATIC = 3)] = "STATIC"),
							(e[(e.FUNCTION = 4)] = "FUNCTION"),
							(e[(e.ARRAY_FIELD = 5)] = "ARRAY_FIELD");
					})(n || (t.ExpressionType = n = {})),
					(function (e) {
						(e[(e.NUMBER = 1)] = "NUMBER"),
							(e[(e.TEXT = 2)] = "TEXT"),
							(e[(e.BOOLEAN = 3)] = "BOOLEAN"),
							(e[(e.OBJECT = 4)] = "OBJECT"),
							(e[(e.DATETIME = 5)] = "DATETIME"),
							(e[(e.NULL = 6)] = "NULL"),
							(e[(e.BINARY = 7)] = "BINARY"),
							(e[(e.JSON = 8)] = "JSON"),
							(e[(e.ID = 9)] = "ID"),
							(e[(e.ARRAY = 10)] = "ARRAY"),
							(e[(e.GEOPOINT = 11)] = "GEOPOINT"),
							(e[(e.UNDEFINED = 12)] = "UNDEFINED"),
							(e[(e.ANY = 13)] = "ANY"),
							(e[(e.PRIMITIVE = 14)] = "PRIMITIVE"),
							(e[(e.DATE = 15)] = "DATE"),
							(e[(e.TIME = 16)] = "TIME"),
							(e[(e.STATICBOOLEAN = 17)] = "STATICBOOLEAN");
					})(i || (t.ReturnType = i = {})),
					(t.UpdatePullFunctions = [
						"$eq",
						"$neq",
						"$lt",
						"$lte",
						"$gt",
						"$gte",
						"$in",
						"$nin",
						"$and",
						"$exists",
					]),
					(t.UpdateOperators = [
						"$set",
						"$unset",
						"$inc",
						"$mul",
						"$min",
						"$max",
						"$push",
						"$pull",
						"$pop",
						"$shift",
					]),
					(t.ArrayUpdateOperators = ["$push", "$pull", "$pop", "$shift"]),
					(t.NumericUpdateOperators = ["$inc", "$mul", "$min", "$max"]),
					(t.ComputeOperators = [
						"$count",
						"$countif",
						"$sum",
						"$avg",
						"$min",
						"$max",
					]);
			},
			2781: (e) => {
				e.exports = require("stream");
			},
		},
		t = {},
		r = (function r(n) {
			var i = t[n];
			if (void 0 !== i) return i.exports;
			var a = (t[n] = { exports: {} });
			return e[n].call(a.exports, a, a.exports, r), a.exports;
		})(341);
	module.exports = r;
})();
