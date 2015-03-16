var navTab = {
  componentBox: null, // tab component. contain tabBox, prevBut, nextBut, panelBox
  _tabBox: null,
  _prevBut: null,
  _nextBut: null,
  _panelBox: null,
  _currentIndex: 0,

  _op: {
    idArr : "id_arr",
    id: "nav-content",
    stTabBox: ".tab-nav-list",
    stPanelBox: ".tab-content-container",
    close$: "s.tab-item-close",
    prevClass: "tabs-left",
    nextClass: "tabs-right"
  },

  init: function(options) {
    var $this = this;
    $.extend(this._op, options);

      if (!!FX.getNavPositionSetting())
      {
        var mainId = FX.getNavPositionSetting().moduleId;
        var i = $.inArray(mainId, this._op.idArr);
      }
      else 
      {
        var i = 0;
      }

      var tabId = $('.nav-content-list').eq(i);

    this.componentBox = $("#" + this._op.id);
    this._tabBox = tabId.find(this._op.stTabBox,tabId);
    this._panelBox = tabId.find(this._op.stPanelBox);
    this._prevBut = tabId.find("." + this._op.prevClass);
    this._nextBut = tabId.find("." + this._op.nextClass);

    this._prevBut.click(function(event) {
      $this._scrollPrev()
    });

    this._nextBut.click(function(event) {
      $this._scrollNext()
    });
    this._contextmenu(this._getTabs());
    this._ctrlScrollBut();
  },

  _getTabs: function() {
    return this._tabBox.find("> li");
  },
  _getPanels: function() {
    return this._panelBox.find("> div");
  },

  _getTab: function(tabid) {
    var index = this._indexTabId(tabid);
    if (index >= 0) return this._getTabs().eq(index);
  },

  getPanel: function(tabid) {
    var index = this._indexTabId(tabid);
    if (index >= 0) return this._getPanels().eq(index);
  },

  _getTabsW: function(iStart, iEnd) {
    return this._tabsW(this._getTabs().slice(iStart, iEnd));
  },

  _tabsW: function($tabs) {
    var iW = 0;
    $tabs.each(function() {
      iW += $(this).outerWidth(true);
    });

    return iW;
  },

  _indexTabId: function(tabid) {
    if (!tabid) return -1;
    var iOpenIndex = -1;
    this._getTabs().each(function(index) {
      if ($(this).attr("data-id") == tabid) {
        iOpenIndex = index;
        return;
      }
    });
    return iOpenIndex;
  },

  _getLeft: function() {
    return this._tabBox.position().left;
  },

  _getScrollBarW: function() {
    return this._panelBox.width() - 55;
  },

  _visibleStart: function() {
    var iLeft = this._getLeft(),
      iW = 0;
    var $tabs = this._getTabs();
    for (var i = 0; i < $tabs.size(); i++) {
      if (iW + iLeft >= 0) return i;
      iW += $tabs.eq(i).outerWidth(true);
    }
    return 0;
  },

  _visibleEnd: function() {
    var iLeft = this._getLeft(),
      iW = 0;
    var $tabs = this._getTabs();
    for (var i = 0; i < $tabs.size(); i++) {
      iW += $tabs.eq(i).outerWidth(true);
      if (iW + iLeft > this._getScrollBarW()) return i;
    }
    return $tabs.size();
  },

  _scrollPrev: function() {
    var iStart = this._visibleStart();
    if (iStart > 0) {
      this._scrollTab(-this._getTabsW(0, iStart - 1));
    }
  },

  _scrollNext: function() {
    var iEnd = this._visibleEnd();
    if (iEnd < this._getTabs().size()) {
      this._scrollTab(-this._getTabsW(0, iEnd + 1) + this._getScrollBarW());
    }
  },

  _scrollTab: function(iLeft, isNext) {
    var $this = this;
    this._tabBox.animate({
      left: iLeft + 'px'
    }, 200, function() {
      $this._ctrlScrollBut();
    });
  },

  _scrollCurrent: function() { // auto scroll current tab
    var iW = this._tabsW(this._getTabs());
    if (iW <= this._getScrollBarW()) {
      this._scrollTab(0);
    } else if (this._getLeft() < this._getScrollBarW() - iW) {
      this._scrollTab(this._getScrollBarW() - iW);
    } else if (this._currentIndex < this._visibleStart()) {
      this._scrollTab(-this._getTabsW(0, this._currentIndex));
    } else if (this._currentIndex >= this._visibleEnd()) {
      this._scrollTab(this._getScrollBarW() - this._getTabs().eq(this._currentIndex).outerWidth(true) - this._getTabsW(0, this._currentIndex));
    }
  },

  _ctrlScrollBut: function() {
    var iW = this._tabsW(this._getTabs());
    if (this._getScrollBarW() > iW) {
      this._prevBut.hide();
      this._nextBut.hide();
      this._tabBox.parent().removeClass("tabsPageHeaderMargin");
    } else {
      this._prevBut.show().removeClass("tabsLeftDisabled");
      this._nextBut.show().removeClass("tabsRightDisabled");
      this._tabBox.parent().addClass("tabsPageHeaderMargin");
      if (this._getLeft() >= 0) {
        this._prevBut.addClass("tabsLeftDisabled");
      } else if (this._getLeft() <= this._getScrollBarW() - iW) {
        this._nextBut.addClass("tabsRightDisabled");
      }
    }
  },
  _switchTab : function(iTabIndex) {
    this._currentIndex = iTabIndex;

    this._scrollCurrent();
  },

  closeAllTab: function() {
    this._getTabs().remove();
    this._getPanels().remove();
  },

  _closeOtherTab: function(index) {
    var index2 = index;
    if (index2 >= 0) {
      var str$ = ":eq(" + index + ")";
      this._getTabs().filter(str$).addClass('selected');
      this._getPanels().filter(str$).show();
      this._getTabs().not(str$).remove();
      this._getPanels().not(str$).remove();

      this._currentIndex = 1;
      this._scrollCurrent();
    } else {
      this.closeAllTab();
    }
  },

  _contextmenu: function($obj) { // navTab右键菜单
    var $this = this;
    $obj.contextMenu('navTabCM', {
      bindings: {
        reload: function(t, m) {
          var index = $('.tab-nav-list-item').index(t);
          var src = $('.tab-content').eq(index).find('iframe').attr('src');
          $('.tab-content').eq(index).find('iframe').attr('src',src)
        },

        closeOther: function(t, m) {
          var index = $this._indexTabId(t.attr("data-id"));
          $this._closeOtherTab(index);
        },

        closeAll: function(t, m) {
          $this.closeAllTab();
        }
      },
      ctrSub: function(t, m) {
        var mReload = m.find("[rel='reload']");
        var mCur = m.find("[rel='closeCurrent']");
        var mOther = m.find("[rel='closeOther']");
        var mAll = m.find("[rel='closeAll']");
        var $tabLi = $this._getTabs();
      }
    });
  }
};