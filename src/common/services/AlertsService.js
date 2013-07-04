/**
* handles common alert functionality
*/
angular.module('Alerts', [])
.factory('AlertsService', function($rootScope, $timeout){
  var toPromise;
  return {
    setAlert : function(type, msg){
      var iconClass = '';
      if(type == 'error'){
        iconClass='icon-exclamation-sign';
      }else if(type == 'info'){
        iconClass='icon-info-sign';
      }else if(type == 'success'){
        iconClass='icon-ok-sign';
      }
      $rootScope.alert = {type: type, msg: msg, icon: iconClass};
      if(toPromise){
        $timeout.cancel(toPromise);
      }
      toPromise = $timeout(function(){
        $rootScope.alert = undefined;
      }, 7000);
    },
    clearAlert : function(){
      $rootScope.alert = undefined;
      if(toPromise){
        $timeout.cancel(toPromise);
      }
    } 
  };
});