//dlg.js
;(function(window, $, undefined){
	var __top = 1000;
	// window.dlgInfo = {
	// 	dlgs:[],
	// }

	var dlg = function(elem, options){
		this._create(elem, options);
		// window.dlgInfo.dlgs.push(this);
	}, proto;
	var p = proto = dlg.fn = dlg.prototype = 
	{
		constructor: dlg,
		csss:{
			modalBody:"dlg-mdl-dom",
			modalHelper:"dlg-mdl",
			wrap:"dlg-wrp",
			header:"dlg-hdr",
			footer:"dlg-ftr clearfix",
			content:"dlg-bdy clearfix",
			padContent:"dlg-msg",
			closeButton:"btn ico dlg-cls",
			title:"dlg-ttl clearfix",
			button:"btn",
			buttons:"btns",
			dialog:"dlg clearfix",
			fullScreen:"mx",
			noHeader:'no-hdr',
			noFooter:'no-ftr'
		},
		txts:{
			yes:"是",
			no:"否",
			cancle:"取消",
			confirm:"确认"
		},
		defaultOptions:{
			showHeader: true,
			showFooter: true,
			// headerButtons:["maximize","minimize","close"],
			buttons:["yes","no","cancle"],
			fullScreen: false,
			resizable: true,
			dragable: true,
			modal: false,
			appendTo: window,
			padContent: false,
			content: "Hello Dlg!",
			title:"Hello",
			mixClass:[],
			fixed: false,

			onClose: null,
			onResize: null
		},
		_create:function(elem, mixOpts){
			this._originParent = elem?elem.parent():null;
			this.$content = elem || $("<div>").addClass(proto.csss.padContent).html(mixOpts.content);
			this.elem = elem;
			var opts = this.options = {};
			$.extend(opts,p.defaultOptions,{width: this.$content.width()},mixOpts);
			if(opts.fullScreen){
				opts.dragable = opts.resizable = false;
				opts.modal = true;
			}
			this.$content.data("_dlg",this);
			this.$win = $("<div>").addClass(proto.csss.dialog);
			if(opts.mixClass) this.$win.addClass(opts.mixClass);
			this.$win.appendTo($("body"));
			this._createHeader();
			this._createBody();
			this._createFooter();
			this.state = {};
			if(opts.dragable) this._makeDragable();
			if(opts.resizable) this._makeResizable();
			this._init();
		},
		_createWrap:function(){
			if(!this.options.modal && !this.options.dismissOnBlur) return;
			this.$wrap = $("<div>").addClass(proto.csss.wrap);
		},
		_createHeader:function(){
			var that = this;
			var hdr = this.$header = $("<div class='"+proto.csss.header
				+"'><span class='"+proto.csss.title
				+"'></span><div class='"+proto.csss.buttons
				+"'><a class='"+proto.csss.closeButton
				+"'></a></div></div>");
			$(".dlg-ttl", hdr).text(this.options.title);
			hdr.appendTo(this.$win);
			var cls = this.closeButton = $("a", hdr);
			cls.on("click",function(){that._dismiss();});
			if(!this.options.showHeader) {hdr.hide(); this.$win.addClass(proto.csss.noHeader);}
		},
		_createFooter:function(){
			var ftr = this.$footer = $("<div>").addClass(proto.csss.footer);
			var btns = $("<div>").addClass(proto.csss.buttons).appendTo(ftr);
			ftr.appendTo(this.$win);
			if(!this.options.showFooter) {ftr.hide(); this.$win.addClass(proto.csss.noFooter);}
			else{
				var that = this;
				$.each(this.options.buttons,function(i, v){
					var btn;
					if(typeof v === 'string'){
						btn = $("<a class='btn'>"+proto.txts[v]+"</a>");
						btns.append(btn);
						if(v == 'yes') btn.click(function(){that._dismiss(that.options.onYes);});
						if(v == 'no') btn.click(function(){that._dismiss(that.options.onNo);});
						if(v == 'cancle') btn.click(function(){that._dismiss(that.options.onCancle);});
						if(v == 'confirm') btn.click(function(){that._dismiss(that.options.onConfirm);});
					}else{
						btn = $("<input class='btn' type='button' value='"+v.title+"'/>");
						btns.append(btn);
						if(typeof v.click === 'function'){
							btn.click(v.click);
						}
					}
				});
			}
		},
		_createBody:function(){
			with(this){
				if(options.padContent) $content.addClass(proto.csss.padContent);
				this.$body = $("<div>").addClass(proto.csss.content).appendTo($win);
				this.$helper = $("<div>").css("position", $content.css("position"))
				.css("float", $content.css("float")).height($content.outerHeight()).width($content.outerWidth());
				$content.before($helper).appendTo($body);
			}
		},
		_init:function(){
			this.open();
		},
		_appendTo: function() {
			var element = this.options.appendTo;
			if (element){
				if(element instanceof dlg)
					return element._appendTo();
				if($.data(element, "_dlg"))
					return $.data(element, "_dlg").$win_parent;
				if (element.jquery || element.nodeType){
					if(element.jquery && element.data("_dlg"))
						return element.data("_dlg").$win_parent;
					return $( element );
				}
			}
			return $("body");
		},
		_getParentAttrs:function(){
			if(!this.$base) return;
			var attrs = this.$base.data("__dlg");
			if(!attrs){
				attrs = {modalCount:0, dlgCount:0};
				this.$base.data("__dlg",attrs);
			}
			return attrs;
		},
		open:function(){
			this.options.dismissOnBlur = !this.options.modal && this.options.dismissOnBlur;
			var that = this;
			var base = this.$base = this._appendTo();
			var appendToAttrs = this._getParentAttrs();
			appendToAttrs.dlgCount++;
			if(this.options.modal){
				if(appendToAttrs.modalCount==0) base.addClass(proto.csss.modalBody);
				this.wrap = $("<div>").addClass(proto.csss.wrap);
				$("<div>").addClass(proto.csss.modalHelper).appendTo(this.wrap);
				this.wrap.appendTo(base);
				this.$win_parent = this.wrap;
				appendToAttrs.modalCount++;
			}else if(this.options.dismissOnBlur){
				this.wrap = $("<div>").addClass(proto.csss.wrap);
				this.wrap.appendTo(base);
				this.$win_parent = this.wrap;
			}else{
				if(this.wrap) this.$win_parent = this.wrap.appendTo(base);
				else this.$win_parent = base;
			}
			if(this.options.dismissOnBlur) this.wrap.click(function(e){if(e.target == that.wrap[0]) that._dismiss();});
			this.$win.appendTo(this.$win_parent);
			if(this.options.fullScreen){
				this.$win.addClass(proto.csss.fullScreen);
			}else{
				this.$win.show();
				this._sizeTo(this.options);
				var wp = this.$win_parent;
				var po = {
					"position":"absolute",
					"max-width": wp.innerWidth(),
					"top": wp.scrollTop()+Math.max(10,((wp[0].clientHeight?wp[0].clientHeight:$(window).height())-this.$win.outerHeight())*0.3),
					"left":wp.scrollLeft()+Math.max(0,((wp[0].clientWidth?wp[0].clientWidth:$(window).width())-this.$win.outerWidth())/2)
				};
				this.$win.hide().css(po).show();
			}
			this.moveToTop();
		},
		_sizeTo:function(size){
			if(size.height)this.$win.height(size.height);
			if(size.width) this.$win.width(size.width);
			this.$body.height(this.$win.innerHeight() - 
				(this.options.showHeader?this.$header.outerHeight():0) - 
				(this.options.showFooter?this.$footer.outerHeight():0))
				.width(this.$win.innerWidth());
			var r = this.options.onResize;
			if(typeof r === 'function') r.call(this);
		},
		_makeResizable:function(){
			var hlp = $("<div class='dlg-rszHdl' style='position:absolute; width:4px; height:4px; right:-1px; bottom:-1px'></div>"), that = this;
			hlp.appendTo(this.$win).on("mousedown", function(e){
				that.state.resize = true;
				// $("body").css("cursor","se-resize");
				var mH = that.$header.outerHeight() + that.$footer.outerHeight() + 100;
				var w = that.$win, gh = w.outerHeight()-w.innerHeight(), gw = w.outerWidth() - w.innerWidth();
				that._resizeStartParams = {
					dlgWidth: that.$win.width(),
					dlgHeight: that.$win.height(),
					mY: e.pageY,
					mX: e.pageX,
					minHeight: mH,
					minWidth: 300,
					maxHeight: Math.max(that.$win_parent.innerHeight() - parseInt(that.$win.css("top")) - gh, mH),
					maxWidth: Math.max(that.$win_parent.innerWidth() - parseInt(that.$win.css("left")) - gw,300)
				};
			});
			this._addAttachToDocCallBack("mouseup", function(e){
				that.state.resize = false;
				// $("body").css("cursor","");
			});
			this._addAttachToDocCallBack("mousemove",function(e){
				if(!that.state.resize || that.state.max) return;
				e.preventDefault();
				var o = that._resizeStartParams;
				var width = o.dlgWidth + (e.pageX - o.mX), height = o.dlgHeight + (e.pageY - o.mY);
				if(width < o.minWidth) width = o.minWidth; if(width > o.maxWidth) width = o.maxWidth;
				if(height < o.minHeight) height = o.minHeight; if(height > o.maxHeight) height = o.maxHeight;
				that._sizeTo({
					width: width,
					height: height
				});
				return false;
			});
		},
		_makeDragable:function(){
			var that = this;
			this.$win.on("mousedown",function(){
				that.moveToTop();
			});
			this.$header.on("mousedown selectstart", function(e){
				e.preventDefault();
				that.state.drag = true;
				that._dragStartParams = {
					dlgTop: parseInt(that.$win.css("top")),
					dlgLeft: parseInt(that.$win.css("left")),
					mTop: e.pageY,
					mLeft: e.pageX,
					maxTop: that.$win_parent.innerHeight() - that.$win.outerHeight(),
					maxLeft: that.$win_parent.innerWidth() - that.$win.outerWidth()
				}
			});
			$("."+proto.csss.buttons+" ."+proto.csss.closeButton, this.$header).on("mousedown",function(e){
				e.preventDefault();
				return false;});
			this.$header.addClass("dlg-drgHdl");
			var that = this;
			this._addAttachToDocCallBack("mouseup select", function(e){that.state.drag = false; });
			this._addAttachToDocCallBack("mousemove", function(e){
				if(!that.state.drag || that.state.max) return;
				e.preventDefault();
				var o = that._dragStartParams;
				var top = o.dlgTop + (e.pageY - o.mTop), left = o.dlgLeft + (e.pageX - o.mLeft);
				if(top<0) top = 0; if(top > o.maxTop ) top = o.maxTop;
				if(left<0) left = 0; if(left > o.maxLeft) left = o.maxLeft;
				that.$win.css({
					top:top,
					left:left
				});
				return false;
			});
		},
		_addAttachToDocCallBack:function(eventName, callback){
			if(!this._docCallback) this._docCallback = {};
			if(!this._docCallback[eventName]) this._docCallback[eventName] = [];
			this._docCallback[eventName].push(callback);
			$(document).on(eventName, callback);
		},
		_dismiss:function(callback){
			if(callback && typeof callback == 'function'){
				if(callback.call(this, [].slice.call(arguments, 1, arguments.length))===false) return;
			}
			var c = this.options.onClose;
			if(c && typeof c === 'function'){
				if(c.call(this, this.$content)===false) return;
			}
			var that = this;
			this.$win.fadeOut("fast",function(){
				if(that.wrap) that.wrap.remove();
				var appendToAttrs = that._getParentAttrs();
				with(that){
					if(options.modal){
						appendToAttrs.modalCount--;
						if(appendToAttrs.modalCount==0) $base.removeClass(proto.csss.modalBody);
					}
					$helper.before($content).remove();
					$win.remove();
				}
				that._docCallback&&$.each(that._docCallback, function(n, a){
					$.each(a, function(){
						$(document).off(n, this);
					});
				});
				appendToAttrs.dlgCount--;
			});
			this.$content.data("_dlg", null);
		},
		moveToTop:function(){
			// window.test = this.$win;
			// if(this.$win.parent().children().last()[0]!=this.$win[0]) this.$win.appendTo(this.$win_parent);
			if(this.__top && this.__top == __top) return;
			this.__top = __top++;
			this.$win.css("z-index",this.__top);
		},
		update:function(newOpts){
			var differs = [];
			for(var i in newOpts){
				if(newOpts[i]!=this.options[i]){
					differs.push([i,newOpts[i]]);
				}
			}
			console.debug(differs.map(function(e){return e.join(",")}).join(" | "));
		}
	};
	$.dlg = $.fn.dlg = function(options){
		var e = !(this.jquery || this.nodeType)?null: $($(this).get(0));
		if(e==null){
			if(options.content){
				var m = options.content;
				if(m.jquery || m.nodeType){
					e = $($(m).get(0));
				}
			}
		}
		if(e && e.data() && e.data("_dlg"))
			return e.data("_dlg").update(options);
		return new dlg(e, options);
	}
	$.dlg.tip = function(msg, options){
		var map = {tip:"info", info:"info", error:"err", alert:"alert", question:"quest", success:"success"};
		var dur = options.dur || (msg.length * 300);
		var type = options.type || "info";
		var tip = new dlg(null, {
			content: "<i class='ico'></i><span class='content'>"+msg+"</span>",
			showHeader:false,
			showFooter:false,
			mixClass:"msg "+(map[type]?map[type]:"info"),
			width: 500,
			dismissOnBlur:true
		});
		setTimeout(function(){tip._dismiss();}, dur);
	}

})(window, window.jQuery);