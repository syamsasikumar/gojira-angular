angular.module( 'gojira.search', [
  'ui.bootstrap',
  'Conf',
  'Util',
  'Alerts',
  'Auth'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/search', {
    controller: 'SearchCtrl',
    templateUrl: 'search/search.tpl.html'
  });
})
/**
* Controller for search page
*/
.controller( 'SearchCtrl', function SearchCtrl( $scope, $rootScope, $http, ApiConfigService, UtilityService, AlertsService, AuthService ) {
  $scope.search = '';
  $scope.loaded = false;
  $scope.conf = ApiConfigService.getConf();
  /**
  * If no rating available sets to 0
  */
  $scope.setDefaultRatings = function(id){
    if(!$scope.userTemp.ratings[id]){
      $scope.userTemp.ratings[id] = 0;
    }
  }
    /**
  * Sets ratings
  */
  $scope.setRating = function(id){
    if(!$rootScope.user.ratings[id] || ($rootScope.user.ratings[id] != $scope.userTemp.ratings[id])){
      $rootScope.user.ratings[id] = $scope.userTemp.ratings[id];
      AuthService.setUser($rootScope.user);
    }
  }
  /**
  * Calls utility method to get rating style
  */
  $scope.getRatingClass = function(rating){
    return UtilityService.getRatingClass(rating);
  }
  /**
  * Called on page load
  */
  $scope.auto = function(){
    if(!$scope.conf.isSet){
      if(!$rootScope.user){
        AlertsService.setAlert('info', 'Login to rate / review movies');
      }
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
    $scope.$watch( function(){ return $rootScope.user }, function(user){
      $scope.userTemp =  user;
      if(user){
        $scope.isLoggedIn = true;
      }else{
        $scope.isLoggedIn = false;
      }
    }, true);
  };
  /**
  * Gets the list for search - most popular by default
  */
  $scope.fetch = function() {
    $scope.loaded = false;
    $scope.imgUrl = $scope.conf.image.baseUrl;
    if($scope.search == ''){
      var url = $scope.conf.url.movies + '/popular';
    }else{
      var url = $scope.conf.url.movies + '/search?q=' + $scope.search;  
    }
    $http.get(url, {}, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(data, status) {
        $scope.loaded = true;
        $scope.status = status;
        $scope.movies = data.results;
        if($scope.search == ''){
          $scope.listTitle = 'Popular movies to rate';
        }else if(data.total_results == 0){
          $scope.listTitle = 'No movie found matching "' + $scope.search + '"';
        }else if(data.total_results == 1){
          $scope.listTitle = 'Found 1 movie matching "' + $scope.search + '"';
        }else if(data.total_results < 20){
          $scope.listTitle = 'Found ' + data.total_results + 'movies matching "' + $scope.search + '"';
        }else{
          $scope.listTitle = 'Top 20 movies matching "' + $scope.search + '"';
        }
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
        $scope.status = status;
    });
  };
})

;