/**
*  更新：2014.09.17 
* //------------头部结构-------------------//
* <div id="header" class="clearfix">
*     <h1 class="top-left-bar logo"><a href="/"></a></h1> 
*     <ul class="top-right-bar"><li class="welcome-info">欢迎您！</li></ul>
* </div>
*
* //------------导航及内容结构-------------------//
*<div class="content"> 
*    <div id="mainnav">
*          <ul id="j-nav" class="clearfix"></ul>
*    </div> 
*
*    <ul id="nav-content" class="nav-content"></ul> 
*</div>
*/

"use strict";
var FxTab = function () {
      var head_tpl = '<div id="header" class="clearfix"><h1 class="top-left-bar logo"><a href="/"></a></h1> <ul class="top-right-bar"><li class="welcome-info">欢迎您！</li></ul></div>',
            base_tpl = '<div class="content"> <div id="mainnav"><ul id="j-nav" class="clearfix"></ul></div> <ul id="nav-content" class="nav-content"></ul> </div>',
            item_arr,
            id_arr,
            _createModule,
            _setModuleSelected,
            item_allarr,
            is_tab;

    function _init(config,style,isTab) 
    {
        this.modulesConfig = config || {};
        this.modulesConfig.nav = config.nav;
        this.theme = style || 'default';
        item_arr = FX.getNavSingleMenu(config.nav);  //返回无menu 的当前对象， 数组形式，表现为弹出tab的项
        id_arr = FX.getTopId(config.nav);   //提取顶级的 id字段，数组形式
        item_allarr = FX.getNavItem(config.nav);       //重组json格式，返回无嵌套的 扁平化的json数据，方便历遍比较        
        is_tab = isTab;  //配置tab 标签，默认false
    };

    _init.prototype = {

		// 获取 id在json数据中的 索引
		getModuleIndex : function(id) 
		{
			var   _self = this,
			       result = 0;

			$.each(_self.modulesConfig.nav, function(index, conf) 
                   {
			     if (conf.id === id) 
                        {
				  result = index;
				  return false;
			     }
			});
			return result;
		},

		// 获取 id 对象
		getModuleConfig : function(id) 
		{
			var	_self = this,
			      result = null;
			$.each(_self.modulesConfig.nav, function(index, conf) 
			{
				if (conf.id === id) 
				{
					result = conf;
					return false;
				}
			});
			return result;
		},

		//A 获取模块,初始化模块
		getModule : function(id) 
             {
			var  _self = this,
				top_nav_obj = _self.getModuleConfig(id), // 返回当前一级id对象
				index = _self.getModuleIndex(id);   //返回id 的索引

				_self.initMenu(top_nav_obj);

				$('.nav-content-list').eq(index).find('.third-nav-menu').eq(0).prev('.second-nav-menu-title').trigger('click'); //打开页面打开第一个有子菜单的下拉
		},

		//获取模块编号
		getModuleId : function(index) 
		{
			var  _self = this;

			if( _self.modulesConfig.nav[index]) 
			{
			  return  _self.modulesConfig.nav[index].id;
			} 
			else 
			{
			  return index;
			}
		},


            //初始化 导航  参数为一级id 的 对象
		initMenu : function(top_nav_obj)
		{
			var  _self = this,
				id = top_nav_obj.id,
                          treeId = '#j-' + id + '-tree',
                          index = _self.getModuleIndex(id),  // 注：b风格内容只有一个li包含， 所以只有index为 0起作用
                          tabId = '.nav-content-list';

				for (var i = 0, j = item_allarr.length; i < j ; i++)
				{
                               
                                //如设置有home_page 则默认打开所设置的页面
					if (!!top_nav_obj.home_page  && item_allarr[i].id === top_nav_obj.home_page)
					{

					  var 	current_tab =  item_allarr[i],
							current_text = [],
							current_href = item_allarr[i].href,
							current_id = item_allarr[i].id,
							closeable = item_allarr[i].closeable || false;

                                            current_text.push(item_allarr[i].text);
							
							FX.openTap(current_id,current_text,current_href,closeable,index,is_tab);

							is_tab ?  FX.bindTabClick(current_id, tabId, true) : '';
					}
				};

                    // 渲染当前top_nav_obj.id 下的二级 ，三级导航
			childMenu({ render: treeId, items: top_nav_obj.menu});

			$('#j-nav').find('.nav-item').eq(index).attr('aria', false); //标识页面已打开过，a风格
		},


		// 模块选中
		setModuleSelected : function(index) 
		{

			var _self = this,
				moduleId = _self.getModuleId(index),
				module = null,
			
			      $main_nav_list = $('#j-nav').find('.nav-item'),
			      $nav_con_list = $('#nav-content').find('.nav-content-list');
       

			FX.setNavPosition(moduleId);
			if ($('.nav-item').eq(index).attr('aria') == 'true') 
			{
			   _self.getModule(moduleId);
			   new tabView(item_arr,id_arr,is_tab);
			}

                    $main_nav_list.removeClass('selected').eq(index).addClass('selected');
                    $nav_con_list.addClass('js-hide').eq(index).removeClass('js-hide');
                    is_tab ?  navTab.init({idArr : id_arr}) : "";

		},

		_AutoHeight : function()
		{
			// 自适应高度
			var _self = this, 
				 tabH = $('.tab-nav-list').height() + 1,
				 mainNavH = $('#mainnav').height(),
				 $navContent =$('#nav-content'),
				 $content = $('.content'),
				 $tabContainer = $('.tab-content-container');

			$(window).resize(function() 
			{
				$.trim(_self.theme) == 'A-0' ?  $navContent.height(FX.getAutoHeight()-mainNavH) : '';
				$content.height(FX.getAutoHeight());
				$tabContainer.height(($navContent.height()-tabH));
			});

			$(window).resize();
		},

		bindMenuToggle : function()
		{
			  // 子级收缩
			  var _self = this;
			  $('#j-nav,#nav-content').on('click', 'a',function() {

				if ($(this).hasClass('nav-item-title') && $(this).siblings('.second-nav').length>0 && $.trim(_self.theme)!='B-1')
				{
				  $(this).siblings('.second-nav').slideToggle().end().toggleClass("close");
				}
				else if ($(this).hasClass('second-nav-menu-title') && $(this).siblings('.third-nav-menu').length>0 && $.trim(_self.theme)!='B-1')
				{
				  $(this).siblings('.third-nav-menu').slideToggle().end().toggleClass("close");
				}
			  });
		},

		// 初始化基本的dom
		initDom: function() 
		{
			var _self = this,
				config = _self.modulesConfig,
				logo_text,
				logo_link,
				con_base_tpl = [head_tpl, base_tpl].join(''),
				topbar_config = _self.modulesConfig.topbar;  //头部登录信息数据

				$('.fx_page').html(con_base_tpl);

                          is_tab ? '' : $('body').addClass('js-no-tab');

				!!config.logo ? logo_text = config.logo.url : '';  //支持图片或文字，图片只返回图片路径
				!!config.logo ? logo_link = config.logo.link : '';

				// 遍历顶部工具条
				$.each(topbar_config, function(index,item)
				{
					var    item_title = item.title || '无标题',
						  item_link = item.link || 'javascript:void(0)',
						  item_icon = item.icon || 'icon_empty',
						  mini_top_tpl = '<li><i class="'+item_icon+'"></i><a href="'+ item_link +'"><span>'+item_title+'</span></a></li>';

						  if (!!item.menu && item.menu.length >0) 
						  {

						  var mini_top_tpl = '<li><i class="'+item_icon+'"></i><a href="'+ item_link +'"><span>'+item_title+'</span></a>'+'<ul class="drop-nav menu_'+index+'"></ul></li>';
						  }

						  $(mini_top_tpl).appendTo($('.top-right-bar'));
						  
						  if (!!item.menu && item.menu.length >0)
						  {
							for(var i=0, j = item.menu.length;i<j;i++)
							{
								var item_title = item.menu[i].title || '无标题',
									  item_link = item.menu[i].link || 'javascript:void(0)',
									  item_icon = item.menu[i].icon || 'icon_empty';
								var menu_tpl ='<li><i class="'+item_icon+'"></i><a href="'+ item_link +'"><span>'+item_title+'</span></a></li>';
								$(menu_tpl).appendTo($('.menu_'+index))
							}
						  }
				});

				
				$('.logo a').attr('href',logo_link); //logo链接
				
				// 判断是否是图片 图片格式支持jpg|gif|png|bmp
				 /[^\s]+\.(jpg|gif|png|bmp)/i.test(logo_text) ? $('.logo a').html('<img src="'+logo_text+'">') : $('.logo a').html(logo_text);

				 _self._initNav();
				_self._initLocation();
				_self._initEvent();
				_self._AutoHeight();
				
		},

		// 初始化 menu 及内容外框结构
		_initNav: function() 
		{
			var _self = this,
				nav_arr = _self.modulesConfig.nav,
				$main_nav = $('#j-nav'),
				$nav_con = $('#nav-content'),
				moduleId, index, href, text, icon,
				main_nav_list_tpl_a,
				main_nav_list_tpl_b,
				tab_con_list_tpl_a,
				tab_con_list_tpl_b,
				tab_wrap_tpl,
				children_menu_tpl;

			_self.bindMenuToggle();

			  //风格B
			if (/[B][-]\d/.test(_self.theme)) 
			{

				_self.theme == 'B-0' ? $('body').addClass('theme-styleB-0') : $('body').addClass('theme-styleB-1');

				var tab_wrap_tpl_b = '<div class="inner-tab" id="j-tab"><div class="tab-nav-bar"><div class="tab-nav-wrapper"><div class="tab-nav-inner"> <ul class="tab-nav-list clearfix"></ul>  </div> <div class="tabs-left">left</div><div class="tabs-right">right</div></div> </div><div class="tab-content-container"></div></div>';
				
				// 内容框 包含tab 和iframe
				tab_con_list_tpl_b = '<li class="nav-content-list clearfix">' + tab_wrap_tpl_b + '</li>';

				$(tab_con_list_tpl_b).appendTo($nav_con)
			} 

			else 
			{
				// 风格A 
				_self.theme == 'A-0' ? $('body').addClass('theme-styleA-0') : $('body').addClass('theme-styleA-1');
			}

			$.each(nav_arr, function(index, item) 
			{
				moduleId = item.id,
				href = item.href || 'javascript:void(0);',
				text = item.text || '无标题',
				icon = item.icon || 'icon_empty',
				index = index,
				children_menu_tpl =
				  [
				  '<div class="second-nav"><div class="second-nav-tree" id="',
				  'j-',
				  moduleId,
				  '-tree">',
				  '</div></div>'
				].join(''),

				tab_wrap_tpl =
				  [
				  '<div class="inner-tab" id="j-',
				  moduleId,
				  '-tab">',
				  '<div class="tab-nav-bar">  <div class="tab-nav-wrapper">  <div class="tab-nav-inner"> <ul class="tab-nav-list clearfix"></ul>  </div> <div class="tabs-left">left</div><div class="tabs-right">right</div></div> </div>',
				  '<div class="tab-content-container"></div>',
				  '</div>'
				].join(''),

				main_nav_list_tpl_a = ['<li class="nav-item" data-id = "', moduleId, '"><a href="',href,'"class="nav-item-title" title="',text,'"><i class="' ,icon, '"></i><span class="text">', text, '</span></a></li>'].join(''),
				main_nav_list_tpl_b = ['<li class="nav-item" data-id = "', moduleId, '"><a href="',href,'"class="nav-item-title" title="',text,'"><i class="' ,icon, '"></i><span class="text">', text, '</span></a>', children_menu_tpl, '</li>'].join(''),

				tab_con_list_tpl_a = '<li class="nav-content-list js-hide clearfix">' + children_menu_tpl + tab_wrap_tpl + '</li>';

				// 没有子菜单的情况
				if (!item.menu || item.menu.length ==0) 
				{
					tab_con_list_tpl_a = '<li class="nav-content-list clearfix no-child">' + tab_wrap_tpl + '</li>';
					main_nav_list_tpl_b = main_nav_list_tpl_a;
				};

				function styleA() 
				{
				  $(main_nav_list_tpl_a).appendTo($main_nav);
				  $(tab_con_list_tpl_a).appendTo($nav_con);
				  $('.nav-item').attr('aria', 'true')
				};

				function styleB() 
				{
				  $(main_nav_list_tpl_b).appendTo($main_nav);
				  $('.nav-item').attr('aria', 'true')
				};

				/[A][-]\d/.test(_self.theme) ? styleA() : styleB(); //根据参数判断模板风格

			});
		  
		},

		//初始化选中的模块和页面
		_initLocation: function() {
			var _self = this,
			      modulesConfig = _self.modulesConfig.nav;
	   
			//从链接中获取用户定位到的模块，便于刷新和转到指定模块使用
			var defaultSetting = FX.getNavPositionSetting() || false, //Object {moduleId: "", pageId: ""} 
				id_index;

			//b风格结构不一样，所以渲染不一样
			if (/[B][-]\d/.test(_self.theme)) 
			{
				$.each(modulesConfig, function(i, top_nav_obj) 
				{
					_self.initMenu(top_nav_obj);
				});

			  new tabView(item_arr,id_arr,is_tab);
                      is_tab ?  navTab.init({idArr : id_arr}) : "";
			  return false;
			};

			defaultSetting ? id_index = _self.getModuleIndex(defaultSetting.moduleId) : id_index = 0;
			_self.setModuleSelected(id_index);

		},

		_initEvent: function() 
		{
			var _self = this;
			var modulesConfig = _self.modulesConfig.nav,
				navItems = $('#j-nav'),
				mainNav = $('#j-nav').find('.nav-item');

			$("#j-nav,.second-nav-menu").live("click","a",function(event) 
			{
				var e = event ||  window.event; 
				e.preventDefault();
			}); 

                         // if (/[B][-]\d/.test(_self.theme)) 
			if (/[B][-]\d/.test(_self.theme)) 
			{
                          if(_self.theme == 'B-0') {
                              $('.second-nav').eq(0).prev('.nav-item-title').trigger('click'); //b-0下拉展开
                          }
				
			}
			else
			{
				mainNav.each(function(index, item) 
				{
					var item = $(item);

					item.on('click', function() 
					{

						if (!$(this).hasClass('selected')) 
						{

							_self.setModuleSelected(index);
						}

					});
				});
			};
		}
	}

	return _init;
}();

