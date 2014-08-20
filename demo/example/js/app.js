var Demo = Demo || {};
Demo.app = angular.module('CustomerServiceDemo', []);

// Filters
app.filter('readAsHtml', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

// Service
app.service('AppService', function ($log, $http, $q) {
  var self = this;

  // API Configuration
  this.api = {
    posturl:    'http://webrtc-enterprise.temasys.com.sg/devapi',
    roomserver: 'http://webrtc-enterprise.temasys.com.sg/',
    apikey:     '1399520221741q1Rb'
  };

  this._init = function () {
    if(!t._temp) t._temp = {};
    if(!_this.user.displayName) _this.user.displayName = _this.user.defaultAgentName;
    t._temp.displayName = _this.user.displayName;
    $log.info('roomserver:' + _this.api.roomserver);
    $log.info('apikey:' + _this.api.apikey);
    $log.info('room:' + _this.api.room);
    setTimeout(function () {
      t.init(
        _this.api.roomserver,
        _this.api.apikey,
        _this.api.room
      );
      t._trigger('changeStatus', 'init');
    }, 1000);
  };
  // Create a token
  this.getToken = function () {
    var deferred = $q.defer();
    $.post(_this.api.posturl, {
      api: 'requesttoken',
      id:  _this.api.apikey
    },function(data,status){
      if(data.success) {
        _this.user.token = data.data;
        return deferred.promise; // Only when it's done, return the promise :D
      } else {
        $log.error('getToken() failed.');
      }
    });
  };
  // Get meetings
  this.getMeetings = function (callback) {
    var deferred = $q.defer();
    $.post(_this.api.posturl,{
        api:      'getmeetings',
        id:       _this.api.apikey,
        user:     _this.api.apikey,
        byhost:   true,
        token:    _this.user.token
    },function(data,status){
      $log.info(data.data);
      if(data.success) {
        return deferred.resolve(data.data);
      } else {
        $log.error('getMeetings() failed.');
        return deferred.reject();
      }
    });
    return deferred.promise;
  };
  // Create a meeting
  // NC - Use a promise here.
  this.createMeeting = function () {
    var deferred = $q.defer();
    var d1 = new Date();
    var d2 = new Date();
    d2.setHours(d1.getHours() - 1);
    _this.api.room = _this.user.displayName.replace(/ /g,'_') + '@' + CryptoJS.SHA1((new Date()).toISOString());
    $.post(_this.api.posturl,{
        api:      'createmeeting',
        id:       _this.api.apikey,
        user:     _this.api.apikey,
        status:   'init',
        roomname: _this.api.room,
        token:    _this.user.token,
        start:     d2,
        onetimemeeting: true
    },function(data,status){
      if(data.success) {
        $log.info(_this.api._mID);
        $log.info('Roomserver:' + _this.api.roomserver);
        $log.info('API:' + _this.api.apikey);
        $log.info('Room:' + _this.api.room);
        return deferred.resolve(data.id._id);
      } else {
        $log.error('createMeeting() failed.');
        return deferred.reject();
      }
    });
    return deferred.promise;
  };
  // Update Meeting Status
  this.updateStatusMeeting = function (newStatus) {
    $.post(_this.api.posturl,{
      api:   'updatestatusmeeting',
      id:     _this.api.apikey,
      _mID:   _this.api._mID,
      status: newStatus,
      token:  _this.user.token
    },function(data,status){
      $log.info('updateStatusMeeting() received status: ' + status);
      if(data.success) {
        $log.info(_this.api._mID);
        $log.info('mID:' + _this.api._mID);
        $log.info('Status:' + newStatus);
        t._trigger('changeStatus', newStatus);
      } else {
        $log.error('updateStatusMeeting() failed.');
      }
    });
  };
  // Get the Status
  this.getStatus = function(status) {
    if(!status) return '<i>[No Status]</i>';
    switch (status) {
      case 'init':
        return 'Initializing';
      case 'onwebcam':
        return 'Webcam Access Allowed';
      case 'onwebcamerror':
        return 'Webcam Access Failed';
      case 'watching':
        return 'Watching Advertisment';
      case 'onhold':
        return 'Waiting For Agent';
      case 'chat':
        return 'Sent a Message';
      case 'startingcall':
        return 'Calling is starting with Agent';
      case 'incall':
        return 'In Call with Agent';
      case 'leftroom':
        return 'Customer Left Room';
      case 'nousers':
        return 'Empty Room';
      default:
        return '<i>[Unknown Status "' + status + '"]</i>';
    }
  };
  // User Session
  this.user = {
    token : _this.getToken(),
    defaultAgentName : 'Agent Bob'
  };
});

csd.agentView = function($scope, $log, $compile, AppService) {
  $scope.config = {
    viewLabel: 'Agent View',
    meetings : {}
  };
  $scope.retrieveMeetings = function () {
    (AppService.getMeetings()).then(function(array){
      for(var i=0;i<array.length;i++){
        var roomName = array[i].RoomName;
        var user = roomName.split('@')[0];
        var startTime = array[i].StartTime;
        var status = AppService.getStatus(array[i].Status);
        
        if ((new Date()).getTime() - (new Date(startTime)).getTime() < 15*60*1000) {
          delete $scope.meetings[roomName];
        }
        if (!$scope.meetings) {
          $scope.meetings = {};
        }
        if (!$scope.meetings[roomName]) {
          $scope.meetings[roomName] = array[i];
          $scope.meetings[roomName].index = i+1;
          $scope.meetings[roomName].user = (user)?user.replace(/_/g,' '):'<i>[No Name]</i>';
          $scope.meetings[roomName].status = status;
        } else if ($scope.meetings[roomName].status !== status) {
          $scope.meetings[roomName].status = status;
        }
      }
    });
  };
  $scope.agentStartCall = function (roomname) {
    $log.info('Room: ' + roomname);
    AppService.api.room = roomname;
    AppService.api._mID = $scope.meetings[roomname]._id;
    AppService._init();
  };
  $scope.changeStatus = function (status) {
    $log.info('changeStatus() called');
    $log.info('Status: ' + status);
    if (!status||!AppService.api._mID) {
      $log.info('No Status or Room initialized');
      return;
    } else if (status === 'leftroom') {
      AppService.updateStatusMeeting(status);
    } else {
      $log.info('Other events: ' + status);
      clearInterval($scope.refreshMeetings);
      t._trigger('changeStatus',status);
      return;
    }
  };
  window.changeStatusEvent = $scope.changeStatus;
  $log.info('Token: ' + AppService.user.token);
  $scope.refreshMeetings = setInterval($scope.retrieveMeetings,1000);
};

csd.clientView = function ($scope, $log, AppService) {
  $scope.config = {
    viewLabel: 'Client View'
  };
  $scope.clientStartCall = function () {
    $log.info('Token:' + AppService.user.token);
    $log.info('Displayname:' + $scope.clientName);
    AppService.user.displayName = $scope.clientName;
    (AppService.createMeeting()).then(function(id){
      $log.info('Received id: ' + id);
      AppService.api._mID = id;
      AppService._init();
    });
  };
  $scope.changeStatus = function (status) {
    $log.info('changeStatus() called');
    $log.info('Status: ' + status);
    if (!status||!AppService.api._mID) {
      $log.info('No Status or Room initialized');
      return;
    } else if (status === 'started') {
      $log.info('Page just loaded');
      return;
    } else if (status !== 'leftroom') {
      AppService.updateStatusMeeting(status);
    } else {
      // No need update. I'm the customer
      window.location.href = window.location.href;
    }
  };
  window.changeStatusEvent = $scope.changeStatus;
};