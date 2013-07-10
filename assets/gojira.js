/**
 * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
 * <%= pkg.homepage %>
 *
 * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>
 * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>
 */
(function ( window, angular, undefined ) {

angular.module( 'gojira', [
  'templates-app',
  'templates-component',
  'ui.route',
  'ui.bootstrap',
  'gojira.user',
  'gojira.ratings',
  'gojira.lists',
  'gojira.search',
  'gojira.movies'
])

.config( function myAppConfig ( $routeProvider ) {
  $routeProvider.otherwise({ redirectTo: '/search' });
})
/**
* Root controller
* Observes for alerts
*/
.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $rootScope ) {
  $scope.isLoggedIn = false;
  $scope.showAlert = false;
  /**
  * called on page load
  */
  $scope.init = function(){
    $scope.$watch( function(){ return $rootScope.user }, function(user){
      $scope.user =  user;
      if(user){
        $scope.isLoggedIn = true;
      }else{
        $scope.isLoggedIn = false;
      }
    }, true);
    $scope.$watch( function(){ return $rootScope.alert }, function(alert){
      if(alert){
        $scope.showAlert = true;
      }else{
        $scope.showAlert = false;
      }
      $scope.alert = alert;
    }, true);
  }
})
;


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
/**
* Controller for my lists page
*/
.controller( 'ListsCtrl', function ListsCtrl( $scope, $rootScope, AlertsService, $location ) {
  $scope.init = function(){
    /**
    * Redirect if not logged in
    */
    if(!$rootScope.user){
      AlertsService.setAlert('error', 'You should be logged in to access your lists page');
      $location.path('/');
    }
  };
})

