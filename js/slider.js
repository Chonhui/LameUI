;(function(){
	var sld = function(options){
		this._create(null, options);
	};
	var p = sld.prototype = {
		constructor: sld,
		defaultOptions:{
			onSlideStart:function(prev, cur){},
			onSlideEnd:function(prev, cur){}
		}
		_create:function(){

		},
		methods:{
			next:function(){

			},
			prev:function(){

			},
			slideTo:function(){

			},
			pause:function(){

			},
			play:function(){

			}
		}
	}
	$.slide = function(options){
		return new sld(options);
	};
	$.fn.slide = function(options){
		if(!options.appendTo) options.appendTo = this;
		$(this[0]).data("sld", new grd(options));
	}
})(window, jQuery);