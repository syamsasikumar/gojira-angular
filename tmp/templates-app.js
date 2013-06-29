angular.module('templates-app', ['lists/lists.tpl.html', 'movie/movie.tpl.html', 'ratings/ratings.tpl.html', 'search/search.tpl.html', 'user/anon.tpl.html', 'user/user.tpl.html']);

angular.module("lists/lists.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/lists.tpl.html",
    "{{message}}");
}]);

angular.module("movie/movie.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("movie/movie.tpl.html",
    "<div class=\"row-fluid\" ng-style=\"getBackground(imgUrl, movie.backdrop_path)\" class=\"img-background\">\n" +
    "  <div class=\"movie-container\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span1\">\n" +
    "        <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" ></img>\n" +
    "      </div>\n" +
    "      <div class=\"span11\">\n" +
    "        <h3>{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</h3>\n" +
    "          <p ng-if=\"movie.tagline\"> \n" +
    "            <span class=\"property\"> Tag Line : </span> \n" +
    "            <i>\"{{movie.tagline}}\"</i> </p>\n" +
    "          <p> \n" +
    "            <span class=\"property\">User Rating : </span>\n" +
    "            <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating>  ( {{movie.vote_average}}/10 | <b>{{movie.vote_count}}</b> users reviewed this title ) </p>\n" +
    "           <p ng-show=\"movie.genres\">\n" +
    "             <span class=\"property\">Genres : </span>\n" +
    "             <span class=\"genre\" ng-repeat=\"(index,genre) in movie.genres\"> {{genre.name}} <span class=\"sep\" ng-show=\"index < (movie.genres.length -1)\"> | </span></span></p>\n" +
    "       </div>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid\">\n" +
    "      <h5>Overview : </h5>\n" +
    "      <p class=\"left-padded-content\">\n" +
    "        {{movie.overview}}\n" +
    "      </p>\n" +
    "    </div>  \n" +
    "    <div class=\"row-fluid\">\n" +
    "      <div class=\"span6\" ng-if=\"movie.casts.cast\">\n" +
    "        <h5> Casts : </h5>\n" +
    "        <div class=\"row-fluid message left-padded-content\" ng-show=\"!showAllCast\">\n" +
    "          Showing top casts. Click <a ng-click=\"showAllCast = true\" >here</a> to show all casts.\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid message left-padded-content\" ng-show=\"showAllCast\">\n" +
    "          Showing all casts. Click <a ng-click=\"showAllCast = false\" >here</a> to show only top casts.\n" +
    "        </div>\n" +
    "        <div class=\"cast-result row-fluid left-padded-content\" ng-repeat=\"(index,cast) in movie.casts.cast\">\n" +
    "          <div class=\"span1\" ng-show=\"index < 10 || showAllCast\">\n" +
    "            <img ng-src=\"{{imgUrl}}/w92/{{cast.profile_path}}\" ng-if=\"cast.profile_path\" ng-show=\"cast.profile_path\"></img>\n" +
    "            <i class=\"icon-question-sign\" ng-show=\"!cast.profile_path\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"span11\" ng-show=\"index < 10 || showAllCast\">\n" +
    "            {{cast.name}} <i ng-show=\"cast.character\">( {{cast.character}} )</i>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"span6\" ng-if=\"movie.trailers.youtube[0]\">\n" +
    "        <h5>Trailer :</h5>\n" +
    "        <iframe id=\"ytplayer\" type=\"text/html\" class=\"span10\" src=\"http://www.youtube.com/embed/{{movie.trailers.youtube[0].source}}\" frameborder=\"0\"></iframe> \n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid\" ng-show=\"movie.similar_movies.results\">\n" +
    "      <h5>Similar Movies : </h5>\n" +
    "      <div class=\"similar-movie-container row-fluid\">\n" +
    "        <div class=\"span2 movie-leaf\" ng-repeat=\"(index, s_movie) in movie.similar_movies.results\">\n" +
    "          <a href=\"#/movie/{{s_movie.id}}\" ng-show=\"index < 6\">\n" +
    "            <img ng-src=\"{{imgUrl}}/w92/{{s_movie.poster_path}}\" ng-if=\"s_movie.poster_path\"></img>\n" +
    "            <h6 >{{s_movie.title}} ( {{s_movie.release_date.substring(0,4)}} )</h6>\n" +
    "          </a>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("ratings/ratings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("ratings/ratings.tpl.html",
    "{{message}}");
}]);

angular.module("search/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("search/search.tpl.html",
    "<div class=\"row-fluid search-input\">\n" +
    "  <input type=\"text\" class=\"span9 offset1\" placeholder=\"Type to search for movies\" ng-model=\"search\" ng-keyup=\"auto()\"/>\n" +
    "</div>\n" +
    "<h3>{{listTitle}}</h3>\n" +
    " <tabset>\n" +
    "  <tab heading=\"List\">\n" +
    "    <div class=\"row-fluid search-results\" >\n" +
    "      <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "        <div class=\"span1\">\n" +
    "          <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img\"></img>\n" +
    "        </div>\n" +
    "        <div class=\"span11\">\n" +
    "          <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h3>\n" +
    "            <span class=\"property\"> User Rating : </span>\n" +
    "            <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating>  ( {{movie.vote_average}}/10 | <b>{{movie.vote_count}}</b> users reviewed this title.) \n" +
    "         </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </tab>\n" +
    "  <tab heading=\"Grid\">\n" +
    "  </tab>\n" +
    "</tabset>");
}]);

angular.module("user/anon.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/anon.tpl.html",
    "<div class=\"row-fluid\">\n" +
    "  <div class=\"row-fluid\" >\n" +
    "    <div class=\"span4 offset2\">\n" +
    "      <img src=\"/assets/images/yoda.png\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span4\">\n" +
    "      <img src=\"/assets/images/luke.png\"></img>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"login-box span4 offset2\">\n" +
    "      <h5>Login</h5>\n" +
    "      <input type=\"text\" class=\"span8\" placeholder=\"Username\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Password\">\n" +
    "      <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"login()\" >Login</button>\n" +
    "    </div>\n" +
    "    <div class=\"reg-box span4 \">\n" +
    "      <h5>Register</h5>\n" +
    "      <input type=\"text\" class=\"span8\" placeholder=\"Username\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Password\">\n" +
    "      <input type=\"password\" class=\"span8\" placeholder=\"Confirm password\">\n" +
    "      <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"register()\">Register</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/user.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/user.tpl.html",
    "Logged In user");
}]);