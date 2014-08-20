var CustomerDemo = CustomerDemo || {};

CustomerDemo.Elements = {
  //- Client: Start a call
  startACallForm: '#startACallForm',
  clientDisplayName: '#clientDisplayName',
  // - Unknown
  isAgent: '#isAgent',
  masterPanelList: '#masterPanelList',
  settingsList: '.settingsList',
  advertVideo: '#advertVideo',
  advertDisplay: '#advertDisplay',
  advertSecs: '#advertSecs',
  remoteVideo: '#remoteVideo',
  localVideo: '#localVideo',
  chatLog: '#chatLog',
  chatInput: '#chatInput',
  noUserPanel: '#noUserPanel',
  startACallPanel: '#startACallPanel',
  headerSide: '.headerSide',
  controlsSide: '.controlsSide',
  controls: '.controls',
  userDisplayName: '.header em',
  muteCam: '#muteCam',
  muteMic: '#muteMic',
  leaveRoom: '#leaveRoom',
  connectivityStatusBtn: '#connectivityStatusBtn',
  connectivityStatus: '#connectivityStatus'
};

CustomerDemo._resize = function () {
  if ($(CustomerDemo.Elements.masterPanelList).width()) {
    $(CustomerDemo.Elements.masterPanelList).width(
      $(window).width() - 270 - 80);
    $(CustomerDemo.Elements.masterPanelList).height(
      $(window).height() - 50);
  }
  if ($(CustomerDemo.Elements.advertVideo).width()) {
    if ($(CustomerDemo.Elements.controlsSide).css('display') !== 'block') {
      $(CustomerDemo.Elements.advertVideo)[0].style.width =
        window.outerWidth + 'px';
    } else {
      $(CustomerDemo.Elements.advertVideo)[0].style.width =
        (window.outerWidth - 300) + 'px';
    }
    $(CustomerDemo.Elements.advertVideo)[0].style.height =
      window.outerHeight + 'px';
  }
  if ($(CustomerDemo.Elements.advertDisplay).width()) {
    $(CustomerDemo.Elements.advertDisplay)[0].style.top = ((window.outerHeight -
      $(CustomerDemo.Elements.advertDisplay).outerHeight()) / 3) + 'px';
    $(CustomerDemo.Elements.advertDisplay)[0].style.left = ((window.outerWidth -
      $(CustomerDemo.Elements.advertDisplay).outerWidth()) / 2) + 'px';
  }
  $(CustomerDemo.Elements.remoteVideo).width((window.outerWidth - 300));
  $(CustomerDemo.Elements.remoteVideo).height((window.outerHeight));
  $(CustomerDemo.Elements.chatLog).height($(window).height() -
    $(CustomerDemo.Elements.controls).outerHeight() - 3 -
    $(CustomerDemo.Elements.chatInput).outerHeight());
  if (!$(CustomerDemo.Elements.chatLog).width()) {
    if ($(CustomerDemo.Elements.noUserPanel).width()) {
      $(CustomerDemo.Elements.noUserPanel)[0].style.right =
        ((window.outerWidth-$(CustomerDemo.Elements.chatLog).outerWidth() -
        $(CustomerDemo.Elements.noUserPanel).width()) / 2) + 'px';
    }
    if ($(CustomerDemo.Elements.startACallPanel).width()) {
      $(CustomerDemo.Elements.startACallPanel)[0].style.right = ((window.outerWidth -
        $(CustomerDemo.Elements.chatLog).outerWidth() -
        $(CustomerDemo.Elements.startACallPanel).width()) / 2) + 'px';
    }
  } else {
    if ($(CustomerDemo.Elements.noUserPanel).width()) {
      $(CustomerDemo.Elements.noUserPanel)[0].style.right = ((window.outerWidth -
        $(CustomerDemo.Elements.noUserPanel).width()) / 2) + 'px';
    }
    if ($(CustomerDemo.Elements.startACallPanel).width()) {
      $(CustomerDemo.Elements.startACallPanel)[0].style.right = ((window.outerWidth -
        $(CustomerDemo.Elements.startACallPanel).width()) / 2) + 'px';
    }
  }
};

$(window).resize(function () {
  CustomerDemo._resize();
});