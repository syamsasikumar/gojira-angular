angular.module( 'gojira', [
  'templates-app',
  'templates-component',
  'ui.route',
  'placeholders',
  'ui.bootstrap'
])

.config( function myAppConfig ( $routeProvider ) {
  $routeProvider.otherwise({ redirectTo: '/' });
})


.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
	$scope.content="Test";
})

.controller( 'BreadCrumbCtr1', function AppCtrl ( $scope, $location ) {
	$scope.content="Test";
})

;

