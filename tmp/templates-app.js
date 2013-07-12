angular.module('templates-app', ['lists/lists.tpl.html', 'movies/movies.tpl.html', 'ratings/ratings.tpl.html', 'search/search.tpl.html', 'user/anon.tpl.html', 'user/user.tpl.html']);

angular.module("lists/lists.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/lists.tpl.html",
    "<div class=\"row-fluid\" data-ng-init=\"init()\">\n" +
    "  Lists\n" +
    "</div>");
}]);

angular.module("movies/movies.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("movies/movies.tpl.html",
    "<div class=\"row-fluid\" ng-style=\"getBackground(imgUrl, movie.backdrop_path)\" class=\"img-background\" data-ng-init=\"init()\">\n" +
    "  <div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "    <div class=\"loader\" ng-class=\"loadingClass\"><h4> Loading.. </h4></div>\n" +
    "  </div>\n" +
    "  <div class=\"movie-container\" ng-show=\"loaded\">\n" +
    "    <div class=\"row-fluid\" >\n" +
    "      <div class=\"span1\">\n" +
    "        <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" ></img>\n" +
    "      </div>\n" +
    "      <div class=\"span8\">\n" +
    "        <h3>{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</h3>\n" +
    "          <p ng-if=\"movie.tagline\"> \n" +
    "            <span class=\"property\"> Tag Line : </span> \n" +
    "            <i>\"{{movie.tagline}}\"</i> </p>\n" +
    "          <p> \n" +
    "            <span class=\"property\">User Rating : </span>\n" +
    "            <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating>  ( {{movie.vote_average}}/10 | <b>{{movie.vote_count}}</b> users reviewed this title ) \n" +
    "          </p>\n" +
    "          <div class=\"movie-user-rating\" ng-if=\"isLoggedIn\" ng-click=\"setRating()\">\n" +
    "            <span class=\"property\" > Your Rating : </span>\n" +
    "            <rating value=\"movie.user_rating\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "          </div>\n" +
    "           <p ng-show=\"movie.genres\">\n" +
    "             <span class=\"property\">Genres : </span>\n" +
    "             <span class=\"genre\" ng-repeat=\"(index,genre) in movie.genres\"> {{genre.name}} <span class=\"sep\" ng-show=\"index < (movie.genres.length -1)\"> | </span></span></p>\n" +
    "       </div>\n" +
    "       <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(movie.vote_average)\">\n" +
    "          <div class=\"rating-text\">\n" +
    "            {{movie.vote_average}} <i class=\"icon-star\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"rating-by\">\n" +
    "            {{movie.vote_count}} users\n" +
    "          </div>\n" +
    "       </div>\n" +
    "       <div class=\"pull-right rating-box ratings-box-user\" ng-class=\"getRatingClass(movie.user_rating)\" ng-if=\"isLoggedIn\">\n" +
    "          <div class=\"rating-text\" ng-if=\"movie.user_rating > 0\">\n" +
    "            {{movie.user_rating}} <i class=\"icon-star\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"rating-text na-text\" ng-if=\"movie.user_rating == 0\">\n" +
    "            N/A\n" +
    "          </div>\n" +
    "          <div class=\"rating-by\">\n" +
    "            You\n" +
    "          </div>\n" +
    "       </div>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid\" ng-click=\"setRating(movie)\">\n" +
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
    "            <img ng-src=\"{{imgUrl}}/w92/{{cast.profile_path}}\" ng-if=\"cast.profile_path\" ng-show=\"cast.profile_path\" class=\"list-img\"></img>\n" +
    "            <i class=\"icon-question-sign\" ng-show=\"!cast.profile_path\"></i>\n" +
    "          </div>\n" +
    "          <div class=\"span11 cast-name\" ng-show=\"index < 10 || showAllCast\">\n" +
    "            <a><span tooltip-placement=\"right\"  tooltip-html-unsafe=\"{{castMarkup[cast.id]}}\" tooltip-trigger=\"mouseenter\" class=\"cast-desc\">{{cast.name}} <i ng-show=\"cast.character\">( {{cast.character}} )</i></span></a>\n" +
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
    "<div class=\"row-fluid search-input\" data-ng-init=\"init()\">\n" +
    "  <input type=\"text\" class=\"span10 offset1\" placeholder=\"Type to search for movies you rated\" ng-model=\"filter\" ng-keyup=\"filterMovie()\"/>\n" +
    "</div>\n" +
    "<h3>Your Ratings</h3>\n" +
    "<div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "  <div class=\"loader\" ng-class=\"loadingClass\"><h4> Loading.. </h4></div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"loaded && ratings\">\n" +
    "  <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "    <div class=\"span1\">\n" +
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "        <div class=\"row-fluid movie-list-field\"  ng-click=\"setRating(movie.id)\">\n" +
    "          <span class=\"property\" > Your Rating : </span>\n" +
    "          <rating value=\"userRatings[movie.id]\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(userRatings[movie.id])\" >\n" +
    "        <div class=\"rating-text-user\" ng-if=\"userRatings[movie.id] > 0\">\n" +
    "          {{userRatings[movie.id]}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"!ratings && loaded\">\n" +
    "  No ratings found.\n" +
    "</div>\n" +
    "");
}]);

