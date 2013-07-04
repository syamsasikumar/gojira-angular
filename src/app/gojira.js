angular.module( 'gojira', [
  'templates-app',
  'templates-component',
  'ui.route',
  'ui.bootstrap',
  'gojira.user',
  'gojira.ratings',
  'gojira.lists',
  'gojira.search',
  'gojira.movie'
])

.config( function myAppConfig ( $routeProvider ) {
  $routeProvider.otherwise({ redirectTo: '/search' });
})
/**
* Root controller
* Observes for alerts
*/
.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $rootScope ) {
  $scope.isLoggedIn = false;
  $scope.showAlert = false;
  /**
  * called on page load
  */
  $scope.init = function(){
    $scope.$watch( function(){ return $rootScope.user }, function(user){
      $scope.user =  user;
      if(user){
        $scope.isLoggedIn = true;
      }else{
        $scope.isLoggedIn = false;
      }
    }, true);
    $scope.$watch( function(){ return $rootScope.alert }, function(alert){
      if(alert){
        $scope.showAlert = true;
      }else{
        $scope.showAlert = false;
      }
      $scope.alert = alert;
    }, true);
  }
})
;

