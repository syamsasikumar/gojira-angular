/**
* Handles cookie based auth functions
*/
angular.module('Auth', ['Storage'])
.factory('AuthService', function( $cookies, $rootScope, LocalStorageService ){
  var _user = (LocalStorageService.get('gojiraUser'))?JSON.parse(LocalStorageService.get('gojiraUser')):undefined;
  return {
    setUser:function(data){
      _user = {};
      _user._id = data._id;
      _user.name = data.name;
       $cookies.sid = data._id;
       LocalStorageService.set('gojiraUser', JSON.stringify(_user));
    },
    logout:function(){
      delete $cookies.sid;
      _user = undefined;
      LocalStorageService.remove('gojiraUser');
    },
    isLoggedIn:function(){
      if($cookies.sid && _user){
        return true;
      }
      return false;
    },
    getUser:function(){
      return _user;
    },
    getUserCookie:function(){
      return ($cookies.sid)? $cookies.sid: false;
    }
  }
});