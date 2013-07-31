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
  $routeProvider.when( '/list/:id', {
    controller: 'ListCtrl',
    templateUrl: 'lists/list.tpl.html'
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
  $scope.conf = ApiConfigService.getConf();

  $scope.getDefaultCheckedArray = function(){
    var checked = [];
    $scope.none = true;
    angular.forEach($scope.lists, function(list, key){
      $scope.none = false;
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
      ListService.addMovieToList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        $rootScope.user.lists[listId], 
        $scope.movie.id,
        function(){
          $rootScope.user.lists[listId]['movies'][$scope.movie.id] = $scope.movie.id;
          $scope.checked[listId] = true;
          AuthService.setUser($rootScope.user, false);
          $scope.movieLists = ListService.getListsForMovie($scope.movie.id);
        });
    }else{
      ListService.deleteMovieFromList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        listId, 
        $scope.movie.id,
        function(){
          $scope.checked[listId] = false;
          delete $rootScope.user.lists[listId]['movies'][$scope.movie.id];
          AuthService.setUser($rootScope.user, false);
          $scope.movieLists = ListService.getListsForMovie($scope.movie.id);
        });
    }
  };

  $scope.close = function(){
    dialog.close();
  };

  $scope.init = function(){
    $scope.checked = $scope.getDefaultCheckedArray();
  }

})
.controller( 'ListCtrl', function ListCtrl( $scope, $rootScope, $location, $routeParams, $http, $dialog, $timeout, AlertsService, ListService, ApiConfigService, AuthService ) {
  $scope.id = $routeParams.id;
  $scope.conf = ApiConfigService.getConf();
  $scope.loadingClass = AlertsService.getLoadingClass();
  $scope.loaded = false;
  $scope.filter = "";
  $scope.dialogOpts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: 'lists/add.tpl.html',
    controller: 'ListAddBoxCtrl',
    dialogFade: true
  };

  /**
  * Redirect if not logged in
  */
  $scope.init = function(){
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access this list page');
      $location.path('/');
    }else{
      $scope.auto();
      $scope.$watch( AuthService.getUser, function(user){
        $timeout(function(){$scope.fetch()}, 2000);
      });
    }
  };
  /**
  * Called on page load
  */
  $scope.auto = function(){
    if(!$scope.conf.isSet){
      $scope.loadingClass = AlertsService.getLoadingClass();
      $http.get($scope.conf.url.movies + '/conf', {}, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).
        success(function(data, status) {
          $scope.conf.image.baseUrl = data.images.base_url;
          ApiConfigService.setConf($scope.conf);
          $scope.fetch();
        }).
        error(function(data, status) {
            
        });
    }else{
      $scope.fetch();
    }
  };
  $scope.removeMovie = function(mid){
    ListService.deleteMovieFromList(
      $rootScope.user._id, 
      AuthService.getUserToken(),
      $scope.list._id, 
      mid,
      function(){
        delete $rootScope.user.lists[$scope.list._id]['movies'][mid];
        AuthService.setUser($rootScope.user, false);
    });
  };
  $scope.fetch = function(){
    $scope.loadingClass = AlertsService.getLoadingClass();
    $scope.loaded = false;
    $scope.imgUrl = $scope.conf.image.baseUrl;
    ListService.getList( $rootScope.user._id, $scope.id,  function(list){
      $scope.list = list;
      $scope.movies = $scope.movieStore = list.movies;
      $scope.loaded = true;
      $scope.name = list.name;
      $scope.description = list.description;
    });
  };
  $scope.filterMovie = function(){
    var movies = [];
    if($scope.filter != '' && $scope.movieStore){
      angular.forEach($scope.movieStore, function(movie, key){
        if(movie.title.search(new RegExp($scope.filter, "i")) != -1){
          movies.push(movie);
        }
      });
    }else{
      movies = $scope.movieStore;
    }
    $scope.movies = movies;
  };
  $scope.openAddPopUp = function(list){
    ListService.setListBoxData(list);
    var d = $dialog.dialog($scope.dialogOpts);
    d.open().then(function(result){
    });
  }

})
.controller( 'ListAddBoxCtrl', function ListAddBoxCtrl( $scope, $rootScope, $http, dialog, ListService, ApiConfigService, AuthService, AlertsService ) {
  $scope.list = ListService.getListBoxData();
  $scope.conf = ApiConfigService.getConf();
  $scope.loaded = true;
  $scope.user = $rootScope.user;
  $scope.addButtons = [];
  $scope.close = function(){
    dialog.close();
  };
  /**
  * Gets the list for search 
  */
  $scope.fetch = function() {
    $scope.loadingClass = AlertsService.getLoadingClass();
    $scope.loaded = false;
    $scope.imgUrl = $scope.conf.image.baseUrl;
    if($scope.search == ''){
      $scope.movies = {};
      return;
    }
    var url = $scope.conf.url.movies + '/search?q=' + $scope.search;  
    $http.get(url, {}, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(data, status) {
        $scope.loaded = true;
        angular.forEach(data.results, function(movie, key){
          $scope.addButtons[movie.id] = !$scope.checkMovieInList(movie.id);
        });
        $scope.movies = data.results;
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
    });
  };
  $scope.checkMovieInList = function(mid){
    if($scope.user.lists[$scope.list._id]['movies'][mid]){
      return true;
    }else{
      return false;
    }
  }
  $scope.toggleMovieList = function(mid, action){
    if(action == 'add'){
      ListService.addMovieToList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        $rootScope.user.lists[$scope.list._id], 
        mid,
        function(){
          $rootScope.user.lists[$scope.list._id]['movies'][mid] = mid;
          AuthService.setUser($rootScope.user, false);
          $scope.addButtons[mid] = false;
        });
    }else{
      ListService.deleteMovieFromList(
        $rootScope.user._id, 
        AuthService.getUserToken(),
        $scope.list._id, 
        mid,
        function(){
          delete $rootScope.user.lists[$scope.list._id]['movies'][mid];
          AuthService.setUser($rootScope.user, false);
          $scope.addButtons[mid] = true;
      });
    }
  }
});
;