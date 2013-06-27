angular.module( 'gojira.ratings', [
  'placeholders',
  'ui.bootstrap'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/ratings', {
    controller: 'RatingsCtrl',
    templateUrl: 'ratings/ratings.tpl.html'
  });
})

.controller( 'RatingsCtrl', function RatingsCtrl( $scope ) {
  $scope.message = "on ratings page";
})

;