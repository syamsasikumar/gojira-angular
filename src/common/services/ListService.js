angular.module('List', ['Alerts'])
.factory('ListService', function($http, $rootScope, AlertsService){
  var _box = {};
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
    getList: function(){

    },
    saveList: function(uid, token, url, list, callback){
      var id = list._id;
      $http({
        url:url + '/lists', 
        method: 'PUT',
        data: {uid: uid, token:token, list: list},
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
    deleteList: function(uid, token, url, lid, callback){
      var id = lid;
      $http({
        url:url + '/lists', 
        method: 'DELETE',
        data: {uid: uid, token:token, lid: lid},
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
    addMovieToList: function(){

    },
    deleteMovieFromList: function(){

    },
    getListsForMovie: function(){

    },
    getListColors: function(){
      return ['#c0392b', '#16a085', '#2980b9', '#d35400', '#2c3e50', '#f1c40f'];
    }
  };
});