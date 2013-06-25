angular.module( 'gojira.user', [
  'templates-app',
  'templates-component',
  'ui.bootstrap',
  'Auth'
])
.controller( 'UserCtrl', function UserCtrl ( $scope, AuthService ) {
	$scope.isCollapsed = true;
	$scope.login = function(){
		console.log('Clicked login');
	};
	$scope.register = function(){
		console.log('Clicked register');
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