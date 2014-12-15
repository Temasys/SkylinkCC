/*! skylinkcc - v0.3.0 - 2014-12-15 */

(function() {
/**
 * SkylinkCC is a implementation from Skylink to create a control center like
 * use-case. Things to take note are:
 * - Skyway.init() is required to be called before
 *   {{#crossLink "SkylinkCC/connect:method"}}connect(){{/crossLink}}
 * - To disconnect users from the lobby or the room, call Skyway.leaveRoom()
 *   instead.
 * - If there's no lobbyRoom specified, 'MAIN' is the main lobby
 * - Check out the rest of the other functionalities in the
 *   [Skyway documentation](http://cdn.temasys.com.sg/skyway/skywayjs
 *   /0.3.1/doc/classes/Skyway.html).
 * @class SkylinkCC
 * @constructor
 * @example
 *   // Getting started on how to use Skyway
 *   // Note that init() is still required to be called as init() is to fetch
 *   // server connection information.
 *   var SkylinkDemo = new SkylinkCC();
 *   SkylinkDemo.init({
 *     defaultRoom: 'default',
 *     apiKey: 'apiKey'
 *   });
 * @since 0.1.0
 */
function SkylinkCC() {
  if (!Skylink) {
    log.error('Skylink is not loaded. Please load Skylink first before SkylinkCC.');
  }
}
// Initialize SkylinkCC as Skyway and start
SkylinkCC.prototype = new Skylink();
this.SkylinkCC = SkylinkCC;

/**
 * Version of SkylinkCC
 * @attribute VERSION
 * @type String
 * @readOnly
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype.VERSION = '0.3.0';

/**
 * State if User is in lobby room or not
 * @attribute _inLobby
 * @type Boolean
 * @private
 * @required
 * @for SkylinkCC
 * @since 0.3.1
 */
SkylinkCC.prototype._inLobby = false;

/**
 * The default lobby room.
 * @attribute _defaultLobbyRoom
 * @type String
 * @private
 * @required
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype._defaultLobbyRoom = 'MAIN';

/**
 * The lobby room
 * @attribute _lobbyRoom
 * @type String
 * @default _defaultLobbyRoom
 * @private
 * @required
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype._lobbyRoom = false;

/**
 * The ready state of the peer's call if they are ready to join the room.
 * @attribute CALL_READY_STATE
 * @type JSON
 * @param {Integer} LOBBY         Step 1. Peer is in lobby
 * @param {Integer} REQUEST_CALL  Step 2. Agent requests to start the call
 * @param {Integer} ACCEPTED_CALL Step 3a. Client accepted the call
 * @param {Integer} REJECTED_CALL Step 3b. Client rejected the call.
 * @param {Integer} START_CALL    Step 4. Agent and Client is ready to start the call.
 * @param {Intger}
 * @readOnly
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype.CALL_READY_STATE = {
  LOBBY: 1,
  REQUEST_CALL: 2,
  ACCEPTED_CALL: 3,
  START_CALL: 4,
  REJECTED_CALL: -1
};

/**
 * Peer call status object.
 * @attribute _user
 * @type JSON
 * @param {Integer} status The current ready state of the user's call.
 *   [Rel: SkylinkCC.CALL_READY_STATE]
 * @param {String} targetPeerId PeerId the call to direct to.
 * @param {String} peerType Peer type [Rel: SkylinkCC.PEER_TYPE]
 * @param {String} targetRoom The targeted Room to join. Default is
 *   info.call.targetPeerId if not specified.
 * @required
 * @private
 * @for SkylinkCC
 * @since 0.4.0
 */
SkylinkCC.prototype._userCall = null;

/**
 * If peer is agent or customer. Types are:
 * @attribute PEER_TYPE
 * @type JSON
 * @param {String} CUSTOMER  User is customer
 * @param {String} AGENT     User is agent
 * @readOnly
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype.PEER_TYPE = {
  CLIENT: 'client',
  AGENT: 'agent'
};

/**
 * Connect user to the main lobby.
 * - Please call this only after calling Skyway.init().
 * - To disconect from the lobby, please call Skyway.leaveRoom().
 * @method connect
 * @param {String} lobbyRoom The lobby all peers connect to before the call starts.
 * @param {JSON|String} userData The user custom data.
 * @param {String} peerType Deprecated. The peer type [Rel: SkylinkCC.PEER_TYPE].
 *   This would be removed from the specs once agent and client is identified
 *   from the request url.
 * @example
 *   SkylinkDemo.connect('main_lobby', {
 *     'displayName': 'Agent Bob',
 *     'timeStamp': (new Date()).toISOString,
 *     'status': CALL_CENTER.EVENT.STARTING,
 *     'UUID': 'XXX-XXX-XXXX'
 *   }, SkylinkDemo.PEER_TYPE.AGENT);
 * @trigger peerJoined
 * @for SkylinkCC
 * @required
 * @for SkylinkCC
 * @since 0.1.0
 */
SkylinkCC.prototype.connect = function (lobbyRoom, userData, peerType) {
  var self = this;
  var checkReadyState = setInterval(function() {
    if (self._readyState === self.READY_STATE_CHANGE.COMPLETED &&
      self._user) {
      clearInterval(checkReadyState);
      self._userCall = {
        status: self.CALL_READY_STATE.LOBBY,
        peerType: peerType || self.PEER_TYPE.CLIENT
      };
      self._lobbyRoom = lobbyRoom || self._defaultLobbyRoom;
      self.joinRoom(self._lobbyRoom, {
        userData: userData,
        audio: false,
        video: false
      });
    }
  });
};

/**
 * Gets the peer information.
 * - If input peerId is user's id or empty, <b>getPeerInfo()</b>
 *   would return user's peer information.
 * @method getPeerInfo
 * @param {String} [peerId] Id of the peer retrieve we want to retrieve the information.
 * If no id is set, <b>getPeerInfo()</b> returns self peer information.
 * @return {JSON} Peer information:
 *   - settings {JSON}: User stream settings.
 *     - audio {Boolean|JSON}: User audio settings.
 *       - stereo {Boolean} : User has enabled stereo or not.
 *     - video {Boolean|JSON}: User video settings.
 *       - resolution {Boolean|JSON}: User video
 *     resolution set. [Rel: Skylink.VIDEO_RESOLUTION]
 *         - width {Integer}: User video resolution width.
 *         - height {Integer}:User video resolution height.
 *     - frameRate {Integer}: User video minimum
 *     frame rate.
 *   - mediaStatus {JSON}: User MediaStream(s) status.
 *     - audioMuted {Boolean}: Is user's audio muted.
 *     - videoMuted {Boolean}: Is user's vide muted.
 *   - userData {String|JSON}: User's custom data set.See
 *   {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 *   - userCall {String|JSON}: User call information
 *   - call {String|JSON}: Deprecated. User call information
 *
 * If peerId doesn't exist return 'null'.
 * @example
 *   // Example 1: To get other peer's information
 *   var peerInfo = SkylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: To get own information
 *   var userInfo = SkylinkDemo.getPeerInfo();
 * @for SkylinkCC
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  if (peerId && peerId !== this._user.sid) {
    // peer info
    return this._peerInformations[peerId] || {};
  } else {
    // user info
    // prevent undefined error
    this._user = this._user || {};
    this._userData = this._userData || '';

    this._mediaStreamsStatus = this._mediaStreamsStatus || {};
    this._streamSettings = this._streamSettings || {};

    return {
      userData: this._userData,
      settings: this._streamSettings,
      mediaStatus: this._mediaStreamsStatus,
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion
      },
      userCall: this._userCall,
      call: this._userCall
    };
  }
};

/**
 * We just joined a room! Let's send a nice message to all to let them know I'm in.
 * @method _inRoomHandler
 * @param {JSON} message
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.sid PeerId of self.
 * @param {String} message.mid PeerId of the peer that is
 * @param {JSON} message.pc_config The peerconnection configuration
 *   sending the joinRoom message.
 * @param {String} message.type The type of message received.
 * @trigger peerJoined
 * @private
 * @overwritten_from SkylinkJS
 * @since 0.3.0
 */
SkylinkCC.prototype._inRoomHandler = function(message) {
  var self = this;
  log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  // Re-set the information
  if (self._userCall) {
    if (self._userCall.status === self.CALL_READY_STATE.LOBBY) {
      self._inLobby = true;
    }
  }
  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);

  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    userInfo: self.getPeerInfo()
  });
  log.log('Sending enter');
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
};

