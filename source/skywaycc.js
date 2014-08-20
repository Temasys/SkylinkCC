/**
 * @class SkywayCC
 * @extends Skyway
 * @requires Skyway
 * @for Skyway
 */
(function() {
  /**
   * SkywayCC is a implementation for Skyway to create a control center like
   * use-case. Things to take note are:
   * - The defaultRoom is the main lobby where all the peers connect to from the
   *   beginning. If no defaultRoom specified, the lobby would be the apiKey.
   * - Call {{#crossLink "SkywayCC/connect:method"}}connect(){{/crossLink}} after
   *   {{#crossLink "Skyway/init:method"}}init(){{/crossLink}} to connect peer
   *   to the main lobby.
   * @class SkywayCC
   * @constructor
   * @example
   *   // Getting started on how to use Skyway
   *   // Note that the defaultRoom is required for SkywayCC if you want
   *   // To specify a specific lobby room name
   *   var SkywayDemo = new SkywayCC();
   *   SkywayDemo.init({
   *     defaultRoom: 'lobby',
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
    this.VERSION = '@@version';
    /**
     * The ready state of the peer's call if they are ready to join the room.
     * @attribute CALL_READY_STATE
     * @type JSON
     * @param {Integer} LOBBY         Peer is in lobby
     * @param {Integer} REQUEST_CALL  Agent requests to start the call
     * @param {Integer} START_CALL    Agent and Client is ready to start the call.
     * @param {Integer} ACCEPTED_CALL Client accepted the call
     * @param {Integer} REJECTED_CALL Client rejected the call.
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
     * Internal array of peer requests
     * @attribute _peerRequests
     * @type Array
     * @required
     * @private
     * @since 0.1.0
     */
    this._peerRequests = [];
    /**
     * User object
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
     * @param {JSON} info.status Peer call status object.
     * @param {String} info.status.userStatus The current ready state of the user's call.
     *   [Rel: SkywayCC.CALL_READY_STATE]
     * @param {String} info.status.userTargetPeerId PeerId the call to direct to.
     * @param {String} info.status.userType Peer type [Rel: SkywayCC.PEER_TYPE]
     * @param {String} info.status.userTargetRoom The targeted Room to join. Default is
     *   info.status.userTargetPeerId if not specified.
     * @required
     * @private
     * @since 0.1.0
     */
    this._user = null;
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
     * User custom events stored
     * @attribute CUSTOM_EVENT
     * @type JSON
     * @readOnly
     * @final
     * @since 0.1.0
     */
    this.CUSTOM_EVENT = {};
    /**
     * Connect user to the main lobby.
     * Please call this only after calling
     * {{#crossLink "Skyway/init:method"}}init(){{/crossLink}}
     * @method connect
     * @param {JSON|String} userData The User Data
     * @param {JSON} userEvents The events that would be recognised by Skyway
     * @param {String} userType Deprecated. The peer type [Rel: SkywayCC.PEER_TYPE].
     *   This would be removed from the specs once agent and client is identified
     *   from the request url.
     * @example
     *   var EVENT = {
     *     STARTING: 'starting',
     *     ON_HOLD: 'onhold',
     *     IN_CALL: 'incall'
     *   };
     *   SkywayDemo.connect({
     *     'displayName': 'Agent Bob',
     *     'timeStamp': (new Date()).toISOString,
     *     'status': EVENT.STARTING
     *   }, EVENT, SkywayDemo.PEER_TYPE.AGENT);
     * @trigger peerJoined, peerRequest
     * @for SkywayCC
     * @required
     * @since 0.1.0
     */
    this.connect = function (userData, userEvents, userType) {
      var self = this;
      var checkReadyState = setInterval(function() {
        if (self._readyState === self.READY_STATE_CHANGE.COMPLETED &&
          self._user) {
          clearInterval(checkReadyState);
          self._user.info = self._user.info || {};
          self._user.info.status = {
            userStatus: self.CALL_READY_STATE.LOBBY,
            userType: userType
          };
          self.joinRoom({
            user: userData,
            audio: false,
            video: false
          });
          self.CUSTOM_EVENT = (typeof userEvents === 'object') ?
            userEvents : {};
        }
      });
    };
  }
  // Initialize SkywayCC as Skyway and start
  SkywayCC.prototype = new Skyway();
  this.SkywayCC = SkywayCC;

  /**
   * Throw an event with the received private message
   * @method _privateMessageHandler
   * @param {JSON} message
   * @param {String} message.sender The senderPeerId.
   * @param {JSON|String} message.data The Data broadcasted
   * @param {String} message.userStatus For peerRequest event.
   * @param {String} message.mid TargetMid
   * @param {String} message.cid The credentialId
   * @param {String} message.rid RoomId
   * @param {String} message.type Message type
   * @trigger privateMessage
   * @private
   * @since 0.1.0
   */
  SkywayCC.prototype._privateMessageHandler = function(message) {
    if (message.userStatus) {
      this._userStatusHandler(message);
    } else {
      this._trigger('privateMessage', message.data, message.sender,
        message.target, false);
    }
  };

  /**
   * Throw an event with the received private message
   * @method _publicMessageHandler
   * @param {JSON} message
   * @param {String} message.sender The senderPeerId.
   * @param {JSON|String} message.data The Data broadcasted
   * @param {JSON}   message.userStatus For peerRequest event
   * @param {String} message.mid TargetMid
   * @param {String} message.cid The credentialId
   * @param {String} message.rid RoomId
   * @param {String} message.type Message type
   * @trigger publicMessage
   * @private
   * @since 0.1.0
   */
  SkywayCC.prototype._publicMessageHandler = function(message) {
    if (message.userStatus) {
      this._userStatusHandler(message);
    } else {
      this._trigger('publicMessage', message.data, message.sender, false);
    }
  };

  /**
   * Handles all user status event changes
   * @method _userStatusHandler
   * @param {JSON} message
   * @param {String} message.sender The senderPeerId.
   * @param {JSON|String} message.data The Data broadcasted
   * @param {String} message.userStatus For peerRequest event.
   * @param {String} message.mid TargetMid
   * @param {String} message.cid The credentialId
   * @param {String} message.rid RoomId
   * @param {String} message.type Message type
   * @trigger privateMessage
   * @private
   * @since 0.1.0
   */
  SkywayCC.prototype._userStatusHandler = function(message) {
    if (message.target) {
      if (message.data.userStatus >= this.CALL_READY_STATE.REQUEST_CALL) {
        // Verify it's sending to the correct peer and also not to me
        if (message.data.userTargetPeerId === this._user.sid) {
          this._peerRequests[message.sender] = message.data;
          this._user.info.status.userStatus = message.data.userStatus;
          this._trigger('peerRequest', message.sender, message.data, false);
        } else {
          console.info('API [' + message.mid +
            '] - Dropped request because targetPeerId does not match.');
        }
      } else {
        this._peerRequests[message.sender] = message.data;
        this._user.status.userStatus = message.data.userStatus;
        this._trigger('peerRequest', message.sender, message.data, false);
      }
    } else {
      this._peerRequests[message.sender] = message.data;
      // Customer cannot see agent information
      if (message.data.userType === this.PEER_TYPE.AGENT) {
        this._trigger('peerRequest', message.sender, message.data, false);
      }
    }
  };

  /**
   * Trigger a event that is parsed in
   * {{#crossLink "SkywayCC/connect:method"}}connect(){{/crossLink}} for self.
   * Note: It is only received by self.
   * Use {{#crossLink "Skyway/sendPrivateMessage:method"}}sendPrivateMessage(){{/crossLink}}
   * to broadcast a private event or
   * {{#crossLink "Skyway/sendPublicMessage:method"}}sendPublicMessage(){{/crossLink}}
   * to broadcast a public event.
   * @method startEvent
   * @param {JSON|String} userData The peer's updated user data to send over.
   * @param {String} userEvent The event to be trigged.
   * @param {JSON|String|Array} userEventParams The event params.
   * @example
   *   var userData = SkywayDemo.getUserData().userData;
   *   userData.status = 'newEvent';
   *   SkywayDemo.startEvent(userData, 'newEvent', {
   *     'startAdvert': true,
   *     'UUID': 'XXXX-XXX-XXX'
   *   });
   *   SkywayDemo.on('newEvent', function (params) {
   *     // ....
   *   });
   * @trigger [customEvent]
   * @since 0.1.0
   */
  SkywayCC.prototype.startEvent = function (userData, userEvent, userEventParams) {
    var self = this;
    setTimeout(function () {
      self.setUserData(userData);
    }, 200);
    for (var e in this._events) {
      if (this._events[e] === userEvent) {
        console.error('API - You cannot call a Skyway event.');
        return;
      }
    }
    for (var ce in this.CUSTOM_EVENT) {
      if (this.CUSTOM_EVENT[ce] === userEvent) {
        this._trigger(userEvent, userEventParams);
        return;
      }
    }
    console.error('API - You cannot call an event that is not specified.');
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
   * @trigger peerRequest
   * @since 0.1.0
   */
  SkywayCC.prototype.agentRequestCall = function (clientPeerId, room) {
    if (!this._user) {
      return;
    } else if (!this._user.info) {
      return;
    } else if (!this._user.info.status) {
      return;
    }
    if (this._user.info.status.userType !== this.PEER_TYPE.AGENT) {
      return;
    }
    this._user.info.status.userStatus = this.CALL_READY_STATE.REQUEST_CALL;
    this._user.info.status.userTargetPeerId = clientPeerId;
    this._user.info.status.userTargetRoom = room || clientPeerId;
    this._sendMessage({
      cid: this._key,
      mid: this._user.sid,
      rid: this._room.id,
      sender: this._user.sid,
      data: this._user.status,
      target: ((clientPeerId) ? clientPeerId : this._user.sid),
      type: this.SIG_TYPE.PRIVATE_MESSAGE,
      userStatus: true
    });
    this._trigger('peerRequest', this._user.sid, this._user.status, true);
  };

  /**
   * Step 2: Client to accept or reject the call.
   * @method acceptRequestCall
   * @param {String} agentPeerId PeerId of the agent.
   * @param {Boolean} accept If client accepts agent request or not.
   * @example
   *   SkywayDemo.on('peerRequest', function (peerId, peerStatus, isSelf)) {
   *     if (!isSelf) {
   *       if (peerStatus.userStatus === SkywayDemo.CALL_STATUS.REQUEST_CALL) {
   *         var result = confirm('Do you want to accept the call?');
   *         SkywayDemo.acceptRequestCall(peerId, result);
   *       }
   *     }
   *   });
   * @trigger peerRequest
   * @since 0.1.0
   */
  SkywayCC.prototype.acceptRequestCall = function (agentPeerId, accept) {
    if (this._user.status.userType === this.PEER_TYPE.AGENT) {
      return;
    }
    this._user.status.userStatus = (accept) ? this.CALL_READY_STATE.ACCEPTED_CALL
      : this.CALL_READY_STATE.REJECTED_CALL;
    this._user.status.userTargetPeerId = agentPeerId;
    this._user.status.userTargetRoom = this._peerRequests[agentPeerId].userTargetRoom;
    this._sendMessage({
      cid: this._key,
      data: this._user.status,
      mid: this._user.sid,
      rid: this._room.id,
      sender: this._user.sid,
      target: ((agentPeerId) ? agentPeerId : this._user.sid),
      type: this.SIG_TYPE.PRIVATE_MESSAGE,
      userStatus: true
    });
    this._trigger('peerRequest', this._user.sid, this._user.status, true);
  };

  /**
   * Step 3: Start the call. You may call method
   * {{#crossLink "Skyway/init:method"}}joinRoom(){{/crossLink}} to start the call.
   * Request a call for agent
   * @method startRequestCall
   * @param {String} room Room to ask client to join in
   * @param {Function} callback Callback after the room is ready to join
   * @example
   *   SkywayDemo.on('peerRequest', function (peerId, peerStatus, isSelf)) {
   *     if (!isSelf) {
   *       if (peerStatus.userStatus === SkywayDemo.CALL_STATUS.START_CALL) {
   *         SkywayDemo.startRequestCall(peerId, function (targetRoom) {
   *           SkywayDemo.joinRoom(targetRoom, {
   *             audio: true,
   *             video: true
   *           });
   *         });
   *       }
   *     }
   *   });
   * @trigger peerRequest
   * @since 0.1.0
   */
  SkywayCC.prototype.startRequestCall = function (targetPeerId, callback) {
    var self = this;
    var leaveRoom = function () {
      for (var pc_index in self._peerConnections) {
        if (self._peerConnections.hasOwnProperty(pc_index)) {
          self._removePeer(pc_index);
        }
      }
      self._in_room = false;
      self._closeChannel();
      callback(self._user.status.userTargetRoom);
    };
    if (self._user.status.userType === self.PEER_TYPE.AGENT) {
      self._user.status.userStatus = self.CALL_READY_STATE.START_CALL;
      self._sendMessage({
        cid: self._key,
        mid: self._user.sid,
        rid: self._room.id,
        sender: self._user.sid,
        data: self._user.status,
        target: ((targetPeerId) ? targetPeerId : self._user.sid),
        type: self.SIG_TYPE.PRIVATE_MESSAGE,
        userStatus: true
      });
      self._trigger('peerRequest', self._user.sid, self._user.status, true);
      setTimeout(function () {
        leaveRoom();
      }, 3500);
    } else {
      leaveRoom();
    }
  };
  /* Syntactically private variables and utility functions */
  /**
   * Event fired when a peer request has changed changed.
   * @event peerRequest
   * @param {String} peerId PeerId of the peer that has a call ready state changed.
   * @param {JSON} peerStatus Peer's peerStatus object.
   * @param {JSON} peerStatus.userStatus Peer userStatus [Rel: SkywayCC.CALL_STATUS]
   * @param {Boolean|JSON} peerStatus.userType Peer user type [Rel: SkywayCC.PEER_TYPE]
   * @param {String|JSON} peerInfo.userTargetPeerId Peer target directed call to.
   * @param {Boolean} isSelf Is the Peer self.
   * @since 0.1.0
   */
  SkywayCC.prototype._events.peerRequest = [];

}).call(this);