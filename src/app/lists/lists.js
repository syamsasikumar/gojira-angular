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

.controller( 'ListsCtrl', function ListsCtrl( $scope ) {
  $scope.message = "on lists page";
})

;