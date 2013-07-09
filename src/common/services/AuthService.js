/**
* Handles cookie based auth functions
*/
angular.module('Auth', ['Storage'])
.factory('AuthService', function( $cookies, $rootScope, LocalStorageService ){
  var _user = (LocalStorageService.get('gojiraUser') && $cookies.sid)?JSON.parse(LocalStorageService.get('gojiraUser')):undefined;
  return {
    setUser:function(data, setCookies){
      var data = data;
      _user = {};
      _user._id = data._id;
      _user.name = data.name;
      _user.lists = data.lists;
      _user.ratings = data.ratings;
      if(setCookies){
        $cookies.token = data.token;
        $cookies.sid = data._id;
      }
      LocalStorageService.set('gojiraUser', JSON.stringify(_user));
      $rootScope.user = _user;
    },
    logout:function(){
      delete $cookies.token;
      delete $cookies.sid;
      $rootScope.user = _user = undefined;
      LocalStorageService.remove('gojiraUser');
    },
    isLoggedIn:function(){
      if($cookies.sid && _user && $cookies.token){
        return true;
      }
      LocalStorageService.remove('gojiraUser');//hack for first time
      return false;
    },
    getUser:function(){
      return _user;
    },
    getUserCookie:function(){
      return ($cookies.sid)? $cookies.sid: false;
    },
    getUserToken:function(){
      return ($cookies.token)? $cookies.token: false;
    }
  }
});