/**
 * Throw an event with the received private message
 * @method _privateMessageHandler
 * @param {JSON} message The message object.
 * @param {JSON|String} message.data The data broadcasted.
 * @param {String} message.mid PeerId of the peer that sent
 *   the call status message.
 * @param {String} message.cid CredentialId for the room.
 * @param {String} message.rid RoomId of the room peer is connected to.
 * @param {String} message.callStatus Is the message a callStatus event.
 * @param {String} message.type The type of the message.
 * @trigger privateMessage, peerCallRequest
 * @private
 * @overwritten_from SkylinkJS
 * @since 0.3.0
 */
SkylinkCC.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  if (message.callStatus) {
    this._callStatusHandler(targetMid, message, true);
  } else {
    log.log([targetMid, null, message.type,
      'Received private message from peer:'], message.data);
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: true,
      targetPeerId: message.target, // is not null if there's user
      isDataChannel: false,
      senderPeerId: targetMid
    }, targetMid, this._peerInformations[targetMid], false);
  }
};

/**
 * Throw an event with the received private message
 * @method _publicMessageHandler
 * @param {JSON} message The message object.
 * @param {JSON|String} message.data The data broadcasted.
 * @param {String} message.mid PeerId of the peer that sent
 *   the call status message.
 * @param {String} message.cid CredentialId for the room.
 * @param {String} message.rid RoomId of the room peer is connected to.
 * @param {String} message.callStatus Is the message a callStatus event.
 * @param {String} message.type The type of the message.
 * @trigger publicMessage, peerCallRequest
 * @private
 * @overwritten_from SkylinkJS
 * @since 0.1.0
 */
