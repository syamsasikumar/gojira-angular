angular.module( 'gojira.ratings', [
  'ui.bootstrap',
  'Alerts',
  'Conf',
  'Rating',
  'Alerts',
  'Auth'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/ratings', {
    controller: 'RatingsCtrl',
    templateUrl: 'ratings/ratings.tpl.html'
  });
})
/**
* Controller for my ratings page
*/
.controller( 'RatingsCtrl', function RatingsCtrl( $scope, $rootScope, $http, ApiConfigService, RatingService, AlertsService, AuthService, $location ) {
  $scope.loaded = false;
  $scope.conf = ApiConfigService.getConf();
  $scope.userRatings = {};
  $scope.loadingClass = AlertsService.getLoadingClass();
  $scope.filter = "";
  /**
  * If no rating available sets to 0
  */
  $scope.setDefaultRatings = function(id){
    $scope.userRatings[id] = RatingService.getDefaultRating(id);
  }
    /**
  * Sets ratings
  */
  $scope.setRating = function(id){
    var id = id;
    RatingService.setRating( id, $scope.conf.url.users , AuthService.getUserCookie(), AuthService.getUserToken(), $scope.userRatings[id], function(){
      AlertsService.setAlert('success', 'Rating successful ');
      $rootScope.user.ratings[id] = $scope.userRatings[id];
      AuthService.setUser($rootScope.user, false);
    });
  }

  /**
  * Calls utility method to get rating style
  */
  $scope.getRatingClass = function(rating){
    return RatingService.getRatingClassBg(rating);
  }

  /**
  * Redirect if not logged in
  */
  $scope.init = function(){
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access your ratings page');
      $location.path('/');
    }else{
      $scope.auto();
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
  }
  $scope.fetch = function(){
    $scope.loadingClass = AlertsService.getLoadingClass();
    $scope.loaded = false;
    $scope.imgUrl = $scope.conf.image.baseUrl;
    RatingService.getRatingsWithMovies($scope.conf.url.users, $rootScope.user._id, function(ratings, movies){
      $scope.ratings = ratings;
      $scope.none = true;
      angular.forEach($scope.ratings, function(rating, movie){
        $scope.none = false;
        $scope.setDefaultRatings(movie);
      });
      $scope.movies = $scope.movieStore = movies;
      $scope.loaded = true;
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
  }



})
;