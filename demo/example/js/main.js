var CustomerDemo = CustomerDemo || {};

CustomerDemo.API = {
  apiKey: '7d75a8fb-94bf-4451-bc71-ca7d9f362279', //'5f874168-0079-46fc-ab9d-13931c2baa39',
  defaultRoom: 'lobby',
  user: {},
  peers: [],
  in_room: false,
  in_call: false
};

CustomerDemo.Streams = {
  local: '',
  remote: []
};

CustomerDemo.Skyway = new Skyway();
CustomerDemo.Skyway.init({
  apiKey: CustomerDemo.API.apiKey,
  defaultRoom: CustomerDemo.API.defaultRoom
});

CustomerDemo.updateUser = function (event) {
  setTimeout(function() {
    CustomerDemo.API.user.userData.status = event;
    console.info(CustomerDemo.API.user);
    CustomerDemo.Skyway.setUserData(CustomerDemo.API.user.userData);
    console.info('Set status: ' + event);
  }, 200);
};

CustomerDemo.updatePeerList = function (peerId, peerInfo, peerLeft) {
  if (peerLeft) {
    delete CustomerDemo.API.peers[peerId];
    $('#' + peerId).fadeOut();
    setTimeout(function() {
      $('#' + peerId).remove();
    }, 2000);
  } else {
    if (!CustomerDemo.API.peers[peerId]) {
      CustomerDemo.API.peers[peerId] = peerInfo;
      var newPeer = '<div id="' + peerId + '" class="customerPeer">' +
        '<span>' + peerInfo.userData.displayName + '</span>' +
        '<em>' + peerInfo.userData.timeStamp + '</em>' +
        '<em class="status">' + peerInfo.userData.status + '</em>' +
      '</div>';
      $(CustomerDemo.Elements.masterPanelList).append(newPeer);
    } else {
      CustomerDemo.API.peers[peerId] = peerInfo;
      $('#' + peerId).find('.status').html(peerInfo.userData.status);
    }
  }
};

CustomerDemo.updateConnState = function (_id, stateColor, stateTitle, stateInfo) {
  var stateElm = document.getElementById(_id);
  stateElm.innerHTML = '<span>' + stateTitle + ': </span>' +
    '<em class="_' + stateColor + '">' +
    (stateInfo.charAt(0).toUpperCase() + stateInfo.slice(1)) + '</em>';
};

