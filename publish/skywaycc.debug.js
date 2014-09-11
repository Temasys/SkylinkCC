/*! skywaycc - v0.2.0 - 2014-09-11 */

(function() {
  /**
   * SkywayCC is a implementation from Skyway to create a control center like
   * use-case. Things to take note are:
   * - Skyway.init() is required to be called before
   *   {{#crossLink "SkywayCC/connect:method"}}connect(){{/crossLink}}
   * - To disconnect users from the lobby or the room, call Skyway.leaveRoom()
   *   instead.
   * - If there's no lobbyRoom specified, 'MAIN' is the main lobby
   * - Check out the rest of the other functionalities in the
   *   [Skyway documentation](http://cdn.temasys.com.sg/skyway/skywayjs
   *   /0.3.1/doc/classes/Skyway.html).
   * @class SkywayCC
   * @constructor
   * @example
   *   // Getting started on how to use Skyway
   *   // Note that init() is still required to be called as init() is to fetch
   *   // server connection information.
   *   var SkywayDemo = new SkywayCC();
   *   SkywayDemo.init({
   *     defaultRoom: 'default',
   *     apiKey: 'apiKey'
   *   });
   */
  function SkywayCC() {
    if (!Skyway) {
      console.error('API - Skyway is not loaded. Please load Skyway first before SkywayCC.');
    }
    /**
     * Version of SkywayCC
     * @attribute VERSION
     * @type String
     * @readOnly
     * @since 0.1.0
     */
    this.VERSION = '0.2.0';
    /**
     * State if User is in lobby room or not
     * @attribute _in_lobby
     * @type Boolean
     * @private
     * @required
     * @since 0.1.0
     */
    this._in_lobby = false;
    /**
     * The default lobby room.
     * @attribute _defaultLobbyRoom
     * @type String
     * @private
     * @required
     * @since 0.1.0
     */
    this._defaultLobbyRoom = 'MAIN';
    /**
     * The lobby room
     * @attribute _lobbyRoom
     * @type String
     * @default _defaultLobbyRoom
     * @private
     * @required
     * @since 0.1.0
     */
    this._lobbyRoom = false;
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
     * @since 0.1.0
     */
    this.CALL_READY_STATE = {
      LOBBY: 1,
      REQUEST_CALL: 2,
      ACCEPTED_CALL: 3,
      START_CALL: 4,
      REJECTED_CALL: -1
    };
    /**
     * User object
     * @attribute _user
     * @type JSON
     * @param {String} id User Session ID
     * @param {Object} peer PeerConnection object
     * @param {String} sid User Secret Session ID
     * @param {String} apiOwner Owner of the room
     * @param {Array} streams Array of User's MediaStream
     * @param {String} timestamp User's timestamp
     * @param {String} token User access token
     * @param {JSON} info Optional. User information
     * @param {JSON} info.settings Peer stream settings
     * @param {Boolean|JSON} info.settings.audio
     * @param {Boolean} info.settings.audio.stereo
     * @param {Boolean|JSON} info.settings.video
     * @param {Bolean|JSON} info.settings.video.resolution [Rel: SkywayCC.VIDEO_RESOLUTION]
     * @param {Integer} info.settings.video.resolution.width
     * @param {Integer} info.settings.video.resolution.height
     * @param {Integer} info.settings.video.frameRate
     * @param {JSON} info.mediaStatus Peer stream status.
     * @param {Boolean} info.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} info.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} info.userData Peer custom data
     * @param {JSON} info.call Peer call status object.
     * @param {Integer} info.call.status The current ready state of the user's call.
     *   [Rel: SkywayCC.CALL_READY_STATE]
     * @param {String} info.call.targetPeerId PeerId the call to direct to.
     * @param {String} info.call.peerType Peer type [Rel: SkywayCC.PEER_TYPE]
     * @param {String} info.call.targetRoom The targeted Room to join. Default is
     *   info.call.targetPeerId if not specified.
     * @required
     * @private
     * @since 0.1.0
     */
    this._user = null;
    /**
     * Object to store temporary information
     * @attribute _temp
     * @type Array
     * @private
     * @since 0.1.0
     */
    this._temp = [];
    /**
     * If peer is agent or customer. Types are:
     * @attribute PEER_TYPE
     * @type JSON
     * @param {String} CUSTOMER  User is customer
     * @param {String} AGENT     User is agent
     * @readOnly
     * @since 0.1.0
     */
    this.PEER_TYPE = {
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
     * @param {String} peerType Deprecated. The peer type [Rel: SkywayCC.PEER_TYPE].
     *   This would be removed from the specs once agent and client is identified
     *   from the request url.
     * @example
     *   SkywayDemo.connect('main_lobby', {
     *     'displayName': 'Agent Bob',
     *     'timeStamp': (new Date()).toISOString,
     *     'status': CALL_CENTER.EVENT.STARTING,
     *     'UUID': 'XXX-XXX-XXXX'
     *   }, SkywayDemo.PEER_TYPE.AGENT);
     * @trigger peerJoined
     * @for SkywayCC
     * @required
     * @since 0.1.0
     */
    this.connect = function (lobbyRoom, userData, peerType) {
      var self = this;
      var checkReadyState = setInterval(function() {
        if (self._readyState === self.READY_STATE_CHANGE.COMPLETED &&
          self._user) {
          clearInterval(checkReadyState);
          self._temp.userCall = {
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
  }
  // Initialize SkywayCC as Skyway and start
  SkywayCC.prototype = new Skyway();
  this.SkywayCC = SkywayCC;

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
   * @since 0.1.0
   */
  SkywayCC.prototype._inRoomHandler = function(message) {
    var self = this;
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(message.pc_config);
    self._room.pcHelper.pcConfig = self._setFirefoxIceServers(message.pc_config);
    self._in_room = true;
    self._user.sid = message.sid;
    // Re-set the information
    if (self._user.info.call) {
      if (self._user.info.call.status === self.CALL_READY_STATE.LOBBY) {
        self._in_lobby = true;
      }
    } else {
      if (self._temp.userCall) {
        self._user.info.call = self._temp.userCall;
        delete self._temp.userCall;
      }
      if (self._temp.userData) {
        self._user.info.userData = self._temp.userData;
        delete self._temp.userData;
      }
    }
    self._trigger('peerJoined', self._user.sid, self._user.info, true);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var params = {
      type: self.SIG_TYPE.ENTER,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser.browser,
      version: window.webrtcDetectedBrowser.version,
      userInfo: self._user.info
    };
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
    self._sendMessage(params);
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
   * @since 0.1.0
   */
  SkywayCC.prototype._privateMessageHandler = function(message) {
    var targetMid = message.mid;
    if (message.callStatus) {
      this._callStatusHandler(targetMid, message, true);
    } else {
      this._trigger('privateMessage', message.data, targetMid, message.target, false);
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
   * @since 0.1.0
   */
  SkywayCC.prototype._publicMessageHandler = function(message) {
    var targetMid = message.mid;
    if (message.callStatus) {
      this._callStatusHandler(targetMid, message, false);
    } else {
      this._trigger('publicMessage', message.data, targetMid, false);
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
  SkywayCC.prototype._callStatusHandler = function(targetMid, message, isPrivate) {
    var call = message.data;
    var checkPrivate = (call.status >= this.CALL_READY_STATE.REQUEST_CALL) ?
      (call.targetPeerId === this._user.sid) : true;

    if (isPrivate && checkPrivate) {
      this._peerInformations[targetMid].call = call;
      this._user.info.call.status = call.status;
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
      console.error('API [' + message.mid +
        '] - Dropped request because targetPeerId does not match.');
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
   *   var userData = SkywayDemo.getUserData().userData;
   *   userData.status = 'newEvent';
   *   SkywayDemo.startPeerEvent(userData, {
   *     name: 'newEvent',
   *     params: {
   *       'startAdvert': true,
   *       'UUID': 'XXXX-XXX-XXX'
   *     }
   *   });
   *   SkywayDemo.on('newEvent', function (params) {
   *     // ....
   *   });
   * @trigger [customEvent]
   * @since 0.1.0
   */
  SkywayCC.prototype.startPeerEvent = function (userData, event) {
    var self = this;
    for (var e in this._events) {
      if (this._events[e] === event.name) {
        console.error('API - You cannot call a Skyway event.');
        return;
      }
    }
    if (event.name) {
      setTimeout(function () {
        self.setUserData(userData);
        self._trigger(event.name, event.params);
      }, 200);
    } else {
      console.error('API - No event.name is provided');
    }
  };

  /**
   * Handles all call states.
   * @method _handleCall
   * @param {String} peerId PeerId of the peer to send request to.
   * @param {JSON} options Peer call status object.
   * @param {JSON} options.status Peer call status [Rel: SkywayCC.CALL_STATUS]
   * @param {Boolean} options.peerType Peer user type [Rel: SkywayCC.PEER_TYPE]
   * @param {String} options.targetPeerId PeerId of the peer the call request
   *   is directed to.
   * @param {String} options.targetRoom Room that the peer requests to join.
   * @param {Function} callback Callback function once call message is sent.
   * @trigger peerCallRequest
   * @private
   * @since 0.1.0
   */
  SkywayCC.prototype._handleCall = function (peerId, options, callback) {
    if (!this._user) {
      console.error('API - "_user" object is not loaded yet. Check readyState.');
      return;
    } else if (!this._user.info) {
      console.error('API - "_user.info" object is not loaded yet. Check readyState.');
      return;
    } else if (!this._user.info.call) {
      console.error('API - "_user.info.call" object is not loaded yet. Check readyState.');
      return;
    } else if (this._user.info.call.peerType !== options.peerType) {
      console.error('API - Peer type is not ' + options.peerType + '. Peer type is: "' +
        this._user.info.call.peerType);
      return;
    }
    this._user.info.call.status = options.status || this._user.info.call.status;
    this._user.info.call.targetPeerId = options.targetPeerId ||
      this._user.info.call.targetPeerId;
    this._user.info.call.targetRoom = options.targetRoom ||
      this._user.info.call.targetRoom || null;
    this._sendMessage({
      cid: this._key,
      mid: this._user.sid,
      rid: this._room.id,
      data: this._user.info.call,
      target: peerId,
      type: this.SIG_TYPE.PRIVATE_MESSAGE,
      callStatus: true
    });
    this._trigger('peerCallRequest', this._user.sid, this._user.info, true);
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
   *   SkywayDemo.agentRequestCall(peerId);
   *
   *   // Example 2: Request call with a specific room
   *   SkywayDemo.agentRequestCall(peerId, room);
   * @trigger peerCallRequest
   * @since 0.1.0
   */
  SkywayCC.prototype.agentRequestCall = function (clientPeerId, room) {
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
   *   SkywayDemo.on('peerCallRequest', function (peerId, peerInfo, isSelf)) {
   *     if (!isSelf) {
   *       if (peerInfo.call.status === SkywayDemo.CALL_STATUS.REQUEST_CALL) {
   *         var result = confirm('Do you want to accept the call?');
   *         SkywayDemo.acceptRequestCall(peerId, result);
   *       }
   *     }
   *   });
   * @trigger peerCallRequest
   * @since 0.1.0
   */
  SkywayCC.prototype.acceptRequestCall = function (agentPeerId, accept) {
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
   *   SkywayDemo.on('peerCallRequest', function (peerId, peerInfo, isSelf)) {
   *     if (!isSelf) {
   *       if (peerInfo.call.status === SkywayDemo.CALL_STATUS.START_CALL) {
   *         SkywayDemo.startRequestCall(peerId, function (userInfo, peerInfo) {
   *           SkywayDemo.joinRoom(peerInfo.call.targetRoom, {
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
  SkywayCC.prototype.startRequestCall = function (targetPeerId, callback) {
    var self = this;
    var peerInfo;
    var doLeaveRoom = function () {
      var userInfo = self._user.info;
      self.leaveRoom();
      self._in_lobby = false;
      self._temp.userCall = userInfo.call;
      self._temp.userData = userInfo.userData;
      callback(userInfo, peerInfo);
    };
    if (self._user.info.call.peerType === self.PEER_TYPE.AGENT) {
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
   * @param {Integer} peerInfo.call.status Peer call status [Rel: SkywayCC.CALL_STATUS]
   * @param {String} peerInfo.call.peerType Peer user type [Rel: SkywayCC.PEER_TYPE]
   * @param {String} peerInfo.call.targetPeerId PeerId of the peer the call request
   *   is directed to.
   * @param {String} peerInfo.call.targetRoom Room that the peer requests to join.
   * @param {Boolean} isSelf Is the peer self.
   * @since 0.1.0
   */
  SkywayCC.prototype._events.peerCallRequest = [];
}).call(this);