SkylinkCC.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  if (message.callStatus) {
    this._callStatusHandler(targetMid, message, false);
  } else {
    log.log([targetMid, null, message.type,
      'Received public message from peer:'], message.data);
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: false,
      targetPeerId: null, // is not null if there's user
      isDataChannel: false,
      senderPeerId: targetMid
    }, targetMid, this._peerInformations[targetMid], false);
  }
};

/**
 * Handles all call status event changes
 * @method _callStatusHandler
 * @param {String} targetMid PeerId of the peer that sent
 *   the call status message.
 * @param {JSON} message The message object.
 * @param {JSON|String} message.data The data broadcasted.
 * @param {String} message.mid PeerId of the peer that sent
 *   the call status message.
 * @param {String} message.cid CredentialId for the room.
 * @param {String} message.rid RoomId of the room peer is connected to.
 * @param {String} message.callStatus Is the message a callStatus event.
 * @param {String} message.type The type of the message.
 * @param {Boolean} isPrivate Is the message a targeted message or not.
 * @trigger peerCallRequest
 * @private
 * @since 0.1.0
 */
SkylinkCC.prototype._callStatusHandler = function(targetMid, message, isPrivate) {
  var call = message.data;
  var checkPrivate = (call.status >= this.CALL_READY_STATE.REQUEST_CALL) ?
    (call.targetPeerId === this._user.sid) : true;

  if (isPrivate && checkPrivate) {
    this._peerInformations[targetMid].call = call;
    this._userCall.status = call.status;
    this._trigger('peerCallRequest', targetMid,
      this._peerInformations[targetMid], false);
  } else if (!isPrivate) {
    this._peerInformations[message.sender].call = call;
    // Customer cannot see agent information
    if (call.peerType === this.PEER_TYPE.AGENT) {
      this._trigger('peerCallRequest', targetMid,
        this._peerInformations[targetMid], false);
    }
  } else {
    log.error([message.mid, 'CallStatus', call.status,
      'Dropped request because targetPeerId does not match'], call);
  }
};

