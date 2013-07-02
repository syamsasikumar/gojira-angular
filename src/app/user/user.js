angular.module( 'gojira.user', [
  'ngCookies',
  'templates-app',
  'templates-component',
  'ui.bootstrap',
  'Auth',
  'Conf'
])
.controller( 'UserCtrl', function UserCtrl ( $scope, AuthService, ApiConfigService, $http,  $cookies ) {
  $scope.name = "";
  $scope.pass = "";
  $scope.rName = "";
  $scope.rPass = "";
  $scope.rcPass = "";
  $scope.isCollapsed = true;
  $scope.conf = ApiConfigService.getConf();
  $scope.login = function(name, pass){
    $http({
      url:$scope.conf.url.users + '/login?' + 'name=' + name + '&pass=' + pass, 
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }).
    success(function(data, status) {
      if(data.code == 0){
        $cookies.sid = data._id;
      }
    }).
    error(function(data, status) {
      console.log(data);
    });
    console.log('Clicked login ');
  };
  $scope.register = function(name, pass, cpass){
    $http({
      url:$scope.conf.url.users + '/register?' + 'name=' + name + '&pass=' + pass + '&cpass=' + cpass, 
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }).
    success(function(data, status) {
      if(data.code == 0){
        $cookies.sid = data._id;
      }
    }).
    error(function(data, status) {
      console.log(data);
    });
    console.log('clicked register');
  };  
  $scope.toggleUser = function(){
    $scope.isCollapsed = !$scope.isCollapsed;
    console.log('here');
  }
  $scope.$watch( AuthService.isLoggedIn, function(isLoggedIn){
    $scope.user = AuthService.getUser();
    $scope.userContent = (isLoggedIn)? "user/user.tpl.html":"user/anon.tpl.html";
  });
})

;