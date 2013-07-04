/**
* Localstorage factory to handle data storage on browser
*/
angular.module('Storage', [])
.factory('LocalStorageService', function(){
  var store = (function(){
    try {
      if( 'localStorage' in window && window['localStorage'] !== null){
        return window['localStorage'];
      }else{
        return false;
      }
    } catch (e) {
      return false;
    }
  })();

  return {
    get : function(key){
      return (store)? store.getItem(key):undefined;
    },
    set : function(key, val){
      if(store){
        store.setItem(key, val);
      }
    },
    remove: function(key){
      if(store){
        store.removeItem(key);
      }
    }
  };
});