/**
 * Trigger a event after updating userData.
 * @method startPeerEvent
 * @param {JSON|String} userData The peer's updated user data to send over.
 * @param {JSON} event The event object. Event triggered will only be
 *   directed to self.
 * @param {String} event.name The event to be trigged.
 * @param {JSON|String|Array} event.params The event params.
 * @example
 *   var userData = SkylinkDemo.getUserData().userData;
 *   userData.status = 'newEvent';
 *   SkylinkDemo.startPeerEvent(userData, {
 *     name: 'newEvent',
 *     params: {
 *       'startAdvert': true,
 *       'UUID': 'XXXX-XXX-XXX'
 *     }
 *   });
 *   SkylinkDemo.on('newEvent', function (params) {
 *     // ....
 *   });
 * @trigger [customEvent]
 * @since 0.1.0
 */
SkylinkCC.prototype.startPeerEvent = function (userData, event) {
  var self = this;
  for (var e in this._EVENTS) {
    if (this._EVENTS[e] === event.name) {
      log.error('You cannot call a Skyway event.');
      return;
    }
  }
  if (event.name) {
    setTimeout(function () {
      self.setUserData(userData);
      self._trigger(event.name, event.params);
    }, 200);
  } else {
    log.error('No event name is provided');
  }
};

/**
 * Handles all call states.
 * @method _handleCall
 * @param {String} peerId PeerId of the peer to send request to.
 * @param {JSON} options Peer call status object.
 * @param {JSON} options.status Peer call status [Rel: SkylinkCC.CALL_STATUS]
 * @param {Boolean} options.peerType Peer user type [Rel: SkylinkCC.PEER_TYPE]
 * @param {String} options.targetPeerId PeerId of the peer the call request
 *   is directed to.
 * @param {String} options.targetRoom Room that the peer requests to join.
 * @param {Function} callback Callback function once call message is sent.
 * @trigger peerCallRequest
 * @private
 * @since 0.1.0
 */
SkylinkCC.prototype._handleCall = function (peerId, options, callback) {
  if (!this._user) {
    log.error('"_user" object is not loaded yet. Check readyState.');
    return;
  } else if (!this._userCall) {
    log.error('"_userCall" object is not loaded yet. Check readyState.');
    return;
  } else if (this._userCall.peerType !== options.peerType) {
    log.error('Peer type is not ' + options.peerType + '. Peer type is: "' +
      this._userCall.peerType);
    return;
  }
  this._userCall.status = options.status || this._userCall.status;
  this._userCall.targetPeerId = options.targetPeerId ||
    this._userCall.targetPeerId;
  this._userCall.targetRoom = options.targetRoom ||
    this._userCall.targetRoom || null;
  this._sendChannelMessage({
    cid: this._key,
    mid: this._user.sid,
    rid: this._room.id,
    data: this._userCall,
    target: peerId,
    type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE,
    callStatus: true
  });
  this._trigger('peerCallRequest', this._user.sid, this.getPeerInfo(), true);
  if (callback) {
    callback();
  }
};

/**
 * Step 1: Agent requests to start the call to client
 * @method agentRequestCall
 * @param {String} clientPeerId Client peerId to start call to.
 * @param {String} room Room to ask client to join in
 * @example
 *   // Example 1: Request call
 *   SkylinkDemo.agentRequestCall(peerId);
 *
 *   // Example 2: Request call with a specific room
 *   SkylinkDemo.agentRequestCall(peerId, room);
 * @trigger peerCallRequest
 * @since 0.1.0
 */
SkylinkCC.prototype.agentRequestCall = function (clientPeerId, room) {
  this._handleCall(clientPeerId, {
    status: this.CALL_READY_STATE.REQUEST_CALL,
    targetPeerId: clientPeerId,
    targetRoom: room || clientPeerId,
    peerType: this.PEER_TYPE.AGENT
  });
};

/**
 * Step 2: Client to accept or reject the call.
 * @method acceptRequestCall
 * @param {String} agentPeerId PeerId of the agent.
 * @param {Boolean} accept If client accepts agent request or not.
 * @example
 *   SkylinkDemo.on('peerCallRequest', function (peerId, peerInfo, isSelf)) {
 *     if (!isSelf) {
 *       if (peerInfo.call.status === SkylinkDemo.CALL_STATUS.REQUEST_CALL) {
 *         var result = confirm('Do you want to accept the call?');
 *         SkylinkDemo.acceptRequestCall(peerId, result);
 *       }
 *     }
 *   });
 * @trigger peerCallRequest
 * @since 0.1.0
 */
