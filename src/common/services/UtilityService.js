angular.module('Util', [])
.factory('UtilityService', function($http){

  return {
    getObjectLength : function(obj){
      var length = 0;
      for(key in obj){
        length++;
      }
      return length;
    }
  };
});
