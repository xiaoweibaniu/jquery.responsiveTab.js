(function(window, document, $) {
	'use strict';

	/*
	* 插件主要用于不同屏幕尺寸时将超出菜单项以下拉列表的形式展示
	* 插件基于bootstrap的导航条组件和下拉列表组件实现
	* */

	var pluginName = 'responsiveTab';
	var defaults = {
		tabContent: '',
		checked: 'active',
		noNavItemSelector: '.no-menu',
		closeSelector: '.close-tab',
		closeTab: false, // 关闭选项卡配置参数(default: false)
		complete: function() {
			// do someThings
		}
	};
	var Plugin = function(el, options) {
		// 导航条容器元素
		var $container = $(el);
		var opts = $.extend(true, {}, defaults, options);
		// 以行形态的导航条元素
		var $nav = $container.find('>.nav:not(.flex-column)');
		// 下拉列表元素
		var $dropdown = $nav.find('>.dropdown');
		// 导航条标签项指向内容容器元素
		var tabContent = opts.tabContent;

		// 行形态以外的导航条不支持
		if ($nav.length === 0) {
			return;
		}

		this.$container = $container;
		this.$nav = $nav;
		this.$dropdown = $dropdown;
		this.options = opts;
		this.$navItems = $nav.find('>li.nav-item:not(.dropdown)');
		this.$dropdownItems = $dropdown.find('a.dropdown-item');
		this.$tabContents =
			tabContent === '' ? $container.find('.tab-pane') : $(tabContent).find('.tab-pane');

		// 初始化
		this.init();
	};

	Plugin.prototype = {
		init: function() {
			var $dropdown = this.$dropdown;
			var $nav = this.$nav;
			var $navItems = this.$navItems;
			var len = $navItems.length;
			var dropWidth = 0;
			var tabWidth = 0;
			var breakpoint = 0;
			var i;
			var opts = this.options;
			var breakpoints = [];

			this.breakpoints = breakpoints;
			this.tabsLen = len;

			// 检测导航条标签项为0时不再执行
			len === 0 && console.error('在导航条中没有发现导航项 ');

			// 没有下拉列表时动态创建元素并计算其宽度
			if ($dropdown.length === 0) {
				this.flag = true;

				// 创建下拉列表内容
				$nav.append(
					'<li class="dropdown nav-item" style="display:none;" role="presentation"><a class="dropdown-toggle nav-link" data-toggle="' +
					'dropdown" href="javascript:;" aria-haspopup="true" aria-expanded="false">' +
					'更多</a><div class="dropdown-menu active" role="menu"></div></li>'
				);

				// 获取下拉列表元素更新$dropdown属性
				$dropdown = $nav.find('>.dropdown');
				this.$dropdown = $dropdown;

				// 计算宽度
				dropWidth = $dropdown.width();
				dropWidth = dropWidth === 0 ? 90 : dropWidth;
			} else {
				// 有下拉列表时计算其宽度
				dropWidth = $dropdown.width();
			}

			// 按照标签数及标签宽度划分断点
			for (i = 0; i < len + 1; i += 1) {
				tabWidth = $navItems.eq(i).width();

				switch (i) {
					case 0:
						breakpoint = tabWidth + dropWidth;
						break;
					case len - 1:
						breakpoint = breakpoints[i - 1] + tabWidth - dropWidth;
						break;
					case len:
						breakpoint = breakpoints[i - 1] + dropWidth;
						break;
					default:
						breakpoint = breakpoints[i - 1] + tabWidth;
				}

				breakpoints.push(breakpoint);
			}

			this.layout();
			this.bind();

			// closeTab为true，并且容器中发现关闭标签元素时触发标签关闭方法
			if (opts.closeTab && this.$container.find(opts.closeSelector).length > 0) {
				this.close();
			}
		},
		layout: function() {
			// 根据容器宽度计算导航条标签显示情况
			var i = 0;
			var checked;
			var paneIndex;
			var callback;
			var opts;
			var flag;
			var self = this;
			var breakpoints = this.breakpoints;
			var noNavItemSelector;
			var tabsLen;
			var $navItems;
			var $dropdown;
			var $dropdownItems;
			var $container;

			// breakpoint记录为空时不再重新布局
			if (breakpoints.length === 0) {
				return;
			}

			opts = this.options;
			flag = this.flag;
			noNavItemSelector = this.options.noNavItemSelector;
			tabsLen = this.tabsLen;
			$navItems = this.$navItems;
			$dropdown = this.$dropdown;
			$dropdownItems = this.$dropdownItems;
			$container = this.$container;

			checked = opts.checked;
			// 当前选中标签下标
			paneIndex = this.$tabContents.filter('.' + checked).index();
			callback = function(m) {
				var v = m;
				var $item;
				var j = 0;

				// 显示导航条标签页
				for (; j < tabsLen + 1; j += 1) {
					if (j < v) {
						$navItems.eq(j).show();
					}
				}

				// v为最后一个breakpoints记录点时
				if (v === tabsLen) {
					v -= 1;
				}

				for (; v < tabsLen; v += 1) {
					// 获取导航条标签元素并包装为下拉列表元素
					$item = $navItems
						.eq(v)
						.clone()
						.find('a');
					$item.addClass('dropdown-item').removeClass('nav-link');

					// 动态创建的下拉列表以append方式新增列表项
					if (flag) {
						$dropdown.find('div').append($item);
					} else {
						// 自定义的下拉列表以before方式新增列表项在固定项之前
						$dropdown.find('div>a.dropdown-item' + noNavItemSelector + ':first').before($item);
					}

					// 隐藏已经添加到下拉列表中的标签
					$navItems.eq(v).hide();
					// 更新$dropdownItems属性
					self.$dropdownItems = $dropdown.find('a.dropdown-item');
				}
			};

			// 遍历breakpoint记录，找到大于导航条容器宽度节点时终端循环
			for (; i < breakpoints.length; i += 1) {
				// 有一个宽度大于导航条的宽度
				if (breakpoints[i] > $container.width() - 30) {
					break;
				}
			}

			// 标签和下拉列表都删除选中类
			$navItems.find('>a').removeClass(checked);
			$dropdownItems.removeClass(checked);
			$dropdown.find('>a').removeClass(checked);

			// 所有标签都展开时
			if (i === breakpoints.length) {
				// 动态创建的下拉列表隐藏
				if (flag) {
					$dropdown.hide();
				} else {
					// 自定义的下拉列表删除非固定项
					$dropdown.find('div>a.dropdown-item:not(' + noNavItemSelector + ')').remove();
				}

				// 展开所有标签 && 定位选中标签
				$navItems.show();
				$navItems
					.eq(paneIndex)
					.find('>a')
					.addClass(checked);
			} else {
				// 有标签收起时展开下拉列表
				// 动态创建的下拉列表删除所有项
				if (flag) {
					$dropdown.show();
					$dropdown.find('div>a').remove();
				} else {
					// 自定义的下拉列表删除非固定项
					$dropdown.find('div>a.dropdown-item:not(' + noNavItemSelector + ')').remove();
				}

				// 隐藏导航条标签，增加下拉列表
				callback(i);

				// 选中下标小于breakpoint记录下标时为标签增加选中类
				if (paneIndex < i) {
					$navItems
						.eq(paneIndex)
						.find('>a')
						.addClass(checked);
				} else {
					// 选中下标大于等于breakpoin记录下标时为下拉列表及指定项增加选中类
					$dropdown.find('>a').addClass(checked);
					self.$dropdownItems.eq(paneIndex - i).addClass(checked);
				}
			}

			// 布局完成后触发complete方法
			if (typeof opts.complete === 'function') {
				opts.complete($container);
			}
		},
		close: function() {
			var self = this;

			// 标签可关闭项
			this.$container.on('click', this.options.closeSelector, function(event) {
				var $this = $(this);
				var $toggle = $this.closest('[data-toggle="tab"]');
				var selector = $toggle.data('target');
				var $li = $toggle.parent('li');
				var $next;
				var $parent;
				var api;
				var e = event;

				if (!selector) {
					selector = $toggle.attr('href');
					selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
				}

				if ($li.hasClass('active')) {
					$next = $li
						.siblings()
						.eq(0)
						.find('>[data-toggle="tab"]');
					if ($next.length > 0) {
						api = $next.tab().data('bs.tab');
						api.show();
					}
				}

				$parent = $(selector);

				e.preventDefault();

				$parent.trigger((e = $.Event('close.bs.tab')));

				if (e.isDefaultPrevented()) {
					return;
				}

				$parent.removeClass('in');

				function refresh() {
					self.$dropdown.find('div>a:first').remove();

					if (self.$dropdown.find('div>a').length === 0) {
						self.$dropdown.remove();
					}
				}

				function removeElement() {
					// detach from parent, fire event then clean up data
					$parent
						.detach()
						.trigger('closed.bs.tab')
						.remove();
					$li.detach().remove();
					refresh();
					self.init();
				}

				$.support.transition && $parent.hasClass('fade')
					? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(150)
					: removeElement();
			});
		},
		throttle: function(fn, interval) {
			// 节流方法
			var timer;
			var firstTime = true;

			return function() {
				var args = arguments;
				var that = this;

				if (firstTime) {
					fn.apply(that, args);
					firstTime = false;
				}

				if (timer) {
					return;
				}

				timer = setInterval(function() {
					clearInterval(timer);
					timer = null;
					fn.apply(that, args);
				}, interval || 500);
			};
		},
		reset: function() {
			// 重置方法
			this.init();
		},
		bind: function() {
			// 绑定resize事件，屏幕尺寸变化时触发layout方法
			var self = this;

			$(window).resize(function() {
				self.throttle(function() {
					self.layout();
				}, 1000)();
			});
		}
	};

	$.fn[pluginName] = function(options) {
		var method;
		var methodArguments;

		// 参数为字符串时触发方法
		if (typeof options === 'string') {
			method = options;
			methodArguments = Array.prototype.slice.call(arguments, 1);

			// 禁止调用私有方法
			if (/^_/.test(method)) {
				console.error('No such method : ' + options);
			}

			return this.each(function() {
				var api = $.data(this, pluginName);

				if (api && typeof api[method] === 'function') {
					api[method].apply(api, methodArguments);
				}
			});
		}

		return this.each(function() {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new Plugin(this, options));
			} else {
				$.data(this, pluginName).init();
			}
		});
	};
})(window, document, jQuery);
