angular.module('Util', [])
.factory('UtilityService', function(){

  return {
    getRatingClass : function(rating){
      if(rating < 5){
        return "low";
      }else if (rating < 7){
        return "med";
      }else {
        return "high";
      }
    }
  };
});