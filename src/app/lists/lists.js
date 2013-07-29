angular.module( 'gojira.lists', [
  'placeholders',
  'ui.bootstrap',
  'List',
  'Util'
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
.controller( 'ListsCtrl', function ListsCtrl( $scope, $rootScope, $location, $dialog, AlertsService, ListService, UtilityService ) {
  $scope.dialogOpts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: 'lists/box.tpl.html',
    controller: 'ListBoxCtrl',
    dialogFade: true
  };

  $scope.init = function(){
    /**
    * Redirect if not logged in
    */
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access your lists page');
      $location.path('/');
    }else{
      $scope.auto();
    }
  };

  $scope.auto = function(){
    $scope.lists = $rootScope.user.lists;
    if(UtilityService.getObjectLength($scope.lists) == 0){
      $scope.message = 'No lists found';
    }else{
      
    }
  };

  $scope.openListBox = function(action, id){
    if(action == 'create'){
      ListService.setListBox(action, {});
    }else {
      ListService.setListBox(action, $scope.lists[id]);
    }
    var d = $dialog.dialog($scope.dialogOpts);
    d.open().then(function(result){
    });
  };
})

.controller( 'ListBoxCtrl', function ListBoxCtrl( $scope, $rootScope, dialog, AlertsService, ListService, ApiConfigService, AuthService ) {
  $scope.colors = ListService.getListColors();
  $scope.conf = ApiConfigService.getConf();
  $scope.box = ListService.getListBox();
  $scope.action = $scope.box.action;
  $scope.name = ($scope.box.data.name)? $scope.box.data.name: '';
  $scope.description = ($scope.box.data.description)? $scope.box.data.description: '';
  $scope.color = ($scope.box.data.color)? $scope.box.data.color: $scope.colors[0];
  $scope._id = ($scope.box.data._id)? $scope.box.data._id: 0;
  $scope.movies = ($scope.box.data.movies)? $scope.box.data.movies: {};

  $scope.close = function(){
    dialog.close();
  };

  $scope.setListColor = function(color){
    $scope.color = color;
  }

  $scope.saveList = function(){
    var list = {_id: $scope._id, name:$scope.name, description:$scope.description, color:$scope.color, movies: $scope.movies};
    if($scope.action == 'create' || $scope.action == 'edit'){
      ListService.saveList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        $scope.conf.url.users,
        list,
        function(id){
          list._id = id;
          $rootScope.user.lists[id] = list;
          AuthService.setUser($rootScope.user, false);
          AlertsService.setAlert('success', 'List Saved');
      });
    }else if($scope.action == 'delete'){
      ListService.deleteList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        $scope.conf.url.users,
        list._id,
        function(id){
          delete $rootScope.user.lists[id];
          AuthService.setUser($rootScope.user, false);
          AlertsService.setAlert('success', 'List Deleted');
      });
    }
    dialog.close();
  }
})
.controller( 'MovieListBoxCtrl', function MovieListBoxCtrl( $scope, $rootScope, dialog, AlertsService, ListService, ApiConfigService, AuthService ) {
  $scope.movie = ListService.getMovieBoxData();
  $scope.lists = $rootScope.user.lists;
  $scope.movieLists = ListService.getListsForMovie($scope.movie.id);

  $scope.getDefaultCheckedArray = function(){
    var checked = [];
    angular.forEach($scope.lists, function(list, key){
      if($scope.checkMovieInList(list._id)){
        checked[list._id] = true;
      }else{
        checked[list._id] = false;
      }
    });
    return checked;
  };

  $scope.checkMovieInList = function(listId){
    if($scope.movieLists.lists[listId]){
      return true;
    }else{
      return false;
    }
  };

  $scope.toggleMovieList = function(listId){
    if(!$scope.checkMovieInList(listId)){
      $rootScope.user.lists[listId]['movies'][$scope.movie.id] = $scope.movie.id;
      $scope.checked[listId] = true;
    }else{
      $scope.checked[listId] = false;
      delete $rootScope.user.lists[listId]['movies'][$scope.movie.id];
    }
    AuthService.setUser($rootScope.user, false);
    $scope.movieLists = ListService.getListsForMovie($scope.movie.id);
  };

  $scope.close = function(){
    dialog.close();
  };

  $scope.checked = $scope.getDefaultCheckedArray();

});
;