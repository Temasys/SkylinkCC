var Demo = Demo || {};

Demo.User = {};
Demo.Peers = [];
Demo.Advert = 'img/sample_video.mp4';

// Demo events
Demo.Events = {
  starting: 'starting',
  watching: 'watching',
  onhold: 'onhold'
};

// Demo media streams
Demo.Streams = {};

// Demo functions
Demo.Methods = {};
Demo.Methods.getUserType = function () {
  // get current user type via url
  // E.g client.html for client
  // agent.html for agent
  var urlParts = window.location.href.split('/');
  var parseItem = function (urlPart) {
    return urlPart.split('.')[0];
  };
  if (urlParts[urlParts.length - 1]) {
    return parseItem(urlParts[urlParts.length - 1]);
  } else {
    return parseItem(urlParts[urlParts.length - 2]);
  }
};

// DOM events
$(document).ready(function () {
  //---------------------------------------------------
  // after user hits the enter key
  $('#displayName').keyup(function(key) {
    if (key.keyCode === 13) {
      Demo.Skyway.connect(Demo.API.lobbyRoom, {
        displayName: $(this).val(),
        timeStamp: (new Date()).toISOString(),
        status: Demo.Events.starting
      }, Demo.Methods.getUserType());
    }
  });
  //---------------------------------------------------
  // client item click
  $('#peerList').on('click', '.clientPeer', function () {
    Demo.Skyway.agentRequestCall($(this).attr('id'));
  });
});
//---------------------------------------------------
// Skyway
// Initialize all the Skyway settings
Demo.Skyway = new SkywayCC();
Demo.Skyway.init({
  defaultRoom: Demo.API.defaultRoom, // the lobby
  apiKey: Demo.API.apiKey
});
//---------------------------------------------------
// A peer has joined a room
Demo.Skyway.on('peerJoined', function (peerId, peerInfo, isSelf) {
  console.info(peerInfo);
  if (isSelf) {
    Demo.User = Demo.User || {};
    Demo.User = peerInfo;
    // Display client only data not agent to agent
    if (peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT &&
      Demo.User.call.status === Demo.Skyway.CALL_READY_STATE.LOBBY) {
      Demo.User.userData.status = Demo.Events.watching;
      Demo.Skyway.startPeerEvent(Demo.User.userData, {
        name: Demo.Events.watching,
        params: Demo.Advert
      });
    } else if ($('#advertVideo').length) {
      $('#advertVideo')[0].src = '';
    }
  } else {
    Demo.Peers[peerId] = peerInfo;
    // We should handle from skywaycc to prevent sending information
    // of agent
    if (Demo.Methods.getUserType() === Demo.Skyway.PEER_TYPE.AGENT &&
      peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT) {
      $('#peerList').append('<li>' +
        '<a id="' + peerId + '" href="#" class="clientPeer"><span>' +
        peerInfo.userData.displayName + '</span>' +
        '<span class="status">' +
        peerInfo.userData.status + '</span><em>' +
        peerInfo.userData.timeStamp + '</em></a></li>');
    }
  }
});
//---------------------------------------------------
// Add peer media stream
// Note that 'addPeerStream' is now 'incomingStream'
Demo.Skyway.on('incomingStream', function (peerId, stream, isSelf) {
  Demo.Streams[peerId] = stream;
  if (isSelf) {
    attachMediaStream($('#localVideo')[0], stream);
    $('#peerList').hide();
  } else {
    attachMediaStream($('#remoteVideo')[0], stream);
  }
  $('.display-list').hide();
  $('#advertVideo').hide();
});
//---------------------------------------------------
// Peer request changed. Handshake for call connection
Demo.Skyway.on('peerCallRequest', function (peerId, peerInfo, isSelf) {
  var displayName = peerInfo.userData.displayName;

  if (isSelf) {
    Demo.User = peerInfo;
  } else {
    Demo.Peers[peerId] = peerInfo;
    switch(peerInfo.call.status) {
    case Demo.Skyway.CALL_READY_STATE.REQUEST_CALL:
      var result = confirm(displayName + ' requested to call you. Accept?');
      Demo.Skyway.acceptRequestCall(peerId, result);
      break;
    case Demo.Skyway.CALL_READY_STATE.ACCEPTED_CALL:
      alert(displayName + ' has accepted your call.');
      Demo.Skyway.startRequestCall(peerId, function (userInfo, testInfo) {
        console.info(testInfo);
        Demo.Skyway.joinRoom(peerInfo.call.targetRoom, {
          audio: true,
          video: true
        });
      });
      break;
    case Demo.Skyway.CALL_READY_STATE.REJECTED_CALL:
      alert(displayName + ' has rejected your call.');
      break;
    case Demo.Skyway.CALL_READY_STATE.START_CALL:
      Demo.Skyway.startRequestCall(peerId, function (userInfo, testInfo) {
        console.info(testInfo);
        Demo.Skyway.joinRoom(peerInfo.call.targetRoom, {
          audio: true,
          video: true
        });
      });
    }
  }
});
//---------------------------------------------------
// A peer has left the room
Demo.Skyway.on('peerLeft', function (peerId, peerInfo, isSelf) {
  if (!isSelf) {
    delete Demo.Peers[peerId];
    $('#' + peerId).remove();
  }
});
//---------------------------------------------------
// A peer's data {status} is updated
Demo.Skyway.on('peerUpdated', function (peerId, peerInfo, isSelf) {
  console.info(peerInfo);
  if (isSelf) {
    Demo.User = peerInfo;
  } else {
    Demo.Peers[peerId] = peerInfo;
    if (peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT) {
      $('#' + peerId).find('.status').html(peerInfo.userData.status);
    }
  }
});
//---------------------------------------------------
// Demo custom events
Demo.Skyway.on(Demo.Events.watching, function (advertUrl) {
  $('#advertVideo')[0].src = advertUrl;
  var interval = setInterval(function(){
    if ($('#advertVideo')[0].readyState > 0) {
      clearInterval(interval);
      $('#advertVideo').show();
      var secs = 15 * 1000;//($('#advertVideo')[0].duration /
       // 25) * 1000;
      var advertDisplaySecs = window.setInterval(function(){
        secs -= 10;
        $('.advertDisplay').find('span').html((parseInt(secs / 1000) > 9) ?
          parseInt(secs / 1000) : ('0' + parseInt(secs / 1000)));
        if(secs < 10000) {
          $('#advertVideo')[0].volume =
            (secs / 10000).toFixed(1);
        }
        if(secs <= 0) {
          $('.advertDisplay').find('span').html('00');
          clearInterval(advertDisplaySecs);
          $('#advertVideo')[0].volume = 1;
          $('#advertVideo')[0].loop = 'loop';
          Demo.User.userData.status = Demo.Events.onhold;
          Demo.Skyway.startPeerEvent(Demo.User.userData, {
            name: Demo.Events.onhold
          });
        }
      }, 10);
    }
  }, 10);
});
//---------------------------------------------------
Demo.Skyway.on(Demo.Events.onhold, function () {
  $('.advertDisplay').html('Agent is currently on-hold.');
});