;
angular.module( 'gojira.movies', [
  'ui.bootstrap',
  'Conf',
  'Auth',
  'Rating',
  'Alerts'
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
.controller( 'MoviesCtrl', function MoviesCtrl( $scope, $rootScope, $http, $routeParams, ApiConfigService, RatingService, AlertsService, AuthService ) {
  $scope.id = $routeParams.id;
  $scope.conf = ApiConfigService.getConf();
  $scope.showAllCast = false;
  $scope.castMarkup = [];
  $scope.loaded = false;
  $scope.loadingClass = AlertsService.getLoadingClass();
  
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
        $scope.movie.user_rating = RatingService.getDefaultRating(data.id);
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
    $scope.$watch( AuthService.isLoggedIn, function(isLoggedIn){
      $scope.isLoggedIn = isLoggedIn;
      if(isLoggedIn && $scope.movie){
        $scope.movie.user_rating = RatingService.getDefaultRating($scope.movie.id);
      }
    }, true);
  }
});
angular.module( 'gojira.ratings', [
  'placeholders',
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
  }
  $scope.fetch = function(){
    $scope.loadingClass = AlertsService.getLoadingClass();
    $scope.loaded = false;
    $scope.imgUrl = $scope.conf.image.baseUrl;
    $http({
      url: $scope.conf.url.users + '/ratings/' + $rootScope.user._id + '?movies=1', 
      method: 'GET',
      headers: { 'Content-Type': 'application/json; charset=UTF-8'}
    }).
    success(function(ratingData, status) {
      if(ratingData.code == 0 && ratingData.ratings.length){
        $scope.ratings = JSON.parse(ratingData.ratings);
        angular.forEach($scope.ratings, function(rating, movie){
          $scope.setDefaultRatings(movie);
        });
        $scope.movies = $scope.movieStore = ratingData.movies;
      }
      $scope.loaded = true;
    }).
    error(function(ratingData, status) {
      AlertsService.setAlert('error', 'Error fetching your ratings');
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
angular.module( 'gojira.search', [
  'ui.bootstrap',
  'Conf',
  'Rating',
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
.controller( 'SearchCtrl', function SearchCtrl( $scope, $rootScope, $http, ApiConfigService, RatingService, AlertsService, AuthService ) {
  $scope.search = '';
  $scope.loaded = false;
  $scope.conf = ApiConfigService.getConf();
  $scope.userRatings = {};
  $scope.loadingClass = AlertsService.getLoadingClass();
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
    return RatingService.getRatingClass(rating);
  }
  /**
  * Called on page load
  */
  $scope.auto = function(){
    if(!$scope.conf.isSet){
      $scope.loadingClass = AlertsService.getLoadingClass();
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
    $scope.loadingClass = AlertsService.getLoadingClass();
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
angular.module( 'gojira.user', [
  'ngCookies',
  'templates-app',
  'templates-component',
  'ui.bootstrap',
  'Auth',
  'Conf',
  'Alerts',
  'Rating'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/user/:id', {
    controller: 'UserCtrl',
    templateUrl: 'user/user.tpl.html'
  });
})

/**
* authentication controller
*/
.controller( 'AuthCtrl', function AuthCtrl ( $scope, $rootScope, $location, $http,  $cookies, AlertsService, RatingService, AuthService, ApiConfigService) {
  $scope.name = '';
  $scope.pass = '';
  $scope.rName = '';
  $scope.rPass = '';
  $scope.rcPass = '';
  $scope.isCollapsed = true;
  $scope.conf = ApiConfigService.getConf();
  /**
  * init to be called on page load
  */
  $scope.init = function(){
    var user, ratings, lists;
    if(AuthService.getUserCookie() && !AuthService.getUser()){
      $http({
        url:$scope.conf.url.users + '/' + AuthService.getUserCookie(), 
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(userData, status) {
        if(userData.code == 0){
          user = userData;
          $scope.isCollapsed = true;
          RatingService.getRatings($scope.conf.url.users, user._id, function(ratings){
            user.ratings = ratings || {};
            AuthService.setUser(user, true);
            AlertsService.setAlert('info', 'Logged in as ' + userData.name);
          });
        }else{
          AlertsService.setAlert('error', 'Login failed');
        }
      }).
      error(function(userData, status) {
        AlertsService.setAlert('error', 'Login Failed');
      });
    }
    $scope.$watch( AuthService.isLoggedIn, function(isLoggedIn){
      $scope.userContent = (isLoggedIn)? 'user/user.tpl.html':'user/anon.tpl.html';
      $scope.userIcon = (isLoggedIn)? 'icon-signout':'icon-unlock';
      $scope.userText = (isLoggedIn)? ('Logout ' + AuthService.getUser().name) : 'Login / Register';
      $rootScope.user = AuthService.getUser();
    });
  };
  /**
  * login button click
  */
  $scope.login = function(name, pass){
    var user, ratings, lists;
    $http({
      url:$scope.conf.url.users + '/login', 
      method: 'POST',
      data: {name: name, pass:pass},
      headers: { 'Content-Type': 'application/json; charset=UTF-8'}
    }).
    success(function(userData, status) {
      if(userData.code == 0){
        user = userData;
        $scope.isCollapsed = true;
        RatingService.getRatings($scope.conf.url.users, user._id, function(ratings){
          user.ratings = ratings || {};
          AuthService.setUser(user, true);
          AlertsService.setAlert('info', 'Login successful ');
        });
      }else{
        AlertsService.setAlert('error', userData.status);
      }
    }).
    error(function(userData, status) {
      AlertsService.setAlert('error', 'Login Failed');
      console.log(userData);
    });
  };
  /**
  * Register button click
  */
  $scope.register = function(name, pass, cpass){
    $http({
      url:$scope.conf.url.users + '/register',
      data:  {name: name, pass: pass, cpass: cpass}, 
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8'}
    }).
    success(function(userData, status) {
      if(userData.code == 0){
        $scope.isCollapsed = true;
        AuthService.setUser(userData, true);
        AlertsService.setAlert('info', 'Registration successful ');
      }else{
        AlertsService.setAlert('error', userData.status);
      }
    }).
    error(function(userData, status) {
      AlertsService.setAlert('error', 'Registration error');
      console.log(userData);
    });
  };  
  /**
  * Toggle login/ logout UI
  */
  $scope.toggleUser = function(){
    AlertsService.clearAlert();
    if(!AuthService.isLoggedIn()){
      $scope.isCollapsed = !$scope.isCollapsed;
    }else{
      AuthService.logout();
      $location.path('/');
      AlertsService.setAlert('info', 'Logout successful ');
    }
  };
})
/**
* Controller for user admin
*/
.controller( 'UserCtrl', function UserCtrl ( $scope, $rootScope, $routeParams, $location, AlertsService) {
  if($rootScope.user && $rootScope.user._id == $routeParams.id){

  }else{
    $location.path('/');
  }
});
;


/**
* handles common alert functionality
*/
angular.module('Alerts', [])
.factory('AlertsService', function($rootScope, $timeout){
  var toPromise;
  return {
    setAlert : function(type, msg){
      var iconClass = '';
      if(type == 'error'){
        iconClass='icon-exclamation-sign';
      }else if(type == 'info'){
        iconClass='icon-info-sign';
      }else if(type == 'success'){
        iconClass='icon-ok-sign';
      }
      $rootScope.alert = {type: type, msg: msg, icon: iconClass};
      if(toPromise){
        $timeout.cancel(toPromise);
      }
      toPromise = $timeout(function(){
        $rootScope.alert = undefined;
      }, 7000);
    },
    clearAlert : function(){
      $rootScope.alert = undefined;
      if(toPromise){
        $timeout.cancel(toPromise);
      }
    },
    getLoadingClass : function(){
      var classes = { 1:'pp', 2:'cb', 3:'et', 4:'lotr', 5:'gf', 6:'dk', 7:'sj', 8:'sw', 9:'us', 10:'br'};
      var rid = Math.floor(Math.random() * 10) + 1; //Math.random() gives a value between 0 and 1
      return classes[rid];
    }
  };
});
angular.module('Conf', [])
.factory('ApiConfigService', function($http){
  var conf = {
    url:{
      movies : 'http://daimajin.herokuapp.com/movies',
      users: 'http://daimajin.herokuapp.com/users'
    },
    image:{
      baseUrl:''
    },
    isSet:false
  };

  return {
    getConf : function(){
      return conf;
    },
    setConf: function(newConf){
        conf = newConf;
        conf.isSet = true;
    }
  };
});

/**
* Handles cookie based auth functions
*/
angular.module('Auth', ['Storage'])
.factory('AuthService', function( $cookies, $rootScope, LocalStorageService ){
  var _user = (LocalStorageService.get('gojiraUser') && $cookies.sid)?JSON.parse(LocalStorageService.get('gojiraUser')):undefined;
  return {
    setUser:function(data, setCookies){
      var data = data;
      _user = {};
      _user._id = data._id;
      _user.name = data.name;
      _user.lists = data.lists;
      _user.ratings = data.ratings;
      if(setCookies){
        $cookies.token = data.token;
        $cookies.sid = data._id;
      }
      LocalStorageService.set('gojiraUser', JSON.stringify(_user));
      $rootScope.user = _user;
    },
    logout:function(){
      delete $cookies.token;
      delete $cookies.sid;
      $rootScope.user = _user = undefined;
      LocalStorageService.remove('gojiraUser');
    },
    isLoggedIn:function(){
      if($cookies.sid && _user && $cookies.token){
        return true;
      }
      LocalStorageService.remove('gojiraUser');//hack for first time
      return false;
    },
    getUser:function(){
      return _user;
    },
    getUserCookie:function(){
      return ($cookies.sid)? $cookies.sid: false;
    },
    getUserToken:function(){
      return ($cookies.token)? $cookies.token: false;
    }
  }
});
/**
* Localstorage factory to handle data storage on browser
*/
angular.module('Storage', [])
.factory('LocalStorageService', function(){
  var store = (function(){
    try {
      if( 'localStorage' in window && window['localStorage'] !== null){
        return window['localStorage'];
      }else{
        return false;
      }
    } catch (e) {
      return false;
    }
  })();

  return {
    get : function(key){
      return (store)? store.getItem(key):undefined;
    },
    set : function(key, val){
      if(store){
        store.setItem(key, val);
      }
    },
    remove: function(key){
      if(store){
        store.removeItem(key);
      }
    }
  };
});

angular.module('Rating', ['Alerts'])
.factory('RatingService', function($http, $rootScope, AlertsService){

  return {
    getRatingClass : function(rating){
      if(rating < 5){
        return "low";
      }else if (rating < 7){
        return "med";
      }else {
        return "high";
      }
    },
    getRatingClassBg : function(rating){
      if(rating < 5){
        return "low-bg";
      }else if (rating < 7){
        return "med-bg";
      }else {
        return "high-bg";
      }
    },
    getRatings : function(url, id, cb){
      var callback = cb;
      var ratings = {};
      $http({
        url: url + '/ratings/' + id, 
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(ratingData, status) {
        if(ratingData.code == 0 && ratingData.ratings.length){
          ratings = JSON.parse(ratingData.ratings);
        }
        callback(ratings);
      }).
      error(function(ratingData, status) {
        callback(ratings);
      })
    },
    getDefaultRating : function(id){
      if(!$rootScope.user.ratings[id]){
        return 0;
      }else{
        return $rootScope.user.ratings[id];
      }
    },
    setRating : function(mid, url, uid, token, val, callback){
      if(!$rootScope.user.ratings[mid] || ($rootScope.user.ratings[mid] != val)){
        $http({
          url:url + '/ratings', 
          method: 'PUT',
          data: {uid: uid, token:token, rating:{mid: mid, val: val}},
          headers: { 'Content-Type': 'application/json; charset=UTF-8'}
        }).
        success(function(ratingData, status) {
          if(ratingData.code == 0){
            callback();
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
  };
});
angular.module('templates-app', ['lists/lists.tpl.html', 'movies/movies.tpl.html', 'ratings/ratings.tpl.html', 'search/search.tpl.html', 'user/anon.tpl.html', 'user/user.tpl.html']);

angular.module("lists/lists.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/lists.tpl.html",
    "<div class=\"row-fluid\" data-ng-init=\"init()\">\n" +
    "  Lists\n" +
    "</div>");
}]);

angular.module("movies/movies.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("movies/movies.tpl.html",
    "<div class=\"row-fluid\" ng-style=\"getBackground(imgUrl, movie.backdrop_path)\" class=\"img-background\" data-ng-init=\"init()\">\n" +
    "  <div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "    <h4> Loading.. </h4>\n" +
    "    <div class=\"loader\" ng-class=\"loadingClass\"></div>\n" +
    "  </div>\n" +
    "  <div class=\"movie-container\" ng-show=\"loaded\">\n" +
    "    <div class=\"row-fluid\" >\n" +
    "      <div class=\"span1\">\n" +
    "        <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" ></img>\n" +
    "      </div>\n" +
    "      <div class=\"span8\">\n" +
    "        <h3>{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</h3>\n" +
    "          <p ng-if=\"movie.tagline\"> \n" +
    "            <span class=\"property\"> Tag Line : </span> \n" +
    "            <i>\"{{movie.tagline}}\"</i> </p>\n" +
    "          <p> \n" +
    "            <span class=\"property\">User Rating : </span>\n" +
    "            <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating>  ( {{movie.vote_average}}/10 | <b>{{movie.vote_count}}</b> users reviewed this title ) \n" +
    "          </p>\n" +
    "          <div class=\"movie-user-rating\" ng-if=\"isLoggedIn\" ng-click=\"setRating()\">\n" +
    "            <span class=\"property\" > Your Rating : </span>\n" +
    "            <rating value=\"movie.user_rating\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "          </div>\n" +
    "           <p ng-show=\"movie.genres\">\n" +
    "             <span class=\"property\">Genres : </span>\n" +
    "             <span class=\"genre\" ng-repeat=\"(index,genre) in movie.genres\"> {{genre.name}} <span class=\"sep\" ng-show=\"index < (movie.genres.length -1)\"> | </span></span></p>\n" +
    "       </div>\n" +
    "       <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(movie.vote_average)\">\n" +
    "          <div class=\"rating-text\">\n" +
    "            {{movie.vote_average}} <i class=\"icon-star\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"rating-by\">\n" +
    "            {{movie.vote_count}} users\n" +
    "          </div>\n" +
    "       </div>\n" +
    "       <div class=\"pull-right rating-box ratings-box-user\" ng-class=\"getRatingClass(movie.user_rating)\" ng-if=\"isLoggedIn\">\n" +
    "          <div class=\"rating-text\" ng-if=\"movie.user_rating > 0\">\n" +
    "            {{movie.user_rating}} <i class=\"icon-star\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"rating-text na-text\" ng-if=\"movie.user_rating == 0\">\n" +
    "            N/A\n" +
    "          </div>\n" +
    "          <div class=\"rating-by\">\n" +
    "            You\n" +
    "          </div>\n" +
    "       </div>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid\" ng-click=\"setRating(movie)\">\n" +
    "      <h5>Overview : </h5>\n" +
    "      <p class=\"left-padded-content\">\n" +
    "        {{movie.overview}}\n" +
    "      </p>\n" +
    "    </div>  \n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span6\" ng-if=\"movie.casts.cast\">\n" +
    "        <h5> Casts : </h5>\n" +
    "        <div class=\"row-fluid message left-padded-content\" ng-show=\"!showAllCast\">\n" +
    "          Showing top casts. Click <a ng-click=\"showAllCast = true\" >here</a> to show all casts.\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid message left-padded-content\" ng-show=\"showAllCast\">\n" +
    "          Showing all casts. Click <a ng-click=\"showAllCast = false\" >here</a> to show only top casts.\n" +
    "        </div>\n" +
    "        <div class=\"cast-result row-fluid left-padded-content\" ng-repeat=\"(index,cast) in movie.casts.cast\">\n" +
    "          <div class=\"span1\" ng-show=\"index < 10 || showAllCast\">\n" +
    "            <img ng-src=\"{{imgUrl}}/w92/{{cast.profile_path}}\" ng-if=\"cast.profile_path\" ng-show=\"cast.profile_path\" class=\"list-img\"></img>\n" +
    "            <i class=\"icon-question-sign\" ng-show=\"!cast.profile_path\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"span11 cast-name\" ng-show=\"index < 10 || showAllCast\">\n" +
    "            <a><span tooltip-placement=\"right\"  tooltip-html-unsafe=\"{{castMarkup[cast.id]}}\" tooltip-trigger=\"mouseenter\" class=\"cast-desc\">{{cast.name}} <i ng-show=\"cast.character\">( {{cast.character}} )</i></span></a>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"span6\" ng-if=\"movie.trailers.youtube[0]\">\n" +
    "        <h5>Trailer :</h5>\n" +
    "        <iframe id=\"ytplayer\" type=\"text/html\" class=\"span10\" src=\"http://www.youtube.com/embed/{{movie.trailers.youtube[0].source}}\" frameborder=\"0\"></iframe> \n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid\" ng-show=\"movie.similar_movies.results\">\n" +
    "      <h5>Similar Movies : </h5>\n" +
    "      <div class=\"similar-movie-container row-fluid\">\n" +
    "        <div class=\"span2 movie-leaf\" ng-repeat=\"(index, s_movie) in movie.similar_movies.results\">\n" +
    "          <a href=\"#/movie/{{s_movie.id}}\" ng-show=\"index < 6\">\n" +
    "            <img ng-src=\"{{imgUrl}}/w92/{{s_movie.poster_path}}\" ng-if=\"s_movie.poster_path\"></img>\n" +
    "            <h6 >{{s_movie.title}} ( {{s_movie.release_date.substring(0,4)}} )</h6>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("ratings/ratings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("ratings/ratings.tpl.html",
    "<div class=\"row-fluid search-input\" data-ng-init=\"init()\">\n" +
    "  <input type=\"text\" class=\"span10 offset1\" placeholder=\"Type to search for movies you rated\" ng-model=\"filter\" ng-keyup=\"filterMovie()\"/>\n" +
    "</div>\n" +
    "<h3>Your Ratings</h3>\n" +
    "<div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "  <h4> Loading.. </h4>\n" +
    "  <div class=\"loader\" ng-class=\"loadingClass\"></div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"loaded && ratings\">\n" +
    "  <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "    <div class=\"span1\">\n" +
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "        <div class=\"row-fluid movie-list-field\"  ng-click=\"setRating(movie.id)\">\n" +
    "          <span class=\"property\" > Your Rating : </span>\n" +
    "          <rating value=\"userRatings[movie.id]\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(userRatings[movie.id])\" >\n" +
    "        <div class=\"rating-text-user\" ng-if=\"userRatings[movie.id] > 0\">\n" +
    "          {{userRatings[movie.id]}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"!ratings && loaded\">\n" +
    "  No ratings found.\n" +
    "</div>\n" +
    "");
}]);

angular.module("search/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("search/search.tpl.html",
    "<div class=\"row-fluid search-input\" data-ng-init=\"auto()\">\n" +
    "  <input type=\"text\" class=\"span10 offset1\" placeholder=\"Type to search for movies\" ng-model=\"search\" ng-keyup=\"auto()\"/>\n" +
    "</div>\n" +
    "<h3>{{listTitle}}</h3>\n" +
    "<div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "  <h4> Loading.. </h4>\n" +
    "  <div class=\"loader\" ng-class=\"loadingClass\"></div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"loaded\">\n" +
    "  <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "    <div class=\"span1\">\n" +
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "        <div class=\"row-fluid movie-list-field\">\n" +
    "          <span class=\"property\"> User Rating : </span>\n" +
    "          <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating><br/>\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid movie-list-field\" ng-if=\"isLoggedIn\" ng-click=\"setRating(movie.id)\">\n" +
    "          <span class=\"property\" > Your Rating : </span>\n" +
    "          <rating value=\"userRatings[movie.id]\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(movie.vote_average)\">\n" +
    "        <div class=\"rating-text\">\n" +
    "          {{movie.vote_average}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"rating-by\">\n" +
    "          {{movie.vote_count}} users\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box ratings-box-user\" ng-class=\"getRatingClass(userRatings[movie.id])\" ng-if=\"isLoggedIn\">\n" +
    "        <div class=\"rating-text\" ng-if=\"userRatings[movie.id] > 0\">\n" +
    "          {{userRatings[movie.id]}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"rating-text na-text\" ng-if=\"userRatings[movie.id] == 0\">\n" +
    "          N/A\n" +
    "        </div>\n" +
    "        <div class=\"rating-by\">\n" +
    "          You\n" +
    "        </div>\n" +
    "     </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/anon.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/anon.tpl.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"login-box span4 offset2\">\n" +
    "      <h5>Login</h5>\n" +
    "      <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"name\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"pass\">\n" +
    "      <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"login(name, pass)\" >Login</button>\n" +
    "    </div>\n" +
    "    <div class=\"reg-box span4 \">\n" +
    "      <h5>Register</h5>\n" +
    "      <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"rName\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"rPass\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Confirm password\" ng-model=\"rcPass\">\n" +
    "      <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"register(rName, rPass,rcPass)\">Register</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/user.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/user.tpl.html",
    "&nbsp;");
}]);

angular.module('templates-component', []);


angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dialog","ui.bootstrap.dropdownToggle","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.position","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.typeahead"]),angular.module("ui.bootstrap.tpls",["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/dialog/message.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/rating/rating.html","template/tabs/pane.html","template/tabs/tabs.html","template/typeahead/typeahead.html"]),angular.module("ui.bootstrap.transition",[]).factory("$transition",["$q","$timeout","$rootScope",function(t,e,n){function o(t){for(var e in t)if(void 0!==i.style[e])return t[e]}var a=function(o,i,r){r=r||{};var l=t.defer(),s=a[r.animation?"animationEndEventName":"transitionEndEventName"],c=function(){n.$apply(function(){o.unbind(s,c),l.resolve(o)})};return s&&o.bind(s,c),e(function(){angular.isString(i)?o.addClass(i):angular.isFunction(i)?i(o):angular.isObject(i)&&o.css(i),s||l.resolve(o)}),l.promise.cancel=function(){s&&o.unbind(s,c),l.reject("Transition cancelled")},l.promise},i=document.createElement("trans"),r={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"},l={WebkitTransition:"webkitAnimationEnd",MozTransition:"animationend",OTransition:"oAnimationEnd",transition:"animationend"};return a.transitionEndEventName=o(r),a.animationEndEventName=o(l),a}]),angular.module("ui.bootstrap.collapse",["ui.bootstrap.transition"]).directive("collapse",["$transition",function(t){var e=function(t,e,n){e.removeClass("collapse"),e.css({height:n}),e[0].offsetWidth,e.addClass("collapse")};return{link:function(n,o,a){var i,r=!0;n.$watch(function(){return o[0].scrollHeight},function(){0!==o[0].scrollHeight&&(i||(r?e(n,o,o[0].scrollHeight+"px"):e(n,o,"auto")))}),n.$watch(a.collapse,function(t){t?u():c()});var l,s=function(e){return l&&l.cancel(),l=t(o,e),l.then(function(){l=void 0},function(){l=void 0}),l},c=function(){r?(r=!1,i||e(n,o,"auto")):s({height:o[0].scrollHeight+"px"}).then(function(){i||e(n,o,"auto")}),i=!1},u=function(){i=!0,r?(r=!1,e(n,o,0)):(e(n,o,o[0].scrollHeight+"px"),s({height:"0"}))}}}}]),angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse"]).constant("accordionConfig",{closeOthers:!0}).controller("AccordionController",["$scope","$attrs","accordionConfig",function(t,e,n){this.groups=[],this.closeOthers=function(o){var a=angular.isDefined(e.closeOthers)?t.$eval(e.closeOthers):n.closeOthers;a&&angular.forEach(this.groups,function(t){t!==o&&(t.isOpen=!1)})},this.addGroup=function(t){var e=this;this.groups.push(t),t.$on("$destroy",function(){e.removeGroup(t)})},this.removeGroup=function(t){var e=this.groups.indexOf(t);-1!==e&&this.groups.splice(this.groups.indexOf(t),1)}}]).directive("accordion",function(){return{restrict:"EA",controller:"AccordionController",transclude:!0,replace:!1,templateUrl:"template/accordion/accordion.html"}}).directive("accordionGroup",["$parse","$transition","$timeout",function(t){return{require:"^accordion",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/accordion/accordion-group.html",scope:{heading:"@"},controller:["$scope",function(){this.setHeading=function(t){this.heading=t}}],link:function(e,n,o,a){var i,r;a.addGroup(e),e.isOpen=!1,o.isOpen&&(i=t(o.isOpen),r=i.assign,e.$watch(function(){return i(e.$parent)},function(t){e.isOpen=t}),e.isOpen=i?i(e.$parent):!1),e.$watch("isOpen",function(t){t&&a.closeOthers(e),r&&r(e.$parent,t)})}}}]).directive("accordionHeading",function(){return{restrict:"E",transclude:!0,template:"",replace:!0,require:"^accordionGroup",compile:function(t,e,n){return function(t,e,o,a){a.setHeading(n(t,function(){}))}}}}).directive("accordionTransclude",function(){return{require:"^accordionGroup",link:function(t,e,n,o){t.$watch(function(){return o[n.accordionTransclude]},function(t){t&&(e.html(""),e.append(t))})}}}),angular.module("ui.bootstrap.alert",[]).directive("alert",function(){return{restrict:"EA",templateUrl:"template/alert/alert.html",transclude:!0,replace:!0,scope:{type:"=",close:"&"},link:function(t,e,n){t.closeable="close"in n}}}),angular.module("ui.bootstrap.buttons",[]).constant("buttonConfig",{activeClass:"active",toggleEvent:"click"}).directive("btnRadio",["buttonConfig",function(t){var e=t.activeClass||"active",n=t.toggleEvent||"click";return{require:"ngModel",link:function(t,o,a,i){var r=t.$eval(a.btnRadio);t.$watch(function(){return i.$modelValue},function(t){angular.equals(t,r)?o.addClass(e):o.removeClass(e)}),o.bind(n,function(){o.hasClass(e)||t.$apply(function(){i.$setViewValue(r)})})}}}]).directive("btnCheckbox",["buttonConfig",function(t){var e=t.activeClass||"active",n=t.toggleEvent||"click";return{require:"ngModel",link:function(t,o,a,i){var r=t.$eval(a.btnCheckboxTrue),l=t.$eval(a.btnCheckboxFalse);r=angular.isDefined(r)?r:!0,l=angular.isDefined(l)?l:!1,t.$watch(function(){return i.$modelValue},function(t){angular.equals(t,r)?o.addClass(e):o.removeClass(e)}),o.bind(n,function(){t.$apply(function(){i.$setViewValue(o.hasClass(e)?l:r)})})}}}]),angular.module("ui.bootstrap.carousel",["ui.bootstrap.transition"]).controller("CarouselController",["$scope","$timeout","$transition","$q",function(t,e,n){function o(){function n(){i?(t.next(),o()):t.pause()}a&&e.cancel(a);var r=+t.interval;!isNaN(r)&&r>=0&&(a=e(n,r))}var a,i,r=this,l=r.slides=[],s=-1;r.currentSlide=null,r.select=function(a,i){function c(){r.currentSlide&&angular.isString(i)&&!t.noTransition&&a.$element?(a.$element.addClass(i),a.$element[0].offsetWidth=a.$element[0].offsetWidth,angular.forEach(l,function(t){angular.extend(t,{direction:"",entering:!1,leaving:!1,active:!1})}),angular.extend(a,{direction:i,active:!0,entering:!0}),angular.extend(r.currentSlide||{},{direction:i,leaving:!0}),t.$currentTransition=n(a.$element,{}),function(e,n){t.$currentTransition.then(function(){u(e,n)},function(){u(e,n)})}(a,r.currentSlide)):u(a,r.currentSlide),r.currentSlide=a,s=p,o()}function u(e,n){angular.extend(e,{direction:"",active:!0,leaving:!1,entering:!1}),angular.extend(n||{},{direction:"",active:!1,leaving:!1,entering:!1}),t.$currentTransition=null}var p=l.indexOf(a);void 0===i&&(i=p>s?"next":"prev"),a&&a!==r.currentSlide&&(t.$currentTransition?(t.$currentTransition.cancel(),e(c)):c())},r.indexOfSlide=function(t){return l.indexOf(t)},t.next=function(){var t=(s+1)%l.length;return r.select(l[t],"next")},t.prev=function(){var t=0>s-1?l.length-1:s-1;return r.select(l[t],"prev")},t.select=function(t){r.select(t)},t.isActive=function(t){return r.currentSlide===t},t.slides=function(){return l},t.$watch("interval",o),t.play=function(){i||(i=!0,o())},t.pause=function(){i=!1,a&&e.cancel(a)},r.addSlide=function(e,n){e.$element=n,l.push(e),1===l.length||e.active?(r.select(l[l.length-1]),1==l.length&&t.play()):e.active=!1},r.removeSlide=function(t){var e=l.indexOf(t);l.splice(e,1),l.length>0&&t.active&&(e>=l.length?r.select(l[e-1]):r.select(l[e]))}}]).directive("carousel",[function(){return{restrict:"EA",transclude:!0,replace:!0,controller:"CarouselController",require:"carousel",templateUrl:"template/carousel/carousel.html",scope:{interval:"=",noTransition:"="}}}]).directive("slide",[function(){return{require:"^carousel",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/carousel/slide.html",scope:{active:"="},link:function(t,e,n,o){o.addSlide(t,e),t.$on("$destroy",function(){o.removeSlide(t)}),t.$watch("active",function(e){e&&o.select(t)})}}}]);var dialogModule=angular.module("ui.bootstrap.dialog",["ui.bootstrap.transition"]);dialogModule.controller("MessageBoxController",["$scope","dialog","model",function(t,e,n){t.title=n.title,t.message=n.message,t.buttons=n.buttons,t.close=function(t){e.close(t)}}]),dialogModule.provider("$dialog",function(){var t={backdrop:!0,dialogClass:"modal",backdropClass:"modal-backdrop",transitionClass:"fade",triggerClass:"in",dialogOpenClass:"modal-open",resolve:{},backdropFade:!1,dialogFade:!1,keyboard:!0,backdropClick:!0},e={},n={value:0};this.options=function(t){e=t},this.$get=["$http","$document","$compile","$rootScope","$controller","$templateCache","$q","$transition","$injector",function(o,a,i,r,l,s,c,u,p){function d(t){var e=angular.element("<div>");return e.addClass(t),e}function f(n){var o=this,a=this.options=angular.extend({},t,e,n);this._open=!1,this.backdropEl=d(a.backdropClass),a.backdropFade&&(this.backdropEl.addClass(a.transitionClass),this.backdropEl.removeClass(a.triggerClass)),this.modalEl=d(a.dialogClass),a.dialogFade&&(this.modalEl.addClass(a.transitionClass),this.modalEl.removeClass(a.triggerClass)),this.handledEscapeKey=function(t){27===t.which&&(o.close(),t.preventDefault(),o.$scope.$apply())},this.handleBackDropClick=function(t){o.close(),t.preventDefault(),o.$scope.$apply()},this.handleLocationChange=function(){o.close()}}var g=a.find("body");return f.prototype.isOpen=function(){return this._open},f.prototype.open=function(t,e){var n=this,o=this.options;if(t&&(o.templateUrl=t),e&&(o.controller=e),!o.template&&!o.templateUrl)throw Error("Dialog.open expected template or templateUrl, neither found. Use options or open method to specify them.");return this._loadResolves().then(function(t){var e=t.$scope=n.$scope=t.$scope?t.$scope:r.$new();if(n.modalEl.html(t.$template),n.options.controller){var o=l(n.options.controller,t);n.modalEl.children().data("ngControllerController",o)}i(n.modalEl)(e),n._addElementsToDom(),g.addClass(n.options.dialogOpenClass),setTimeout(function(){n.options.dialogFade&&n.modalEl.addClass(n.options.triggerClass),n.options.backdropFade&&n.backdropEl.addClass(n.options.triggerClass)}),n._bindEvents()}),this.deferred=c.defer(),this.deferred.promise},f.prototype.close=function(t){function e(t){t.removeClass(o.options.triggerClass)}function n(){o._open&&o._onCloseComplete(t)}var o=this,a=this._getFadingElements();if(g.removeClass(o.options.dialogOpenClass),a.length>0)for(var i=a.length-1;i>=0;i--)u(a[i],e).then(n);else this._onCloseComplete(t)},f.prototype._getFadingElements=function(){var t=[];return this.options.dialogFade&&t.push(this.modalEl),this.options.backdropFade&&t.push(this.backdropEl),t},f.prototype._bindEvents=function(){this.options.keyboard&&g.bind("keydown",this.handledEscapeKey),this.options.backdrop&&this.options.backdropClick&&this.backdropEl.bind("click",this.handleBackDropClick),this.$scope.$on("$locationChangeSuccess",this.handleLocationChange)},f.prototype._unbindEvents=function(){this.options.keyboard&&g.unbind("keydown",this.handledEscapeKey),this.options.backdrop&&this.options.backdropClick&&this.backdropEl.unbind("click",this.handleBackDropClick)},f.prototype._onCloseComplete=function(t){this._removeElementsFromDom(),this._unbindEvents(),this.deferred.resolve(t)},f.prototype._addElementsToDom=function(){g.append(this.modalEl),this.options.backdrop&&(0===n.value&&g.append(this.backdropEl),n.value++),this._open=!0},f.prototype._removeElementsFromDom=function(){this.modalEl.remove(),this.options.backdrop&&(n.value--,0===n.value&&this.backdropEl.remove()),this._open=!1},f.prototype._loadResolves=function(){var t,e=[],n=[],a=this;return this.options.template?t=c.when(this.options.template):this.options.templateUrl&&(t=o.get(this.options.templateUrl,{cache:s}).then(function(t){return t.data})),angular.forEach(this.options.resolve||[],function(t,o){n.push(o),e.push(angular.isString(t)?p.get(t):p.invoke(t))}),n.push("$template"),e.push(t),c.all(e).then(function(t){var e={};return angular.forEach(t,function(t,o){e[n[o]]=t}),e.dialog=a,e})},{dialog:function(t){return new f(t)},messageBox:function(t,e,n){return new f({templateUrl:"template/dialog/message.html",controller:"MessageBoxController",resolve:{model:function(){return{title:t,message:e,buttons:n}}}})}}}]}),angular.module("ui.bootstrap.dropdownToggle",[]).directive("dropdownToggle",["$document","$location","$window",function(t){var e=null,n=angular.noop;return{restrict:"CA",link:function(o,a){o.$watch("$location.path",function(){n()}),a.parent().bind("click",function(){n()}),a.bind("click",function(o){o.preventDefault(),o.stopPropagation();var i=a===e;e&&n(),i||(a.parent().addClass("open"),e=a,n=function(o){o&&(o.preventDefault(),o.stopPropagation()),t.unbind("click",n),a.parent().removeClass("open"),n=angular.noop,e=null},t.bind("click",n))})}}}]),angular.module("ui.bootstrap.modal",["ui.bootstrap.dialog"]).directive("modal",["$parse","$dialog",function(t,e){return{restrict:"EA",terminal:!0,link:function(n,o,a){var i,r=angular.extend({},n.$eval(a.uiOptions||a.bsOptions||a.options)),l=a.modal||a.show;r=angular.extend(r,{template:o.html(),resolve:{$scope:function(){return n}}});var s=e.dialog(r);o.remove(),i=a.close?function(){t(a.close)(n)}:function(){angular.isFunction(t(l).assign)&&t(l).assign(n,!1)},n.$watch(l,function(t){t?s.open().then(function(){i()}):s.isOpen()&&s.close()})}}}]),angular.module("ui.bootstrap.pagination",[]).constant("paginationConfig",{boundaryLinks:!1,directionLinks:!0,firstText:"First",previousText:"Previous",nextText:"Next",lastText:"Last"}).directive("pagination",["paginationConfig",function(t){return{restrict:"EA",scope:{numPages:"=",currentPage:"=",maxSize:"=",onSelectPage:"&"},templateUrl:"template/pagination/pagination.html",replace:!0,link:function(e,n,o){function a(t,e,n,o){return{number:t,text:e,active:n,disabled:o}}var i=angular.isDefined(o.boundaryLinks)?e.$eval(o.boundaryLinks):t.boundaryLinks,r=angular.isDefined(o.directionLinks)?e.$eval(o.directionLinks):t.directionLinks,l=angular.isDefined(o.firstText)?o.firstText:t.firstText,s=angular.isDefined(o.previousText)?o.previousText:t.previousText,c=angular.isDefined(o.nextText)?o.nextText:t.nextText,u=angular.isDefined(o.lastText)?o.lastText:t.lastText;e.$watch("numPages + currentPage + maxSize",function(){e.pages=[];var t=1,n=e.numPages;e.maxSize&&e.maxSize<e.numPages&&(t=Math.max(e.currentPage-Math.floor(e.maxSize/2),1),n=t+e.maxSize-1,n>e.numPages&&(n=e.numPages,t=n-e.maxSize+1));for(var o=t;n>=o;o++){var p=a(o,o,e.isActive(o),!1);e.pages.push(p)}if(r){var d=a(e.currentPage-1,s,!1,e.noPrevious());e.pages.unshift(d);var f=a(e.currentPage+1,c,!1,e.noNext());e.pages.push(f)}if(i){var g=a(1,l,!1,e.noPrevious());e.pages.unshift(g);var m=a(e.numPages,u,!1,e.noNext());e.pages.push(m)}e.currentPage>e.numPages&&e.selectPage(e.numPages)}),e.noPrevious=function(){return 1===e.currentPage},e.noNext=function(){return e.currentPage===e.numPages},e.isActive=function(t){return e.currentPage===t},e.selectPage=function(t){!e.isActive(t)&&t>0&&e.numPages>=t&&(e.currentPage=t,e.onSelectPage({page:t}))}}}}]),angular.module("ui.bootstrap.position",[]).factory("$position",["$document","$window",function(t,e){function n(t,n){return t.currentStyle?t.currentStyle[n]:e.getComputedStyle?e.getComputedStyle(t)[n]:t.style[n]}function o(t){return"static"===(n(t,"position")||"static")}var a=function(e){for(var n=t[0],a=e.offsetParent||n;a&&a!==n&&o(a);)a=a.offsetParent;return a||n};return{position:function(e){var n=this.offset(e),o={top:0,left:0},i=a(e[0]);return i!=t[0]&&(o=this.offset(angular.element(i)),o.top+=i.clientTop,o.left+=i.clientLeft),{width:e.prop("offsetWidth"),height:e.prop("offsetHeight"),top:n.top-o.top,left:n.left-o.left}},offset:function(n){var o=n[0].getBoundingClientRect();return{width:n.prop("offsetWidth"),height:n.prop("offsetHeight"),top:o.top+(e.pageYOffset||t[0].body.scrollTop),left:o.left+(e.pageXOffset||t[0].body.scrollLeft)}}}}]),angular.module("ui.bootstrap.tooltip",["ui.bootstrap.position"]).provider("$tooltip",function(){function t(t){var e=/[A-Z]/g,n="-";return t.replace(e,function(t,e){return(e?n:"")+t.toLowerCase()})}var e={placement:"top",animation:!0,popupDelay:0},n={mouseenter:"mouseleave",click:"click",focus:"blur"},o={};this.options=function(t){angular.extend(o,t)},this.$get=["$window","$compile","$timeout","$parse","$document","$position",function(a,i,r,l,s,c){return function(a,u,p){function d(t){var e,o;return e=t||f.trigger||p,o=angular.isDefined(f.trigger)?n[f.trigger]||e:n[e]||e,{show:e,hide:o}}var f=angular.extend({},e,o),g=t(a),m=d(void 0),h="<"+g+"-popup "+'title="{{tt_title}}" '+'content="{{tt_content}}" '+'placement="{{tt_placement}}" '+'animation="tt_animation()" '+'is-open="tt_isOpen"'+">"+"</"+g+"-popup>";return{restrict:"EA",scope:!0,link:function(t,e,n){function o(){t.tt_isOpen?g():p()}function p(){t.tt_popupDelay?y=r(v,t.tt_popupDelay):t.$apply(v)}function g(){t.$apply(function(){b()})}function v(){var n,o,a,i;if(t.tt_content){switch($&&r.cancel($),C.css({top:0,left:0,display:"block"}),f.appendToBody?(k=k||s.find("body"),k.append(C)):e.after(C),n=c.position(e),o=C.prop("offsetWidth"),a=C.prop("offsetHeight"),t.tt_placement){case"right":i={top:n.top+n.height/2-a/2+"px",left:n.left+n.width+"px"};break;case"bottom":i={top:n.top+n.height+"px",left:n.left+n.width/2-o/2+"px"};break;case"left":i={top:n.top+n.height/2-a/2+"px",left:n.left-o+"px"};break;default:i={top:n.top-a+"px",left:n.left+n.width/2-o/2+"px"}}C.css(i),t.tt_isOpen=!0}}function b(){t.tt_isOpen=!1,r.cancel(y),angular.isDefined(t.tt_animation)&&t.tt_animation()?$=r(function(){C.remove()},500):C.remove()}var $,y,k,C=i(h)(t);t.tt_isOpen=!1,n.$observe(a,function(e){t.tt_content=e}),n.$observe(u+"Title",function(e){t.tt_title=e}),n.$observe(u+"Placement",function(e){t.tt_placement=angular.isDefined(e)?e:f.placement}),n.$observe(u+"Animation",function(e){t.tt_animation=angular.isDefined(e)?l(e):function(){return f.animation}}),n.$observe(u+"PopupDelay",function(e){var n=parseInt(e,10);t.tt_popupDelay=isNaN(n)?f.popupDelay:n}),n.$observe(u+"Trigger",function(t){e.unbind(m.show),e.unbind(m.hide),m=d(t),m.show===m.hide?e.bind(m.show,o):(e.bind(m.show,p),e.bind(m.hide,g))})}}}}]}).directive("tooltipPopup",function(){return{restrict:"E",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-popup.html"}}).directive("tooltip",["$tooltip",function(t){return t("tooltip","tooltip","mouseenter")}]).directive("tooltipHtmlUnsafePopup",function(){return{restrict:"E",replace:!0,scope:{content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/tooltip/tooltip-html-unsafe-popup.html"}}).directive("tooltipHtmlUnsafe",["$tooltip",function(t){return t("tooltipHtmlUnsafe","tooltip","mouseenter")}]),angular.module("ui.bootstrap.popover",["ui.bootstrap.tooltip"]).directive("popoverPopup",function(){return{restrict:"EA",replace:!0,scope:{title:"@",content:"@",placement:"@",animation:"&",isOpen:"&"},templateUrl:"template/popover/popover.html"}}).directive("popover",["$compile","$timeout","$parse","$window","$tooltip",function(t,e,n,o,a){return a("popover","popover","click")}]),angular.module("ui.bootstrap.progressbar",["ui.bootstrap.transition"]).constant("progressConfig",{animate:!0,autoType:!1,stackedTypes:["success","info","warning","danger"]}).controller("ProgressBarController",["$scope","$attrs","progressConfig",function(t,e,n){function o(t){return r[t]}var a=angular.isDefined(e.animate)?t.$eval(e.animate):n.animate,i=angular.isDefined(e.autoType)?t.$eval(e.autoType):n.autoType,r=angular.isDefined(e.stackedTypes)?t.$eval("["+e.stackedTypes+"]"):n.stackedTypes;this.makeBar=function(t,e,n){var r=angular.isObject(t)?t.value:t||0,l=angular.isObject(e)?e.value:e||0,s=angular.isObject(t)&&angular.isDefined(t.type)?t.type:i?o(n||0):null;return{from:l,to:r,type:s,animate:a}},this.addBar=function(e){t.bars.push(e),t.totalPercent+=e.to},this.clearBars=function(){t.bars=[],t.totalPercent=0},this.clearBars()}]).directive("progress",function(){return{restrict:"EA",replace:!0,controller:"ProgressBarController",scope:{value:"=",onFull:"&",onEmpty:"&"},templateUrl:"template/progressbar/progress.html",link:function(t,e,n,o){t.$watch("value",function(t,e){if(o.clearBars(),angular.isArray(t))for(var n=0,a=t.length;a>n;n++)o.addBar(o.makeBar(t[n],e[n],n));else o.addBar(o.makeBar(t,e))},!0),t.$watch("totalPercent",function(e){e>=100?t.onFull():0>=e&&t.onEmpty()},!0)}}}).directive("progressbar",["$transition",function(t){return{restrict:"EA",replace:!0,scope:{width:"=",old:"=",type:"=",animate:"="},templateUrl:"template/progressbar/bar.html",link:function(e,n){e.$watch("width",function(o){e.animate?(n.css("width",e.old+"%"),t(n,{width:o+"%"})):n.css("width",o+"%")})}}}]),angular.module("ui.bootstrap.rating",[]).constant("ratingConfig",{max:5}).directive("rating",["ratingConfig","$parse",function(t,e){return{restrict:"EA",scope:{value:"="},templateUrl:"template/rating/rating.html",replace:!0,link:function(n,o,a){var i=angular.isDefined(a.max)?n.$eval(a.max):t.max;n.range=[];for(var r=1;i>=r;r++)n.range.push(r);n.rate=function(t){n.readonly||(n.value=t)},n.enter=function(t){n.readonly||(n.val=t)},n.reset=function(){n.val=angular.copy(n.value)},n.reset(),n.$watch("value",function(t){n.val=t}),n.readonly=!1,a.readonly&&n.$parent.$watch(e(a.readonly),function(t){n.readonly=!!t})}}}]),angular.module("ui.bootstrap.tabs",[]).controller("TabsController",["$scope","$element",function(t){var e=t.panes=[];this.select=t.select=function(t){angular.forEach(e,function(t){t.selected=!1}),t.selected=!0},this.addPane=function(n){e.length||t.select(n),e.push(n)},this.removePane=function(n){var o=e.indexOf(n);e.splice(o,1),n.selected&&e.length>0&&t.select(e[e.length>o?o:o-1])}}]).directive("tabs",function(){return{restrict:"EA",transclude:!0,scope:{},controller:"TabsController",templateUrl:"template/tabs/tabs.html",replace:!0}}).directive("pane",["$parse",function(t){return{require:"^tabs",restrict:"EA",transclude:!0,scope:{heading:"@"},link:function(e,n,o,a){var i,r;e.selected=!1,o.active&&(i=t(o.active),r=i.assign,e.$watch(function(){return i(e.$parent)},function(t){e.selected=t}),e.selected=i?i(e.$parent):!1),e.$watch("selected",function(t){t&&a.select(e),r&&r(e.$parent,t)}),a.addPane(e),e.$on("$destroy",function(){a.removePane(e)})},templateUrl:"template/tabs/pane.html",replace:!0}}]),angular.module("ui.bootstrap.typeahead",["ui.bootstrap.position"]).factory("typeaheadParser",["$parse",function(t){var e=/^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;return{parse:function(n){var o=n.match(e);if(!o)throw Error("Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_' but got '"+n+"'.");return{itemName:o[3],source:t(o[4]),viewMapper:t(o[2]||o[1]),modelMapper:t(o[1])}}}}]).directive("typeahead",["$compile","$parse","$q","$document","$position","typeaheadParser",function(t,e,n,o,a,i){var r=[9,13,27,38,40];return{require:"ngModel",link:function(l,s,c,u){var p,d=l.$eval(c.typeaheadMinLength)||1,f=i.parse(c.typeahead),g=l.$eval(c.typeaheadEditable)!==!1,m=e(c.typeaheadLoading).assign||angular.noop,h=angular.element("<typeahead-popup matches='matches' active='activeIdx' select='select(activeIdx)' query='query' position='position'></typeahead-popup>"),v=l.$new();l.$on("$destroy",function(){v.$destroy()});var b=function(){v.matches=[],v.activeIdx=-1},$=function(t){var e={$viewValue:t};m(l,!0),n.when(f.source(v,e)).then(function(n){if(t===u.$viewValue){if(n.length>0){v.activeIdx=0,v.matches.length=0;for(var o=0;n.length>o;o++)e[f.itemName]=n[o],v.matches.push({label:f.viewMapper(v,e),model:n[o]});v.query=t,v.position=a.position(s),v.position.top=v.position.top+s.prop("offsetHeight")}else b();m(l,!1)}},function(){b(),m(l,!1)})};b(),v.query=void 0,u.$parsers.push(function(t){return b(),p?t:(t&&t.length>=d&&$(t),g?t:void 0)}),u.$render=function(){var t={};t[f.itemName]=p||u.$viewValue,s.val(f.viewMapper(v,t)||u.$viewValue),p=void 0},v.select=function(t){var e={};e[f.itemName]=p=v.matches[t].model,u.$setViewValue(f.modelMapper(v,e)),u.$render()},s.bind("keydown",function(t){0!==v.matches.length&&-1!==r.indexOf(t.which)&&(t.preventDefault(),40===t.which?(v.activeIdx=(v.activeIdx+1)%v.matches.length,v.$digest()):38===t.which?(v.activeIdx=(v.activeIdx?v.activeIdx:v.matches.length)-1,v.$digest()):13===t.which||9===t.which?v.$apply(function(){v.select(v.activeIdx)}):27===t.which&&(t.stopPropagation(),b(),v.$digest()))}),o.bind("click",function(){b(),v.$digest()}),s.after(t(h)(v))}}}]).directive("typeaheadPopup",function(){return{restrict:"E",scope:{matches:"=",query:"=",active:"=",position:"=",select:"&"},replace:!0,templateUrl:"template/typeahead/typeahead.html",link:function(t){t.isOpen=function(){return t.matches.length>0},t.isActive=function(e){return t.active==e},t.selectActive=function(e){t.active=e},t.selectMatch=function(e){t.select({activeIdx:e})}}}}).filter("typeaheadHighlight",function(){function t(t){return t.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}return function(e,n){return n?e.replace(RegExp(t(n),"gi"),"<strong>$&</strong>"):n}}),angular.module("template/accordion/accordion-group.html",[]).run(["$templateCache",function(t){t.put("template/accordion/accordion-group.html",'<div class="accordion-group">\n  <div class="accordion-heading" ><a class="accordion-toggle" ng-click="isOpen = !isOpen" accordion-transclude="heading">{{heading}}</a></div>\n  <div class="accordion-body" collapse="!isOpen">\n    <div class="accordion-inner" ng-transclude></div>  </div>\n</div>')}]),angular.module("template/accordion/accordion.html",[]).run(["$templateCache",function(t){t.put("template/accordion/accordion.html",'<div class="accordion" ng-transclude></div>')}]),angular.module("template/alert/alert.html",[]).run(["$templateCache",function(t){t.put("template/alert/alert.html","<div class='alert' ng-class='type && \"alert-\" + type'>\n    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n    <div ng-transclude></div>\n</div>\n")}]),angular.module("template/carousel/carousel.html",[]).run(["$templateCache",function(t){t.put("template/carousel/carousel.html",'<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel">\n    <ol class="carousel-indicators" ng-show="slides().length > 1">\n        <li ng-repeat="slide in slides()" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a ng-click="prev()" class="carousel-control left" ng-show="slides().length > 1">&lsaquo;</a>\n    <a ng-click="next()" class="carousel-control right" ng-show="slides().length > 1">&rsaquo;</a>\n</div>\n')}]),angular.module("template/carousel/slide.html",[]).run(["$templateCache",function(t){t.put("template/carousel/slide.html","<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item\" ng-transclude></div>\n")}]),angular.module("template/dialog/message.html",[]).run(["$templateCache",function(t){t.put("template/dialog/message.html",'<div class="modal-header">\n	<h1>{{ title }}</h1>\n</div>\n<div class="modal-body">\n	<p>{{ message }}</p>\n</div>\n<div class="modal-footer">\n	<button ng-repeat="btn in buttons" ng-click="close(btn.result)" class=btn ng-class="btn.cssClass">{{ btn.label }}</button>\n</div>\n')}]),angular.module("template/pagination/pagination.html",[]).run(["$templateCache",function(t){t.put("template/pagination/pagination.html",'<div class="pagination"><ul>\n  <li ng-repeat="page in pages" ng-class="{active: page.active, disabled: page.disabled}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  </ul>\n</div>\n')}]),angular.module("template/tooltip/tooltip-html-unsafe-popup.html",[]).run(["$templateCache",function(t){t.put("template/tooltip/tooltip-html-unsafe-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind-html-unsafe="content"></div>\n</div>\n')}]),angular.module("template/tooltip/tooltip-popup.html",[]).run(["$templateCache",function(t){t.put("template/tooltip/tooltip-popup.html",'<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n')}]),angular.module("template/popover/popover.html",[]).run(["$templateCache",function(t){t.put("template/popover/popover.html",'<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n')}]),angular.module("template/progressbar/bar.html",[]).run(["$templateCache",function(t){t.put("template/progressbar/bar.html",'<div class="bar" ng-class=\'type && "bar-" + type\'></div>')}]),angular.module("template/progressbar/progress.html",[]).run(["$templateCache",function(t){t.put("template/progressbar/progress.html",'<div class="progress"><progressbar ng-repeat="bar in bars" width="bar.to" old="bar.from" animate="bar.animate" type="bar.type"></progressbar></div>')}]),angular.module("template/rating/rating.html",[]).run(["$templateCache",function(t){t.put("template/rating/rating.html",'<span ng-mouseleave="reset()">\n	<i ng-repeat="number in range" ng-mouseenter="enter(number)" ng-click="rate(number)" ng-class="{\'icon-star\': number <= val, \'icon-star-empty\': number > val}"></i>\n</span>\n')}]),angular.module("template/tabs/pane.html",[]).run(["$templateCache",function(t){t.put("template/tabs/pane.html",'<div class="tab-pane" ng-class="{active: selected}" ng-show="selected" ng-transclude></div>\n')}]),angular.module("template/tabs/tabs.html",[]).run(["$templateCache",function(t){t.put("template/tabs/tabs.html",'<div class="tabbable">\n  <ul class="nav nav-tabs">\n    <li ng-repeat="pane in panes" ng-class="{active:pane.selected}">\n      <a ng-click="select(pane)">{{pane.heading}}</a>\n    </li>\n  </ul>\n  <div class="tab-content" ng-transclude></div>\n</div>\n')}]),angular.module("template/typeahead/match.html",[]).run(["$templateCache",function(t){t.put("template/typeahead/match.html",'<a tabindex="-1" ng-bind-html-unsafe="match.label | typeaheadHighlight:query"></a>')}]),angular.module("template/typeahead/typeahead.html",[]).run(["$templateCache",function(t){t.put("template/typeahead/typeahead.html",'<ul class="typeahead dropdown-menu" ng-style="{display: isOpen()&&\'block\' || \'none\', top: position.top+\'px\', left: position.left+\'px\'}">\n    <li ng-repeat="match in matches" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)">\n        <a tabindex="-1" ng-click="selectMatch($index)" ng-bind-html-unsafe="match.label | typeaheadHighlight:query"></a>\n    </li>\n</ul>')}]);
angular.module("placeholders",["placeholders.img","placeholders.txt"]),angular.module("placeholders.img",[]).directive("phImg",function(){return{restrict:"A",scope:{dimensions:"@phImg"},link:function(e,t,n){function s(){var t=[e.size.h,e.size.w].sort(),n=Math.round(t[1]/16);return Math.max(i.text_size,n)}function o(){r=r||document.createElement("canvas");var t=r.getContext("2d"),n,o;return r.width=e.size.w,r.height=e.size.h,t.fillStyle=i.fill_color,t.fillRect(0,0,e.size.w,e.size.h),n=s(),o=e.dimensions,t.fillStyle=i.text_color,t.textAlign="center",t.textBaseline="middle",t.font="bold "+n+"pt sans-serif",t.measureText(o).width/e.size.w>1&&(n=i.text_size/(t.measureText(o).width/e.size.w),t.font="bold "+n+"pt sans-serif"),t.fillText(e.dimensions,e.size.w/2,e.size.h/2),r.toDataURL("image/png")}var r,i={text_size:10,fill_color:"#EEEEEE",text_color:"#AAAAAA"};e.$watch("dimensions",function(){if(!angular.isDefined(e.dimensions))return;var n=e.dimensions.match(/^(\d+)x(\d+)$/),r;if(!n){console.error("Expected '000x000'. Got "+e.dimensions);return}e.size={w:n[1],h:n[2]},t.prop("title",e.dimensions),t.prop("alt",e.dimensions),r=o(),t.prop("tagName")==="IMG"?t.prop("src",r):t.css("background-image",'url("'+r+'")')})}}}),angular.module("placeholders.txt",[]).factory("TextGeneratorService",function(){function t(e,t){return Math.floor(Math.random()*(t-e+1))+e}var e=["lorem","ipsum","dolor","sit","amet,","consectetur","adipiscing","elit","ut","aliquam,","purus","sit","amet","luctus","venenatis,","lectus","magna","fringilla","urna,","porttitor","rhoncus","dolor","purus","non","enim","praesent","elementum","facilisis","leo,","vel","fringilla","est","ullamcorper","eget","nulla","facilisi","etiam","dignissim","diam","quis","enim","lobortis","scelerisque","fermentum","dui","faucibus","in","ornare","quam","viverra","orci","sagittis","eu","volutpat","odio","facilisis","mauris","sit","amet","massa","vitae","tortor","condimentum","lacinia","quis","vel","eros","donec","ac","odio","tempor","orci","dapibus","ultrices","in","iaculis","nunc","sed","augue","lacus,","viverra","vitae","congue","eu,","consequat","ac","felis","donec","et","odio","pellentesque","diam","volutpat","commodo","sed","egestas","egestas","fringilla","phasellus","faucibus","scelerisque","eleifend","donec","pretium","vulputate","sapien","nec","sagittis","aliquam","malesuada","bibendum","arcu","vitae","elementum","curabitur","vitae","nunc","sed","velit","dignissim","sodales","ut","eu","sem","integer","vitae","justo","eget","magna","fermentum","iaculis","eu","non","diam","phasellus","vestibulum","lorem","sed","risus","ultricies","tristique","nulla","aliquet","enim","tortor,","at","auctor","urna","nunc","id","cursus","metus","aliquam","eleifend","mi","in","nulla","posuere","sollicitudin","aliquam","ultrices","sagittis","orci,","a","scelerisque","purus","semper","eget","duis","at","tellus","at","urna","condimentum","mattis","pellentesque","id","nibh","tortor,","id","aliquet","lectus","proin","nibh","nisl,","condimentum","id","venenatis","a,","condimentum","vitae","sapien","pellentesque","habitant","morbi","tristique","senectus","et","netus","et","malesuada","fames","ac","turpis","egestas","sed","tempus,","urna","et","pharetra","pharetra,","massa","massa","ultricies","mi,","quis","hendrerit","dolor","magna","eget","est","lorem","ipsum","dolor","sit","amet,","consectetur","adipiscing","elit","pellentesque","habitant","morbi","tristique","senectus","et","netus","et","malesuada","fames","ac","turpis","egestas","integer","eget","aliquet","nibh","praesent","tristique","magna","sit","amet","purus","gravida","quis","blandit","turpis","cursus","in","hac","habitasse","platea","dictumst","quisque","sagittis,","purus","sit","amet","volutpat","consequat,","mauris","nunc","congue","nisi,","vitae","suscipit","tellus","mauris","a","diam","maecenas","sed","enim","ut","sem","viverra","aliquet","eget","sit","amet","tellus","cras","adipiscing","enim","eu","turpis","egestas","pretium","aenean","pharetra,","magna","ac","placerat","vestibulum,","lectus","mauris","ultrices","eros,","in","cursus","turpis","massa","tincidunt","dui","ut","ornare","lectus","sit","amet","est","placerat","in","egestas","erat","imperdiet","sed","euismod","nisi","porta","lorem","mollis","aliquam","ut","porttitor","leo","a","diam","sollicitudin","tempor","id","eu","nisl","nunc","mi","ipsum,","faucibus","vitae","aliquet","nec,","ullamcorper","sit","amet","risus","nullam","eget","felis","eget","nunc","lobortis","mattis","aliquam","faucibus","purus","in","massa","tempor","nec","feugiat","nisl","pretium","fusce","id","velit","ut","tortor","pretium","viverra","suspendisse","potenti","nullam","ac","tortor","vitae","purus","faucibus","ornare","suspendisse","sed","nisi","lacus,","sed","viverra","tellus","in","hac","habitasse","platea","dictumst","vestibulum","rhoncus","est","pellentesque","elit","ullamcorper","dignissim","cras","tincidunt","lobortis","feugiat","vivamus","at","augue","eget","arcu","dictum","varius","duis","at","consectetur","lorem","donec","massa","sapien,","faucibus","et","molestie","ac,","feugiat","sed","lectus","vestibulum","mattis","ullamcorper","velit","sed","ullamcorper","morbi","tincidunt","ornare","massa,","eget","egestas","purus","viverra","accumsan","in","nisl","nisi,","scelerisque","eu","ultrices","vitae,","auctor","eu","augue","ut","lectus","arcu,","bibendum","at","varius","vel,","pharetra","vel","turpis","nunc","eget","lorem","dolor,","sed","viverra","ipsum","nunc","aliquet","bibendum","enim,","facilisis","gravida","neque","convallis","a","cras","semper","auctor","neque,","vitae","tempus","quam","pellentesque","nec","nam","aliquam","sem","et","tortor","consequat","id","porta","nibh","venenatis","cras","sed","felis","eget","velit","aliquet","sagittis","id","consectetur","purus","ut","faucibus","pulvinar","elementum","integer","enim","neque,","volutpat","ac","tincidunt","vitae,","semper","quis","lectus","nulla","at","volutpat","diam","ut","venenatis","tellus","in","metus","vulputate","eu","scelerisque","felis","imperdiet","proin","fermentum","leo","vel","orci","porta","non","pulvinar","neque","laoreet","suspendisse","interdum","consectetur","libero,","id","faucibus","nisl","tincidunt","eget","nullam","non","nisi","est,","sit","amet","facilisis","magna","etiam","tempor,","orci","eu","lobortis","elementum,","nibh","tellus","molestie","nunc,","non","blandit","massa","enim","nec","dui","nunc","mattis","enim","ut","tellus","elementum","sagittis","vitae","et","leo","duis","ut","diam","quam","nulla","porttitor","massa","id","neque","aliquam","vestibulum","morbi","blandit","cursus","risus,","at","ultrices","mi","tempus","imperdiet","nulla","malesuada","pellentesque","elit","eget","gravida","cum","sociis","natoque","penatibus","et","magnis","dis","parturient","montes,","nascetur","ridiculus","mus","mauris","vitae","ultricies","leo","integer","malesuada","nunc","vel","risus","commodo","viverra","maecenas","accumsan,","lacus","vel","facilisis","volutpat,","est","velit","egestas","dui,","id","ornare","arcu","odio","ut","sem","nulla","pharetra","diam","sit","amet","nisl","suscipit","adipiscing","bibendum","est","ultricies","integer","quis","auctor","elit","sed","vulputate","mi","sit","amet","mauris","commodo","quis","imperdiet","massa","tincidunt","nunc","pulvinar","sapien","et","ligula","ullamcorper","malesuada","proin","libero","nunc,","consequat","interdum","varius","sit","amet,","mattis","vulputate","enim","nulla","aliquet","porttitor","lacus,","luctus","accumsan","tortor","posuere","ac","ut","consequat","semper","viverra","nam","libero","justo,","laoreet","sit","amet","cursus","sit","amet,","dictum","sit","amet","justo","donec","enim","diam,","vulputate","ut","pharetra","sit","amet,","aliquam","id","diam","maecenas","ultricies","mi","eget","mauris","pharetra","et","ultrices","neque","ornare","aenean","euismod","elementum","nisi,","quis","eleifend","quam","adipiscing","vitae","proin","sagittis,","nisl","rhoncus","mattis","rhoncus,","urna","neque","viverra","justo,","nec","ultrices","dui","sapien","eget","mi","proin","sed","libero","enim,","sed","faucibus","turpis","in","eu","mi","bibendum","neque","egestas","congue","quisque","egestas","diam","in","arcu","cursus","euismod","quis","viverra","nibh","cras","pulvinar","mattis","nunc,","sed","blandit","libero","volutpat","sed","cras","ornare","arcu","dui","vivamus","arcu","felis,","bibendum","ut","tristique","et,","egestas","quis","ipsum","suspendisse","ultrices","fusce","ut","placerat","orci","nulla","pellentesque","dignissim","enim,","sit","amet","venenatis","urna","cursus","eget","nunc","scelerisque","viverra","mauris,","in","aliquam","sem","fringilla","ut","morbi","tincidunt","augue","interdum","velit","euismod","in","pellentesque","massa","placerat","duis","ultricies","lacus","sed","turpis","tincidunt","id","aliquet","risus","feugiat","in","ante","metus,","dictum","at","tempor","commodo,","ullamcorper","a","lacus","vestibulum","sed","arcu","non","odio","euismod","lacinia","at","quis","risus","sed","vulputate","odio","ut","enim","blandit","volutpat","maecenas","volutpat","blandit","aliquam","etiam","erat","velit,","scelerisque","in","dictum","non,","consectetur","a","erat","nam","at","lectus","urna","duis","convallis","convallis","tellus,","id","interdum","velit","laoreet","id","donec","ultrices","tincidunt","arcu,","non","sodales","neque","sodales","ut","etiam","sit","amet","nisl","purus,","in","mollis","nunc","sed","id","semper","risus","in","hendrerit","gravida","rutrum","quisque","non","tellus","orci,","ac","auctor","augue","mauris","augue","neque,","gravida","in","fermentum","et,","sollicitudin","ac","orci","phasellus","egestas","tellus","rutrum","tellus","pellentesque","eu","tincidunt","tortor","aliquam","nulla","facilisi","cras","fermentum,","odio","eu","feugiat","pretium,","nibh","ipsum","consequat","nisl,","vel","pretium","lectus","quam","id","leo","in","vitae","turpis","massa","sed","elementum","tempus","egestas","sed","sed","risus","pretium","quam","vulputate","dignissim","suspendisse","in","est","ante","in","nibh","mauris,","cursus","mattis","molestie","a,","iaculis","at","erat","pellentesque","adipiscing","commodo","elit,","at","imperdiet","dui","accumsan","sit","amet","nulla","facilisi","morbi","tempus","iaculis","urna,","id","volutpat","lacus","laoreet","non","curabitur","gravida","arcu","ac","tortor","dignissim","convallis","aenean","et","tortor","at","risus","viverra","adipiscing","at","in","tellus","integer","feugiat","scelerisque","varius","morbi","enim","nunc,","faucibus","a","pellentesque","sit","amet,","porttitor","eget","dolor","morbi","non","arcu","risus,","quis","varius","quam","quisque","id","diam","vel","quam","elementum","pulvinar","etiam","non","quam","lacus","suspendisse","faucibus","interdum","posuere","lorem","ipsum","dolor","sit","amet,","consectetur","adipiscing","elit","duis","tristique","sollicitudin","nibh","sit","amet","commodo","nulla","facilisi","nullam","vehicula","ipsum","a","arcu","cursus","vitae","congue","mauris","rhoncus","aenean","vel","elit","scelerisque","mauris","pellentesque","pulvinar","pellentesque","habitant","morbi","tristique","senectus","et","netus","et","malesuada","fames","ac","turpis","egestas","maecenas","pharetra","convallis","posuere","morbi","leo","urna,","molestie","at","elementum","eu,","facilisis","sed","odio","morbi","quis","commodo","odio","aenean","sed","adipiscing","diam","donec","adipiscing","tristique","risus","nec","feugiat","in","fermentum","posuere","urna","nec","tincidunt","praesent","semper","feugiat","nibh","sed","pulvinar","proin","gravida","hendrerit","lectus","a","molestie","gravida","dictum"];return{createSentence:function(n){var r,i;return n=n||t(5,20),r=t(0,e.length-n-1),i=e.slice(r,r+n).join(" ").replace(/\,$/g,"")+".",i=i.charAt(0).toUpperCase()+i.slice(1),i},createSentences:function(e){var n=[],r=0;e=e||t(3,5);for(r=0;r<e;r++)n.push(this.createSentence());return n.join(" ")},createParagraph:function(e){var t=this.createSentences(e);return"<p>"+t+"</p>"},createParagraphs:function(e,n){var r=[],i=0;e=e||t(3,7);for(i=0;i<e;i++)r.push(this.createParagraph(n));return r.join("\n")}}}).directive("phTxt",["TextGeneratorService",function(e){return{restrict:"EA",controller:["$scope","$element","$attrs",function(t,n,r){function o(){var t;s||!i?t=e.createParagraphs(s,i):t=e.createSentences(i),n.html(t)}var i,s;r.$observe("phTxt",function(e){var t,n;t=e.match(/(\d+)p/),n=e.match(/(\d+)s/),t!==null?s=parseInt(t[1],10):s=!1,n!==null?i=parseInt(n[1],10):i=!1,o()}),r.phTxt||o()}]}}]);
/**
 * Set a $uiRoute boolean to see if the current route matches
 */
angular.module('ui.route', []).directive('uiRoute', ['$location', '$parse', function ($location, $parse) {
  return {
    restrict: 'AC',
    scope: true,
    compile: function(tElement, tAttrs) {
      var useProperty;
      if (tAttrs.uiRoute) {
        useProperty = 'uiRoute';
      } else if (tAttrs.ngHref) {
        useProperty = 'ngHref';
      } else if (tAttrs.href) {
        useProperty = 'href';
      } else {
        throw new Error('uiRoute missing a route or href property on ' + tElement[0]);
      }
      return function ($scope, elm, attrs) {
        var modelSetter = $parse(attrs.ngModel || attrs.routeModel || '$uiRoute').assign;
        var watcher = angular.noop;

        // Used by href and ngHref
        function staticWatcher(newVal) {
          if ((hash = newVal.indexOf('#')) > -1){
            newVal = newVal.substr(hash + 1);
          }
          watcher = function watchHref() {
            modelSetter($scope, ($location.path().indexOf(newVal) > -1));
          };
          watcher();
        }
        // Used by uiRoute
        function regexWatcher(newVal) {
          if ((hash = newVal.indexOf('#')) > -1){
            newVal = newVal.substr(hash + 1);
          }
          watcher = function watchRegex() {
            var regexp = new RegExp('^' + newVal + '$', ['i']);
            modelSetter($scope, regexp.test($location.path()));
          };
          watcher();
        }

        switch (useProperty) {
          case 'uiRoute':
            // if uiRoute={{}} this will be undefined, otherwise it will have a value and $observe() never gets triggered
            if (attrs.uiRoute){
              regexWatcher(attrs.uiRoute);
            }else{
              attrs.$observe('uiRoute', regexWatcher);
            }
            break;
          case 'ngHref':
            // Setup watcher() every time ngHref changes
            if (attrs.ngHref){
              staticWatcher(attrs.ngHref);
            }else{
              attrs.$observe('ngHref', staticWatcher);
            }
            break;
          case 'href':
            // Setup watcher()
            staticWatcher(attrs.href);
        }

        $scope.$on('$routeChangeSuccess', function(){
          watcher();
        });
		
        //Added for compatibility with ui-router
        $scope.$on('$stateChangeSuccess', function(){
          watcher();
        });
      };
    }
  };
}]);

/*
 AngularJS v1.0.7
 (c) 2010-2012 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(m,f,l){'use strict';f.module("ngCookies",["ng"]).factory("$cookies",["$rootScope","$browser",function(d,b){var c={},g={},h,i=!1,j=f.copy,k=f.isUndefined;b.addPollFn(function(){var a=b.cookies();h!=a&&(h=a,j(a,g),j(a,c),i&&d.$apply())})();i=!0;d.$watch(function(){var a,e,d;for(a in g)k(c[a])&&b.cookies(a,l);for(a in c)e=c[a],f.isString(e)?e!==g[a]&&(b.cookies(a,e),d=!0):f.isDefined(g[a])?c[a]=g[a]:delete c[a];if(d)for(a in e=b.cookies(),c)c[a]!==e[a]&&(k(e[a])?delete c[a]:c[a]=e[a])});return c}]).factory("$cookieStore",
["$cookies",function(d){return{get:function(b){return(b=d[b])?f.fromJson(b):b},put:function(b,c){d[b]=f.toJson(c)},remove:function(b){delete d[b]}}}])})(window,window.angular);

})( window, window.angular );
