/**
* Handles cookie based auth functions
*/
angular.module('Auth', ['Storage'])
.factory('AuthService', function( $cookies, $rootScope, LocalStorageService ){
  var _user = (LocalStorageService.get('gojiraUser') && $cookies.sid)?JSON.parse(LocalStorageService.get('gojiraUser')):undefined;
  return {
    setUser:function(data){
      _user = {};
      _user._id = data._id;
      _user.name = data.name;
      _user.lists = data.lists;
      _user.ratings = data.ratings;
       $cookies.sid = data._id;
       console.log(data);
       LocalStorageService.set('gojiraUser', JSON.stringify(_user));
       $rootScope.user = _user;
    },
    logout:function(){
      delete $cookies.sid;
      _user = undefined;
      LocalStorageService.remove('gojiraUser');
      $rootScope.user = _user;
    },
    isLoggedIn:function(){
      if($cookies.sid && _user){
        return true;
      }
      LocalStorageService.remove('gojiraUser');
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