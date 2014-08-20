//---------------------------------------------------
CustomerDemo.Skyway.on('addPeerStream', function(peerID, stream){
  CustomerDemo._updateConnState('peerState', 'G', 'Peer State', 'Added Stream');
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
        CustomerDemo.changeStatusEvent('incall');
      }
    }
  }
});
//---------------------------------------------------
CustomerDemo.Skyway.on('peerLeft', function(peerID){
  CustomerDemo._updateConnState('peerState', 'R', 'Peer State', 'Left Room');
  console.log('Connectivity Status [Peer] - Status: Left Room');
  $(remoteVideo)[0].poster  = '/default.png';
  $(remoteVideo)[0].src = '';
  CustomerDemo.changeStatusEvent('leftroom');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('changeStatus',function(status){
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
        CustomerDemo.changeStatusEvent('watching');
      } else {
        CustomerDemo._init();
      }
      break;
    case 'onwebcamerror':
      console.log('Room Status: User has failed to allow webcam.');
      break;
    case 'watching':
      // Watching event here
      console.log('Room Status: Customer is currently watching advertisement');
      CustomerDemo.startAdvert();
      break;
    case 'onhold':
      // Onhold event here
      console.log('Room Status: Customer is placed onhold before the next agent arrives.');
      CustomerDemo._init();
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
//---------------------------------------------------
CustomerDemo.Skyway.on('mediaAccessSuccess', function(stream){
  attachMediaStream( $(CustomerDemo.Elements.localVideo)[0], stream );
  CustomerDemo.changeStatusEvent('onwebcam');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('mediaAccessError', function(err){
  console.log('mediaAccessError: ' + err);
  CustomerDemo.changeStatusEvent('onwebcamerror');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('channelMessage', function(){
  CustomerDemo._updateConnState('channelState', 'G', 'Channel', 'Message Received');
  console.log('Connectivity Status - Channel Message Received.');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('channelOpen', function(){
  CustomerDemo._updateConnState('channelState', 'Y', 'Channel', 'Opened');
  console.log('Connectivity Status - Channel Opened.');
});
//---------------------------------------------------
CustomerDemo.Skyway.on('channelClose', function(){
  CustomerDemo._updateConnState('channelState', 'R', 'Channel', 'Closed');
  console.log("Connectivity Status - Channel Closed.");
});
//---------------------------------------------------
CustomerDemo.Skyway.on('handshakeProgress', function(state){
  var stateColor = 'R';
  switch( state ){
    case 'welcome': stateColor = 'Y'; break;
    case 'offer': stateColor = 'G'; break;
    case 'answer': stateColor = 'G'; break;
  }
  CustomerDemo._updateConnState('handshakeProgress', stateColor, 'HandShake Progress', state);
  console.log('Connectivity Status [Peer] - Handshake Progress State: ' + state);
});
//---------------------------------------------------
CustomerDemo.Skyway.on('candidateGenerationState', function(state){
  var stateColor = 'R';
  if(state === 'done') { stateColor = 'G'; }
  CustomerDemo._updateConnState('candidateGenerationState', stateColor, 'Candidate Generation State', state);
  console.log('Connectivity Status [Peer] - Candidate Generation State: ' + state);
});
//---------------------------------------------------
CustomerDemo.Skyway.on('iceConnectionState', function(state){
  var stateColor = 'D';
  switch( state ){
    case 'new': case 'closed': case 'failed': stateColor = 'R'; break;
    case 'checking': case 'disconnected': stateColor = 'Y'; break;
    case 'connected': case 'completed': stateColor = 'G'; break;
  }
  CustomerDemo._updateConnState('iceConnectionState', stateColor, 'Ice Connection State', state);
  console.log('Connectivity Status [Peer] - Candidate Generation State: [' + stateColor + '] ' + state);
});


CustomerDemo._init = function () {
  $(CustomerDemo.Elements.noUserPanel).show();
  $(CustomerDemo.Elements.advertDisplay).remove();
  CustomerDemo.Skyway.joinRoom();
  CustomerDemo.Skyway._user.displayName =
    CustomerDemo.Skyway._temp.displayName;
  delete CustomerDemo.Skyway._temp.displayName;
  $(CustomerDemo.Elements.controlsSide).fadeIn();
  $(CustomerDemo.Elements.userDisplayName).html('Hi, <u>' +
    CustomerDemo.Elements._user.displayName + '</u>!');
  CustomerDemo._resize();
};

