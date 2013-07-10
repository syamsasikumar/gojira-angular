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

