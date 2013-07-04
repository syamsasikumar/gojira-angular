angular.module( 'gojira.lists', [
  'placeholders',
  'ui.bootstrap'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/lists', {
    controller: 'ListsCtrl',
    templateUrl: 'lists/lists.tpl.html'
  });
})
/**
* Controller for my lists page
*/
.controller( 'ListsCtrl', function ListsCtrl( $scope, $rootScope, AlertsService, $location ) {
  $scope.init = function(){
    /**
    * Redirect if not logged in
    */
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access your lists page');
      $location.path('/');
    }
  };
})

;