angular.module( 'gojira.search', [
  'ui.bootstrap',
  'Conf'
])

.config(function config( $routeProvider ) {
  $routeProvider.when( '/search', {
    controller: 'SearchCtrl',
    templateUrl: 'search/search.tpl.html'
  });
})

.controller( 'SearchCtrl', function SearchCtrl( $scope, $http, ApiConfigService ) {
	$scope.search = '';
  $scope.conf = ApiConfigService.getConf();
  $scope.auto = function(){
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
  };
  $scope.fetch = function() {
    $scope.imgUrl = $scope.conf.image.baseUrl;
    if($scope.search == ''){
      var url = $scope.conf.url + '?popular=1';
    }else{
      var url = $scope.conf.url + '?q=' + $scope.search;  
    }
    $http.post(url, {}, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      }).
      success(function(data, status) {
        $scope.status = status;
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
  $scope.auto();
})

;