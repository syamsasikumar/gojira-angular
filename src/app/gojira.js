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


.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
	$scope.content="Test";
})
;

