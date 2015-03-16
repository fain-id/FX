/**
 * @author Fain
 * 介绍：小型portal系统
 * name ：FX对象，包含最基础的方法
 * getTopId：该方法以数组形式提取一级id字段
 * getNavItem ：该方法扁平化json数据
 * getNavSingleMenu ：该方法最后以数组形式提取json数据最后一级的对象
 * getAutoHeight ：返回屏幕减头部高度之差
 * setNavPosition :  设置链接hash 暂时只应用于A风格
 * getNavPositionSetting ：获取当前链接 hash
 * replaceAll ：字符串局部字符正则替换 并返回新的字符串
 * openTap ：打开tab的方法
 * closeTap ：关闭按钮方法
 * renderMenu ：用来解析渲染二三级menu
 * bindTabClick ：为tab标签绑定点击事件
 */
 window.FX = window.FX || {}; 
 $.extend(FX, 
 {
	getTopId : function(arr) 
	{
		var idArr = [];
		for (var i = 0, j = arr.length;i<j; i++)
		{
			var itemId = arr[i].id;
			idArr.push(itemId)
		};
		return idArr;
	},

    getNavItem : function(arr) 
    {
        var a = [];
        for(var i = 0, j = arr.length; i < j; i++){
			var r = {};
			$.extend(r, arr[i],{"menu":null});
			a.push(r);
			if(arr[i]["menu"] && arr[i]["menu"].length > 0)
			{
				$.merge(a, this.getNavItem(arr[i]["menu"]));
			}
        }
        return a;
    },

    getNavSingleMenu : function(arr)
    {
        var a = [];

        for(var i = 0, j = arr.length; i<j; i++)
        {
            var r = {};

            if(!arr[ i ]["menu"] || arr[ i ]["menu"].length <=  0)
            {
                $.extend(r, arr[ i ],{"menu":null});
                a.push(r);
            };

            if(arr[ i ]["menu"] && arr[ i ]["menu"].length > 0)  
            {
                $.merge(a, this.getNavSingleMenu(arr[ i ]["menu"]));
            }
        };  
        return a;
    },

    getAutoHeight : function()
    {
        var height = $(window).height(),
		
            subHeight = $('#header').outerHeight();

            return height - subHeight;  
    },

    setNavPosition : function(moduleId,pageId)
    {
        pageId = pageId || '';
        var str = '#'+moduleId;
              
        if(pageId){
            str += '/'+pageId;
        }
        location.hash =str;
    },

	getNavPositionSetting : function()
	{
		var pos = location.hash,
			moduleIndex = 0,
			pageId ='',
			splitIndex = pos.indexOf('/');

		if(!pos){
			return null;
		}
		
		if(splitIndex >= 0){
			moduleIndex = pos.substring(1,splitIndex);
			pageId = pos.substring(splitIndex + 1);
		}
		else
		{
			moduleIndex=pos.substring(1);
		}

		return {moduleId : moduleIndex,pageId : pageId}; 
	},
	
    replaceAll : function(os, ns, str)
    {
        return str.replace(new RegExp(os,"gm"),ns);
    },

    openTap : function(current_id, text, href, closeable, index,isTab) 
    {

        var tabTpl,
              _self = this;
              iframeTpl = '<div class="tab-content"><iframe src="{url}" width="100%" height="100%" frameborder="0"></iframe></div>';
              isTab && $.trim(closeable) != "true" ? 
              tabTpl =  ' <li class="tab-nav-list-item selected tab-nav-list-item-0{i}" data-id="{current_id}"><a href="javascript:void(0)"><s class="tab-item-close">×</s><span class="tab-item-title">{text}</span></a></li>' :
              tabTpl = ' <li class="tab-nav-list-item selected tab-nav-list-item-0{i}" data-id="{current_id}"><a href="javascript:void(0)"><s class="tab-item-close js-hide">×</s><span class="tab-item-title">{text}</span></a></li>' ,
             listTpl ='';
        $.each(text, function(i,item) {
          var item2 = _self.replaceAll("{i}", i, tabTpl);
         
          //面包屑加 间隔符
          if(i != text.length-1) {
               listTpl += _self.replaceAll("{text}", item, _self.replaceAll("{current_id}", current_id, item2)) + '<li class=\"divider\">/</li>' ;
          }
          else {
               listTpl += _self.replaceAll("{text}", item, _self.replaceAll("{current_id}", current_id, item2)) ;
          }
        });

	  $('#nav-content').find('.nav-content-list').eq(index).find('.tab-nav-list')[isTab?"append":"html"](listTpl)
        $('#nav-content').find('.nav-content-list').eq(index).find('.tab-content-container')[isTab?"append":"html"]($( this.replaceAll("{url}", href, iframeTpl) ))
		
        isTab ? navTab._contextmenu($('.tab-nav-list-item')) : "";
    },

    closeTap : function(index, tabId)
    {
		navTab._scrollCurrent();
		
		$('.tab-nav-list-item',tabId).eq(index).remove();
		$('.second-nav li').removeClass('selected');
		$('.tab-content',tabId).eq(index).remove();
		
		if ($(this).hasClass('selected')) 
		{
			$('.tab-nav-list-item',tabId).last().show().addClass('selected');
			$('.tab-content',tabId).last().show();
		};
        
    },

    renderMenu :function(menuArr,level, parentNode)
    {
        $.each(menuArr, function (index, item) 
        {
            var id = item.id,
                href = item.href || 'javascript:void(0)',
                text = item.text,
                icon =item.icon || 'icon_empty',
                closeable = item.closeable || false;
                tpl = [
                '<li class="',level,'-nav-menu-item" closeable = "',closeable,'"  data-id="',
                id,
                '"><a title="',text,'" href="',href,
                '" class="',level,'-nav-menu-title"><i class="',
                icon,
                '"></i><span class="text">',
                text,
                '</span></a></li>'].join('');
				  
                $(tpl).appendTo(parentNode);

        });
    },

    bindTabClick : function(id, tabId, isHomePage)
    {
		var _self = this;
		
		$('.tab-nav-list li[data-id=' + id+ ']',tabId).on('click',function(event) 
		{
			var e=window.event || event;

			if ((e.target || e.srcElement).className== 'tab-item-close') 
			{
			// 关闭按钮绑定
			var i = $('.tab-item-close',tabId).index($('s',this));
					
				_self.closeTap.call(this,i, tabId);
				return false
			};
			
			navTab._switchTab($('.tab-nav-list-item').index($(this)));
			
			var index =  $('.tab-nav-list li',tabId).index($(this)),
				tab_id = $(this).attr('data-id');

				$('.tab-nav-list li',tabId).removeClass('selected');
				$(this).addClass('selected');
				$('.tab-content',tabId).hide();
				$('.tab-content',tabId).eq(index).show();

				if (isHomePage) {return false};

				$('.second-nav').find('li').removeClass('selected');

				for (var i =0; i < $('.second-nav').find('li').length;i++)
				{
					if ($('.second-nav').find('li').eq(i).attr('data-id') == tab_id)
					{
						$('.second-nav').find('li').eq(i).addClass('selected');
					}
				}
		});
    }
 });