SkylinkCC.prototype.acceptRequestCall = function (agentPeerId, accept) {
  this._handleCall(agentPeerId, {
    status: ((accept) ? this.CALL_READY_STATE.ACCEPTED_CALL :
      this.CALL_READY_STATE.REJECTED_CALL),
    targetPeerId: agentPeerId,
    targetRoom: this._peerInformations[agentPeerId].call.targetRoom,
    peerType: this.PEER_TYPE.CLIENT
  });
};

/**
 * Step 3: Start the call. You may call method
 * - "peerLeft" would be triggered because user left the lobby room
 * - Call Skyway.joinRoom() to start the call.
 * Request a call for agent
 * @method startRequestCall
 * @param {String} room Room to ask client to join in
 * @param {Function} callback Callback after the room is ready to join
 * @return {JSON} User information object
 * @return {JSON} Peer information object
 * @example
 *   SkylinkDemo.on('peerCallRequest', function (peerId, peerInfo, isSelf)) {
 *     if (!isSelf) {
 *       if (peerInfo.call.status === SkylinkDemo.CALL_STATUS.START_CALL) {
 *         SkylinkDemo.startRequestCall(peerId, function (userInfo, peerInfo) {
 *           SkylinkDemo.joinRoom(peerInfo.call.targetRoom, {
 *             audio: true,
 *             video: true
 *           });
 *         });
 *       }
 *     }
 *   });
 * @trigger peerCallRequest, peerLeft
 * @since 0.2.0
 */
SkylinkCC.prototype.startRequestCall = function (targetPeerId, callback) {
  var self = this;
  var peerInfo;
  var doLeaveRoom = function () {
    self.leaveRoom();
    self._inLobby = false;
    callback(self.getPeerInfo(), peerInfo);
  };
  if (self._userCall.peerType === self.PEER_TYPE.AGENT) {
    this._handleCall(targetPeerId, {
      status: self.CALL_READY_STATE.START_CALL,
      targetPeerId: targetPeerId,
      peerType: this.PEER_TYPE.AGENT
    }, function () {
      peerInfo = self._peerInformations[targetPeerId];
      setTimeout(function () {
        doLeaveRoom();
      }, 3500);
    });
  } else {
    peerInfo = self._peerInformations[targetPeerId];
    doLeaveRoom();
  }
};

/* Syntactically private variables and utility functions */
/**
 * Event fired when a peer call request has changed.
 * @event peerCallRequest
 * @param {String} peerId PeerId of the peer that has a call ready state changed.
 * @param {JSON} peerInfo Peer information of the peer
 * @param {JSON} peerInfo.settings Peer stream settings
 * @param {Boolean|JSON} peerInfo.settings.audio
 * @param {Boolean} peerInfo.settings.audio.stereo
 * @param {Boolean|JSON} peerInfo.settings.video
 * @param {JSON} peerInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
 * @param {Integer} peerInfo.settings.video.resolution.width
 * @param {Integer} peerInfo.settings.video.resolution.height
 * @param {Integer} peerInfo.settings.video.frameRate
 * @param {JSON} peerInfo.mediaStatus Peer stream status.
 * @param {Boolean} peerInfo.mediaStatus.audioMuted If Peer's audio stream is muted.
 * @param {Boolean} peerInfo.mediaStatus.videoMuted If Peer's video stream is muted.
 * @param {String|JSON} peerInfo.userData Peer custom data
 * @param {JSON} peerInfo.call Peer call status object.
 * @param {Integer} peerInfo.call.status Peer call status [Rel: SkylinkCC.CALL_STATUS]
 * @param {String} peerInfo.call.peerType Peer user type [Rel: SkylinkCC.PEER_TYPE]
 * @param {String} peerInfo.call.targetPeerId PeerId of the peer the call request
 *   is directed to.
 * @param {String} peerInfo.call.targetRoom Room that the peer requests to join.
 * @param {Boolean} isSelf Is the peer self.
 * @since 0.1.0
 */
SkylinkCC.prototype._EVENTS.peerCallRequest = [];

SkywayCC = SkylinkCC;
}).call(this);