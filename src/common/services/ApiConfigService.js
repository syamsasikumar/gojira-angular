angular.module('Conf', [])
.factory('ApiConfigService', function($http){
  var conf = {
    url:{
      movies : 'http://daimajin.herokuapp.com/movies',
      users: 'http://localhost:8081/users'
    },
    image:{
      baseUrl:''
    },
    isSet:false
  };

  return {
    getConf : function(){
      return conf;
    },
    setConf: function(newConf){
        conf = newConf;
        conf.isSet = true;
    }
  };
});