/* 名称  子菜单menu函数
 * 参数menuConfig 字面量对象
*/

function childMenu(menuConfig) 
{ 
    var _self = this, 
        config = $.extend(this.menuConfig,menuConfig);

        isSecondTree = config.items.length > 0 ;         // 判断是否有二级
		
        if (isSecondTree)
        {
	   var  i =0,
                secondMenuCount     =      config.items.length,
                secondMenuItem      =      config.items,
                thirdMenuItem,
                childUl             =       $(config.render),
                isThirdTree;

			var childUlWrap = 
				{
					_inintSecondMenu : function () 
					{
						FX.renderMenu(secondMenuItem,'second',childUl.find('.second-nav-menu'))
					},

					_inintThirdMenu : function (i)
					{
						var thirdMenuItem = config.items[i].menu; 
						$('<ul class="third-nav-menu"></ul>').appendTo(childUl.find('.second-nav-menu-item').eq(i));
						 FX.renderMenu(thirdMenuItem,'third',childUl.find('.second-nav-menu-item').eq(i).find('.third-nav-menu'))
					},
				 
					onlySecond :  function () 
					{ 
						var _self = this;
						$('<ul class="second-nav-menu"></ul>').appendTo(childUl);
						_self._inintSecondMenu()
					}
                };

            childUlWrap.onlySecond();  //先渲染二级

			for (; i < secondMenuCount; i++)  // 三级有则执行，没有则不执行
			{
				if(!!config.items[i].menu && config.items[i].menu.length>0) {childUlWrap._inintThirdMenu(i) }
			}
        }
  };

