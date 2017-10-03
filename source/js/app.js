(function () {

var sl = new Skylink();
sl.setLogLevel(sl.LOG_LEVEL.DEBUG);

/**
 * Handles the data.
 */
var data = {
  user: {
    name: '',
    status: 'Loading',
    type: 'client',
    joined: ''
  },
  clients: {},
  insession: null
};

/**
 * Handles utils
 */
var utils = {
  
  forEach: function (obj, fn) {
    if (typeof obj.forEach === 'function') {
      obj.forEach(fn);
      return;
    }

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key);
      }
    }
  }
};

/**
 * Handles templating UI
 */
var template = {
  
  renderError: function (method, error) {
    console.error(method +  '() failed', error);
    $('.name').html('<b>ERROR:</b> Failed connecting. Aborted with [' + method + ': ' +
      error.errorCode + ']. <p><small>To see more details, open the Web Console to view the error log</small></p>').show();
    $('.av, .a-banner, .peer, .self, .clients').hide();
  },


  renderClients: function (clients) {
    utils.forEach(clients, function (client, clientId) {
      if (client.type !== 'client') {
        return;
      }

      var dom = document.getElementById('client-' + clientId);

      if (dom) {
        $(dom).find('.c-status').html(client.status);
      
      } else {
        dom = document.createElement('button');
        dom.id = 'client-' + clientId;
        dom.className = 'client';
        dom.onclick = function () {
          $('.clients .client').attr('disabled', true);
          connect.requestToPeer(clientId);
        };

        dom.innerHTML = '<p class="c-name">' + client.name + '</p>' +
          '<p class="c-status">' + client.status + '</p>' +
          '<p class="c-joined">' + (new Date (client.joined)).toString() + '</p>';

        $('.clients').append(dom);
        $(dom).fadeIn();
      }
    });
  },

  removeClient: function (clientId) {
    var dom = document.getElementById('client-' + clientId);

    if (dom) {
      $(dom).fadeOut(200);

      setTimeout(function () {
        $(dom).remove();
      }, 200);
    }
  }
};

/**
 * Handles connection
 */
var connect = {

  goToLobby: function () {
    sl.init(config, function (initError, initSuccess) {
      if (initError) {
        template.renderError('init', initError);
        return;
      }

      sl.joinRoom('lobby', {
        userData: data.user,
        audio: false,
        video: false

      }, function (jRError, jRSuccess) {
        if (jRError) {
          template.renderError('joinRoom', jRError);
          return;
        }

        data.clients = {};

        if (data.user.type === 'agent') {
          $('.clients').fadeIn();
        } else {
          connect.watchAdvert();
        }
        
        $('.name').hide();
      });
    });
  },

  watchAdvert: function () {
    $('body').addClass('incall');
    $('.av').attr('src', 'video.mp4');
    $('.a-banner').show();
    
    var waitForPlayback = setInterval(function(){
      if ($('.av')[0].readyState > 0) {
        clearInterval(waitForPlayback);
        $('.av').fadeIn();

        data.user.status = 'Waiting for Agent';
        sl.setUserData(data.user);
      }
    }, 10);
  },

  requestToPeer: function (peerId) {
    sl.sendMessage({
      action: 'connect',
      room: sl.generateUUID()
    }, peerId);
  },

  connectToPeer: function (room) {
    $('.a-banner').html('Connecting to Agent ...');

    sl.joinRoom(room, {
      userData: data.user,
      audio: true,
      video: true

    }, function (jRError, jRSuccess) {
      if (jRError) {
        template.renderError('joinRoom', jRError);
        return;
      }

      $('.a-banner').hide();
      $('.av').attr('src', '');
      $('.clients, .av').hide();
      $('.peer, .self').show();
    });
  }
}

sl.on('incomingStream', function (peerId, stream, isSelf, peerInfo) {
  $('body').addClass('incall');
  if (isSelf) {
    attachMediaStream($('.self')[0], stream);
  
  } else {
    $('.a-user').show();
    $('.a-username').html((peerInfo.userData.type === 'agent' ? 'Agent' : 'Client') + ': ' + peerInfo.userData.name);


    attachMediaStream($('.peer')[0], stream);

    var second = 1;

    data.insession = setInterval(function () {
      $('.a-calltime').html('Call-time: ' + second + 's');
      second++;
    }, 1000);

    $('.a-endcall').click(function () {
      sl.leaveRoom();
    });
  }
});

sl.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
  if (isSelf || !message.isPrivate) {
    return;
  }

  switch (message.content.action) {
    case 'connect':
      sl.sendMessage({
        action: 'connect-recv',
        room: message.content.room
      }, peerId);
    case 'connect-recv':
      connect.connectToPeer(message.content.room);
      break;

    case 'message':
      // test
  }
});

sl.on('peerJoined', function (peerId, peerInfo, isSelf) {
  if (peerInfo.room === 'lobby') {
    if (!isSelf) {
      data.clients[peerId] = peerInfo.userData;
      template.renderClients(data.clients);
    }
  }
});

sl.on('peerUpdated', function (peerId, peerInfo, isSelf) {
  if (peerInfo.room === 'lobby') {
    if (!isSelf) {
      data.clients[peerId] = peerInfo.userData;
      template.renderClients(data.clients);
    }
  }
});

sl.on('peerLeft', function (peerId, peerInfo, isSelf) {
  if (peerInfo.room === 'lobby') {
    if (!isSelf) {
      data.clients[peerId] = peerInfo.userData;
      template.removeClient(peerId);
    }
  } else {
    console.info('Me left', peerId, peerInfo, isSelf);
    if (data.insession) {
      clearInterval(data.insession);
    }

    $('body').removeClass('incall');
    sl.stopStream();

    $('.a-banner, .peer, .self, .name, .clients, .a-user').hide();

    if (data.user.type === 'agent') {
      connect.goToLobby();
    } else {
      $('#name').val('');
      $('.name').show();
    }
  }
});

$(document).ready(function () {
  $('#name').keyup(function(key) {
    if (key.keyCode === 13) {
      data.user.type = $('#type').val();
      data.user.name = $('#name').val();
      data.user.joined = (new Date ()).toISOString();
      connect.goToLobby();
    }
  });
});

})();
