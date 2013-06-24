angular.module('Conf', [])
.factory('ApiConfigService', function($http){
	var conf = {
		url:'http://daimajin.herokuapp.com/',
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