/* 名称tab 控件函数
 * 参数 items ：二级 id 所包含的三级数组[]
 * 参数 tabId  ：二级id  对应的 #j-id-tab
*/
var tabView = function (items,id_arr,isTab)
{
	var text,href,current_id,closeable;
	$.each(items,function(index, item) 
	{
		current_id = item.id;
		text = item.text;
		href = item.href;
		closeable = item.closeable || false;

		var itemEl  = $('li[data-id=' + current_id+ ']:not(.tab-nav-list-item)');

		//a风格 一级menu 特殊处理
		if ($.inArray(current_id, id_arr) >=0 && /[A][-]\d/.test($('body').attr('class'))) 
		{
			var index = $.inArray(current_id, id_arr);
			
			itemEl.on('click', function () 
			{    
				var target_id = $.trim($(this).attr('data-id') ),
					target_text = [],
					target_href = $('a',this).attr('href'),
					target_closeable = 'true',
					tabLength =$('.tab-nav-list').eq(index).find('li').length,
					tabId = '.nav-content-list:visible';

                                target_text.push($.trim($('.text',this).text()));

					$('#nav-content').find('li.nav-content-list').addClass('js-hide');
					$('#nav-content').find('li.nav-content-list').eq(index).removeClass('js-hide');
					$(this).parent().find('li').removeClass('selected')
					$(this).addClass('selected');
                                 $(this).attr('aria','false');

				  
					FX.setNavPosition(itemEl.attr('data-id'))
				  
					for (var i =0; i< tabLength;i++)  //如果已经打开，则不在打开
					{

						var tab_id= $('.tab-nav-list',tabId).find('.tab-nav-list-item').eq(i).attr('data-id');
						if (target_id == tab_id)
						{
							$('#j-nav').find('li').removeClass('selected')
							$(this).addClass('selected');
							$('.tab-nav-list',tabId).find('.tab-item-title').parent().removeClass('selected')
							$('.tab-nav-list',tabId).find('.tab-item-title').eq(i).parent().addClass('selected')
							$('.tab-content',tabId).hide();
							$('.tab-content',tabId).eq(i).show();

                                            // 刷新页面 20141115
                                            var src = $('.tab-content',tabId).eq(i).find('iframe').attr('src');
                                            $('.tab-content',tabId).eq(i).find('iframe').attr('src',src);
							return false
						}
					};
				  FX.openTap(target_id,target_text,target_href,target_closeable,index, isTab);
			})
		}
		else 
		{
			if (!!FX.getNavPositionSetting())
			{
				var mainId = FX.getNavPositionSetting().moduleId;
				var i = $.inArray(mainId, id_arr),isB = false;
			}
			else 
			{
				var i = 0, isB = true;
			}

			var tabId = $('.nav-content-list').eq(i);

			// 判断事件是否绑定
			$events = itemEl.data("events");

			if( $events && $events["click"] )
			{
			  // 　console.log(!($events && $events["click"]))
			}
			else 
			{
				itemEl.on('click', function ()
				{
					var target_id = $.trim($(this).attr('data-id'));
					var target_text = [];
					var target_href = $('a',this).attr('href');
					var target_closeable = $(this).attr('closeable');
					var tabLength =$('.tab-nav-list',tabId).find('li').length;

                                if(!isTab) 
                                {
                                     if(!!$(this).parents('.second-nav-menu-item').length) {

                                      isB ?  target_text.push($(this).parents('.nav-item').find('.nav-item-title').text()) : target_text.push($('.nav-item.selected').text());
                                      target_text.push($(this).parents('.second-nav-menu-item').find('.second-nav-menu-title').text());

                                     
                                    } else {
                                      isB ?  !!$(this).parents('.nav-item').length && target_text.push($(this).parents('.nav-item').find('.nav-item-title').text()) : target_text.push($('.nav-item.selected').text());                                  
                                    }
                                };

                                 target_text.push($.trim($(this).text()));

					for (var j = 0; j< tabLength; j++)  //如果已经打开，则不在打开
					{ 

						var tab_id= $('.tab-nav-list',tabId).find('.tab-nav-list-item').eq(j).attr('data-id');
						if (target_id == tab_id)
						{	
							if($('.second-nav').length>0 && !isB) 
							{
                                                    //二级导航存在而且是A风格
								$('.second-nav',tabId).find('li').removeClass('selected');                                                  
							}
							else 
							{
								$('#j-nav').find('li').removeClass('selected')
							};

							$(this).addClass('selected');
							$('.tab-nav-list',tabId).find('.tab-item-title').parent().parent().removeClass('selected');
							$('.tab-nav-list',tabId).find('.tab-item-title').eq(j).parent().parent().addClass('selected');
							$('.tab-content',tabId).hide();
							$('.tab-content',tabId).eq(j).show();
							isTab ?  navTab._switchTab(j) : '';

                                            // 刷新页面 20141115
                                            var src = $('.tab-content',tabId).eq(j).find('iframe').attr('src');
                                            $('.tab-content',tabId).eq(j).find('iframe').attr('src',src);
							return false;
						}
					};

					$('.tab-content', tabId).hide();
					$('.tab-nav-list li', tabId).removeClass('selected');

					if ($('.second-nav').length>0 && !isB) 
					{
						$('.second-nav',tabId).find('li').removeClass('selected');                                                  
					}
					else 
					{
						$('#j-nav').find('li').removeClass('selected');
					};

					$(this).addClass('selected');
					FX.openTap(target_id,target_text,target_href,target_closeable,i,isTab);
                                if(!isTab) {
                                  return;
                                };
					FX.bindTabClick(target_id, tabId, false);
                                navTab._switchTab($('.tab-nav-list-item').length+1);
					
				})
			}
		}
	})
};

