//grd.js
;(function(){
	var cachedScrollbarWidth;
	function scrollbarWidth() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	};
	$(scrollbarWidth);
	var gSeq = 0;
	function isfunc(func){
		return typeof func === 'function';
	};
	function tryfunc(func, t){
		func = eval(func);
		if(typeof func === 'function'){
			func.apply(t, [].splice.call(arguments, 2, arguments.length - 2));
		}else return;
	}
	var defaultGridOptions = {
		columnSettings: [],
		rowSettings: {},
		striped: true,
		method: "post",
		nowrap: true,
		autoRowHeight: true,
		url: null,
		pageNumber: 1,
		pageSize: 15,
		pageSizeList: [10, 30, 50],
		showHeader: true,
		showPager: true,
		idField: "",
		loader: function(param, suc, err) {
			var opts = this.options;
			if (!opts.url) return false;
			$.ajax({
				type: opts.method,
				url: opts.url,
				data: param,
				dataType: "json",
				success: function(data) {suc(data);},
				error: function() {err.apply(this, arguments);}
			});
		},
		onBeforeLoad: function(_6a0) {},
		onLoadSuccess: function() {},
		onLoadError: function() {},
		onClickRow: function(_6a1, _6a2) {},
		onDblClickRow: function(_6a3, _6a4) {},
		onClickCell: function(_6a5, _6a6, _6a7) {},
		onDblClickCell: function(_6a8, _6a9, _6aa) {},
		onSortColumn: function(sort, _6ab) {},
		onResizeColumn: function(_6ac, _6ad) {},
		onSelect: function(_6ae, _6af) {},
		onUnselect: function(_6b0, _6b1) {},
		onSelectAll: function(rows) {},
		onUnselectAll: function(rows) {},
	},
	defaultColOptions = {
		field: "",
		title: "",
		align: "left",
		halign: "left",
		sortable: false,
		formatter: function(v, r, i){return v;},
		styler: function(v, r, i){return ""},
	};
	var grd = function(options){
		this._create(null, options);
	};
	var p = grd.prototype = {
		constructor: grd,
		txts:{
			pagerDetail:"显示第{start} - {end}条记录 共{total}条记录",
			prevPage:"上一页",
			nextPage:"下一页",
			firstPage:"第一页",
			lastPage:"最后一页",
			gotoPage:"前往",
			loading:"数据加载中..."
		},
		csss:{
			wrap:"grd-wrp",
			zone1:"grd-zn1",
			zone2:"grd-zn2",
			header:"grd-tbl-hdr",
			body:"grd-tbl-bdy",
			table:"tbl",
			numberCell:"grd-row-num",
			checkCell:"grd-chk",
			pager:"grd-pgr",
			pagerButtons:"btns rt",
			firstPageButton:"btn ico grd-fst",
			lastPageButton:"btn ico grd-lst",
			prevPageButton:"btn ico grd-pre",
			nextPageButton:"btn ico grd-nxt",
			gotoPageButton:"btn sz-sm",
			pageNumberField:"inp sz-sm",
			pagerDetail:"infos"
		},
		defaultOptions: defaultGridOptions,
		defaultcolumnSettings: defaultColOptions,
		reload:function(){
			var err = function(data){
				$.dlg({title:"Error", content:$("<div>").text(data.msg||data)})
				echo(arguments);
			}
			this.options.loader.call(this, $.extend({sortField: this.sort, order:this.sortOrder},{}), _bind(function(data){
				data = $.isArray(data)? {total:data.length, pageSize:data.length, rows:data} : data;
				if(!data.rows) return err(data);
				this.data = data;
				this._render();
			}, this), err);
			this._render();
		},
		checkRow:function(index){
			var r = this.data.rows[index], cr = this.checkedRecords, sr = this.selectedRecords, a = this.isAllSelect, rr = this.removedRecords;
			if(cr.indexOf(r)<0) cr.push(r);
			if(a){
				if(rr.indexOf(r)<0) rr.push(r);
			}else{
				if(sr.indexOf(r)<0) sr.push(r);
			}
			var tr = $($("tr", this[''].$body2).get(index)).prop("checked",true).addClass("checked");
			$(".grd-chk input[type='checkbox']",tr).prop("checked", true);
			tryfunc(this.options.onCheckRow, this, index, r);
		},
		uncheckRow:function(index){
			var r = this.data.rows[index], cr = this.checkedRecords, sr = this.selectedRecords, a = this.isAllSelect, rr = this.removedRecords;
			if(cr.indexOf(r)>=0) cr.splice(cr.indexOf(r),1);
			if(a){
				if(rr.indexOf(r)>=0) rr.splice(rr.indexOf(r),1);
			}else{
				if(sr.indexOf(r)>=0) sr.splice(sr.indexOf(r),1);
			}
			var tr = $($("tr", this[''].$body2).get(index)).prop("checked",false).removeClass("checked");
			$(".grd-chk input[type='checkbox']",tr).prop("checked", false);
			tryfunc(this.options.onUncheckRow, this, index, r);
		},
		getRowById:function(id){
			for(var i = 0; i < this.data.rows.length; i++){
				if(this.data.rows[i][this.options.idField] == id) return this.data.rows[i];
			}
		},
		selectAll:function(expand){
			if(expand){
				this.isAllSelect = true;
				this.removedRecords.splice(0, this.removedRecords.length);
			}
			for(var i = 0; i<this.data.rows.length; i++) this.checkRow(i);
		},
		selectNone:function(expand){
			if(expand) {
				this.isAllSelect = false;
				this.removedRecords.splice(0, this.removedRecords.length);
				this.selectedRecords.splice(0, this.selectedRecords.length);
			}
			for(var i = 0; i<this.data.rows.length; i++) this.uncheckRow(i);
		},
		getSelection:function(expand){
			if(expand) return {
				selected:[].concat(this.selectedRecords),
				removed:[].concat(this.removedRecords),
				allSelect:this.isAllSelect
			};
			else{
				var sr = [], r = this.data.rows;
				$("tr", this[''].$body2).each(function(i,tr){
					if($(tr).prop("checked")) sr.push(r[$(tr).attr("data-index")]);
				});
				return {selected:sr};
			}
		},
		getSelectedIds:function(){ //cannot expand
			var rtn = [], r = this.data.rows, id = this.options.idField;
			$("tr", this[''].$body2).each(function(i,tr){
				if($(tr).prop("checked")) rtn.push(r[$(tr).attr("data-index")][id]);
			});
			return rtn;
		},
		sortColumn:function(index, order){
			var s = index;
			if(typeof index === 'number'){
				s = this.options.columnSettings[index];
				s = s.sortName || s.field;
			}
			if(this.sort.indexOf(s)>=0) this.sortOrder = this.sortOrder == 'asc'? 'desc':'asc';
			else this.sortOrder = "asc";
			this.sort = s;
			this.reload();
		},
		gotoPage:function(page){
			page=(page*1)||0;
			if(page==0) page+=1;
			var x = Math.floor(this.data.total / this.options.pageSize) + (this.data.total % this.options.pageSize>0?1:0);
			if(page>x) page = x;
			if(page<-x) page = 1;
			if(page<0) page += x+1;
			this.options.pageNumber = page;
			this.reload();
		},
		prevPage:function(){
			this.gotoPage(this.options.pageNumber-1);
		},
		nextPage:function(){
			this.gotoPage(this.options.pageNumber+1);
		},
		getData:function(){
			return this.data;
		},
		getQueryParam:function(){
			return {};
		},
		getSortField:function(){
			return this.sort;
		},
		getSortOrder:function(){
			return this.sortOrder;
		},
		getOptions:function(){
			return this.options;
		},
		_create:function(elem, opts){
			this.options = $.extend({}, p.defaultOptions, opts);
			this.seq = gSeq++;
			var pnl = this[''] = {};

			function makeTag(tagContent, className, parent){
				return $(tagContent).addClass(p.csss[className]).appendTo(parent);
			}

			var d = "<div>", a = "<a>";
			pnl.$appendTo = $(this.options.appendTo);
			pnl.$wrap = makeTag(d, "wrap", pnl.$appendTo).attr("id", "grd-id-" + this.seq);
			pnl.$styleTag = $("<style>").appendTo(pnl.$wrap);

			pnl.$zone1 = makeTag(d, "zone1", pnl.$wrap);
			pnl.$zone2 = makeTag(d, "zone2", pnl.$wrap);
			pnl.$header1 = makeTag(d, "header", pnl.$zone1)
				.html("<table class='"+p.csss.table+"'><thead><th>&nbsp;</th></thead></table>");
			pnl.$header2 = makeTag(d, "header", pnl.$zone2);
			pnl.$body1 = makeTag(d, "body", pnl.$zone1).html("<table class='"+p.csss.table+"'></table>");
			pnl.$body2 = makeTag(d, "body", pnl.$zone2).html("<table class='"+p.csss.table+"'></table>");

			pnl.$pager = makeTag(d, "pager", pnl.$wrap);
			var pgrs = pnl.pager = {};
			var b = makeTag(d, "pagerButtons", pnl.$pager);
			pgrs.$infos = makeTag(d, "pagerDetail", pnl.$pager);
			pgrs.$first = makeTag(a, "firstPageButton", b).attr("title",p.txts["firstPage"]);
			pgrs.$prev = makeTag(a, "prevPageButton", b).attr("title",p.txts["prevPage"]);
			pgrs.$pageNum = makeTag("<input type='text' size='3' />", "pageNumberField", b);
			pgrs.$jump = makeTag(a, "gotoPageButton", b).attr("title",p.txts["gotoPage"]).text(p.txts["gotoPage"]);
			pgrs.$next = makeTag(a, "nextPageButton", b).attr("title",p.txts["nextPage"]);
			pgrs.$last = makeTag(a, "lastPageButton", b).attr("title",p.txts["lastPage"]);

			this.sort = this.sortOrder = ",";
			pnl.$body2.on("scroll", _bind(p._scroll, this)).on("click","tr[data-index]",_bind(function(e){
				var tr = $(e.currentTarget);
				if(this.options.onClickRow) this.options.onClickRow.call(this,e.currentTarget);
				if(tr.prop("checked")) this.uncheckRow(tr.attr("data-index"));
				else this.checkRow(tr.attr("data-index"));
			},this)).on("dblclick","tr[data-index]",_bind(function(e){
				if(this.options.onDblClickRow) this.options.onDblClickRow.call(this,e.currentTarget);
			},this));

			pgrs.$first.click(_bind(function(e){e.preventDefault(); this.gotoPage(1);}, this));
			pgrs.$prev.click(_bind(function(e){e.preventDefault(); this.prevPage();}, this));
			pgrs.$next.click(_bind(function(e){e.preventDefault(); this.nextPage();}, this));
			pgrs.$last.click(_bind(function(e){e.preventDefault(); this.gotoPage(-1);}, this));
			pgrs.$jump.click(_bind(function(e){
				e.preventDefault();
				var page = this[''].pager.$pageNum.val();
				if(/^\d+$/.test(page)) this.gotoPage(page);
				else this[''].pager.$pageNum.val(this.options.pageNumber);
			},this));

			$(window).on("resize", _bind(p._resize, this));

			$.extend(this,{
				checkedRecords:[],
				selectedRecords:[],
				removedRecords:[],
				isAllSelect:false
			});

			if(elem) $(elem).hide().appendTo(pnl.$wrap).data("_grd", this);
			this._init();
		},
		_init:function(){
			this.reload();
		},
		_adjustColumnsWidth:function(){
			var pnl = this[''], scrw = scrollbarWidth(),
				vw = pnl.$wrap.innerWidth() - pnl.$zone1.width() -scrw,
				cc = this.options.columnSettings, 
				pw = 0, pc = 0, fw = 0, nw = 0, defw = Math.floor(vw / cc.length);
			$.each(cc, function(){
				var w = parseInt(this.width||defw);
				if((""+this.width).indexOf("%")>0) {pw+=w, pc++;}
				else if(this.fixWidth==true) fw+=w;
				else nw+=w;
			});
			var w1 = vw - fw, w2 = w1 * (100 - pw) / 100.0, wr = 1;
			if(w2 > nw) wr = w2 * 1.0 / nw;
			var w3 = Math.max((w1 - nw*wr) * 100.0 / pw, pc * 100 / pw);
			var rtn = [];
			$.each(cc, function(i){
				var w = parseInt(this.width||defw);
				if((""+this.width).indexOf("%")>0) rtn.push(Math.floor(w3*w/100.0)-1);
				else if(this.fixWidth==true) rtn.push(w-1);
				else rtn.push(Math.floor(wr*w)-1);
			});
			return rtn;
		},
		_resizeRows:function(){
			var rs = $('tr td', this[''].$body1);
			$('tr', this[''].$body2).each(function(i){
				var dst = rs.get(i); tar = $(this);
				$(dst).height(tar.height());
			});
		},
		_resize:function(){
			var pnl = this[''], tbView = pnl.$body2.children(0), scrw = scrollbarWidth();
			pnl.$wrap.width(pnl.$appendTo.innerWidth()).height(pnl.$appendTo.innerHeight());
			pnl.$zone1.width("auto");

			var w1 = pnl.$zone1.width(), w2 = pnl.$wrap.innerWidth() - w1, vw = w2-scrw;
			pnl.$zone1.width(w1);
			pnl.$zone2.width(w2);
			tbView.width(vw);

			var s = [], thisId="#grd-id-"+this.seq;
			$.each(this._adjustColumnsWidth(), function(i,w){
				s.push(thisId+" .grd-col-"+i+"{width: "+w+"px;}\n");
			});
			pnl.$styleTag.html(s.join(""));
			pnl.$header2.children(0).width(tbView.width());

			pnl.$zone1.css("bottom", pnl.$pager.outerHeight());
			pnl.$zone2.css("bottom", pnl.$pager.outerHeight());
			var h1 = Math.max(pnl.$header2.outerHeight(), pnl.$header1.outerHeight()),
				h2 = pnl.$zone2.innerHeight()-h1;
			pnl.$body1.height(h2);
			pnl.$body2.height(h2);

			$("th",pnl.$header1).height($("th",pnl.$header2).height());
			this._resizeRows();
			this._scroll();
		},
		_scroll:function(pos){
			var pnl = this[''], view = pnl.$body2;
			if(pos){
				if(pos.top) view.scrollTop(pos.top);
				if(pos.left) view.scrollLeft(pos.left);
			}
			pnl.$body1.children(0).css("top",-view.scrollTop());
			pnl.$header2.children(0).css("left",-view.scrollLeft());
		},
		_renderData:function(data){
			var htm=["<table class='tbl hover striped'>"], i = 0;
			for(; i < data.rows.length; i++)
				htm.push(renderRow.call(this, i, data.rows[i], this.options.columnSettings, this.options.rowSettings));
			for(; i < this.options.pageSize; i++){
				htm.push(renderRow.call(this,i,false,this.options.columnSettings));
			}
			htm.push("</table>");
			htm = htm.join("");
			this[''].$body2.html(htm);

			var idField = this.options.idField, drows = this.data.rows, that = this;
			$.each(this.selectedRecords, function(){
				for(var i = 0; i<drows.length; i++) if(drows[i][idField] == this[idField]) that.checkRow(i);
			});

			var startRow = (this.options.pageNumber - 1) * this.options.pageSize,
				htm2 = ["<table class='tbl'><tbody>"], i;
			for(i = 0; i<this.options.pageSize; i++)
				htm2.push("<tr><td class='grd-row-num'><div>"+(startRow+i+1)+"</div></td></tr>");
			htm2.push("</tbody></table>");
			htm2 = htm2.join("");
			this[''].$body1.html(htm2);
			return htm;

			function renderRow(i, r, cs, rs){
				var htm = ["<tr"], ro, co, s, id = this.options.idField;
				if(r) {
					htm.push(" data-index='"+i+"'");
					if(isfunc(s = rs.styler)){
						ro = s(r, i)||{};
						if(typeof ro === 'string') ro = {style:ro};
						if(ro.class) htm.push(" class='"+ro.class+"'");
						if(ro.style) htm.push(" style='"+ro.style+"'");
					}
				}
				htm.push(">")

				$.each(cs, function(j, c){
					htm.push("<td><div class='grd-col-"+j);
					if(r){
						var s=c.styler, f=c.formatter, co, v = r[c.field];
						if(c.checkbox) htm.push(" grd-chk");
						htm.push(" "+(c.align||"left").charAt(0));
						if(isfunc(s)){
							co = s(v, r, j)||{};
							if(typeof co === 'string') co = {style:co};
							if(co.class) htm.push(" "+co.class);
							if(co.style) htm.push("' style='"+co.style);
						}
					}
					htm.push("'>");
					if(r){
						if(c.checkbox) htm.push("<input type='checkbox' value='"+r[id]+"' />");
						else htm.push(isfunc(f)?f(v,r,j):v);
					}else htm.push("&nbsp;");
					htm.push("</div></td>");
				});

				htm.push("</tr>");
				return htm.join("");
			}

			this._renderIndexes();
		},
		_renderTableHeader:function(){
			var htm = ["<table class='tbl'><thead><tr>"], sortNameAttr = "data-grd-sort-name";
				sorts = this.sort.split(","), orders = this.sortOrder.split(",");
			$.each(this.options.columnSettings, function(i, c){
				if(c.checkbox){
					return htm.push("<th><div class='grd-col-"+i+" grd-chk'><input type='checkbox'/></div></th>");
				} 
				htm.push("<th");
				if(c.sortable) htm.push(" "+sortNameAttr+"='"+(c.sortName||c.field)+"'");
				htm.push("><div");
				htm.push(" class='grd-col-"+i+" "+(c.halign||c.align||'left').charAt(0)+"'");
				htm.push(">");
				htm.push(c.title);
				var si = sorts.indexOf(c.sortName||c.field);
				if(si >= 0) htm.push("<i class='sort-"+orders[si]+"'></i>");
				htm.push("</div></th>");
			});
			htm.push("</tr></thead></table>");
			htm = htm.join("");

			var h2 = this[''].$header2.html(htm);

			$(".grd-chk input[type='checkbox']", h2).on("change", _bind(function(e){
				if($(e.currentTarget).prop("checked")) this.selectAll();
				else this.selectNone();
			}, this));

			$("*["+sortNameAttr+"]", h2).on("click", _bind(function(e){
				this.sortColumn($(e.currentTarget).attr(sortNameAttr));
			}, this));

			return htm;
		},
		_renderPager:function(){
			var tt = this.data.total, pp = this.options.pageNumber, sz = this.options.pageSize,
				e = pp * sz, s = e - sz + 1, pgr = this[''].pager;
			e = Math.min(e, tt);
			pgr.$infos.html(p.txts["pagerDetail"].replace("{start}", s).replace("{end}",e).replace("{total}",tt));
			pgr.$pageNum.val(pp);
			function foo(jq, disable){
				jq.prop("disable", disable)[disable?"addClass":"removeClass"]("_dis");
			}
			if(pp == 1){
				foo(pgr.$prev, true);
				foo(pgr.$first, true);
			}else{
				foo(pgr.$prev, false);
				foo(pgr.$first, false);
			}
			if(pp == Math.ceil(tt*1.0/sz)){
				foo(pgr.$next, true);
				foo(pgr.$last, true);
			}else{
				foo(pgr.$next, false);
				foo(pgr.$last, false);
			}
		},
		_render:function(){
			this._renderTableHeader();
			this._renderData(this.data);
			this._renderPager();
			this._resize();
		},
		appendTo:function(pane){
			this[''].$wrap.appendTo(pane);
		},
		_destory:function(){}
	};
	$.grd = function(options){
		return new grd(options);
	};
	$.fn.grd = function(options){
		if(!options.appendTo) options.appendTo = this;
		$(this[0]).data("grd", new grd(options));
	}
	$(function(){
		//init in element config components
	});
})(window, jQuery);