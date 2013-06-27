angular.module('Auth', [])
.factory('AuthService', function(){
  var user;
  return {
    login:function(){

    },
    logout:function(){

    },
    isLoggedIn:function(){
      return false;
    },
    getUser:function(){
      return user;
    }
  }
});