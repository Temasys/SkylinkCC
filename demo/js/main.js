var Demo = Demo || {};
// Demo api settings
Demo.API = {
  //'7d75a8fb-94bf-4451-bc71-ca7d9f362279',
  apiKey: '5f874168-0079-46fc-ab9d-13931c2baa39',
  defaultRoom: 'default',
  lobbyRoom: 'main_lobby',
  user: {},
  peers: []
};

// Demo events
Demo.EVENT = {
  STARTING: 'starting',
  WATCHING: 'watching',
  ON_HOLD: 'onhold'
};

// Demo media streams
Demo.Streams = {
  local: '',
  remote: []
};

// Demo functions
Demo.getUserType = function () {
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

// Skyway
// Initialize all the Skyway settings
Demo.Skyway = new SkywayCC();
Demo.Skyway.init({
  defaultRoom: Demo.API.defaultRoom, // the lobby
  apiKey: Demo.API.apiKey
});

// DOM events
$(document).ready(function () {
  // after user hits the enter key
  $('#displayName').keyup(function(key) {
    if (key.keyCode === 13) {
      Demo.Skyway.connect(Demo.API.lobbyRoom, {
        displayName: $(this).val(),
        timeStamp: (new Date()).toISOString(),
        status: Demo.EVENT.STARTING
      }, Demo.getUserType());
    }
  });

  // client item click
  $('#peerList').on('click', '.clientPeer', function () {
    Demo.Skyway.agentRequestCall($(this).attr('id'));
  });
});

// A peer has joined a room
Demo.Skyway.on('peerJoined', function (peerId, peerInfo, isSelf) {
  if (isSelf) {
    Demo.API.user = Demo.API.user || {};
    Demo.API.user = peerInfo;
    // Display client only data not agent to agent
    if (peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT &&
      Demo.API.user.call.status === Demo.Skyway.CALL_READY_STATE.LOBBY) {
      Demo.API.user.userData.status = Demo.EVENT.WATCHING;
      Demo.Skyway.startPeerEvent(Demo.API.user.userData, {
        name: Demo.EVENT.WATCHING,
        params: 'img/advert.mp4'
      });
    } else if ($('#advertVideo').length) {
      $('#advertVideo')[0].src = '';
    }
  } else {
    Demo.API.peers[peerId] = peerInfo;
    // We should handle from skywaycc to prevent sending information
    // of agent
    if (Demo.getUserType() === Demo.Skyway.PEER_TYPE.AGENT &&
      peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT) {
      console.info(peerInfo);
      $('#peerList').append('<li>' +
        '<a id="' + peerId + '" href="#" class="clientPeer"><span>' +
        peerInfo.userData.displayName + '</span>' +
        '<span class="status">' +
        peerInfo.userData.status + '</span><em>' +
        peerInfo.userData.timeStamp + '</em></a></li>');
    }
  }
});

// Add peer media stream
Demo.Skyway.on('addPeerStream', function (peerId, stream, isSelf) {
  if (isSelf) {
    Demo.Streams.local = stream;
    attachMediaStream($('#localVideo')[0], stream);
    $('#peerList').hide();
  } else {
    Demo.Streams.remote[peerId] = stream;
    attachMediaStream($('#remoteVideo')[0], stream);
  }
  $('.display-list').hide();
  $('#advertVideo').hide();
});

// Peer request changed. Handshake for call connection
Demo.Skyway.on('peerCallRequest', function (peerId, peerInfo, isSelf) {
  if (isSelf) {
    Demo.API.user = peerInfo;
  } else {
    Demo.API.peers[peerId] = peerInfo;
    switch(peerInfo.call.status) {
    case Demo.Skyway.CALL_READY_STATE.REQUEST_CALL:
      var result = confirm(peerId + ' requested to call you. Accept?');
      Demo.Skyway.acceptRequestCall(peerId, result);
      break;
    case Demo.Skyway.CALL_READY_STATE.ACCEPTED_CALL:
      alert(peerId + ' has accepted your call.');
      Demo.Skyway.startRequestCall(peerId, function (userInfo, peerInfo) {
        Demo.Skyway.joinRoom(peerInfo.call.targetRoom, {
          audio: true,
          video: true
        });
      });
      break;
    case Demo.Skyway.CALL_READY_STATE.REJECTED_CALL:
      alert(peerId + ' has rejected your call.');
      break;
    case Demo.Skyway.CALL_READY_STATE.START_CALL:
      Demo.Skyway.startRequestCall(peerId, function (userInfo, peerInfo) {
        Demo.Skyway.joinRoom(peerInfo.call.targetRoom, {
          audio: true,
          video: true
        });
      });
    }
  }
});

// A peer has left the room
Demo.Skyway.on('peerLeft', function (peerId, isSelf) {
  if (!isSelf) {
    delete Demo.API.peers[peerId];
    $('#' + peerId).remove();
  }
});

// A peer's data {status} is updated
Demo.Skyway.on('peerUpdated', function (peerId, peerInfo, isSelf) {
  if (isSelf) {
    Demo.API.user = peerInfo;
  } else {
    Demo.API.peers[peerId] = peerInfo;
    if (peerInfo.call.peerType === Demo.Skyway.PEER_TYPE.CLIENT) {
      $('#' + peerId).find('.status').html(peerInfo.userData.status);
    }
  }
});

// Demo custom events
Demo.Skyway.on(Demo.EVENT.WATCHING, function (advertUrl) {
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
          Demo.API.user.userData.status = Demo.EVENT.ON_HOLD;
          Demo.Skyway.startPeerEvent(Demo.API.user.userData, {
            name: Demo.EVENT.ON_HOLD
          });
        }
      }, 10);
    }
  }, 10);
});

Demo.Skyway.on(Demo.EVENT.ON_HOLD, function () {
  $('.advertDisplay').html('Please hold on while we get the next available agent' +
    'to assist you. We apologise for the wait.')
});