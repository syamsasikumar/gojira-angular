angular.module( 'gojira.ratings', [
  'placeholders',
  'ui.bootstrap',
  'Alerts'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/ratings', {
    controller: 'RatingsCtrl',
    templateUrl: 'ratings/ratings.tpl.html'
  });
})
/**
* Controller for my ratings page
*/
.controller( 'RatingsCtrl', function RatingsCtrl( $scope, $rootScope, AlertsService, $location ) {
  /**
  * Redirect if not logged in
  */
  $scope.init = function(){
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access your ratings page');
      $location.path('/');
    }
  };
})

;