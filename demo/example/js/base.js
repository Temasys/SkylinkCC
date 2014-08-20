/****************************************************
  Written by Temasys Communications Pte Ltd
  (c) 2014 All rights reserved
****************************************************/
// Variables
var t = new Skyway();
var isAgent, masterPanelList, settingsList;
var advertVideo, advertDisplay, advertSecs;
var remoteVideo, localVideo, chatLog, chatInput;
var noUserPanel, startACallPanel;
var headerSide, controlsSide, controls, userDisplayName;
var nbPeers = 0;
/***********************************
  Window Events
************************************/
// t.getDefaultStream(); // t.joinRoom(); // t.leaveRoom();
window.onload = function () {
  // Agent Variables
  isAgent = $('#isAgent')[0];
  masterPanelList = '#masterPanelList';
  settingsList = '.settingsList';
  // Client Variables
  advertVideo = '#advertVideo';
  advertDisplay = '#advertDisplay';
  advertSecs = '#advertSecs';
  // In-Call Variables
  remoteVideo = '#remoteVideo';
  localVideo = '#localVideo';
  chatLog = '#chatLog';
  chatInput = '#chatInput';
  // Panels
  noUserPanel = '#noUserPanel';
  startACallPanel = '#startACallPanel';
  // Controls/Display
  headerSide = '.headerSide';
  controlsSide = '.controlsSide';
  controls = '.controls';
  userDisplayName = '.header em';
  window._resize();
  // HTML element events
  $(chatInput).keyup(function(e){
    if(e.keyCode == 13) {
      console.log('Chat: ' + $(this).val());
      t.sendChatMsg( $(this).val() );
      $(this).val('');
    }
  });
  $('#muteCam').click(function(){ });
  $('#muteMic').click(function(){ });
  $('#leaveRoom').click(function(){ t.leaveRoom(); });
  $('#connectivityStatusBtn').click(function() {
    $('#connectivityStatus').slideToggle();
    $(this).find('em').html(($(this).find('em').html()==='+')?'-':'+');
    $(this).find('span').html(
      ($(this).find('em').html()==='+')?'Display Connectivity Status':'Hide Connectivity Status'
    );
  });
};
window.onresize = function (event) {
  window._resize();
};
window._resize = function () {
  if($(masterPanelList).width()){
    $(masterPanelList).width($(window).width() - 270 - 80);
    $(masterPanelList).height($(window).height() - 50);
  }
  if($(advertVideo).width()){
    if($(controlsSide).css('display')!=='block') {
      $(advertVideo)[0].style.width = window.outerWidth + 'px';
    } else {
      $(advertVideo)[0].style.width = (window.outerWidth - 300) + 'px';
    }
    $(advertVideo)[0].style.height = window.outerHeight + 'px';
  }
  if($(advertDisplay).width()){
    $(advertDisplay)[0].style.top =
      ((window.outerHeight-$(advertDisplay).outerHeight())/3) + 'px';
    $(advertDisplay)[0].style.left =
      ((window.outerWidth-$(advertDisplay).outerWidth())/2) + 'px';
  }
  $(remoteVideo).width((window.outerWidth-300));
  $(remoteVideo).height((window.outerHeight));
  $(chatLog).height($(window).height()-$(controls).outerHeight()-3-$(chatInput).outerHeight());
  if (!$(chatLog).width()) {
    if ($(noUserPanel).width()) {
      $(noUserPanel)[0].style.right =
        ((window.outerWidth-$(chatLog).outerWidth()-$(noUserPanel).width())/2) + 'px';
    }
    if ($(startACallPanel).width()) {
      $(startACallPanel)[0].style.right =
        ((window.outerWidth-$(chatLog).outerWidth()-$(startACallPanel).width())/2) + 'px';
    }
  } else {
    if ($(noUserPanel).width()) {
      $(noUserPanel)[0].style.right =
        ((window.outerWidth-$(noUserPanel).width())/2) + 'px';
    }
    if ($(startACallPanel).width()) {
      $(startACallPanel)[0].style.right =
        ((window.outerWidth-$(startACallPanel).width())/2) + 'px';
    }
  }
};
window._init = function () {
  $(noUserPanel).show();
  $(advertDisplay).remove();
  t.joinRoom();
  t._user.displayName = t._temp.displayName;
  delete t._temp.displayName;
  $(controlsSide).fadeIn();
  $(userDisplayName).html('Hi, <u>' + t._user.displayName + '</u>!');
  window._resize();
};
window.startAdvert = function () {
 $(advertVideo)[0].play();
 window._resize();
  var interval = window.setInterval(function(){
    if ($(advertVideo)[0].readyState > 0) {
      clearInterval(interval);
      $(advertDisplay).show();
      var secs = ($(advertVideo)[0].duration/25)*1000;
      var advertDisplaySecs = window.setInterval(function(){
        secs -= 10;
        $(advertSecs).html((parseInt(secs/1000)>9)?parseInt(secs/1000):('0'+parseInt(secs/1000)));
        if(secs<10000) {
          $(advertVideo)[0].volume = (secs/10000).toFixed(1);
        }
        if(secs<=0) {
          $(advertSecs).html('00');
          clearInterval(advertDisplaySecs);
          $(advertVideo)[0].volume = 1;
          $(advertVideo)[0].style.width = (window.outerWidth - 300) + 'px';
          $(advertVideo)[0].loop = 'loop';
          window.changeStatusEvent('onhold');
        }
      },10);
    }
  },500);
};
window._updateConnState = function (_id, stateColor, stateTitle, stateInfo) {
  var stateElm = document.getElementById(_id);
  stateElm.innerHTML = '<span>' + stateTitle + ': </span>' +
    '<em class="_' + stateColor + '">' +
    (stateInfo.charAt(0).toUpperCase() + stateInfo.slice(1)) + '</em>';
};
//--------
t.on('mediaAccessSuccess', function(stream){
  attachMediaStream( $(localVideo)[0], stream );
  window.changeStatusEvent('onwebcam');
});
//--------
t.on('mediaAccessError', function(err){
  console.log('mediaAccessError: ' + err);
  window.changeStatusEvent('onwebcamerror');
});
//--------
t.on('channelMessage', function(){
  window._updateConnState('channelState', 'G', 'Channel', 'Message Received');
  console.log('Connectivity Status - Channel Message Received.');
});
//--------
t.on('channelOpen', function(){
  window._updateConnState('channelState', 'Y', 'Channel', 'Opened');
  console.log('Connectivity Status - Channel Opened.');
});
//--------
t.on('channelClose', function(){
  window._updateConnState('channelState', 'R', 'Channel', 'Closed');
  console.log("Connectivity Status - Channel Closed.");
});
//--------
t.on('readyStateChange', function(){
  window._updateConnState('readyStateChange', 'G', 'Ready State Change', 'Started');
  console.log('Connectivity Status [Peer] - Ready State Change.');
});
//--------
t.on('handshakeProgress', function(state){
  var stateColor = 'R';
  switch( state ){
    case 'welcome': stateColor = 'Y'; break;
    case 'offer': stateColor = 'G'; break;
    case 'answer': stateColor = 'G'; break;
  }
  window._updateConnState('handshakeProgress', stateColor, 'HandShake Progress', state);
  console.log('Connectivity Status [Peer] - Handshake Progress State: ' + state);
});
//--------
t.on('candidateGenerationState', function(state){
  var stateColor = 'R';
  if(state === 'done') { stateColor = 'G'; }
  window._updateConnState('candidateGenerationState', stateColor, 'Candidate Generation State', state);
  console.log('Connectivity Status [Peer] - Candidate Generation State: ' + state);
});
//--------
t.on('iceConnectionState', function(state){
  var stateColor = 'D';
  switch( state ){
    case 'new': case 'closed': case 'failed': stateColor = 'R'; break;
    case 'checking': case 'disconnected': stateColor = 'Y'; break;
    case 'connected': case 'completed': stateColor = 'G'; break;
  }
  window._updateConnState('iceConnectionState', stateColor, 'Ice Connection State', state);
  console.log('Connectivity Status [Peer] - Candidate Generation State: [' + stateColor + '] ' + state);
});
//--------
t.on('joinedRoom', function(){
  window._updateConnState('inRoomState', 'G', 'In Room', 'True');
  console.log('Connectivity Status [User] - In Room State: True');
});
//--------
t.on('chatMessage', function ( msg, nick, isPvt ) {
  var newEntry = '<div class="chatItem"><div class="user">' + nick + ':</div>' +
    '<div class="message">' + (isPvt?'<i>[pvt msg] ':'') + msg + (isPvt?'</i>':'') +
    '</div>' + '<div class="timeStamp">' +
    (new Date()).getHours() + ':' + (new Date()).getMinutes() + ':' +
    (new Date()).getSeconds() + '</div></div>';
  $(chatLog).append( newEntry );
});
//--------
t.on('peerJoined', function(id){
  window._updateConnState('peerState', 'Y', 'Peer State', 'Joined Room');
  console.log('Connectivity Status [Peer] - Status: Joined Room');
  $(noUserPanel).remove();
  $(advertVideo).remove();
  if(!isAgent) {
    window.changeStatusEvent('startingcall');
  }
});
//--------
t.on('addPeerStream', function(peerID, stream){
  window._updateConnState('peerState', 'G', 'Peer State', 'Added Stream');
  console.log('Connectivity Status [Peer] - Status: Added Stream');
  nbPeers += 1;
  if(nbPeers > 0) {
    if(nbPeers > 2) {
      console.log('Someone else ["' + peerID + '"] tried to joined to room.');
      return;
    } else {
      $(remoteVideo)[0].peerID = peerID;
      $(remoteVideo)[0].autoplay = 'autoplay';
      attachMediaStream( $(remoteVideo)[0], stream );
      $(remoteVideo)[0].style.display = 'block';
      if(!isAgent) {
        window.changeStatusEvent('incall');
      }
    }
  }
});
//--------
t.on('peerLeft', function(peerID){
  window._updateConnState('peerState', 'R', 'Peer State', 'Left Room');
  console.log('Connectivity Status [Peer] - Status: Left Room');
  $(remoteVideo)[0].poster  = '/default.png';
  $(remoteVideo)[0].src = '';
  window.changeStatusEvent('leftroom');
});
//--------
t.on('changeStatus',function(status){
  switch (status) {
    case 'init':
      // Init event here
      console.log('Room Status: Room has just been created.');
      t.getDefaultStream();
      break;
    case 'onwebcam':
      console.log('Room Status: User has allowed webcam.');
      $(startACallPanel).fadeOut();
      $(masterPanelList).fadeOut();
      $(settingsList).fadeOut();
      $(headerSide).css('background','transparent');
      $(localVideo).fadeIn();
      if(!isAgent) {
        window.changeStatusEvent('watching');
      } else {
        window._init();
      }
      break;
    case 'onwebcamerror':
      console.log('Room Status: User has failed to allow webcam.');
      break;
    case 'watching':
      // Watching event here
      console.log('Room Status: Customer is currently watching advertisement');
      window.startAdvert();
      break;
    case 'onhold':
      // Onhold event here
      console.log('Room Status: Customer is placed onhold before the next agent arrives.');
      window._init();
      break;
    case 'chat':
      //NOTE: Chat event here. Unknown if should update this event
      console.log('Room Status: Customer has sent a new message.');
      break;
    case 'startingcall':
      // Starting calling event here
      console.log('Room Status: Customer call\' starting with agent.');
      break;
    case 'incall':
      // In-call event here
      console.log('Room Status: Customer is currently in the call with agent.');
      break;
    case 'leftroom':
      // Customer left room event here
      console.log('Room Status: Customer has left the room.');
      window.location.href = window.location.href;
      break;
    case 'nousers':
      // No users event here (highly doubt so)
      console.log('Room Status: No one is in the room.');
      break;
    default:
      // Unknown event here
      console.log('Room Status: Unknown event type - "' + status + '"');
      break;
  }
});