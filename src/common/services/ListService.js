angular.module('List', ['Alerts'])
.factory('ListService', function($http, $rootScope, AlertsService, AuthService, ApiConfigService){
  var _box = {};
  var _movie= {};
  var _list = {};
  var _id = $rootScope.user._id;
  var _token = AuthService.getUserToken();
  var _url = ApiConfigService.getConf().url.users;
  return {
    getListBox: function(){
      return _box;
    },
    setListBox: function(action, data){
      _box.action = action;
      _box.data = data;
    },
    getAllLists: function(url, id, cb){
      var callback = cb;
      var lists = {};
      $http({
        url: url + '/lists/' + id, 
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          lists = listData.lists;
        }
        callback(lists);
      }).
      error(function(listData, status) {
        callback(lists);
      })
    },
    getList: function(lid, cb){
      var callback = cb;
      var list = {};
      $http({
        url: _url + '/lists/' + _id + '?lid=' + lid, 
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          list = listData.list;
        }
        callback(list);
      }).
      error(function(listData, status) {
        callback(list);
      })
    },
    saveList: function(list, callback){
      var id = list._id;
      $http({
        url:_url + '/lists', 
        method: 'PUT',
        data: {uid: _id, token:_token, list: list},
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          if(!id){
            callback(listData.id);
          }else{
            callback(id);
          }
        }else{
          AlertsService.setAlert('error', listData.status);
        }
      }).
      error(function(listData, status) {
        AlertsService.setAlert('error', 'List Operation failed');
      });
    },
    deleteList: function(lid, callback){
      var id = lid;
      $http({
        url:_url + '/lists', 
        method: 'DELETE',
        data: {uid: _id, token:_token, lid: lid},
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          callback(id);
        }else{
          AlertsService.setAlert('error', listData.status);
        }
      }).
      error(function(listData, status) {
        AlertsService.setAlert('error', 'List Operation failed');
      });
    },
    getListsForMovie: function(id){
      var userLists = $rootScope.user.lists;
      var movieLists = { 
        lists:{},
        total: 0
      };
      for(key in userLists){
        var list = userLists[key];
        if(list['movies'][id]){
          movieLists['lists'][list._id] = list;
          movieLists['total']++;
        }
      }
      return movieLists;
    },
    addMovieToList: function( list, mid, callback){
      $http({
        url:_url + '/lists', 
        method: 'PUT',
        data: {uid: _id, token:_token, list: list, mid:mid},
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          callback();
        }else{
          AlertsService.setAlert('error', listData.status);
        }
      }).
      error(function(listData, status) {
        AlertsService.setAlert('error', 'List Operation failed');
      });
    },
    deleteMovieFromList: function(lid, mid, callback){
      $http({
        url:_url + '/lists', 
        method: 'DELETE',
        data: {uid: _id, token: _token, lid: lid, mid:mid},
        headers: { 'Content-Type': 'application/json; charset=UTF-8'}
      }).
      success(function(listData, status) {
        if(listData.code == 0){
          callback();
        }else{
          AlertsService.setAlert('error', listData.status);
        }
      }).
      error(function(listData, status) {
        AlertsService.setAlert('error', 'List Operation failed');
      });
    },
    getListColors: function(){
      return ['#c0392b', '#16a085', '#2980b9', '#d35400', '#2c3e50', '#f1c40f'];
    },
    getMovieBoxOpts: function(){
      return {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: 'lists/movie.tpl.html',
        controller: 'MovieListBoxCtrl',
        dialogFade: true
      };
    },
    setMovieBoxData: function(movie){
      _movie = movie;
    },
    getMovieBoxData: function(){
      return _movie;
    },
    setListBoxData: function(list){
      _list = list;
    },
    getListBoxData: function(){
      return _list;
    },
  };
});