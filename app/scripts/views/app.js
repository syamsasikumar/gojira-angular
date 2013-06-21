define(['backbone', 'jquery'], function(Backbone, $) {
  var App = Backbone.View.extend({
    initialize: function() {
     // console.log( 'In View' );
      console.log("test="+ $('#test').html());
    }
  });
  
  return App;
});