//-- SkywayJS events
//---------------------------------------------------
CustomerDemo.Skyway.on('readyStateChange', function(state){
  CustomerDemo.updateConnState('readyStateChange', 'G', 'Ready State Change', 'Started');
  console.log('Connectivity Status [Peer] - Ready State Change.');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('peerJoined', function(peerId, peerInfo, isSelf){
  if (isSelf) {
    CustomerDemo.updateConnState('inRoomState', 'G', 'In Room', 'True');
    console.log('Connectivity Status [User] - In Room State: True');
    console.log('Connectivity type: ' + peerInfo.userData.type);
    CustomerDemo.API.user = peerInfo;
    CustomerDemo.API.user.id = peerId;
  } else {
    if (peerInfo.userData.type !== 'Agent') {
      CustomerDemo.updatePeerList(peerId, peerInfo);
      CustomerDemo.updateConnState('peerState', 'Y', 'Peer State', 'Joined Room');
      console.log('Connectivity Status [Peer] - Status: Joined Room');
    } else {
      CustomerDemo.API.peers[peerId] = peerInfo;
    }
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('peerLeft', function(peerId, isSelf){
  if (isSelf) {
    setTimeout(function () {
      CustomerDemo.Skyway.joinRoom(CustomerDemo.API.room, {
        user: CustomerDemo.API.user.userData,
        video: true,
        audio: true
      });
    }, 500);
    CustomerDemo.API.in_room = true;
  } else {
    if (CustomerDemo.API.user.userData.type === 'Agent') {
      CustomerDemo.updatePeerList(peerId, null, true);
    }
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('handshakeProgress', function(state){
  if (state === CustomerDemo.Skyway.HANDSHAKE_PROGRESS.ENTER) {
    if (CustomerDemo.API.user.userData.type === 'Customer' &&
      !CustomerDemo.API.in_room) {
      CustomerDemo.updateUser('watching');
    }
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('peerUpdated', function(peerId, peerInfo, isSelf){
  if (isSelf) {
    if(peerInfo.userData.status) {
      CustomerDemo.Skyway._trigger(peerInfo.userData.status);
    }
  } else {
    // Do a reupdate
    if (CustomerDemo.API.user.userData.type === 'Agent') {
      CustomerDemo.updatePeerList(peerId, peerInfo);
    }
  }
});
//---------------------------------------------------
//-- Custom Events
CustomerDemo.Skyway.on('watching', function (params) {
 $(CustomerDemo.Elements.advertVideo)[0].play();
 CustomerDemo._resize();
  var interval = setInterval(function(){
    if ($(CustomerDemo.Elements.advertVideo)[0].readyState > 0) {
      clearInterval(interval);
      $(CustomerDemo.Elements.advertDisplay).show();
      var secs = ($(CustomerDemo.Elements.advertVideo)[0].duration /
        25) * 1000;
      var advertDisplaySecs = window.setInterval(function(){
        secs -= 10;
        $(CustomerDemo.Elements.advertSecs).html((parseInt(secs / 1000) > 9) ?
          parseInt(secs / 1000) : ('0' + parseInt(secs / 1000)));
        if(secs < 10000) {
          $(CustomerDemo.Elements.advertVideo)[0].volume =
            (secs / 10000).toFixed(1);
        }
        if(secs <= 0) {
          $(CustomerDemo.Elements.advertSecs).html('00');
          clearInterval(advertDisplaySecs);
          $(CustomerDemo.Elements.advertVideo)[0].volume = 1;
          $(CustomerDemo.Elements.advertVideo)[0].loop = 'loop';
          CustomerDemo.updateUser('onhold');
        }
      }, 10);
    }
  }, 500);
});
//---------------------------------------------------
CustomerDemo.Skyway.on('onhold', function (params) {
 $(CustomerDemo.Elements.advertDisplay).hide();
 $(CustomerDemo.Elements.noUserPanel).show();
});

CustomerDemo.Skyway.on('privateMessage', function (data, senderPeerId, peerId, isSelf) {
  if (!isSelf) {
    if (data.roomId) {
      CustomerDemo.API.in_room = true;
      CustomerDemo.API.room = data.roomId;
      CustomerDemo.Skyway.leaveRoom();
    }
  } else {
    CustomerDemo.API.in_room = true;
    CustomerDemo.Skyway.leaveRoom();
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('startCall', function (params) {
  CustomerDemo.API.user.userData.status = 'incall';
  CustomerDemo.Skyway.joinRoom({
    user: CustomerDemo.API.user,
    audio: true,
    video: true
  });
});
//---------------------------------------------------
CustomerDemo.Skyway.on('mediaAccessSuccess', function (stream) {
  attachMediaStream($(CustomerDemo.Elements.localVideo)[0], stream);
  $(CustomerDemo.Elements.masterPanelList).hide();
  $(CustomerDemo.Elements.settingsList).hide();
  $(CustomerDemo.Elements.localVideo).show();
  $(CustomerDemo.Elements.headerSide).removeClass('lobby');
  $(CustomerDemo.Elements.controlsSide).show();
  if ($(CustomerDemo.Elements.advertVideo)[0]) {
    $(CustomerDemo.Elements.advertVideo)[0].style.width =
      (window.outerWidth - 300) + 'px';
  } else {
    $(CustomerDemo.Elements.remoteVideo)[0].style.width =
      (window.outerWidth - 300) + 'px';
    $(CustomerDemo.Elements.remoteVideo).show();
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('addPeerStream', function (peerId, stream, isSelf) {
  if (!isSelf) {
    if (!CustomerDemo.API.in_call) {
      CustomerDemo.API.in_call = true;
      if ($(CustomerDemo.Elements.advertVideo)[0]) {
        attachMediaStream($(CustomerDemo.Elements.advertVideo)[0], stream);
        $(CustomerDemo.Elements.advertVideo)[0].autoplay = 'autoplay';
        $(CustomerDemo.Elements.noUserPanel).fadeOut();
      } else {
        attachMediaStream($(CustomerDemo.Elements.remoteVideo)[0], stream);
      }
    }
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('chatMessageReceived', function (message, peerId, isPrivate, isSelf) {
  console.info(CustomerDemo.API.peers[peerId]);
  var displayName = '';
  if (isSelf) {
    displayName = CustomerDemo.API.user.userData.displayName;
  } else {
    displayName = CustomerDemo.API.peers[peerId].userData.displayName;
  }
  $(chatLog).append('<div class="chatItem"><div class="user">' + displayName + ':</div>' +
    '<div class="message">' + (isPrivate?'<i>[pvt msg] ':'') + message + (isPrivate?'</i>':'') +
    '</div>' + '<div class="timeStamp">' +
    (new Date()).getHours() + ':' + (new Date()).getMinutes() + ':' +
    (new Date()).getSeconds() + '</div></div>');
});
//-- Document events
$(document).ready(function () {
  //---------------------------------------------------
  if ($(CustomerDemo.Elements.isAgent).length > 0) {
    CustomerDemo.Skyway.joinRoom({
      user: {
        displayName: 'Agent',
        timeStamp: (new Date()).toISOString(),
        status: 'started',
        type: 'Agent'
      },
      audio: false,
      video: false
    });
  }
  //---------------------------------------------------
  CustomerDemo._resize();
  //---------------------------------------------------
  $(CustomerDemo.Elements.chatInput).keyup(function(e){
    if(e.keyCode === 13) {
      CustomerDemo.Skyway.sendChatMessage($(this).val());
      $(this).val('');
    }
  });
  //---------------------------------------------------
  $(CustomerDemo.Elements.muteCam).click(function(){
    if (CustomerDemo.MediaStatus.videoMuted === true) {
      CustomerDemo.Skyway.disableVideo();
    } else {
      CustomerDemo.Skyway.enableVideo();
    }
  });
  //---------------------------------------------------
  $(CustomerDemo.Elements.muteMic).click(function(){
    if (CustomerDemo.MediaStatus.audioMuted === true) {
      CustomerDemo.Skyway.disableAudio();
    } else {
      CustomerDemo.Skyway.enableAudio();
    }
  });
  //---------------------------------------------------
  $(CustomerDemo.Elements.leaveRoom).click(function(){
    CustomerDemo.Skyway.leaveRoom();
  });
  //---------------------------------------------------
  $(CustomerDemo.Elements.connectivityStatusBtn).click(function() {
    $(CustomerDemo.Elements.connectivityStatus).slideToggle();
    $(this).find('em').html(
      ($(this).find('em').html() === '+') ? '-' : '+' );
    $(this).find('span').html(
      ($(this).find('em').html() === '+') ?
      'Display Connectivity Status' : 'Hide Connectivity Status');
  });
  //---------------------------------------------------
  // Start a call
  $(CustomerDemo.Elements.startACallForm).submit(function() {
    var clientName = $(CustomerDemo.Elements.clientDisplayName).val();
    console.info('Display name: ' + clientName);
    CustomerDemo.Skyway.joinRoom({
      user: {
        displayName: clientName,
        timeStamp: (new Date()).toISOString(),
        status: 'started',
        type: 'Customer'
      },
      audio: false,
      video: false
    });
    $(CustomerDemo.Elements.startACallPanel).fadeOut();
    return false;
  });

  $(CustomerDemo.Elements.masterPanelList).on('click', '.customerPeer', function() {
    CustomerDemo.API.user.userData.agent = true;
    var peerId = $(this).attr('id');
    CustomerDemo.Skyway.sendPrivateMessage({
      roomId: 'cust_' + peerId,
      agent: true
    }, peerId);
    CustomerDemo.API.room = 'cust_' + peerId;
  });
});