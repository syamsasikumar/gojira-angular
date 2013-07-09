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
    getRatings : function(url, id, cb){
      var callback = cb;
      var ratings = {};
      $http({
        url: url + '/ratings/' + id, 
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(ratingData, status) {
        if(ratingData.code == 0){
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