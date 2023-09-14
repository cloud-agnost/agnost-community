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
								default:
									return null;
							}
						}
					});
			},
			2779: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.AgnostServerSideClient = void 0);
				const i = r(7602),
					n = r(6120),
					a = r(6760),
					o = r(9634),
					s = r(665),
					u = r(9419),
					l = r(990);
				class d extends i.APIBase {
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
							const t = new n.Storage(this.metaManager, this.adapterManager, e);
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
			6098: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Expression = void 0);
				const i = r(9307);
				t.Expression = class {
					getFunctionName() {
						return null;
					}
					getReturnType() {
						return i.ReturnType.UNDEFINED;
					}
					validate(e) {}
					validateForPull(e) {}
					hasJoinFieldValues() {
						return !1;
					}
					getReturnTypeText(e) {
						switch (e) {
							case i.ReturnType.NUMBER:
								return "numeric";
							case i.ReturnType.TEXT:
								return "string";
							case i.ReturnType.BOOLEAN:
								return "boolean";
							case i.ReturnType.OBJECT:
								return "object";
							case i.ReturnType.DATETIME:
								return "datetime";
							case i.ReturnType.NULL:
								return "null";
							case i.ReturnType.BINARY:
								return "binary";
							case i.ReturnType.JSON:
								return "json";
							case i.ReturnType.ID:
								return "id";
							case i.ReturnType.ARRAY:
								return "array";
							case i.ReturnType.GEOPOINT:
								return "geopoint";
							case i.ReturnType.UNDEFINED:
								return "undefined";
							case i.ReturnType.ANY:
								return "any";
							case i.ReturnType.PRIMITIVE:
								return "number, string, boolean or date";
							case i.ReturnType.DATE:
								return "date";
							case i.ReturnType.TIME:
								return "time";
							case i.ReturnType.STATICBOOLEAN:
								return "constant boolean";
							default:
								return e;
						}
					}
				};
			},
			7853: function (e, t, r) {
				var i =
					(this && this.__importDefault) ||
					function (e) {
						return e && e.__esModule ? e : { default: e };
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.FunctionManager = void 0);
				const n = i(r(5581)),
					a = i(r(7013)),
					o = i(r(3188)),
					s = i(r(9225)),
					u = i(r(9080)),
					l = i(r(4021)),
					d = i(r(2998)),
					c = i(r(273)),
					p = i(r(756)),
					h = i(r(2897)),
					f = i(r(9335)),
					y = i(r(711)),
					m = i(r(3510)),
					v = i(r(2327)),
					g = i(r(9674)),
					T = i(r(5850)),
					b = i(r(1946)),
					E = i(r(3115)),
					_ = i(r(5616)),
					w = i(r(7934)),
					R = i(r(6489)),
					$ = i(r(2237)),
					M = i(r(9660)),
					O = i(r(3481)),
					P = i(r(789)),
					x = i(r(6587)),
					B = i(r(7267)),
					F = i(r(6835)),
					j = i(r(5191)),
					C = i(r(2115)),
					A = i(r(6509)),
					N = i(r(4207)),
					D = i(r(6032)),
					I = i(r(2228)),
					S = i(r(6683)),
					U = i(r(587)),
					V = i(r(5102)),
					Q = i(r(4175)),
					L = i(r(929)),
					Y = i(r(1021)),
					k = i(r(1401)),
					q = i(r(6222)),
					J = i(r(5331)),
					G = i(r(3236)),
					X = i(r(2970)),
					W = i(r(6903)),
					z = i(r(1421)),
					K = i(r(8354)),
					H = i(r(9135)),
					Z = i(r(7665)),
					ee = i(r(3221)),
					te = i(r(6308)),
					re = i(r(2734)),
					ie = i(r(8374)),
					ne = i(r(6743)),
					ae = i(r(3725)),
					oe = i(r(1357)),
					se = i(r(2415)),
					ue = i(r(923)),
					le = i(r(8949)),
					de = i(r(6336)),
					ce = i(r(5365)),
					pe = i(r(4210)),
					he = i(r(4410)),
					fe = i(r(7821)),
					ye = i(r(4232)),
					me = i(r(4617)),
					ve = i(r(5160)),
					ge = i(r(3057)),
					Te = i(r(6923)),
					be = i(r(8051)),
					Ee = i(r(4184)),
					_e = i(r(6768)),
					we = i(r(6735)),
					Re = i(r(107)),
					$e = i(r(4997));
				t.FunctionManager = {
					$abs: n.default,
					$add: a.default,
					$and: o.default,
					$ceil: s.default,
					$charindex: u.default,
					$concat: l.default,
					$divide: d.default,
					$endswith: c.default,
					$eq: p.default,
					$exists: h.default,
					$floor: f.default,
					$gt: y.default,
					$gte: m.default,
					$in: v.default,
					$includes: g.default,
					$left: T.default,
					$length: b.default,
					$lower: E.default,
					$lt: _.default,
					$lte: w.default,
					$ltrim: R.default,
					$mod: $.default,
					$multiply: M.default,
					$neq: O.default,
					$nin: P.default,
					$not: x.default,
					$or: B.default,
					$right: F.default,
					$round: j.default,
					$rtrim: C.default,
					$sqrt: A.default,
					$startswith: N.default,
					$substring: D.default,
					$subtract: I.default,
					$trim: S.default,
					$upper: U.default,
					$size: V.default,
					$exp: Q.default,
					$ln: L.default,
					$log: Y.default,
					$log10: k.default,
					$pow: q.default,
					$sin: J.default,
					$cos: G.default,
					$tan: X.default,
					$sinh: W.default,
					$cosh: z.default,
					$tanh: K.default,
					$asin: H.default,
					$acos: Z.default,
					$atan: ee.default,
					$atan2: te.default,
					$asinh: re.default,
					$acosh: ie.default,
					$atanh: ne.default,
					$radians: ae.default,
					$degrees: oe.default,
					$dateAdd: se.default,
					$dateDiff: ue.default,
					$hour: le.default,
					$minute: de.default,
					$second: ce.default,
					$year: pe.default,
					$month: he.default,
					$dayOfMonth: fe.default,
					$dayOfWeek: ye.default,
					$dayOfYear: me.default,
					$strToDate: ve.default,
					$toDecimal: ge.default,
					$toBoolean: Te.default,
					$toInteger: be.default,
					$toDate: Ee.default,
					$toString: _e.default,
					$toObjectId: we.default,
					$distance: Re.default,
					$point: $e.default,
				};
			},
			5145: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Function = void 0);
				const i = r(6098),
					n = r(9307),
					a = r(990);
				class o extends i.Expression {
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
						return n.ExpressionType.FUNCTION;
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
							-1 !== this.definition.paramCount
						)
							throw new a.ClientError(
								"invalid_parameter",
								`Function '${this.name}' expects ${this.definition.paramCount} input parameter(s) but received ${t}.`
							);
						for (let t = 0; t < this.parameters.length; t++) {
							const r = this.parameters[t],
								i = r.getReturnType(),
								o = Array.isArray(this.definition.params)
									? this.definition.params[t]
									: this.definition.params;
							if (o !== n.ReturnType.ANY) {
								if (o === n.ReturnType.PRIMITIVE) {
									if (
										[
											n.ReturnType.OBJECT,
											n.ReturnType.ARRAY,
											n.ReturnType.BINARY,
											n.ReturnType.JSON,
										].includes(i)
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a '${this.getReturnTypeText(
												o
											)}' input for parameter #${
												t + 1
											} but received '${this.getReturnTypeText(i)}'.`
										);
								} else if (o === n.ReturnType.STATICBOOLEAN) {
									if (
										i !== n.ReturnType.BOOLEAN &&
										r.getExpressionType() !== n.ExpressionType.STATIC
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a 'constant boolean' input for parameter #${
												t + 1
											} but received ${this.getReturnTypeText(i)}.`
										);
								} else if (o !== i)
									throw new a.ClientError(
										"invalid_parameter",
										`Function '${
											this.name
										}' expects a '${this.getReturnTypeText(
											o
										)}' input for parameter #${
											t + 1
										} but received '${this.getReturnTypeText(i)}'.`
									);
								r.validate(e);
							}
						}
					}
					validateForPull(e) {
						if (!n.UpdatePullFunctions.includes(`$${this.name}`))
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
								i = r.getReturnType(),
								o = Array.isArray(this.definition.params)
									? this.definition.params[t]
									: this.definition.params;
							if (
								(0 !== t ||
									(r.getExpressionType() !== n.ExpressionType.FIELD &&
										r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD)) &&
								o !== n.ReturnType.ANY
							) {
								if (o === n.ReturnType.PRIMITIVE) {
									if (
										[
											n.ReturnType.OBJECT,
											n.ReturnType.ARRAY,
											n.ReturnType.BINARY,
											n.ReturnType.JSON,
										].includes(i)
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a '${this.getReturnTypeText(
												o
											)}' input for parameter #${
												t + 1
											} but received '${this.getReturnTypeText(i)}'.`
										);
								} else if (o === n.ReturnType.STATICBOOLEAN) {
									if (
										i !== n.ReturnType.BOOLEAN &&
										r.getExpressionType() !== n.ExpressionType.STATIC
									)
										throw new a.ClientError(
											"invalid_parameter",
											`Function '${
												this.name
											}' expects a 'constant boolean' input for parameter #${
												t + 1
											} but received ${this.getReturnTypeText(i)}.`
										);
								} else if (o !== i)
									throw new a.ClientError(
										"invalid_parameter",
										`Function '${
											this.name
										}' expects a '${this.getReturnTypeText(
											o
										)}' input for parameter #${
											t + 1
										} but received '${this.getReturnTypeText(i)}'.`
									);
								r.validateForPull(e);
							}
						}
					}
					getQuery(e, t) {
						if (e === n.DBTYPE.MONGODB) {
							const r = this.definition.mapping[e];
							if (1 === this.parameters.length)
								return { [r]: this.parameters[0].getQuery(e, t) };
							{
								const i = [];
								for (const r of this.parameters) i.push(r.getQuery(e, t));
								return { [r]: i };
							}
						}
						return null;
					}
					getPullQuery(e, t) {
						if (e === n.DBTYPE.MONGODB) {
							const r = this.definition.mapping[e];
							if (1 === this.parameters.length)
								return { [r]: this.parameters[0].getPullQuery(e, t) };
							{
								const i = [];
								for (const r of this.parameters) i.push(r.getPullQuery(e, t));
								return { [r]: i };
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
				t.Function = o;
			},
			5581: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("abs", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$abs" },
						});
					}
				}
				t.default = a;
			},
			7665: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("acos", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$acos" },
						});
					}
				}
				t.default = a;
			},
			8374: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("acosh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$acosh" },
						});
					}
				}
				t.default = a;
			},
			7013: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("add", {
							paramCount: -1,
							returnType: n.ReturnType.NUMBER,
							params: n.ReturnType.NUMBER,
							mapping: { MongoDB: "$add" },
						});
					}
				}
				t.default = a;
			},
			3188: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("and", {
							paramCount: -1,
							returnType: n.ReturnType.BOOLEAN,
							params: n.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$and" },
						});
					}
					getPullQuery(e, t) {
						if (t) {
							const r = [];
							for (const i of this.parameters) r.push(i.getPullQuery(e, t));
							return Object.assign({}, ...r);
						}
						return super.getPullQuery(e, t);
					}
				}
				t.default = a;
			},
			9135: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("asin", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$asin" },
						});
					}
				}
				t.default = a;
			},
			2734: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("asinh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$asinh" },
						});
					}
				}
				t.default = a;
			},
			3221: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("atan", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$atan" },
						});
					}
				}
				t.default = a;
			},
			6308: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("atan2", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$atan2" },
						});
					}
				}
				t.default = a;
			},
			6743: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("atanh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$atanh" },
						});
					}
				}
				t.default = a;
			},
			9225: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("ceil", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$ceil" },
						});
					}
				}
				t.default = a;
			},
			9080: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("charIndex", {
							paramCount: 3,
							returnType: n.ReturnType.NUMBER,
							params: [
								n.ReturnType.TEXT,
								n.ReturnType.TEXT,
								n.ReturnType.NUMBER,
							],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? this.parameters[2]
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
								  }
							: null;
					}
				}
				t.default = a;
			},
			4021: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("concat", {
							paramCount: -1,
							returnType: n.ReturnType.TEXT,
							params: n.ReturnType.TEXT,
							mapping: { MongoDB: "$concat" },
						});
					}
				}
				t.default = a;
			},
			3236: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("cos", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$cos" },
						});
					}
				}
				t.default = a;
			},
			1421: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("cosh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$cosh" },
						});
					}
				}
				t.default = a;
			},
			2415: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("dateAdd", {
							paramCount: 3,
							returnType: n.ReturnType.DATE,
							params: [
								n.ReturnType.DATE,
								n.ReturnType.NUMBER,
								n.ReturnType.TEXT,
							],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$dateAdd: {
										startDate: this.parameters[0].getQuery(e, t),
										amount: this.parameters[1].getQuery(e, t),
										unit: this.parameters[2].getQuery(e, t),
									},
							  }
							: null;
					}
				}
				t.default = a;
			},
			923: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("dateDiff", {
							paramCount: 3,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE, n.ReturnType.DATE, n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$dateDiff: {
										startDate: this.parameters[0].getQuery(e, t),
										endDate: this.parameters[1].getQuery(e, t),
										unit: this.parameters[2].getQuery(e, t),
									},
							  }
							: null;
					}
				}
				t.default = a;
			},
			7821: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("dayOfMonth", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$dayOfMonth" },
						});
					}
				}
				t.default = a;
			},
			4232: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("dayOfWeek", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$dayOfWeek" },
						});
					}
				}
				t.default = a;
			},
			4617: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("dayOfYear", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$dayOfYear" },
						});
					}
				}
				t.default = a;
			},
			1357: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("degrees", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$radiansToDegrees" },
						});
					}
				}
				t.default = a;
			},
			107: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("distance", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.GEOPOINT, n.ReturnType.GEOPOINT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getCoordinates(e) {
						return !1 === Array.isArray(e) && "object" == typeof e
							? e.coordinates
							: e + ".coordinates";
					}
					getQuery(e, t) {
						if (e === n.DBTYPE.MONGODB) {
							const r = this.parameters[0].getQuery(e, t),
								i = this.parameters[1].getQuery(e, t);
							return {
								$let: {
									vars: {
										lon1: { $arrayElemAt: [this.getCoordinates(r), 0] },
										lat1: { $arrayElemAt: [this.getCoordinates(r), 1] },
										lon2: { $arrayElemAt: [this.getCoordinates(i), 0] },
										lat2: { $arrayElemAt: [this.getCoordinates(i), 1] },
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
						}
						return null;
					}
				}
				t.default = a;
			},
			2998: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("divide", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$divide" },
						});
					}
				}
				t.default = a;
			},
			273: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("endsWith", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.TEXT, n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
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
							  }
							: null;
					}
				}
				t.default = a;
			},
			756: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("eq", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$eq" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			2897: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("exists", {
							paramCount: 1,
							returnType: n.ReturnType.BOOLEAN,
							params: n.ReturnType.ANY,
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$ne: [
										{ $type: this.parameters[0].getQuery(e, t) },
										"missing",
									],
							  }
							: null;
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				t.default = o;
			},
			4175: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("exp", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$exp" },
						});
					}
				}
				t.default = a;
			},
			9335: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("floor", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$floor" },
						});
					}
				}
				t.default = a;
			},
			711: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("gt", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$gt" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			3510: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("gte", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$gte" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			8949: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("hour", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$hour" },
						});
					}
				}
				t.default = a;
			},
			2327: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("in", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.ARRAY],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$in: [
										this.parameters[0].getQuery(e, t),
										{ $ifNull: [this.parameters[1].getQuery(e, t), []] },
									],
							  }
							: null;
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				t.default = o;
			},
			9674: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("includes", {
							paramCount: 3,
							returnType: n.ReturnType.BOOLEAN,
							params: [
								n.ReturnType.TEXT,
								n.ReturnType.TEXT,
								n.ReturnType.STATICBOOLEAN,
							],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$regexMatch: {
										input: this.parameters[0].getQuery(e, t),
										regex: this.parameters[1].getQuery(e, t),
										options:
											!1 === this.parameters[2].getQuery(e, t) ? "i" : void 0,
									},
							  }
							: null;
					}
				}
				t.default = a;
			},
			5850: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("left", {
							paramCount: 2,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$substrCP: [
										this.parameters[0].getQuery(e, t),
										0,
										this.parameters[1].getQuery(e, t),
									],
							  }
							: null;
					}
				}
				t.default = a;
			},
			1946: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("length", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$strLenCP" },
						});
					}
				}
				t.default = a;
			},
			929: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("ln", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$ln" },
						});
					}
				}
				t.default = a;
			},
			1021: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("log", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$log" },
						});
					}
				}
				t.default = a;
			},
			1401: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("log10", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$log10" },
						});
					}
				}
				t.default = a;
			},
			3115: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("lower", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$toLower" },
						});
					}
				}
				t.default = a;
			},
			5616: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("lt", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$lt" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			7934: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("lte", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$lte" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			6489: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("ltrim", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? { $ltrim: { input: this.parameters[0].getQuery(e, t) } }
							: null;
					}
				}
				t.default = a;
			},
			6336: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("minute", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$minute" },
						});
					}
				}
				t.default = a;
			},
			2237: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("mod", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$mod" },
						});
					}
				}
				t.default = a;
			},
			4410: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("month", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$month" },
						});
					}
				}
				t.default = a;
			},
			9660: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("multiply", {
							paramCount: -1,
							returnType: n.ReturnType.NUMBER,
							params: n.ReturnType.NUMBER,
							mapping: { MongoDB: "$multiply" },
						});
					}
				}
				t.default = a;
			},
			3481: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("neq", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.PRIMITIVE],
							mapping: { MongoDB: "$ne" },
						});
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				}
				t.default = o;
			},
			789: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307),
					a = r(990);
				class o extends i.Function {
					constructor() {
						super("nin", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.PRIMITIVE, n.ReturnType.ARRAY],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$not: [
										{
											$in: [
												this.parameters[0].getQuery(e, t),
												{ $ifNull: [this.parameters[1].getQuery(e, t), []] },
											],
										},
									],
							  }
							: null;
					}
					validateForPull(e) {
						super.validateForPull(e);
						const t = this.parameters[0];
						if (
							t.getExpressionType() !== n.ExpressionType.FIELD &&
							t.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
						)
							throw new a.ClientError(
								"invalid_field",
								`The first parameter of the '${this.name}' function when used for a $pull update operation or array filter condition should be a field value. Either you have typed the field name wrong or you have used a static value or function instead of a field value.`
							);
						const r = this.parameters[1];
						if (
							r.getExpressionType() !== n.ExpressionType.STATIC &&
							r.getExpressionType() !== n.ExpressionType.ARRAY_FIELD
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
				t.default = o;
			},
			6587: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("not", {
							paramCount: 1,
							returnType: n.ReturnType.BOOLEAN,
							params: n.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$custom" },
						});
					}
				}
				t.default = a;
			},
			7267: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("or", {
							paramCount: -1,
							returnType: n.ReturnType.BOOLEAN,
							params: n.ReturnType.BOOLEAN,
							mapping: { MongoDB: "$or" },
						});
					}
				}
				t.default = a;
			},
			4997: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("point", {
							paramCount: 2,
							returnType: n.ReturnType.GEOPOINT,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									type: "Point",
									coordinates: [
										this.parameters[0].getQuery(e, t),
										this.parameters[1].getQuery(e, t),
									],
							  }
							: null;
					}
				}
				t.default = a;
			},
			6222: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("pow", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$pow" },
						});
					}
				}
				t.default = a;
			},
			3725: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("radians", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$degreesToRadians" },
						});
					}
				}
				t.default = a;
			},
			6835: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("right", {
							paramCount: 2,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
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
							  }
							: null;
					}
				}
				t.default = a;
			},
			5191: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("round", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$round" },
						});
					}
				}
				t.default = a;
			},
			2115: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("rtrim", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? { $rtrim: { input: this.parameters[0].getQuery(e, t) } }
							: null;
					}
				}
				t.default = a;
			},
			5365: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("second", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$second" },
						});
					}
				}
				t.default = a;
			},
			5331: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("sin", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$sin" },
						});
					}
				}
				t.default = a;
			},
			6903: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("sinh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$sinh" },
						});
					}
				}
				t.default = a;
			},
			5102: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("size", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.ARRAY],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						if (e === n.DBTYPE.MONGODB)
							return {
								$size: { $ifNull: [this.parameters[0].getQuery(e, t), []] },
							};
					}
				}
				t.default = a;
			},
			6509: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("sqrt", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$sqrt" },
						});
					}
				}
				t.default = a;
			},
			4207: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("startsWith", {
							paramCount: 2,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.TEXT, n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$eq: [
										{
											$indexOfCP: [
												this.parameters[0].getQuery(e, t),
												this.parameters[1].getQuery(e, t),
											],
										},
										0,
									],
							  }
							: null;
					}
				}
				t.default = a;
			},
			5160: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("strToDate", {
							paramCount: 1,
							returnType: n.ReturnType.DATE,
							params: n.ReturnType.TEXT,
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? {
									$dateFromString: {
										dateString: this.parameters[0].getQuery(e, t),
										format: "%Y-%m-%d %H:%M:%S",
									},
							  }
							: null;
					}
				}
				t.default = a;
			},
			6032: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("substring", {
							paramCount: 3,
							returnType: n.ReturnType.TEXT,
							params: [
								n.ReturnType.TEXT,
								n.ReturnType.NUMBER,
								n.ReturnType.NUMBER,
							],
							mapping: { MongoDB: "$substrCP" },
						});
					}
				}
				t.default = a;
			},
			2228: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("subtract", {
							paramCount: 2,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER, n.ReturnType.NUMBER],
							mapping: { MongoDB: "$subtract" },
						});
					}
				}
				t.default = a;
			},
			2970: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("tan", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$tan" },
						});
					}
				}
				t.default = a;
			},
			8354: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("tanh", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.NUMBER],
							mapping: { MongoDB: "$tanh" },
						});
					}
				}
				t.default = a;
			},
			6923: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toBoolean", {
							paramCount: 1,
							returnType: n.ReturnType.BOOLEAN,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toBool" },
						});
					}
				}
				t.default = a;
			},
			4184: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toDate", {
							paramCount: 1,
							returnType: n.ReturnType.DATE,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toDate" },
						});
					}
				}
				t.default = a;
			},
			3057: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toDecimal", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toDecimal" },
						});
					}
				}
				t.default = a;
			},
			8051: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toInteger", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toInt" },
						});
					}
				}
				t.default = a;
			},
			6735: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toObjectId", {
							paramCount: 1,
							returnType: n.ReturnType.ID,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toObjectId" },
						});
					}
				}
				t.default = a;
			},
			6768: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("toString", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.ANY],
							mapping: { MongoDB: "$toString" },
						});
					}
				}
				t.default = a;
			},
			6683: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("trim", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$custom" },
						});
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? { $trim: { input: this.parameters[0].getQuery(e, t) } }
							: null;
					}
				}
				t.default = a;
			},
			587: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("upper", {
							paramCount: 1,
							returnType: n.ReturnType.TEXT,
							params: [n.ReturnType.TEXT],
							mapping: { MongoDB: "$toUpper" },
						});
					}
				}
				t.default = a;
			},
			4210: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 });
				const i = r(5145),
					n = r(9307);
				class a extends i.Function {
					constructor() {
						super("year", {
							paramCount: 1,
							returnType: n.ReturnType.NUMBER,
							params: [n.ReturnType.DATE],
							mapping: { MongoDB: "$year" },
						});
					}
				}
				t.default = a;
			},
			3819: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayFilterFieldValue = void 0);
				const i = r(3100),
					n = r(9307);
				class a extends i.FieldValue {
					constructor(e, t, r, i) {
						super(e, t, r, i);
					}
					getExpressionType() {
						return n.ExpressionType.ARRAY_FIELD;
					}
					validateForPull(e) {}
				}
				t.ArrayFilterFieldValue = a;
			},
			4167: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayValue = void 0);
				const i = r(6098),
					n = r(9307);
				class a extends i.Expression {
					constructor() {
						super(), (this.array = []);
					}
					getExpressionType() {
						return n.ExpressionType.STATIC;
					}
					getReturnType() {
						return n.ReturnType.ARRAY;
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
						for (const i of this.array) r.push(i.getQuery(e, t));
						return r;
					}
					getPullQuery(e, t) {
						const r = [];
						for (const i of this.array) r.push(i.getPullQuery(e, t));
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
				const i = r(6098),
					n = r(9307),
					a = r(990);
				class o extends i.Expression {
					constructor(e, t, r, i) {
						super(),
							(this.field = e),
							(this.fieldPath = t),
							(this.joinType = r),
							(this.joinModel = i);
					}
					getExpressionType() {
						return n.ExpressionType.FIELD;
					}
					getReturnType() {
						switch (this.field.getType()) {
							case "id":
							case "reference":
								return n.ReturnType.ID;
							case "text":
							case "rich-text":
							case "encrypted-text":
							case "email":
							case "link":
							case "phone":
							case "enum":
								return n.ReturnType.TEXT;
							case "createdat":
							case "updatedat":
							case "datetime":
								return n.ReturnType.DATETIME;
							case "date":
								return n.ReturnType.DATE;
							case "time":
								return n.ReturnType.TIME;
							case "boolean":
								return n.ReturnType.BOOLEAN;
							case "integer":
							case "decimal":
								return n.ReturnType.NUMBER;
							case "geo-point":
								return n.ReturnType.GEOPOINT;
							case "binary":
								return n.ReturnType.BINARY;
							case "json":
								return n.ReturnType.JSON;
							case "basic-values-list":
							case "object-list":
							case "join":
								return n.ReturnType.ARRAY;
							case "object":
								return n.ReturnType.OBJECT;
							case "array-filter":
								return n.ReturnType.ANY;
							default:
								return n.ReturnType.UNDEFINED;
						}
					}
					getQuery(e, t) {
						return e === n.DBTYPE.MONGODB
							? "none" === this.joinType && t
								? `$${t(this.fieldPath)}`
								: "complex" === this.joinType
								? `$${this.field.getQueryPath()}`
								: `$${this.fieldPath}`
							: this.fieldPath;
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
				t.FieldValue = o;
			},
			7523: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.StaticValue = void 0);
				const i = r(6098),
					n = r(9307);
				class a extends i.Expression {
					constructor(e) {
						super(), (this.value = e);
					}
					getExpressionType() {
						return n.ExpressionType.STATIC;
					}
					getReturnType() {
						return null === this.value
							? n.ReturnType.NULL
							: "string" == typeof this.value
							? n.ReturnType.TEXT
							: "number" == typeof this.value
							? n.ReturnType.NUMBER
							: n.ReturnType.BOOLEAN;
					}
					getQuery(e, t) {
						return this.value;
					}
					getPullQuery(e, t) {
						return this.getQuery(e);
					}
				}
				t.StaticValue = a;
			},
			341: function (e, t, r) {
				var i =
						(this && this.__createBinding) ||
						(Object.create
							? function (e, t, r, i) {
									void 0 === i && (i = r);
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
										Object.defineProperty(e, i, n);
							  }
							: function (e, t, r, i) {
									void 0 === i && (i = r), (e[i] = t[r]);
							  }),
					n =
						(this && this.__exportStar) ||
						function (e, t) {
							for (var r in e)
								"default" === r ||
									Object.prototype.hasOwnProperty.call(t, r) ||
									i(t, e, r);
						};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DBAction =
						t.Field =
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
				const a = r(7602);
				Object.defineProperty(t, "APIBase", {
					enumerable: !0,
					get: function () {
						return a.APIBase;
					},
				});
				const o = r(2779);
				Object.defineProperty(t, "AgnostServerSideClient", {
					enumerable: !0,
					get: function () {
						return o.AgnostServerSideClient;
					},
				});
				const s = r(6120);
				Object.defineProperty(t, "Storage", {
					enumerable: !0,
					get: function () {
						return s.Storage;
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
				const p = r(665);
				Object.defineProperty(t, "Database", {
					enumerable: !0,
					get: function () {
						return p.Database;
					},
				});
				const h = r(9831);
				Object.defineProperty(t, "Model", {
					enumerable: !0,
					get: function () {
						return h.Model;
					},
				});
				const f = r(1111);
				Object.defineProperty(t, "Field", {
					enumerable: !0,
					get: function () {
						return f.Field;
					},
				});
				const y = r(1687);
				Object.defineProperty(t, "DBAction", {
					enumerable: !0,
					get: function () {
						return y.DBAction;
					},
				});
				const m = (e, t) => new o.AgnostServerSideClient(e, t);
				t.createServerSideClient = m;
				const v = m(global.META, global.ADAPTERS);
				(t.agnost = v), n(r(9307), t);
			},
			8414: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Bucket = void 0);
				const n = r(2781),
					a = r(5979),
					o = r(990),
					s = r(9419);
				t.Bucket = class {
					constructor(e, t, r) {
						(this.name = r), (this.meta = e), (this.adapter = t);
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
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.bucketExists(this.meta, this.name);
						});
					}
					getInfo(e = !1) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new o.ClientError(
									"invalid_value",
									"New name needs to be a string value"
								);
							return yield this.adapter.renameBucket(this.meta, this.name, e);
						});
					}
					empty() {
						return i(this, void 0, void 0, function* () {
							yield this.adapter.emptyBucket(this.meta, this.name);
						});
					}
					delete() {
						return i(this, void 0, void 0, function* () {
							yield this.adapter.deleteBucket(this.meta, this.name);
						});
					}
					makePublic(e = !1) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllBucketTags(
								this.meta,
								this.name
							);
						});
					}
					updateInfo(e, t, r, n = !1) {
						return i(this, void 0, void 0, function* () {
							if (!(0, s.isString)(e))
								throw new o.ClientError(
									"invalid_value",
									"New name parameter needs to be a string value"
								);
							if (!(0, s.isObject)(r))
								throw new o.ClientError(
									"invalid_value",
									"Tags parameter needs to be a JSON object"
								);
							if (!(0, s.isBoolean)(t))
								throw new o.ClientError(
									"invalid_value",
									"isPublic parameter needs to be a boolean value"
								);
							if (!(0, s.isBoolean)(n))
								throw new o.ClientError(
									"invalid_value",
									"includeFiles parameter needs to be a boolean value"
								);
							return yield this.adapter.updateBucketInfo(
								this.meta,
								this.name,
								e,
								t,
								r,
								n
							);
						});
					}
					deleteFiles(e) {
						return i(this, void 0, void 0, function* () {
							if (!(0, s.isArray)(e))
								throw new o.ClientError(
									"invalid_value",
									"File paths parameter needs to be an array of string values"
								);
							yield this.adapter.deleteBucketFiles(this.meta, this.name, e);
						});
					}
					listFiles(e) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
							if ("stream" in e && !(e.stream instanceof n.Readable))
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
			665: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Database = void 0);
				const n = r(5421),
					a = r(9831);
				t.Database = class {
					constructor(e, t, r) {
						this.dbBase = new n.DatabaseBase(e, t, r);
					}
					model(e) {
						const t = this.dbBase.model(e);
						return new a.Model(t);
					}
					beginTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.dbBase.beginTransaction();
						});
					}
					commitTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.dbBase.commitTransaction();
						});
					}
					rollbackTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.dbBase.rollbackTransaction();
						});
					}
				};
			},
			5421: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DatabaseBase = void 0);
				const n = r(7602),
					a = r(892),
					o = r(990),
					s = global.helper;
				class u extends n.APIBase {
					constructor(e, t, r) {
						if (
							(super(e, t),
							(this.models = new Map()),
							(this.subModels = new Map()),
							(this.name = r),
							(this.meta = this.getMetadata("database", r)),
							!this.meta)
						)
							throw new o.ClientError(
								"database_not_found",
								`Cannot find the database object identified by name '${r}'`
							);
						if (
							((this.adapter = this.getAdapter("database", this.name)),
							!this.adapter)
						)
							throw new o.ClientError(
								"adapter_not_found",
								`Cannot find the adapter of the database named '${r}'`
							);
						const { models: i } = this.meta,
							n = i.filter((e) => "model" === e.type);
						for (const e of n) {
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
									s.randomInt(1, this.adapter.slaves.length) - 1
							  ].adapter
							: this.adapter.adapter;
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
					getModelByIId(e) {
						const t = this.getModelMetaByIId(e);
						return this.model(t.name);
					}
					model(e) {
						const t = this.models.get(e);
						if (!t)
							throw new o.ClientError(
								"model_not_found",
								`Cannot find the model identified by name '${e}' in database '${this.meta.name}'`
							);
						return t;
					}
					beginTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).beginTransaction(this.meta);
						});
					}
					commitTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).commitTransaction(this.meta);
						});
					}
					rollbackTransaction() {
						return i(this, void 0, void 0, function* () {
							yield this.getAdapterObj(!1).rollbackTransaction(this.meta);
						});
					}
				}
				t.DatabaseBase = u;
			},
			5979: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.File = void 0);
				const n = r(2781),
					a = r(990),
					o = r(9419);
				t.File = class {
					constructor(e, t, r, i) {
						(this.path = i),
							(this.bucketName = r),
							(this.meta = e),
							(this.adapter = t);
					}
					exists() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.fileExists(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					getInfo() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.getFileInfo(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					delete() {
						return i(this, void 0, void 0, function* () {
							yield this.adapter.deleteFile(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePublic() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePublic(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					makePrivate() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.makeFilePrivate(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					createReadStream() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.createFileReadStream(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					setTag(e, t) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.removeAllFileTags(
								this.meta,
								this.bucketName,
								this.path
							);
						});
					}
					copyTo(e) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
							if ("stream" in e && !(e.stream instanceof n.Readable))
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
					updateInfo(e, t, r) {
						return i(this, void 0, void 0, function* () {
							if (!(0, o.isString)(e))
								throw new a.ClientError(
									"invalid_value",
									"New path parameter needs to be a string value"
								);
							if (!(0, o.isObject)(r))
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
								r
							);
						});
					}
				};
			},
			6760: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Queue = void 0);
				const n = r(7602),
					a = r(990);
				class o extends n.APIBase {
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
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.sendMessage(
								this.meta,
								e,
								null != t ? t : 0
							);
						});
					}
					getMessageStatus(e) {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.getMessageTrackingRecord(
								this.meta.iid,
								e
							);
						});
					}
				}
				t.Queue = o;
			},
			6120: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Storage = void 0);
				const n = r(7602),
					a = r(990),
					o = r(8414),
					s = r(9419);
				class u extends n.APIBase {
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
						if (!(0, s.isString)(e))
							throw new a.ClientError(
								"invalid_value",
								"Bucket name needs to be a string value"
							);
						return new o.Bucket(this.meta, this.adapter, e.trim());
					}
					createBucket(e, t = !0, r, n) {
						return i(this, void 0, void 0, function* () {
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
							if (r && !(0, s.isObject)(r))
								throw new a.ClientError(
									"invalid_value",
									"Bucket tags need to be a JSON object"
								);
							return yield this.adapter.createBucket(
								this.meta,
								e.trim(),
								t,
								r,
								n
							);
						});
					}
					listBuckets(e) {
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
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
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.getStats(this.meta);
						});
					}
				}
				t.Storage = u;
			},
			9634: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.Task = void 0);
				const n = r(7602),
					a = r(990);
				class o extends n.APIBase {
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
								`Cannot find the adapter of the queue named '${r}'`
							);
					}
					runOnce() {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.triggerCronJob(this.meta);
						});
					}
					getTaskStatus(e) {
						return i(this, void 0, void 0, function* () {
							return yield this.adapter.getTaskTrackingRecord(this.meta.iid, e);
						});
					}
				}
				t.Task = o;
			},
			1687: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DBAction = void 0);
				const n = r(1779),
					a = r(8054),
					o = r(7523),
					s = r(3100),
					u = r(3819),
					l = r(4167),
					d = r(7853),
					c = r(9307),
					p = r(9419),
					h = r(990);
				class f {
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
								join: null,
								where: null,
								sort: null,
								arrayFilters: null,
								useReadReplica: !1,
							});
					}
					getCreateData() {
						return this.definition.createData;
					}
					getWhere() {
						return this.definition.where;
					}
					setMethod(e) {
						this.definition.method = e;
					}
					setId(e) {
						if (!(0, p.isValidId)(e, this.model.getDb().getType()))
							throw new h.ClientError(
								"invalid_value",
								`Not a valid record identifier '${e}'`
							);
						this.definition.id = e;
					}
					setWhere(e, t, r) {
						if (!e) return;
						const i = this.processWhereCondition(e, t, r);
						this.definition.where = i;
					}
					setSelect(e, t) {
						if (!e) return;
						if (!(0, p.isArray)(e))
							throw new h.ClientError(
								"invalid_value",
								'Select option needs to specify the names of the fields to return in an array of field names e.g., ["name", "email", "profile.age"]'
							);
						if (this.definition.omit)
							throw new h.ClientError(
								"invalid_value",
								"Either fields to include (select) or exclude (omit) can be specified not both"
							);
						if (0 === (e = e.filter((e) => "string" == typeof e && e)).length)
							return;
						const r = [],
							i = [];
						for (const n of e) {
							const e = this.getFieldObject(n, t);
							e ? r.push(Object.assign({ fieldName: n }, e)) : i.push(n);
						}
						if (i.length > 0)
							throw new h.ClientError(
								"invalid_field",
								`Select option needs to specify the names of valid fields of the base model or fields of the joined models. The following fields cannot be specified in select option '${i.join(
									", "
								)}'`
							);
						this.definition.select = r;
					}
					setOmit(e, t) {
						if (!e) return;
						if (!(0, p.isArray)(e))
							throw new h.ClientError(
								"invalid_value",
								'Select option needs to specify the names of the fields to return in an array of field names e.g., ["name", "email", "profile.age"]'
							);
						if (this.definition.select)
							throw new h.ClientError(
								"invalid_value",
								"Either fields to include (select) or exclude (omit) can be specified not both"
							);
						if (0 === (e = e.filter((e) => "string" == typeof e && e)).length)
							return;
						const r = [],
							i = [];
						for (const n of e) {
							const e = this.getFieldObject(n, t);
							e ? r.push(Object.assign({ fieldName: n }, e)) : i.push(n);
						}
						if (i.length > 0)
							throw new h.ClientError(
								"invalid_field",
								`Omit option needs to specify the names of valid fields of the base model or fields of the joined models. The following fields cannot be specified in omit option '${i.join(
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
											field: new n.JoinField({ name: r.as }, t),
											joinType: "complex",
											joinModel: t,
										};
								}
								return null;
							}
						}
						{
							let i = this.model,
								n = "none";
							for (let a = 0; a < r.length; a++) {
								const o = r[a],
									s = i.getField(o);
								if (s) {
									const u = s.getType();
									if (a === r.length - 1)
										return {
											fieldPath: e,
											field: s,
											joinType: n,
											joinModel: i,
										};
									if ("object" === u || "object-list" === u)
										i = s.getSubModel();
									else {
										if (
											"reference" !== u ||
											!this.isFieldInJoinDefinition(o, t)
										)
											return null;
										(i = this.model.getDb().getModelByIId(s.getRefModelIId())),
											(n = "complex" === n ? n : "simple");
									}
								} else {
									if (0 !== a) return null;
									{
										const e = this.getJoinDefinition(o, t);
										if (!e) return null;
										{
											const t = this.model.getDb().model(e.from);
											if (!t) return null;
											(i = t), (n = "complex");
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
					setJoin(e) {
						if (!e) return;
						const t = [];
						if ("string" == typeof e) this.processStringBasedJoin(e, e, t);
						else if ("object" != typeof e || Array.isArray(e)) {
							if (!Array.isArray(e))
								throw new h.ClientError(
									"invalid_join",
									"Not a valid join definition."
								);
							for (const r of e)
								if ("string" == typeof r) this.processStringBasedJoin(r, e, t);
								else {
									if ("object" != typeof r || Array.isArray(r))
										throw new h.ClientError(
											"invalid_join",
											"Not a valid join definition. The join array needs to include either reference field names as string or complex join definition as JSON object with 'as', 'from' and 'where' values."
										);
									this.processObjectBasedJoin(r, e, t);
								}
						} else this.processObjectBasedJoin(e, e, t);
						this.definition.join = t;
					}
					processStringBasedJoin(e, t, r) {
						const i = this.getFieldObject(e, t);
						if (!i || "reference" !== i.field.getType())
							throw new h.ClientError(
								"invalid_join",
								`'${e}' is not a valid reference field to join. You can either join reference fields or define join queries.`
							);
						const n = this.model
							.getDb()
							.getModelByIId(i.field.getRefModelIId());
						r.push({
							fieldPath: i.fieldName,
							field: i.field,
							joinType: "simple",
							joinModel: n,
							where: null,
							as: e,
							from: n.getName(),
						});
					}
					processObjectBasedJoin(e, t, r) {
						if (!e.as || !e.from || !e.where)
							throw new h.ClientError(
								"invalid_join",
								"The 'from', 'as' and 'where' parameters of a join definition need to be specified."
							);
						if (!(0, p.isString)(e.as))
							throw new h.ClientError(
								"invalid_join",
								"The 'as' parameter of the join definition needs to be string value."
							);
						if (e.as.includes("."))
							throw new h.ClientError(
								"invalid_join",
								"The 'as' parameter of the join definition cannot include '.'(dot) characters."
							);
						if (this.model.getField(e.as))
							throw new h.ClientError(
								"invalid_join",
								`The 'as' parameter should not conflict with an existing field of the base model. There is already a field named '${
									e.as
								}' in model '${this.model.getName()}'`
							);
						if (!(0, p.isString)(e.from))
							throw new h.ClientError(
								"invalid_join",
								"The 'from' parameter of the join definition needs to be string value."
							);
						if (!this.model.getDb().model(e.from))
							throw new h.ClientError(
								"invalid_join",
								`The 'from' parameter should match to the model to join. There no model named '${this.model.getName()}' in datababase '${this.model
									.getDb()
									.getName()}'`
							);
						if (!(0, p.isObject)(e.where))
							throw new h.ClientError(
								"invalid_join",
								"The 'where' parameter of the join definition needs to define the query structure as a JSON object."
							);
						const i = this.getFieldObject(e.as, t);
						if (!i || "complex" !== i.joinType || "join" !== i.field.getType())
							throw new h.ClientError(
								"invalid_join",
								`Join from '${e.from}' as '${e.as}' is not a valid join definition. You can either join reference fields or define join queries.`
							);
						const n = this.processWhereCondition(
							e.where,
							t,
							c.ConditionType.QUERY
						);
						if (!n)
							throw new h.ClientError(
								"invalid_join",
								"The 'where' condition of the join definition is missing."
							);
						r.push(
							Object.assign(Object.assign({}, i), {
								where: n,
								as: e.as,
								from: e.from,
							})
						);
					}
					processWhereCondition(e, t, r) {
						if (!e) return null;
						const i = Object.entries(e);
						if (0 === i.length) return null;
						if (i.length > 1) {
							const e = new d.FunctionManager.$and();
							for (const [n, a] of i) {
								const i = this.processExpression(n, a, t, r);
								e.addParam(i);
							}
							return (
								r === c.ConditionType.QUERY
									? e.validate(this.model.getDb().getType())
									: e.validateForPull(this.model.getDb().getType()),
								e
							);
						}
						{
							const [e, n] = i[0];
							return this.processExpression(e, n, t, r);
						}
					}
					processExpression(e, t, r, i) {
						const n = d.FunctionManager[e.toLowerCase()];
						if (n) {
							const e = new n();
							if (Array.isArray(t))
								for (const n of t) {
									const t = this.parseValue(n, r, i);
									e.addParam(t);
								}
							else {
								const n = this.parseValue(t, r, i);
								e.addParam(n);
							}
							return (
								i === c.ConditionType.QUERY
									? e.validate(this.model.getDb().getType())
									: e.validateForPull(this.model.getDb().getType()),
								e
							);
						}
						{
							const n = this.getFieldObject(e, r);
							if (n && "join" !== n.field.getType()) {
								const n = new d.FunctionManager.$eq(),
									a = this.parseValue(e, r, i),
									o = this.parseValue(t, r, i);
								return (
									n.addParam(a),
									n.addParam(o),
									i === c.ConditionType.QUERY
										? n.validate(this.model.getDb().getType())
										: n.validateForPull(this.model.getDb().getType()),
									n
								);
							}
							if (
								n ||
								"string" != typeof e ||
								i !== c.ConditionType.ARRAY_FILTER
							)
								throw new h.ClientError(
									"invalid_expression",
									`There is no comparison operator, logical operator, function or model field named '${e}'.`
								);
							{
								const n = new d.FunctionManager.$eq(),
									o = new u.ArrayFilterFieldValue(
										new a.ArrayFilterField({ name: e }, this.model, e),
										e,
										"none",
										this.model
									),
									s = this.parseValue(t, r, i);
								return (
									n.addParam(o),
									n.addParam(s),
									n.validateForPull(this.model.getDb().getType()),
									n
								);
							}
						}
					}
					parseValue(e, t, r) {
						if ("boolean" == typeof e || "number" == typeof e || null === e)
							return new o.StaticValue(e);
						if ("string" == typeof e) {
							const i = this.getFieldObject(e, t);
							return i
								? new s.FieldValue(
										i.field,
										i.fieldPath,
										i.joinType,
										i.JoinModel
								  )
								: "string" == typeof e && r === c.ConditionType.ARRAY_FILTER
								? new u.ArrayFilterFieldValue(
										new a.ArrayFilterField({ name: e }, this.model, e),
										e,
										"none",
										this.model
								  )
								: new o.StaticValue(e);
						}
						if ("object" != typeof e || Array.isArray(e)) {
							if (Array.isArray(e)) {
								const i = new l.ArrayValue();
								for (const n of e) {
									const e = this.parseValue(n, t, r);
									i.addEntry(e);
								}
								return i;
							}
							throw new h.ClientError(
								"invalid_parameter",
								`Not a valid function or operator parameter '${e}' to specify in a where condition.`
							);
						}
						{
							const i = Object.entries(e);
							if (0 === i.length)
								throw new h.ClientError(
									"invalid_parameter",
									`Not a valid function or opeartor parameter '${e}' to specify in a where condition.`
								);
							if (i.length > 1)
								throw new h.ClientError(
									"invalid_parameter",
									`Not a valid query expression. Query expression objects have a single { key: value } pair. The provided expression '${JSON.stringify(
										e
									)}' has ${i.length} keys.`
								);
							const [n, a] = i[0];
							return this.processExpression(n, a, t, r);
						}
					}
					setSort(e, t) {
						if (!e) return;
						if (!(0, p.isObject)(e))
							throw new h.ClientError(
								"invalid_value",
								'Sort definition needs to specify the fields and  their sorting order e.g., {"field1": "asc", "field2": "desc"}'
							);
						const r = [],
							i = Object.keys(e);
						for (const n of i) {
							const i = this.getFieldObject(n, t);
							if (!i)
								throw new h.ClientError(
									"invalid_field",
									`'${n}' is not a valid field that can be used to sort query results.`
								);
							const a = e[n];
							if ("asc" !== a && "desc" !== a)
								throw new h.ClientError(
									"invalid_field",
									`Sorting order '${a}' is not a valid ordering type for '${n}'. Ordering can be either 'asc' or 'desc'.`
								);
							r.push(Object.assign({ fieldName: n, order: a }, i));
						}
						r.length > 0 && (this.definition.sort = r);
					}
					setSkip(e) {
						if (null != e) {
							if (!(0, p.isInteger)(e) || e < 0)
								throw new h.ClientError(
									"invalid_value",
									"Skip count can be zero or positive integer"
								);
							this.definition.skip = e;
						}
					}
					setLimit(e) {
						if (e) {
							if (!(0, p.isPositiveInteger)(e))
								throw new h.ClientError(
									"invalid_value",
									"Limit needs to be a positive integer value"
								);
							this.definition.limit = e;
						}
					}
					setReadReplica(e) {
						if (e) {
							if (!(0, p.isBoolean)(e))
								throw new h.ClientError(
									"invalid_value",
									"Use read replica needs to be a boolean (true or fale) value"
								);
							this.definition.useReadReplica = e;
						}
					}
					setCreateData(e) {
						var t, r;
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new h.ClientError(
									"invalid_value",
									"The data to create in the database table/collection needs to be provided"
								);
							if (!(0, p.isObject)(e) && !(0, p.isArray)(e))
								throw new h.ClientError(
									"invalid_value",
									"The data to create in the database table/collection needs to be a single or an array of JSON objects"
								);
							if ((0, p.isObject)(e)) {
								const r = {},
									i = yield this.model.prepareFieldValues(e, !0, r);
								if (
									(null === (t = r.errors) || void 0 === t
										? void 0
										: t.length) > 0
								)
									throw new h.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										r.errors
									);
								this.definition.createData = i;
							} else {
								const t = [],
									i = [];
								for (let n = 0; n < e.length; n++) {
									const a = {},
										o = e[n];
									if (!o) continue;
									const s = yield this.model.prepareFieldValues(o, !0, a);
									(null === (r = a.errors) || void 0 === r
										? void 0
										: r.length) > 0
										? i.push({ entry: n, errors: a.errors })
										: t.push(s);
								}
								if (i.length > 0)
									throw new h.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										i
									);
								this.definition.createData = t;
							}
						});
					}
					setUpdates(e, t) {
						var r;
						return i(this, void 0, void 0, function* () {
							if (0 === Object.keys(e).length)
								throw new h.ClientError(
									"invalid_value",
									"The updates object needs to define at least one key-value pair"
								);
							const i = { main: {}, sub: {} },
								n = [];
							for (const [r, a] of Object.entries(e)) {
								const e = this.getFieldObject(r, t);
								if (!e)
									throw new h.ClientError(
										"invalid_field",
										`There is no field named '${r}' in model '${this.model.getName()}'`
									);
								if ("none" !== e.joinType)
									throw new h.ClientError(
										"invalid_field",
										`Field '${r}' is a field of a joined model. Only fields of model '${this.model.getName()}' can be updated.`
									);
								if (e.field.isSystemField())
									throw new h.ClientError(
										"invalid_field",
										`Field '${r}' is a system managed field. System managed fields cannot be upddate manually.'`
									);
								if (e.field.isReadOnly())
									throw new h.ClientError(
										"invalid_field",
										`Field '${r}' is a a read-only field. Read-only fields cannot be upddated.'`
									);
								if (null === a) {
									if (e.field.isRequired())
										throw new h.ClientError(
											"invalid_value",
											`Field '${r}' is a a required field. Null value cannot be assigned to a required field.`
										);
									yield this.setValue(i, e, null);
								} else if (
									("object" != typeof a && !Array.isArray(a)) ||
									(Array.isArray(a) &&
										"basic-values-list" === e.field.getType()) ||
									(Array.isArray(a) && "geo-point" === e.field.getType())
								)
									yield this.setValue(i, e, a);
								else {
									if ("object" != typeof a || Array.isArray(a))
										throw new h.ClientError(
											"invalid_value",
											`Unrecognized value '${a}' in update operation. Update instruction should be key-value paris where the value can be the value to set for the field or udpate instruction object e.g., { $inc: 4 }`
										);
									yield this.processUpdateInstruction(e, a, i, n);
								}
							}
							const a = {},
								o = yield this.model.prepareFieldValues(i.main, !1, a);
							if (
								(null === (r = a.errors) || void 0 === r ? void 0 : r.length) >
								0
							)
								throw new h.ClientError(
									"validation_errors",
									"The field update data provided has failed to pass validation rules",
									a.errors
								);
							this.definition.updateData = {
								set: Object.assign(Object.assign({}, o), i.sub),
								others: n,
							};
						});
					}
					setValue(e, t, r) {
						var n;
						return i(this, void 0, void 0, function* () {
							if (t.field.getModel().getIid() !== this.model.getIid()) {
								const i = {},
									a = {};
								if (
									(yield t.field.prepare(r, i, a, !1),
									(null === (n = a.errors) || void 0 === n
										? void 0
										: n.length) > 0)
								)
									throw new h.ClientError(
										"validation_errors",
										"The input data provided has failed to pass validation rules",
										a.errors
									);
								e.sub[t.fieldPath] = i[t.field.getName()];
							} else e.main[t.fieldPath] = r;
						});
					}
					processUpdateInstruction(e, t, r, n) {
						return i(this, void 0, void 0, function* () {
							const i = Object.keys(t);
							if (i.length > 0) {
								const n = i[0];
								if (
									!c.UpdateOperators.includes(n) &&
									"json" === e.field.getType()
								)
									return void (yield this.setValue(r, e, t));
							} else if ("json" === e.field.getType()) return void (yield this.setValue(r, e, t));
							if (i.length > 1)
								throw new h.ClientError(
									"invalid_update_instruction",
									"Update instruction should be single key-value pair where the value can be the udpate instruction object e.g., { $inc: 4 }"
								);
							const a = i[0],
								o = t[a];
							if (!c.UpdateOperators.includes(a))
								throw new h.ClientError(
									"invalid_update_instruction",
									`Update type '${a}' is not valid. Allowed update operators are '${c.UpdateOperators.join(
										", "
									)}'.`
								);
							switch (a) {
								case "$set":
									yield this.processSetInstruction(e, o, r);
									break;
								case "$unset":
									this.processUnsetInstruction(e, n);
									break;
								case "$inc":
								case "$mul":
								case "$min":
								case "$max":
									this.processNumericInstruction(e, a, o, n);
									break;
								case "$push":
									yield this.processPushInstruction(e, o, n);
									break;
								case "$pull":
									this.processPullInstruction(e, o, n);
									break;
								case "$pop":
								case "$shift":
									this.processPopShiftInstruction(e, a, n);
							}
						});
					}
					processSetInstruction(e, t, r) {
						return i(this, void 0, void 0, function* () {
							if ("object" == typeof t)
								throw new h.ClientError(
									"invalid_value",
									"Update type '$set' can have a primitive data value such as number, string, boolean but not an object."
								);
							if (null === t && e.field.isRequired())
								throw new h.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is a a required field. Null value cannot be assigned to a required field.`
								);
							yield this.setValue(r, e, t);
						});
					}
					processUnsetInstruction(e, t) {
						if (e.field.isRequired())
							throw new h.ClientError(
								"invalid_update_instruction",
								`Field '${e.fieldPath}' is a a required field and its value cannot be unset.`
							);
						if (this.model.getDb().getType() !== c.DBTYPE.MONGODB)
							throw new h.ClientError(
								"invalid_update_instruction",
								`Update type '$$unset' cannot be used in '${this.model
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
					processNumericInstruction(e, t, r, i) {
						if (!["integer", "decimal"].includes(e.field.getType()))
							throw new h.ClientError(
								"invalid_update_instruction",
								`Update type '${t}' is used to update numeric field values and it cannot be used to update field '${
									e.fieldPath
								}' which has '${e.field.getType()}' type.`
							);
						if ("number" != typeof r)
							throw new h.ClientError(
								"invalid_value",
								`Update type '${t}' needs to have a numeric value.`
							);
						if (
							"number" == typeof r &&
							"integer" === e.field.getType() &&
							!(0, p.isInteger)(r)
						)
							throw new h.ClientError(
								"invalid_value",
								`Update type '${t}' needs to have an integer value to update field '${e.fiendName}' which has 'integer' type.`
							);
						i.push({
							fieldName: e.fieldPath,
							field: e.field,
							type: t,
							value: r,
						});
					}
					processPushInstruction(e, t, r) {
						return i(this, void 0, void 0, function* () {
							if (
								!["object-list", "basic-values-list"].includes(
									e.field.getType()
								)
							)
								throw new h.ClientError(
									"invalid_update_instruction",
									`Update type '$push' is used to manage array fields (e.g., basic values list or object-list) and it cannot be used to update field '${
										e.fieldPath
									}' which has '${e.field.getType()}' type.`
								);
							if (!t && "object-list" === e.field.getType())
								throw new h.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is an object-list field. You cannot add a null value to this field.`
								);
							if ("object-list" === e.field.getType()) {
								if ("object" != typeof t)
									throw new h.ClientError(
										"invalid_value",
										`Field '${
											e.fieldPath
										}' is an object-list field. You can only push a new object(s) of type '${e.field
											.getSubModel()
											.getName()}' to this array.`
									);
								let i = [];
								if (
									("object" != typeof t || Array.isArray(t)
										? (i = t)
										: i.push(t),
									i.length > 0)
								) {
									const t = new f(e.field.getSubModel());
									yield t.setCreateData(i),
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
									throw new h.ClientError(
										"invalid_value",
										`Field '${e.fieldPath}' is a basic values list field. You can only add basic values (e.g., number, text, boolean) or array of basic values to this field.`
									);
								if (Array.isArray(t))
									for (const r of t)
										if (
											("object" == typeof r && !1 === Array.isArray(r)) ||
											Array.isArray(r)
										)
											throw new h.ClientError(
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
						if (
							!["object-list", "basic-values-list"].includes(e.field.getType())
						)
							throw new h.ClientError(
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
						if (
							!["object-list", "basic-values-list"].includes(e.field.getType())
						)
							throw new h.ClientError(
								"invalid_update_instruction",
								`Update type '$pull' is used to manage array fields (e.g., basic values list or object-list) and it cannot be used to update field '${
									e.fieldPath
								}' which has '${e.field.getType()}' type.`
							);
						if (!t)
							throw new h.ClientError(
								"invalid_update_instruction",
								"Update type '$pull' requires a condition to identify the array values to pull (remove)."
							);
						if ("object-list" === e.field.getType()) {
							const i = new f(e.field.getSubModel());
							i.setWhere(t, null, c.ConditionType.PULL_CONDITION),
								r.push({
									fieldName: e.fieldPath,
									field: e.field,
									type: "$pull",
									value: i.getWhere(),
									exp: !0,
									includeFields: !0,
								});
						} else {
							if (Array.isArray(t))
								throw new h.ClientError(
									"invalid_value",
									`Field '${e.fieldPath}' is a basic values list field. You can only remove basic values (e.g., number, text, boolean) values from this field.`
								);
							if ("object" == typeof t) {
								const i = new f(this.model);
								i.setWhere(t, null, c.ConditionType.PULL_CONDITION),
									r.push({
										fieldName: e.fieldPath,
										field: e.field,
										type: "$pull",
										value: i.getWhere(),
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
						if (!e || this.model.getDb().getType() !== c.DBTYPE.MONGODB) return;
						if (!Array.isArray(e))
							throw new h.ClientError(
								"invalid_value",
								"Array filters need to be an array of conditions."
							);
						const t = [];
						for (const r of e) {
							const e = new f(this.model);
							e.setWhere(r, null, c.ConditionType.ARRAY_FILTER),
								t.push(e.getWhere());
						}
						this.definition.arrayFilters = t;
					}
					execute() {
						return i(this, void 0, void 0, function* () {
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
											this.definition.id
										);
									break;
								case "delete":
									e = yield t
										.getAdapterObj(!1)
										.delete(
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
								case "update":
									e = yield t
										.getAdapterObj(!1)
										.update(
											t.getMetaObj(),
											this.model.getMetaObj(),
											this.definition
										);
							}
							return e;
						});
					}
				}
				t.DBAction = f;
			},
			5866: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.createField = void 0);
				const i = r(1264),
					n = r(7433),
					a = r(7984),
					o = r(6199),
					s = r(7781),
					u = r(1990),
					l = r(1126),
					d = r(86),
					c = r(5206),
					p = r(6081),
					h = r(2848),
					f = r(9677),
					y = r(736),
					m = r(2382),
					v = r(3745),
					g = r(9175),
					T = r(6666),
					b = r(335),
					E = r(1620),
					_ = r(9337),
					w = r(8811),
					R = r(8321),
					$ = r(300);
				t.createField = function (e, t) {
					switch (e.type) {
						case "id":
							return new f.IdField(e, t);
						case "text":
							return new w.TextField(e, t);
						case "rich-text":
							return new _.RichTextField(e, t);
						case "encrypted-text":
							return new c.EncryptedTextField(e, t);
						case "email":
							return new d.EmailField(e, t);
						case "link":
							return new v.LinkField(e, t);
						case "phone":
							return new b.PhoneField(e, t);
						case "boolean":
							return new a.BooleanField(e, t);
						case "integer":
							return new y.IntegerField(e, t);
						case "decimal":
							return new l.DecimalField(e, t);
						case "createdat":
							return new o.CreatedAtField(e, t);
						case "updatedat":
							return new $.UpdatedAtField(e, t);
						case "datetime":
							return new u.DateTimeField(e, t);
						case "date":
							return new s.DateField(e, t);
						case "time":
							return new R.TimeField(e, t);
						case "enum":
							return new p.EnumField(e, t);
						case "geo-point":
							return new h.GeoPointField(e, t);
						case "binary":
							return new n.BinaryField(e, t);
						case "json":
							return new m.JSONField(e, t);
						case "reference":
							return new E.ReferenceField(e, t);
						case "basic-values-list":
							return new i.BasicValuesListField(e, t);
						case "object-list":
							return new T.ObjectListField(e, t);
						case "object":
							return new g.ObjectField(e, t);
					}
				};
			},
			1111: function (e, t) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
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
						getSubModel() {
							return null;
						}
						getRefModelIId() {
							return "";
						}
						setValue(e, t, i, n = !0, a = -1) {
							return r(this, void 0, void 0, function* () {});
						}
						addValidationError(e, t, r, i = -1, n = !0) {
							const a = {};
							(a.origin = n ? "client_error" : "server_error"),
								(a.code = r),
								(a.details = {}),
								(a.details.field = this.getQueryPath()),
								i >= 0 && (a.details.index = i),
								void 0 !== t && (a.details.value = t);
							const o = e.errors;
							o ? o.push(a) : ((e.errors = []), e.errors.push(a));
						}
						prepare(e, t, i, n = !0, a = -1) {
							return r(this, void 0, void 0, function* () {
								n
									? yield this.prepareForCrete(e, t, i, a)
									: yield this.prepareForUpdate(e, t, i, a);
							});
						}
						prepareForCrete(e, t, i, n) {
							return r(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.hasDefaultValue())
										yield this.setValue(this.getDefaultValue(), t, i, !0, n);
									else if (this.isRequired())
										this.isUserField()
											? this.addValidationError(
													i,
													e,
													"missing_required_field_value",
													n
											  )
											: yield this.setValue(e, t, i, !0, n);
									else if (
										"object-list" === this.getType() ||
										"basic-values-list" === this.getType()
									)
										yield this.setValue([], t, i, !0, n);
									else {
										if (
											"object" !== this.getType() ||
											!this.hasFieldsWithDefaultValue()
										)
											return;
										yield this.setValue({}, t, i, !0, n);
									}
								else yield this.setValue(e, t, i, !0, n);
							});
						}
						prepareForUpdate(e, t, i, n) {
							return r(this, void 0, void 0, function* () {
								if (null == e || void 0 === e)
									if (this.isSystemField()) {
										if ("updatedat" !== this.getType()) return;
										yield this.setValue(e, t, i, !1, n);
									} else
										null === e &&
											(!1 === this.isRequired()
												? yield this.setValue(e, t, i, !1, n)
												: this.addValidationError(
														i,
														e,
														"invalid_required_field_value",
														n
												  ));
								else {
									if (this.isReadOnly() && this.isUserField()) return;
									yield this.setValue(e, t, i, !1, n);
								}
							});
						}
					});
			},
			9831: function (e, t) {
				var r =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
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
						delete(e, t) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.delete(e, t);
							});
						}
						updateById(e, t, i) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.updateById(e, t, i);
							});
						}
						update(e, t, i) {
							return r(this, void 0, void 0, function* () {
								return yield this.modelBase.update(e, t, i);
							});
						}
						aggregate(e, t) {
							return r(this, void 0, void 0, function* () {
								return [];
							});
						}
					});
			},
			892: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ModelBase = void 0);
				const n = r(1687),
					a = r(5866),
					o = r(9419),
					s = r(990),
					u = r(9307);
				t.ModelBase = class {
					constructor(e, t, r) {
						(this.meta = e),
							(this.parent = t),
							(this.db = r),
							(this.fields = new Map()),
							(this.timestamp = null);
						const { fields: i } = e;
						for (const e of i) {
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
					prepareFieldValues(e, t = !0, r, n = -1) {
						return i(this, void 0, void 0, function* () {
							const i = {},
								a = null != r ? r : {};
							for (const [r, o] of this.fields)
								yield o.prepare(e[r], i, a, t, n);
							return i;
						});
					}
					createOne(e) {
						return i(this, void 0, void 0, function* () {
							if ((this.resetTimestamp(), !e))
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'createOne' method expects an input object to insert into the database"
								);
							if (!(0, o.isObject)(e))
								throw new s.ClientError(
									"invalid_value",
									"The 'data' to create in the database table/collection needs to be a JSON object"
								);
							const t = new n.DBAction(this);
							return (
								t.setMethod("createOne"),
								yield t.setCreateData(e),
								yield t.execute()
							);
						});
					}
					createMany(e) {
						return i(this, void 0, void 0, function* () {
							if ((this.resetTimestamp(), !e))
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'createOne' method expects an array of input objects to insert into the database"
								);
							if (!(0, o.isArray)(e))
								throw new s.ClientError(
									"invalid_value",
									"The 'data' to create in the database table/collection needs to be an array of JSON objects"
								);
							const t = new n.DBAction(this);
							return (
								t.setMethod("createMany"),
								yield t.setCreateData(e),
								yield t.execute()
							);
						});
					}
					findById(e, t) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'findById' method expects id of the record to fetch as input"
								);
							const r = new n.DBAction(this);
							return (
								r.setMethod("findById"),
								r.setId(e),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, t.join),
									r.setOmit(t.omit, t.join),
									r.setJoin(t.join)),
								yield r.execute()
							);
						});
					}
					findOne(e, t) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'findOne' method expects the where condition to query database records"
								);
							const r = new n.DBAction(this);
							return (
								r.setMethod("findOne"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, t.join),
									r.setOmit(t.omit, t.join),
									r.setJoin(t.join),
									r.setSort(t.sort, t.join),
									r.setSkip(t.skip)),
								yield r.execute()
							);
						});
					}
					findMany(e, t) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'findMany' method expects the where condition to query database records"
								);
							const r = new n.DBAction(this);
							return (
								r.setMethod("findMany"),
								r.setWhere(
									e,
									null == t ? void 0 : t.join,
									u.ConditionType.QUERY
								),
								t &&
									(r.setReadReplica(t.useReadReplica),
									r.setSelect(t.select, t.join),
									r.setOmit(t.omit, t.join),
									r.setJoin(t.join),
									r.setSort(t.sort, t.join),
									r.setSkip(t.skip),
									r.setLimit(t.limit)),
								yield r.execute()
							);
						});
					}
					deleteById(e) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'deleteById' method expects id of the record to delete as input"
								);
							const t = new n.DBAction(this);
							return t.setMethod("deleteById"), t.setId(e), yield t.execute();
						});
					}
					delete(e, t) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'delete' method expects the where condition to query database records"
								);
							const r = new n.DBAction(this);
							return (
								r.setMethod("delete"),
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
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'updateById' method expects id of the record to update as input"
								);
							if (!t)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'updateById' method expects the update definitions as input parameter"
								);
							if (!(0, o.isObject)(t))
								throw new s.ClientError(
									"invalid_value",
									"The 'updateById' method expects the update definitions as an object of key-value pairs"
								);
							const i = new n.DBAction(this);
							return (
								i.setMethod("updateById"),
								i.setId(e),
								yield i.setUpdates(t, null),
								r &&
									(i.setSelect(r.select, null),
									i.setOmit(r.omit, null),
									i.setArrayFilters(r.arrayFilters)),
								yield i.execute()
							);
						});
					}
					update(e, t, r) {
						return i(this, void 0, void 0, function* () {
							if (!e)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the where condition to query database records"
								);
							if (!t)
								throw new s.ClientError(
									"missing_input_parameter",
									"The 'update' method expects the update definitions as input parameter"
								);
							if (!(0, o.isObject)(t))
								throw new s.ClientError(
									"invalid_value",
									"The 'update' method expects the update definitions as an object of key-value pairs"
								);
							const i = new n.DBAction(this);
							return (
								i.setMethod("update"),
								i.setWhere(
									e,
									null == r ? void 0 : r.join,
									u.ConditionType.QUERY
								),
								yield i.setUpdates(t, null),
								r && (i.setJoin(r.join), i.setArrayFilters(r.arrayFilters)),
								yield i.execute()
							);
						});
					}
				};
			},
			8054: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ArrayFilterField = void 0);
				const i = r(1111);
				class n extends i.Field {
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
				t.ArrayFilterField = n;
			},
			1264: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BasicValuesListField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || !this.isReadOnly())
								if (n || null !== e || !1 !== this.isRequired()) {
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
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BinaryField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || !this.isReadOnly()) {
								if (n || null !== e || !1 !== this.isRequired())
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
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.BooleanField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || !this.isReadOnly()) {
								if (n || null !== e || !1 !== this.isRequired())
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
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.CreatedAtField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							n && (t[this.getName()] = this.model.getTimestamp());
						});
					}
				}
				t.CreatedAtField = a;
			},
			7781: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (n && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const i = a.getDtmFromString(e.toString());
							if (!i || !i.isValid)
								return this.addValidationError(r, e, "not_date_value", o);
							t[this.getName()] = i.toJSDate();
						});
					}
				}
				t.DateField = o;
			},
			1990: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DateTimeField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (n && "$$NOW" === e)
								return void (t[this.getName()] = this.model.getTimestamp());
							const i = a.getDtmFromString(e.toString());
							if (!i || !i.isValid)
								return this.addValidationError(r, e, "not_datetime_value", o);
							t[this.getName()] = i.toJSDate();
						});
					}
				}
				t.DateTimeField = o;
			},
			1126: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.DecimalField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(r, e, "not_decimal_value", o);
							const i = this.meta.decimal,
								s = a
									.createDecimal(e)
									.toDecimalPlaces(i.decimalDigits, 4)
									.toNumber();
							t[this.getName()] = s;
						});
					}
				}
				t.DecimalField = o;
			},
			86: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EmailField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", o);
							const i = e.toString().trim();
							return "" === i && this.isRequired()
								? this.addValidationError(
										r,
										i,
										"invalid_required_field_value",
										o
								  )
								: i.length > 320
								? this.addValidationError(
										r,
										i,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isEmail(i)
								? this.addValidationError(r, i, "invalid_email_address", o)
								: void (t[this.getName()] = i);
						});
					}
				}
				t.EmailField = o;
			},
			5206: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EncryptedTextField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (
								(n ||
									null !== e ||
									!1 !== this.isRequired() ||
									(t[this.getName()] = null),
								("object" == typeof e && !1 === Array.isArray(e)) ||
									Array.isArray(e))
							)
								return this.addValidationError(r, e, "not_text_value", o);
							let i = e.toString();
							if ("" === i && this.isRequired())
								return this.addValidationError(
									r,
									i,
									"invalid_required_field_value",
									o
								);
							const s = this.meta.encryptedText;
							if (i.length > s.maxLength)
								return this.addValidationError(
									r,
									i,
									"max_length_threshold_exceeded",
									o
								);
							null != i &&
								"" !== i &&
								((i = yield a.encryptText(i)), (t[this.getName()] = i));
						});
					}
				}
				t.EncryptedTextField = o;
			},
			6081: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.EnumField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					isValueFromList(e, t) {
						const r = e.length;
						for (let i = 0; i < r; i++) if (e[i] === t) return !0;
						return !1;
					}
					setValue(e, t, r, n = !0, a = -1) {
						var o, s;
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
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
							const i = e.toString();
							if ("" === i && this.isRequired())
								return this.addValidationError(
									r,
									i,
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
							if (!this.isValueFromList(u, i))
								return this.addValidationError(
									r,
									e,
									"invalid_enumeration_value",
									a
								);
							t[this.getName()] = i;
						});
					}
				}
				t.EnumField = a;
			},
			2848: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.GeoPointField = void 0);
				const n = r(1111),
					a = r(9307);
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (!Array.isArray(e) || 2 !== e.length)
								return this.addValidationError(r, e, "not_geopoint_value"), o;
							if ("number" != typeof e[0] || !isFinite(e[0]))
								return this.addValidationError(
									r,
									e,
									"invalid_longitude_value",
									o
								);
							if ("number" != typeof e[1] || !isFinite(e[1]))
								return this.addValidationError(
									r,
									e,
									"invalid_latitude_value",
									o
								);
							const i = e[0],
								s = e[1];
							if (i < -180 || i > 180)
								return this.addValidationError(
									r,
									e,
									"invalid_longitude_value",
									o
								);
							if (s < -90 || s > 90)
								return this.addValidationError(
									r,
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
									t[this.getName()] = `POINT(${i}, ${s})`;
									break;
								case a.DBTYPE.SQLSERVER:
									t[this.getName()] = `geography::Point(${i}, ${s}, 4326)`;
									break;
								case a.DBTYPE.ORACLE:
									t[
										this.getName()
									] = `SDO_GEOMETRY(\n\t\t\t\t\t2001,            \n\t\t\t\t\tNULL,           \n\t\t\t\t\tSDO_POINT_TYPE(${i}, ${s}, NULL), \n\t\t\t\t\tNULL,            \n\t\t\t\t\tNULL             \n\t\t\t\t)`;
							}
						});
					}
				}
				t.GeoPointField = o;
			},
			9677: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IdField = void 0);
				const n = r(1111);
				global.helper;
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {});
					}
				}
				t.IdField = a;
			},
			736: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.IntegerField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if ("number" != typeof e || !isFinite(e))
								return this.addValidationError(r, e, "not_integer_value", o);
							const i = a.createDecimal(e).toDecimalPlaces(0).toNumber();
							t[this.getName()] = i;
						});
					}
				}
				t.IntegerField = o;
			},
			1779: (e, t, r) => {
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JoinField = void 0);
				const i = r(1111);
				class n extends i.Field {
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
				t.JoinField = n;
			},
			2382: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.JSONField = void 0);
				const n = r(1111),
					a = r(9307);
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || !this.isReadOnly())
								if (n || null !== e || !1 !== this.isRequired()) {
									if ("object" != typeof e)
										return this.addValidationError(r, e, "not_json_value", o);
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
			3745: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.LinkField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", o);
							const i = e.toString().trim();
							return "" === i && this.isRequired()
								? this.addValidationError(
										r,
										i,
										"invalid_required_field_value",
										o
								  )
								: i.length > 2048
								? this.addValidationError(
										r,
										i,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isLink(i)
								? this.addValidationError(r, i, "invalid_URL", o)
								: void (t[this.getName()] = i);
						});
					}
				}
				t.LinkField = o;
			},
			9175: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectField = void 0);
				const n = r(892),
					a = r(1111),
					o = r(990);
				class s extends a.Field {
					constructor(e, t) {
						super(e, t);
						const r = t.getDb().getModelMetaByIId(e.object.iid);
						if (!r)
							throw new o.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new n.ModelBase(r, t, t.getDb())),
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
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || null !== e || !1 !== this.isRequired())
								return !n && e
									? this.addValidationError(
											r,
											e,
											"direct_object_assignment_not_allowed",
											a
									  )
									: "object" != typeof e || Array.isArray(e)
									? this.addValidationError(r, e, "not_object_value", a)
									: void (n && (t[this.getName()] = {}));
							t[this.getName()] = null;
						});
					}
					prepare(e, t, r, n = !0, a = -1) {
						const o = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return i(this, void 0, void 0, function* () {
							if ((yield o.prepare.call(this, e, t, r, n), n)) {
								const i = yield this.subModel.prepareFieldValues(
									e || {},
									n,
									r,
									a
								);
								t[this.getName()] = i;
							}
						});
					}
				}
				t.ObjectField = s;
			},
			6666: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ObjectListField = void 0);
				const n = r(892),
					a = r(1111),
					o = r(990);
				class s extends a.Field {
					constructor(e, t) {
						super(e, t);
						const r = t.getDb().getModelMetaByIId(e.objectList.iid);
						if (!r)
							throw new o.ClientError(
								"submodel_not_found",
								`Cannot find the sub-model of the field '${
									e.name
								}' in model '${t.getName()}' in database '${t
									.getDb()
									.getName()}'`
							);
						(this.subModel = new n.ModelBase(r, t, t.getDb())),
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
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (n || null !== e || !1 !== this.isRequired()) {
								if (!n && Array.isArray(e))
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
								n && (t[this.getName()] = []);
							} else t[this.getName()] = [];
						});
					}
					prepare(e, t, r, n = !0, a = -1) {
						const o = Object.create(null, {
							prepare: { get: () => super.prepare },
						});
						return i(this, void 0, void 0, function* () {
							if ((yield o.prepare.call(this, e, t, r, n, a), n)) {
								e = e || [];
								for (let i = 0; i < e.length; i++) {
									const a = e[i],
										o = yield this.subModel.prepareFieldValues(a, n, r, i);
									t[this.getName()].push(o);
								}
							}
						});
					}
				}
				t.ObjectListField = s;
			},
			335: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.PhoneField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", o);
							const i = e.toString().trim();
							return "" === i && this.isRequired()
								? this.addValidationError(
										r,
										i,
										"invalid_required_field_value",
										o
								  )
								: i.length > 16
								? this.addValidationError(
										r,
										i,
										"max_length_threshold_exceeded",
										o
								  )
								: !1 === a.isMobilePhone(i)
								? this.addValidationError(r, i, "invalid_phone_number", o)
								: void (t[this.getName()] = i);
						});
					}
				}
				t.PhoneField = o;
			},
			1620: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.ReferenceField = void 0);
				const n = r(1111),
					a = r(9307),
					o = global.helper;
				class s extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					getRefModelIId() {
						var e;
						return null === (e = this.meta.reference) || void 0 === e
							? void 0
							: e.iid;
					}
					setValue(e, t, r, n = !0, s = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_reference_value", s);
							const i = e.toString().trim();
							if (!i && this.isRequired())
								return this.addValidationError(
									r,
									i,
									"invalid_required_field_value",
									s
								);
							switch (this.getDBType()) {
								case a.DBTYPE.MONGODB:
									if (!o.isValidId(i))
										return this.addValidationError(
											r,
											i,
											"invalid_mongodb_id",
											s
										);
									t[this.getName()] = o.objectId(i);
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
			9337: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.RichTextField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", a);
							const i = e.toString();
							if ("" === i && this.isRequired())
								return this.addValidationError(
									r,
									i,
									"invalid_required_field_value",
									a
								);
							t[this.getName()] = i;
						});
					}
				}
				t.RichTextField = a;
			},
			8811: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TextField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							if (
								("object" == typeof e && !1 === Array.isArray(e)) ||
								Array.isArray(e)
							)
								return this.addValidationError(r, e, "not_text_value", a);
							const i = e.toString();
							if ("" === i && this.isRequired())
								return this.addValidationError(
									r,
									i,
									"invalid_required_field_value",
									a
								);
							const o = this.meta.text;
							if (i.length > o.maxLength)
								return this.addValidationError(
									r,
									i,
									"max_length_threshold_exceeded",
									a
								);
							t[this.getName()] = i;
						});
					}
				}
				t.TextField = a;
			},
			8321: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.TimeField = void 0);
				const n = r(1111),
					a = global.helper;
				class o extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, o = -1) {
						return i(this, void 0, void 0, function* () {
							if (!n && this.isReadOnly()) return;
							if (!n && null === e && !1 === this.isRequired())
								return void (t[this.getName()] = null);
							const i = a.getTimeFromString(e.toString());
							if (!i) return this.addValidationError(r, e, "not_time_value", o);
							t[this.getName()] = i;
						});
					}
				}
				t.TimeField = o;
			},
			300: function (e, t, r) {
				var i =
					(this && this.__awaiter) ||
					function (e, t, r, i) {
						return new (r || (r = Promise))(function (n, a) {
							function o(e) {
								try {
									u(i.next(e));
								} catch (e) {
									a(e);
								}
							}
							function s(e) {
								try {
									u(i.throw(e));
								} catch (e) {
									a(e);
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
											  })).then(o, s);
							}
							u((i = i.apply(e, t || [])).next());
						});
					};
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.UpdatedAtField = void 0);
				const n = r(1111);
				class a extends n.Field {
					constructor(e, t) {
						super(e, t);
					}
					setValue(e, t, r, n = !0, a = -1) {
						return i(this, void 0, void 0, function* () {
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
					(t.isValidId =
						t.isArray =
						t.isInteger =
						t.isPositiveInteger =
						t.valueExists =
						t.isString =
						t.isBoolean =
						t.isObject =
							void 0);
				const i = r(9307),
					n = global.helper;
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
					(t.isInteger = function (e) {
						return !("number" != typeof e || !Number.isInteger(e));
					}),
					(t.isArray = function (e) {
						return Array.isArray(e);
					}),
					(t.isValidId = function (e, t) {
						if (!e) return !1;
						if ("number" != typeof e && "string" != typeof e) return !1;
						switch (t) {
							case i.DBTYPE.MONGODB:
								return !!n.isValidId(e.toString());
							case i.DBTYPE.POSTGRESQL:
							case i.DBTYPE.MYSQL:
							case i.DBTYPE.SQLSERVER:
							case i.DBTYPE.ORACLE:
								return !0;
							default:
								return !1;
						}
					});
			},
			9307: (e, t) => {
				var r, i, n;
				Object.defineProperty(t, "__esModule", { value: !0 }),
					(t.NumericUpdateOperators =
						t.ArrayUpdateOperators =
						t.UpdateOperators =
						t.UpdatePullFunctions =
						t.ReturnType =
						t.ExpressionType =
						t.ConditionType =
						t.DBTYPE =
							void 0),
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
					})(i || (t.ExpressionType = i = {})),
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
					})(n || (t.ReturnType = n = {})),
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
					(t.NumericUpdateOperators = ["$inc", "$mul", "$min", "$max"]);
			},
			2781: (e) => {
				e.exports = require("stream");
			},
		},
		t = {},
		r = (function r(i) {
			var n = t[i];
			if (void 0 !== n) return n.exports;
			var a = (t[i] = { exports: {} });
			return e[i].call(a.exports, a, a.exports, r), a.exports;
		})(341);
	module.exports = r;
})();
