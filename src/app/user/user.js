angular.module( 'gojira.user', [
  'ngCookies',
  'templates-app',
  'templates-component',
  'ui.bootstrap',
  'Auth',
  'Conf',
  'Alerts'
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
.controller( 'AuthCtrl', function AuthCtrl ( $scope, $rootScope, AuthService, ApiConfigService, $http,  $cookies, AlertsService) {
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
    if(AuthService.getUserCookie() && !AuthService.getUser()){
      $http({
        url:$scope.conf.url.users + '/' + AuthService.getUserCookie(), 
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(data, status) {
        if(data.code == 0){
          AuthService.setUser(data);
          AlertsService.setAlert('info', 'Logged in as ' + data.name);
        }else{
          AlertsService.setAlert('error', 'Login failed');
        }
      }).
      error(function(data, status) {
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
    $http({
      url:$scope.conf.url.users + '/login', 
      method: 'POST',
      data: {name: name, pass:pass},
      headers: { 'Content-Type': 'application/json; charset=UTF-8'}
    }).
    success(function(userData, status) {
      if(userData.code == 0){
        $scope.isCollapsed = true;
        AuthService.setUser(userData);
        AlertsService.setAlert('info', 'Login successful ');
      }else{
        AlertsService.setAlert('error', data.status);
      }
    }).
    error(function(data, status) {
      AlertsService.setAlert('error', 'Login Failed');
      console.log(data);
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
    success(function(data, status) {
      if(data.code == 0){
        $scope.isCollapsed = true;
        AuthService.setUser(data);
        AlertsService.setAlert('info', 'Registration successful ');
      }else{
        AlertsService.setAlert('error', data.status);
      }
    }).
    error(function(data, status) {
      AlertsService.setAlert('error', 'Registration error');
      console.log(data);
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

