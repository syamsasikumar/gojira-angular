angular.module( 'gojira.movie', [
  'ui.bootstrap',
  'Conf',
  'Auth'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/movie/:id', {
    controller: 'MovieCtrl',
    templateUrl: 'movie/movie.tpl.html'
  });
})

.controller( 'MovieCtrl', function MovieCtrl( $scope, $http, $routeParams, ApiConfigService ) {
  $scope.id = $routeParams.id;
  $scope.conf = ApiConfigService.getConf();
  $scope.showAllCast = false;
  $scope.getBackground = function(url, path){
    return {
      background:'url( \'' + url + '/original/' + path + '\')'
    };
  };  
  $scope.fetch = function(){
    $scope.imgUrl = $scope.conf.image.baseUrl;
    var url = $scope.conf.url + '?movie=' + $scope.id;  
    $http.post(url, {}, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }).
      success(function(data, status) {
        $scope.status = status;
        $scope.movie = data;
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
        $scope.status = status;
    });
  };
  if(!$scope.conf.isSet){
    $http.post($scope.conf.url + '?conf=1', {}, {
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
});