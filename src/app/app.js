angular.module( 'gojira', [
])

.config( function myAppConfig ( $routeProvider ) {
  $routeProvider.otherwise({ redirectTo: '/' });
})


.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
})

;