angular.module("search/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("search/search.tpl.html",
    "<div class=\"row-fluid search-input\" data-ng-init=\"auto()\">\n" +
    "  <input type=\"text\" class=\"span10 offset1\" placeholder=\"Type to search for movies\" ng-model=\"search\" ng-keyup=\"auto()\"/>\n" +
    "</div>\n" +
    "<h3>{{listTitle}}</h3>\n" +
    "<div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "  <div class=\"loader\" ng-class=\"loadingClass\"><h4> Loading.. </h4></div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"loaded\">\n" +
    "  <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "    <div class=\"span1\">\n" +
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "        <div class=\"row-fluid movie-list-field\">\n" +
    "          <span class=\"property\"> User Rating : </span>\n" +
    "          <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating><br/>\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid movie-list-field\" ng-if=\"isLoggedIn\" ng-click=\"setRating(movie.id)\">\n" +
    "          <span class=\"property\" > Your Rating : </span>\n" +
    "          <rating value=\"userRatings[movie.id]\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box\" ng-class=\"getRatingClass(movie.vote_average)\">\n" +
    "        <div class=\"rating-text\">\n" +
    "          {{movie.vote_average}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"rating-by\">\n" +
    "          {{movie.vote_count}} users\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"pull-right rating-box ratings-box-user\" ng-class=\"getRatingClass(userRatings[movie.id])\" ng-if=\"isLoggedIn\">\n" +
    "        <div class=\"rating-text\" ng-if=\"userRatings[movie.id] > 0\">\n" +
    "          {{userRatings[movie.id]}} <i class=\"icon-star\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"rating-text na-text\" ng-if=\"userRatings[movie.id] == 0\">\n" +
    "          N/A\n" +
    "        </div>\n" +
    "        <div class=\"rating-by\">\n" +
    "          You\n" +
    "        </div>\n" +
    "     </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/anon.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/anon.tpl.html",
    "<div class=\"user-box\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"row-fuild user-ribbon\">\n" +
    "      <span class=\"pull-right\" ng-click=\"close()\">\n" +
    "        <i class=\"icon-remove-sign close-btn\"></i>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid user-box-inner\">\n" +
    "      <div class=\"login-box span4 offset2\">\n" +
    "        <h5>Login</h5>\n" +
    "        <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"name\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"pass\">\n" +
    "        <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"login(name, pass)\" >Login</button>\n" +
    "      </div>\n" +
    "      <div class=\"reg-box span4 \">\n" +
    "        <h5>Register</h5>\n" +
    "        <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"rName\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"rPass\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Confirm password\" ng-model=\"rcPass\">\n" +
    "        <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"register(rName, rPass,rcPass)\">Register</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/user.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/user.tpl.html",
    "&nbsp;");
}]);
