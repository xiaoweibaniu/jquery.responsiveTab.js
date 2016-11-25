(function (window, document, $) {
	"use strict";
	
	var pluginName = 'responsiveHorizontalTabs',
		defaults = {
			navSelector: '.nav-tabs',
			itemSelector: '>li',
			dropdownSelector: '>.dropdown',
			dropdownItemSelector: 'li',
			tabSelector: '.tab-pane',
			activeClassName: 'active'
		};
	var Plugin = function (el, options) {
		var $tabs = this.$tabs = $(el);
		this.options = options = $.extend(true, {}, defaults, options);
		
		var $nav = this.$nav = $tabs.find(this.options.navSelector),
			$dropdown = this.$dropdown = $nav.find(this.options.dropdownSelector);
		var $items = this.$items = $nav.find(this.options.itemSelector).filter(function () {
			return !$(this).is($dropdown);
		});
		
		this.$dropdownItems = $dropdown.find(this.options.dropdownItemSelector);
		this.$tabPanel = this.$tabs.find(this.options.tabSelector);
		
		this.breakpoints = [];
		
		$items.each(function () {
			$(this).data('width', $(this).width());
		});
		
		this.init();
		this.bind();
		
	};
	
	Plugin.prototype = {
		init: function () {
			if (length <= 1) {   //if there is not tags.
				//this.$dropdown.hide();
				throw 'There should be some tags here ';
			}
			var dropWidth = this.dropWidth = this.$dropdown.width();
			if (this.$dropdown.length === 0) {  //if there were no tags, then we create some tags.
				this.flag = true;
				
				this.$nav.append('<li class="dropdown hidden" role="presentation">'
					+ '<a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">'
					+ '<span class="caret"></span>Menu </a><ul class="dropdown-menu" role="menu"></ul></li>');
				
				this.$dropdown = this.$nav.find(this.options.dropdownSelector);
				this.$dropdown.css("opacity", 0).removeClass("hidden"); //还需要将其隐藏起来
				dropWidth = this.dropWidth = this.$dropdown.width();
				this.$dropdown.addClass("hidden").css("opacity", 1);
			}
			
			var length = this.itemsLenth = this.$items.length;
			
			this.breakpoints = [];
			
			for (var i = 0; i < length + 1; i++) {  //按照标签数划分宽度等级
				if (i === 0) this.breakpoints.push(this.$items.eq(i).width() + dropWidth);
				else if (i === (length - 1)) this.breakpoints.push(this.breakpoints[i - 1] + this.$items.eq(i).width() - dropWidth);
				else if (i === length) this.breakpoints.push(this.breakpoints[i - 1] + dropWidth);
				else this.breakpoints.push(this.breakpoints[i - 1] + this.$items.eq(i).width());
			}
			this.layout();
		},
		
		layout: function () {
			console.log(this.breakpoints);
			if (this.breakpoints.length <= 0) return;
			
			var width = this.$nav.width(),
				i = 0,
				activeClassName = this.options.activeClassName,
				panelIndex = this.$tabPanel.filter('.' + activeClassName).index();
			
			for (; i < this.breakpoints.length; i++) {   //有一个宽度大于导航条的宽度
				if (this.breakpoints[i] > width) break;
			}
			
			this.$items.removeClass(activeClassName);
			this.$dropdownItems.removeClass(activeClassName);
			this.$dropdown.removeClass(activeClassName);
			
			if (this.flag) {
				if (i >= this.breakpoints.length - 1) {
					this.$dropdown.addClass("hidden");
					this.$items.show();
					this.$items.eq(panelIndex).addClass(activeClassName);
				} else {
					
					this.$dropdown.removeClass("hidden");
					this.$dropdown.find("ul>li").remove();
					for (var j = 0; j < this.itemsLenth; j++) {
						if (j < i) {
							this.$items.eq(j).show();
						} else {
							for (var v = i; v < this.itemsLenth; v++) {
								this.$dropdown.find("ul").append(this.$items.eq(v).prop("outerHTML"));
								this.$items.eq(v).hide();
							}
							this.$dropdown.find("ul>li").show();
							break;
						}
					}
					
					if (panelIndex < i) {
						this.$items.eq(panelIndex).addClass(activeClassName);
					} else {
						this.$dropdown.addClass(activeClassName);
						this.$dropdownItems.eq(panelIndex).addClass(activeClassName);
					}
				}
			} else {
				if (i === this.breakpoints.length) {
					this.$items.show();
					this.$dropdown.find("ul>li").remove();
					this.$items.eq(panelIndex).addClass(activeClassName);
				} else {
					this.$dropdown.removeClass("hidden");
					this.$dropdown.find("ul>li").remove();
					for (var j = 0; j < this.itemsLenth + 1; j++) {
						if (j < i) {
							this.$items.eq(j).show();
						} else {
							var v = i;
							if (i === this.itemsLenth) v = i-1;
							for (; v < this.itemsLenth; v++) {
								this.$dropdown.find("ul").append(this.$items.eq(v).prop("outerHTML"));
								this.$items.eq(v).hide();
							}
							this.$dropdown.find("ul>li").show();
							break;
						}
					}
					
					if (panelIndex < i) {
						this.$items.eq(panelIndex).addClass(activeClassName);
					} else {
						this.$dropdown.addClass(activeClassName);
						this.$dropdownItems.eq(panelIndex).addClass(activeClassName);
					}
				}
			}
			
		},
		
		throttle: function (fn, interval) {
			var _fn = fn,   //保存需要被延迟执行的函数引用
				timer,     //定时器
				firstTime = true;     //是否是第一次调用
			return function () {
				var args = arguments,
					_self = this;
				
				if (firstTime) {  //如果是第一次调用，不需要延迟执行
					_fn.apply(_self, args);
					return firstTime = false;
				}
				
				if (timer) {    //如果定时器还在，说明前一次延迟执行还没有完成
					return false;
				}
				
				timer = setInterval(function () {   //延迟一段时间执行
					clearInterval(timer);
					timer = null;
					_fn.apply(_self, args);
				}, interval || 500);
			}
		},
		
		bind: function () {
			var self = this;
			
			$(window).resize(function () {
				self.throttle(function () {
					self.layout();
				}, 1000)();
			});
		}
		
	};
	
	
	$.fn[pluginName] = function (options) {
		if (typeof options === 'string') {
			var method = options;
			var method_arguments = Array.prototype.slice.call(arguments, 1);
			if (/^\_/.test(method)) {
				return false;
			} else {
				return this.each(function () {
					var api = $.data(this, pluginName);
					if (api && typeof api[method] === 'function') {
						api[method].apply(api, method_arguments);
					}
				});
			}
		} else {
			return this.each(function () {
				if (!$.data(this, pluginName)) {
					$.data(this, pluginName, new Plugin(this, options));
				} else {
					$.data(this, pluginName).init();
				}
			});
		}
	};
})(window, document, jQuery);
