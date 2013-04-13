/*
drjs.js
- A JavaScript graphics library based on DOM and CSS.

Version: 0.2.1
Copyright (c) 2008 oldJ, Sansi.Org
License: LGPL

LastUpdate: 2008-8-16
Author: oldj
Blog: http://oldj.net/
*/

(function () {
	//私有方法
	var pm = {
		dot2dom: function (dot) {
			//画一个点（一个div矩形）
			var div = document.createElement("div");
			div.style.position = "absolute";
			div.style.left = dot[0] + "px";
			div.style.top = dot[1] + "px";
			div.style.width = dot[2] + "px";
			div.style.height = dot[3] + "px";
			div.style.overflow = "hidden";
			div.style.backgroundColor = dot[4] || "#000";
			div.style.borderWidth = 0;

			return div;
		},
		dotStroke: function (dot, stroke) {
			if (stroke > 1) {
				var v = Math.round((stroke) / 2)
				dot[0] -= v;
				dot[1] -= v;
				dot[2] += v;
				dot[3] += v;
			}
			return dot;
		},
		merge: function (dots) {
			//将多组点合并为一组点
			var dot = [], i, j, l, d0, d1;

			//将数组拆分、合并
			while (dots[0])
				dot.push.apply(dot, dots.splice(0, 1)[0]);

			/*l = dot.length;
			//合并可合并的点
			for (i = 0; i < l; i ++) {
				d0 = dot[i];
				for (j = i + 1; j < l; j ++) {
					d1 = dot[j];

				}
			}*/

			return dot;
		},
		newColor: function (colorIdx) {
			//返回一个新的颜色
			var clr = "";
			colorIdx = typeof(colorIdx) == "number" ? colorIdx : pv.colors.length;
			if (pv.colors[colorIdx]) {
				clr = pv.colors[colorIdx];
			} else {
				//随机生成一个新的颜色
				clr = "#";
				while (clr.length < 7)
					clr += Math.floor(Math.random() * 16).toString(16);
			}
			return clr;
		}
	};

	//私有变量
	var pv = {
		colors: [	//常用的颜色，绘图时如未指定颜色将依次从本颜色表中读取
			"#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#0000FF",
			"#840084", "#FF00FF", "#008200", "#FF0066", "#CEDF39",
			"#D5FF00", "#848200", "#00FF84", "#0082FF", "#84FFFF",
			"#004184", "#8482FF", "#8400FF", "#FF0084", "#844100",
			"#FF8242", "#848242", "#FF8500", "#BEB05A", "#BEB0E1"
		]

	};

	//预设函数
	var drFunc = {
		arc: function (canvas, p) {
			//画一个扇形
			//参数形式 [a, b, angle1, angle2, noBorder]，角度是360度制，noBorder为可选，
			//如指定noBorder为true，则将只给出圆弧
			var a = p[0], b = p[1],
				angle1 = Math.min(p[2], p[3]) % 360, angle2 = Math.max(p[2], p[3]) % 360,
				noBorder = p[4],
				f = [], ray1, ray2;

			if (angle2 - angle1 >= 360)
				return drFunc.oval(canvas, {a: a, b: b});	//如果两个角度相差大于360度，返回椭圆

			//计算椭圆与射线的交点
			var getIntersection = function (a, b, c, angle) {
				var x = a * b * Math.sqrt(1 / (b * b + a * a * c * c)),
					sign = Math.cos(Math.PI * angle / 180) > 0 ? 1 : - 1;	//根据射线所在区间，计算x、y的正负号
				return x * sign + a;
			};

			//根据角度计算射线方程
			var c1 = Math.tan(Math.PI * angle1 / 180),
				c2 = Math.tan(Math.PI * angle2 / 180);
			ray1 = function (x) {
				return c1 * x;
			};
			ray2 = function (x) {
				return c2 * x;
			};

			var oval = function (sign, x0, x1) {
				return {
					f: function (x) {
						return b * (1 + sign * Math.sqrt(1 - (x - a) * (x - a) / (a * a)));
					},
					interval: [x0, x1]
				}
			}

			//交点
			var x1 = getIntersection(a, b, c1, angle1),
				x2 = getIntersection(a, b, c2, angle2),
				y1 = ray1(x1 - a) + b,
				y2 = ray2(x2 - a) + b;

			//if (x1 == a)
			//	y1 = (1 + Math.sin(Math.PI * angle1 / 180)) * b;
			//if (x2 == a)
			//	y2 = (1 + Math.sin(Math.PI * angle2 / 180)) * b;

			//将射线方程及区间添加到函数组中
			if (!noBorder) {
				f.push.apply(f, drFunc.polyline(canvas, [[x1, y1], [a, b], [x2, y2]]));
			}

			//判断射线区间是否包含X轴
			if (angle1 <= -180) {
				if (angle2 <= -180) {
					f.push(oval(1, x2, x1));
				} else if (angle2 <= 0) {
					f.push(oval(1, 0, x1));
					f.push(oval(-1, 0, x2));
				} else {
					f.push(oval(1, 0, x1));
					f.push(oval(-1, 0, a * 2));
					f.push(oval(1, x2, a * 2));
				}
			} else if (angle1 <= 0) {
				if (angle2 <= 0) {
					f.push(oval(-1, x1, x2));
				} else if (angle2 < 180) {
					f.push(oval(-1, x1, a * 2));
					f.push(oval(1, x2, a * 2));
				} else {
					f.push(oval(-1, x1, a * 2));
					f.push(oval(1, 0, a * 2));
					f.push(oval(-1, 0, x2));
				}
			} else if (angle1 <= 180) {
				if (angle2 <= 180) {
					f.push(oval(1, x2, x1));
				} else {
					f.push(oval(1, 0, x1));
					f.push(oval(-1, 0, x2));
				}
			} else {
				f.push(oval(-1, x1, x2));
			}

			return f;
		},
		box: function (canvas, p) {
			//画一个方框
			//参数p格式： [width, height, cssStyleObject]
			//如 [100, 200, {border: "solid 1px #000", background: "#ff0"}]
			var shape = new drjs.Shape(canvas),
				css0 = {	//默认样式
					width: p[0] + "px",
					height: p[1] + "px",
					borderStyle: "solid",
					borderWidth: "1px",
					borderColor: "#000"
				},
				css = p[2] || {},
				k;
			for (k in css0)
				if (!css[k]) css[k] = css0[k];
			for (k in css)
				shape.container.style[k] = css[k];
			return shape.paint();
		},
		dot: function (canvas, p) {
			//画一个点
			//参数形式 [x, y]
			return [[p[0], p[1], 1, 1]];
		},
		img: function (canvas, p) {
			//在画布中添加一个图片
			//参数形式 [src: "1.gif", style: {width: "20px", height: "20px", border: 0}]
			return (new drjs.Shape(canvas)).setImg(p[0], p[1] || {}).paint();
		},
		line: function (canvas, p) {
			//画一条线
			var a, b, x0 = p[0][0], y0 = p[0][1], x1 = p[1][0], y1 = p[1][1];
			if (x0 == x1) {
				//竖线单独处理
				return [[Math.min(x0, x1), Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1]];
			} else {
				a = (y0 - y1) / (x0 - x1);
				b = (x0 * y1 - x1 * y0) / (x0 - x1);
				return [{
					f: function (x) {
						return a * x + b;
					},
					interval: [Math.min(x0, x1), Math.max(x0, x1)]
				}];
			}
		},
		polyline: function (canvas, p) {
			//画折线
			//参数的形式为：[[x0, y0], [x1, y1], [x2, y2] ...]

			var i, l = p.length, functions = [];
			for (i = 1; i < l; i ++) {
				functions.push(drFunc.line(canvas, [p[i - 1], p[i]])[0]);
			}
			return functions;
		},
		polygon: function (canvas, p) {
			//画多边形
			//与画折线类似，参数p为多边形各顶点
			p.push(p[0]);
			return drFunc.polyline(canvas, p);
		},
		oval: function (canvas, p) {
			//画椭圆
			//参数的形式为：[a, b]
			var a = p[0], b = p[1];
			return [{
				f: function (x) {
					return b * (1 + Math.sqrt(1 - (x - a) * (x - a) / (a * a)));
				},
				interval: [0, a * 2]
			}, {
				f: function (x) {
					return b * (1 - Math.sqrt(1 - (x - a) * (x - a) / (a * a)));
				},
				interval: [0, a * 2]
			}]
		},
		rectangle: function (canvas, p) {
			//画矩形
			//参数形式为：[x, y, width, height]
			var x = p[0], y = p[1], x1 = x + p[2], y1 = y + p[3];
			return drFunc.polygon(canvas, [[x, y], [x1, y], [x1, y1], [x, y1]]);
		},
		string: function (canvas, p, color) {
			//写文字
			//参数形式 [str, cssObj]
			var css = p[1] || {};
			if (color)
				css.color = color;
			return (new drjs.Shape(canvas)).setText(p[0], css).paint();
		}
	}

	//主对象
	drjs = {	//drjs是全局变量，在外部可访问
		addFunc: function (name, func) {
			//添加一个函数到drFunc中，如果该函数已经存在则覆盖
			drFunc[name] = func;
		},
		Canvas: function (p, parent) {
			//画布类，用这个类生成一块新的画布
			//参数p为对象类型
			p = typeof(p) == "object" ? p : {width:480,height:360};

			this.container = document.createElement("div");
			this.shapes = [];
			this.items = {};
			this.groups = {};
			this.parent = parent ? (
				typeof(parent) == "string" ?
					document.getElementById(parent) :
					parent
				) : document.getElementsByTagName("body")[0];

			this._colorIdx = 0;

			//设置默认样式
			this.style({
				position: "relative",
				padding: 0,
				margin: 0,
				width: p.width ? p.width + "px" : "480px",
				height: p.height ? p.height + "px" : "360px",
				lineHeight: p.lineHeight ? p.lineHeight + "px" : "20px",
				overflow: "hidden",
				backgroundColor: p.backgroundColor || "#fff",
				backgroundImage: p.backgroundImage || "none",
				borderWidth: p.borderWidth ? p.borderWidth + "px" : 0,
				borderStyle: p.borderStyle || "solid",
				borderColor: p.borderColor || "#000"
			});
		},
		Shape: function (canvas, dots, name) {
			//形状类
			if (!canvas) return null;

			this.canvas = canvas;	//画布对象，通过这个接口可以访问画布内的属性
			this.dots = dots || [];
			this.canvas.shapes.push(this);
			this.name = name ? name : "shape_" + this.canvas.shapes.length;

			this.container = document.createElement("div");
			this.container.style.position = "absolute";
			this.container.setAttribute("id", "drjs_shape_" + this.name);

			this.init();
		},
		Item: function (canvas, name) {
			//项目类
			this.canvas = canvas;
			this.name = name;
			this.shapes = [];
			this.container = document.createElement("div");
			this.container.style.position = "absolute";
			this.container.setAttribute("id", "drjs_item_" + this.name);

			this.canvas.items[this.name] = this;
			this.canvas.container.appendChild(this.container);

			return this;
		}
	};

	drjs.Canvas.prototype.colorIdx = function () {
		return this._colorIdx ++;
	};

	drjs.Canvas.prototype.count = function () {
		//计算当前画布使用了多少dom元素
		return this.container.getElementsByTagName("div").length;
	};

	drjs.Canvas.prototype.style = function (obCSS) {
		//用一个css对象来设置当前画布的样式

		for (var k in obCSS) {
			this.container.style[k] = obCSS[k];
		}
	};

	drjs.Canvas.prototype.newColor = function () {
		return pm.newColor(this.colorIdx());
	};

	drjs.Canvas.prototype.show = function () {
		//将画布显示到页面中

		this.parent.appendChild(this.container);
	};

	drjs.Canvas.prototype.clear = function () {
		this.container.innerHTML = "";
	};

	drjs.Canvas.prototype.draw = function (drawType, parameters, left, top, color, fill, stroke) {
		//在指定画布上绘图
		//返回值为一个Shap对象

		//根据drawType返回对应的函数组
		var functions, shape;
		if (typeof(drawType) == "string" && (drawType in drFunc)) {
			functions = drFunc[drawType](this, parameters, color);
		} else if (drawType instanceof Array) {
			functions = drawType;
		} else if (typeof(drawType) == "object") {
			functions = [drawType];
		} else {
			throw new Error("drawType Error!");
		}

		if (functions instanceof drjs.Shape)
			shape = functions;
		else
			shape = new drjs.Shape(this, this.mkDots(
				functions, color, fill, stroke
			));
		shape.setTop(top || 0);
		shape.setLeft(left || 0);
		shape.paint();

		return shape;
	};

	drjs.Canvas.prototype.mkDots = function (functions, color, fill, stroke) {
		//根据指定函数及区间生成相应的点
		/*
		* functions参数说明如下：
		* functions为一个数组
		* 每个元素为一个对象，形如
		* {
		* 	f: 需要执行的函数，y = f(x)
		* 	interval: [x0, x1]
		* 		x0: x的最小值
		* 		x1: x的最大值
		* }
		* functions的内容也可以为点（[x, y, width, height]），如果是点，则处理后返回
		* 参数 fill 为是否填充，默认为不填充
		* 本方法将绘制指定函数 y = f(x) 在区间[x0, x1]上的线条
		* 返回值为dots数组
		*/
		color = color || pm.newColor(this.colorIdx());
		stroke = stroke || 1;
		/*if (functions[0] && (functions[0] instanceof Array) && functions[0].length == 4) {
			//如果传入的functions已经是点阵
			for (var k = 0, l = functions.length; k < l; k ++) {
				try {
					functions[k].push(color);
					functions[k] = pm.dotStroke(functions[k], stroke);
				} catch (e) {
				}
			}
			return functions;
		}*/

		var i, f, x, y, x0 = 0, x1 = 0, dots = [], dot, tmp;

		if (!fill) {
			//不填充画法
			for (i = 0; i < functions.length; i ++) {
				//对每一个函数分别求值
				dots[i] = [];	//当前函数的值保存在此数组中
				//如果当前元素是点
				if ((functions[i] instanceof Array)) {
					functions[i][4] = color;
					dots[i].push(functions[i]);
					continue;
				}
				f = functions[i].f;
				x0 = functions[i].interval[0];
				x1 = functions[i].interval[1];
				for (x = x0; x <= x1; x ++) {
					//color = pm.newColor();
					y = Math.round(f(x));	//求得f(x)的值并四舍五入
					if (dots[i][0]) {
						//如果存在上一个点，判断当前点与上一个点是否可合并，是否需要填充
						dot = dots[i][dots[i].length - 1];	//上一个点
						if (dot[1] == y && dot[3] == 1) {
							//如果当前点与上一个点在同一水平线上，并且上一个点为小点或横线
							//将当前点与上一个点合并
							dot[2] ++;
						} else if (dot[1] <= y && dot[1] + dot[3] >= y && Math.round(f(x - 1)) != y) {
							//如果当前点与上一个点连续，并且上一个点不是小点
							dot[3] = Math.abs(dot[1] - y);	//修正上一个点的高度
							if (dot[3] == 0) dot[3] = 1;
							//将当前点添加为新点
							dots[i].push([x, y, 1, 1, color]);
						} else if (Math.abs(y - dot[1]) > 1) {
							//如果当前点与上一个点不连续，需要填充或拉伸以使曲线平滑
							tmp = Math.round(f(x - 0.5));
							if (tmp == dot[1]) tmp += (y > dot[1] ? 1 : -1);
							//修正前一个点
							if (Math.abs(tmp - dot[1]) > 1) {
								if (dot[2] > 1) {
									//添加一个填充
									dots[i].push([x - 1, Math.min(tmp, dot[1]), 1, Math.abs(tmp - dot[1]), color]);
								} else {
									//前一个点拉长
									if (tmp > dot[1]) {
										dot[3] = Math.abs(tmp - dot[1]);
										dot[1] = Math.min(tmp, dot[1]);
									} else {
										dot[3] = Math.abs(tmp - dot[1]) + dot[3] - 1;
										dot[1] = Math.min(tmp + 1, dot[1]);
									}
								}
							}
							//修正当前点
							//将当前点拉长
							dots[i].push([x, Math.min(tmp, y), 1, Math.abs(tmp - y) + 1, color]);
							//dots[i].push([x, y, 1, 1, color]);
						} else {
							//将当前点添加为新点
							dots[i].push([x, y, 1, 1, color]);
						}
					} else {
						//将当前点添加为新点
						dots[i].push([x, y, 1, 1, color]);
					}
				}
			}

			//将dots合并为一个数组
			dots = pm.merge(dots);
		} else {
			//填充画法
			var ys = [],	//y的值
				funcLen = functions.length;

			//得到最小x0和最大x1
			for (i = 0; i < funcLen; i ++) {
				if (functions[i].interval && functions[i].interval[0] < x0)
					x0 = functions[i].interval[0];
				if (functions[i].interval && functions[i].interval[1] > x1)
					x1 = functions[i].interval[1];
			}

			for (x = x0; x < x1; x ++) {
				ys.length = 0;
				for (i = 0; i < funcLen; i ++) {
					if (functions[i].interval && x >= functions[i].interval[0] && x <= functions[i].interval[1]) {
						//如果当前x在函数x值区间内，计算其y并存入ys
						tmp = Math.round(functions[i].f(x));
						if (!isNaN(tmp)) ys.push(tmp);
					}
				}
				if (ys.length < 2) continue;

				ys.sort(function (a, b) {return a - b});
				//如果数组前两个值相同，去掉第一个（例如折线顶点）
				if (ys.length > 1 && ys[0] == ys[1])
					ys.shift();

				for (i = 0; i < ys.length - 1; i += 2) {
					if (dots[0]) {
						//判断当前点与前一个点是否能合并
						dot = dots[dots.length - 1];
						if (dot[0] + dot[2] == x &&
							dot[1] == ys[i] &&
							ys[i + 1] - ys[i] + 1 == dot[3]) {
							//如果可以合并
							dot[2] ++;
						} else {
							//添加新的点
							dots.push([x, ys[i], 1, ys[i + 1] - ys[i] + 1, color]);
						}
					} else {
						//添加新的点
						dots.push([x, ys[i], 1, ys[i + 1] - ys[i] + 1, color]);
					}
				}
			}
		}

		//如果不填充且stroke>1
		if (!fill && stroke > 1) {
			for (i = 0; i < dots.length; i ++)
				dots[i] = pm.dotStroke(dots[i], stroke);
		}

		return dots;
	};

	drjs.Canvas.prototype.newItem = function (name) {
		return new drjs.Item(this, name);
	};

	drjs.Canvas.prototype.chart = function (chartName, chartType, width, height, values, labels, colors, stroke) {
		//绘制图表
		var item = this.newItem(chartName),
			val = [],
			max = Math.max.apply(Math.max, values),
			len = values.length,
			sum = 0,
			i, c;
		for (i = 0; i < len; i ++)
			sum += values[i];

		if (chartType == "bar") {
			var sp = 2,
				w = (width + sp) / len,	//每个直方图的宽度，包括空隙
				h = 0,
				c = colors && colors[0] ? colors[0] : this.newColor();
			for (i = 0; i < len; i ++) {
				h = Math.round(height * values[i] / max);
				//item.addShape(this.draw("box", [Math.round(w - 2), h, {background: c}], Math.round((w + sp) * i), height - h));
				item.addShape(this.draw("rectangle", [Math.round(w * i), height - h, Math.round(w - sp), h], 0, 0, c, true));
			}
		} else if (chartType == "pie") {
			var a = Math.round(width / 2),
				b = Math.round(height / 2);
			/*if (width > height) {
				//画阴影
				item.addShape(this.draw("oval", [a, b], 0, Math.round(30 * (1 - height / width)), "gray", true));
			}*/
			var angles = [-90], sum2 = 0;
			for (i = 0; i < len; i ++) {
				sum2 += values[i];
				angles.push(360 * sum2 / sum - 90);
			}
			for (i = 1; i < angles.length; i ++) {
				item.addShape(this.draw("arc", [a, b, angles[i - 1], angles[i]], 0, 0, colors ? (colors[i - 1] ? colors[i - 1] : null) : null, true));
			}
		} else if (chartType == "polyline") {
			var dots = [],
				w = width / len;
			for (i = 0; i < len; i ++) {
				dots.push([Math.round(w * (i + 0.5)), height - Math.round(height * values[i] / max)]);
			}
			item.addShape(this.draw("polyline", dots, 0, 0, null, false, stroke || 1));
		}

		return item;
	};

	//Shape类的方法
	drjs.Shape.prototype = {
		addDots: function (dots) {
			//向Shape添加点
			this.dots.push.apply(this.dots, dots);
			this.init(dots);
			return this;
		},
		init: function (dots) {
			var df = document.createDocumentFragment ?
					document.createDocumentFragment() :
					document.createElement("div"),
				dot;
			dots = dots || this.dots;
			for (var i = 0, l = dots.length; i < l; i ++) {
				dot = pm.dot2dom(dots[i]);
				df.appendChild(dot);
			}
			this.container.appendChild(df);
			return this;
		},
		paint: function () {
			//将shape添加到画布
			this.canvas.container.appendChild(this.container);
			return this;
		},
		remove: function () {
			//删除形状，并释放相应资源
			for (var i = 0; i < this.canvas.shapes.length; i ++) {
				if (this.canvas.shapes[i] == this)
					this.canvas.shapes.splice(i, 1);
			}
			this.canvas.removeChild(this.container);
			return null;
		},
		setImg: function (src, style) {
			var img = this.container.getElementsByTagName("img")[0];
			if (!img) {
				img = document.createElement("img");
				this.container.appendChild(img);
			}
			if (style && typeof(style) == "object") {
				for (var k in style)
					img.style[k] = style[k];
			}
			img.src = src;
			return this;
		},
		setName: function (name) {
			this.name = name;
			this.container.setAttribute("id", "drjs_" + this.name);
			return this;
		},
		setLeft: function (v) {
			this.container.style.left = v + "px";
			return this;
		},
		setTop: function (v) {
			this.container.style.top = v + "px";
			return this;
		},
		setText: function (str, style) {
			this.text = str;
			if (!this.textContainer) {
				this.textContainer = document.createElement("p");
				this.textContainer.style.fontSize = "12px";
				this.textContainer.style.color = "#000";
				this.textContainer.style.fontFamily = "Courier New, Verdana, Arial";
				this.container.appendChild(this.textContainer);
			}
			if (style && typeof(style) == "object") {
				for (var k in style)
					this.textContainer.style[k] = style[k];
			}
			this.textContainer.innerHTML = str;
			return this;
		}
	}

	//Item类方法
	drjs.Item.prototype = {
		addShape: function (shapes) {
			//为当前Item添加一个形状
			if (!(shapes instanceof Array))
				shapes = [shapes];
			for (var i = 0; i < shapes.length; i ++)
				if (shapes[i] instanceof drjs.Shape) {
					this.container.appendChild(shapes[i].container);
					this.shapes.push(shapes[i].container);
				}
			return this;
		},
		locate: function (left, top) {
			//改变当前Item的位置
			this.container.style.left = left + "px";
			this.container.style.top = top + "px";
			return this;
		},
		remove: function () {
			//删除当前Item
			delete this.canvas.items[this.name];
			this.container.parentNode.removeChild(this.container);
			return null;
		}
	};
})();