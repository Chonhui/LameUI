//tab.js
;(function(window, $){
	var tabView = function(elem, options){
		this._create(elem, options);
	}
	var proto = tabView.prototype = {
		constructor: tabView,
		csss:{
			wrap:"tab-wrp",
			header:"tab-hdr",
			view:"tab-bdy",
			tabLabel:"tab-lbl"
		},
		defaultOptions:{
			onTab:$.noop
		},
		nextTab:function(){
			var target = this.currentIndex+1;
			if(target >= this.viewList.length) gotoTab(0);
			else gotoTab(target);
		},
		prevTab:function(){
			var target = this.currentIndex-1;
			if(target < 0) gotoTab(this.viewList.length - 1);
			else gotoTab(target);
		},
		gotoTab:function(index){
			index = Math.max(0, Math.min(index, this.viewList.length));
			var old = this.currentIndex, cur = this.currentIndex = index;
			if(old>=0){
				$(this.viewList[old]).parent("li").hide();
				$(this.tabList[old]).removeClass("active");
			}
			$(this.viewList[cur]).parent("li").show();
			$(this.tabList[cur]).addClass("active");
			this.options.onTab(index, cur, old);
		},
		_create:function(elem, options){
			var opts = this.options = $.extend({}, proto.defaultOptions, options),
				views, viewList = [], tabList = [], pnl = this[''] = {};
				tabClick = _bind(function(e){
					$.each(this.viewList, _bind(function(i,ee){
						if(ee == e) this.gotoTab(i);
					},this));
				},this);
			pnl.$wrap = $(elem || $("<div>")).addClass(proto.csss.wrap);
			pnl.$header = $("<ul>").addClass(proto.csss.header);
			pnl.$view = $("<ul>").addClass(proto.csss.view);

			if(!opts.viewList){
				views = $("*[data-tab-label]", pnl.$wrap);
			}else views = opts.viewList;
			$.each(views, function(i,e){
				var btn = $("<a>").text($(e).attr("data-tab-label")||i)
					.appendTo($("<li>").appendTo(pnl.$header))
					.addClass(proto.csss.tabLabel).click(function(){tabClick(e);});
				tabList.push(btn);
				$(e).appendTo($("<li>").hide().appendTo(pnl.$view));
				viewList.push($(e)[0]);
			});
			pnl.$wrap.empty().append(pnl.$header).append(pnl.$view);
			this.viewList = viewList;
			this.tabList = tabList;
			if(!elem&&opts.appendTo) pnl.$wrap.appendTo(opts.appendTo);
			this._init();
		},
		_init:function(){
			var hasDef = false;
			$.each(this.viewList, _bind(function(i,e){
				if($(e).attr("data-tab-default")){
					this.gotoTab(i);
					hasDef = true;
					return false;
				}
			},this));
			if(!hasDef) this.gotoTab(0);
		}
	};
	$.tabView = function(options){
		return new tabView(null, options);
	};
	$.fn.tabView = function(options){
		var rs = [];
		this.each(function(i,e){
			if(!$(e).data("tabView")){
				var t = new tabView(e,options);
				$(e).data("tabView", t);
				rs.push(t);
			}
		});
		if(rs.length!=1) return this;
		return rs[0];
	};
	$(function(){
		//init in element config components
	});
})(window, window.jQuery);