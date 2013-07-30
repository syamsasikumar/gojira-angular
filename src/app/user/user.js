angular.module( 'gojira.user', [
  'ngCookies',
  'templates-app',
  'templates-component',
  'ui.bootstrap',
  'Auth',
  'Conf',
  'Alerts',
  'Rating',
  'List'
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
.controller( 'AuthCtrl', function AuthCtrl ( $scope, $rootScope, $location, $http, $dialog, AlertsService, RatingService, AuthService, ApiConfigService) {

  $scope.dialogOpts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: 'user/anon.tpl.html',
    controller: 'LoginBoxCtrl',
    dialogFade: true
  };

  /**
  * init to be called on page load
  */
  $scope.init = function(){
    $scope.conf = ApiConfigService.getConf();
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
            ListService.getAllLists($scope.conf.url.users, user._id, function(lists){
              user.lists = lists || {};
              AuthService.setUser(user, true);
              AlertsService.setAlert('info', 'Login successful ');
              $scope.close();
            });
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
      $scope.userIcon = (isLoggedIn)? 'icon-signout':'icon-unlock';
      $scope.userText = (isLoggedIn)? ('Logout ' + AuthService.getUser().name) : 'Login / Register';
      $rootScope.user = AuthService.getUser();
    });
  };

  /**
  * Toggle login/ logout UI
  */
  $scope.toggleUser = function(){
    AlertsService.clearAlert();
    if(!AuthService.isLoggedIn()){
      $scope.openLoginBox();
    }else{
      AuthService.logout();
      $location.path('/');
      AlertsService.setAlert('info', 'Logout successful ');
    }
  };

$scope.openLoginBox = function(){
    var d = $dialog.dialog($scope.dialogOpts);
    d.open().then(function(result){
    });
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
})
/**
* Controller for loginbox
*/
.controller( 'LoginBoxCtrl', function LoginBoxCtrl ( $scope, $http, dialog, AlertsService, RatingService, ListService, AuthService, ApiConfigService) {
  $scope.name = '';
  $scope.pass = '';
  $scope.rName = '';
  $scope.rPass = '';
  $scope.rcPass = '';
  $scope.isCollapsed = true;
  $scope.conf = ApiConfigService.getConf();

   $scope.close = function(){
      dialog.close();
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
        RatingService.getRatings($scope.conf.url.users, user._id, function(ratings){
          user.ratings = ratings || {};
          ListService.getAllLists($scope.conf.url.users, user._id, function(lists){
            user.lists = lists || {};
            AuthService.setUser(user, true);
            AlertsService.setAlert('info', 'Login successful ');
            $scope.close();
          });
        });
      }else{
        AlertsService.setAlert('error', userData.status);
        $scope.close();
      }
    }).
    error(function(userData, status) {
      AlertsService.setAlert('error', 'Login Failed');
      console.log(userData);
      $scope.close();
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
        AuthService.setUser(userData, true);
        AlertsService.setAlert('info', 'Registration successful ');
        $scope.close();
      }else{
        AlertsService.setAlert('error', userData.status);
        $scope.close();
      }
    }).
    error(function(userData, status) {
      AlertsService.setAlert('error', 'Registration error');
      console.log(userData);
      $scope.close();
    });
  };
  /**
  * Function to detect enter key
  */
  $scope.keypress = function(form, event){
    if(event.keyCode == 13){
      if(form == 'login'){
        $scope.login($scope.name, $scope.pass);
      }else{
        $scope.register($scope.rName, $scope.rPass, $scope.rcPass)
      }
    }
  }
})
;

