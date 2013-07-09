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
  $scope.userRatings = {};
  /**
  * If no rating available sets to 0
  */
  $scope.setDefaultRatings = function(id){
    if(!$rootScope.user.ratings[id]){
      $scope.userRatings[id] = 0;
    }else{
      $scope.userRatings[id] = $rootScope.user.ratings[id];
    }
  }
    /**
  * Sets ratings
  */
  $scope.setRating = function(movie){
    var id = movie.id;
    if(!$rootScope.user.ratings[id] || ($rootScope.user.ratings[id] != $scope.userRatings[id])){
      $rootScope.user.ratings[id] = $scope.userRatings[id];
      AuthService.setUser($rootScope.user, false);
      $http({
        url:$scope.conf.url.users + '/ratings', 
        method: 'PUT',
        data: {uid: AuthService.getUserCookie(), token:AuthService.getUserToken(), rating:{mid: id, val: $scope.userRatings[id]}, movie:movie},
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(ratingData, status) {
        if(ratingData.code == 0){
          AlertsService.setAlert('success', 'Rating successful ');
        }else{
          AlertsService.setAlert('error', ratingData.status);
        }
      }).
      error(function(ratingData, status) {
        AlertsService.setAlert('error', 'Rating failed');
        console.log(ratingData);
      });
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
    $scope.$watch( AuthService.isLoggedIn, function(isLoggedIn){
      $scope.isLoggedIn = isLoggedIn;
      if(isLoggedIn && $scope.movies){
        angular.forEach($scope.movies, function(movie, key){
          $scope.setDefaultRatings(movie.id);
        });
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
        if($scope.isLoggedIn){
          angular.forEach(data.results, function(movie, key){
            $scope.setDefaultRatings(movie.id);
          });
        }
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