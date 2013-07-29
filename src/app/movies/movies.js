angular.module( 'gojira.movies', [
  'ui.bootstrap',
  'Conf',
  'Auth',
  'Rating',
  'Alerts',
  'List'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/movie/:id', {
    controller: 'MoviesCtrl',
    templateUrl: 'movies/movies.tpl.html'
  });
})
/**
* Controller for movie detail page
*/
.controller( 'MoviesCtrl', function MoviesCtrl( $scope, $rootScope, $http, $dialog, $routeParams, ApiConfigService, RatingService, AlertsService, AuthService, ListService ) {
  $scope.id = $routeParams.id;
  $scope.conf = ApiConfigService.getConf();
  $scope.showAllCast = false;
  $scope.castMarkup = [];
  $scope.loaded = false;
  $scope.loadingClass = AlertsService.getLoadingClass();
  $scope.userLists = {};
  
  /**
  * Sets ratings
  */
  $scope.setRating = function(){
    var id = $scope.movie.id;
    RatingService.setRating( id, $scope.conf.url.users , AuthService.getUserCookie(), AuthService.getUserToken(), $scope.movie.user_rating, function(){
      AlertsService.setAlert('success', 'Rating successful ');
      $rootScope.user.ratings[id] = $scope.movie.user_rating;
      AuthService.setUser($rootScope.user, false);
    });
  }

  $scope.getRatingClass = function(rating){
    return RatingService.getRatingClass(rating);
  }
  /**
  * Gets cast info
  */
  $scope.getPerson =function(id, name, img){
    var imgPath = $scope.imgUrl + '/w92/' + img;
    if($scope.castMarkup[id] == undefined){
      var url = $scope.conf.url.movies + '/casts/' + id;  
      $http.get(url, {}, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(data, status) {
        $scope.castMarkup[id] = 
        '<h5>' + name + '</h5>' 
        + '<div class="row-fluid"><div class="span4"><img src="' + imgPath + '" ></img></div><div class="span8">'
        + '<div class="row-fluid cast-bd"><span class="property">Birthday : </span>' + data.birthday + '</div>'
        + '<div class="row-fluid cast-bd"><span class="property">Place of birth : </span>' + data.place_of_birth + '</div>'
        + '</div></div>'
        + '<h6>Bio :</h6>'
        + '<div class="row-fluid">' + data.biography + '</div>';
        var creditCount = 0;
        if(data.credits.cast.length > 0){
          $scope.castMarkup[id] += '<h6> Movies with ' + name + '</h6>';
          angular.forEach(data.credits.cast, function(credit){
            if(creditCount < 5){
              $scope.castMarkup[id] += '<div class="row-fluid"> <div class="span2"><img class="poster" src="' + $scope.imgUrl + '/w92/' + credit.poster_path + '"> </img></div>' 
              + '<a href="#/movie/' + credit.id + '"><div class="span8 movie-name">' + credit.original_title + ' <i>( ' + credit.character + ' )</i></div></a></div>';
            }
            creditCount++;
          });
        }
      }).
      error(function(data, status) {
        $scope.castMarkup[id] = "";
      });
    }
  };
  /**
  * sets background image to class
  */
  $scope.getBackground = function(url, path){
    return {
      background:'url( \'' + url + '/original/' + path + '\')'
    };
  };
  /**
  * gets movie data based on id
  */
  $scope.fetch = function(){
    $scope.imgUrl = $scope.conf.image.baseUrl;
    var url = $scope.conf.url.movies + '/' + $scope.id;
    $http.get(url, {}, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }).
    success(function(data, status) {
      $scope.status = status;
      angular.forEach(data.casts.cast, function(cast){
        $scope.getPerson(cast.id, cast.name, cast.profile_path);
      });
      $scope.movie = data;
      if(!$rootScope.user){
        AlertsService.setAlert('info', 'Login to rate & review "' + data.title + '"');
      }else{
        $scope.setMovieUserData(data.id);
      }
      $scope.loaded = true;
    }).
    error(function(data, status) {
      $scope.data = data || "Request failed";
      $scope.status = status;
    });
  };
  /**
  * To be called on page load
  */
  $scope.init = function(){
    if(!$scope.conf.isSet){
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
    $scope.$watch( AuthService.getUser, function(user){
      $scope.isLoggedIn = AuthService.isLoggedIn();
      if($scope.isLoggedIn && $scope.movie){
        $scope.setMovieUserData($scope.movie.id);
      }
    }, true);
  }
  $scope.setMovieUserData = function(id){
    $scope.movie.user_rating = RatingService.getDefaultRating(id);
    $scope.userLists = ListService.getListsForMovie(id);
  }
  /**
  * Add List popup
  */
  $scope.openListPopUp = function(movie){
    ListService.setMovieBoxData(movie);
    var d = $dialog.dialog(ListService.getMovieBoxOpts());
    d.open().then(function(result){
    });
  }
});