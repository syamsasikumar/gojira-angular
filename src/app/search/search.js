angular.module( 'gojira.search', [
  'placeholders',
  'ui.bootstrap'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/search', {
    controller: 'SearchCtrl',
    templateUrl: 'search/search.tpl.html'
  });
})

.controller( 'SearchCtrl', function SearchCtrl( $scope ) {
	$scope.message = "on search page";
	$scope.search = "";
	$scope.populate = function(){
		console.log('here');
	}
})

;