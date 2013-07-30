angular.module('templates-app', ['lists/add.tpl.html', 'lists/box.tpl.html', 'lists/list.tpl.html', 'lists/lists.tpl.html', 'lists/movie.tpl.html', 'movies/movies.tpl.html', 'ratings/ratings.tpl.html', 'search/search.tpl.html', 'user/anon.tpl.html', 'user/user.tpl.html']);

angular.module("lists/add.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/add.tpl.html",
    "<div class=\"list-box popup\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"row-fuild ribbon\">\n" +
    "      <span class=\"pull-right\" ng-click=\"close()\">\n" +
    "        <i class=\"icon-remove-sign close-btn\"></i>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div class=\"span10 movie-list-box-inner\">\n" +
    "      <h5> Add movies to {{list.name}} </h5>\n" +
    "      <div class=\"row-fluid\">\n" +
    "        <input type=\"text\" class=\"span12\" placeholder=\"Type to search for movies\" ng-model=\"search\" ng-keyup=\"fetch()\"/>\n" +
    "      </div>\n" +
    "      <div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "        <div class=\"loader\" ng-class=\"loadingClass\"><h4> Loading.. </h4></div>\n" +
    "      </div>\n" +
    "      <div class=\"row-fluid search-results list-movie-results\" ng-show=\"loaded && movies\">\n" +
    "        <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "          <div class=\"span1\">\n" +
    "            <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img-rating\"></img>\n" +
    "          </div>\n" +
    "          <div class=\"span6\">\n" +
    "            <h6>{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</h6>\n" +
    "          </div>\n" +
    "          <div class=\"pull-right\">\n" +
    "            <button class=\"btn btn-danger pull-right\" type=\"button\" ng-click=\"toggleMovieList(movie.id, 'remove')\" ng-if=\"!addButtons[movie.id]\"><i class=\"icon-remove\"></i></button>\n" +
    "            <button class=\"btn btn-success pull-right\" type=\"button\" ng-click=\"toggleMovieList(movie.id, 'add')\" ng-if=\"addButtons[movie.id]\"><i class=\"icon-plus\"></i></button>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"row-fluid search-results\" ng-show=\"!movies.length && loaded && search != ''\">\n" +
    "        No movies found.\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("lists/box.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/box.tpl.html",
    "<div class=\"list-box popup\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"row-fuild ribbon\">\n" +
    "      <span class=\"pull-right\" ng-click=\"close()\">\n" +
    "        <i class=\"icon-remove-sign close-btn\"></i>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid list-box-inner\" ng-show=\"action != 'delete'\">\n" +
    "      <h5> {{action}} List </h5>\n" +
    "      <input type=\"text\"  placeholder=\"Name\" ng-model=\"name\">\n" +
    "      <textarea rows=\"3\"  placeholder=\"Description\" ng-model=\"description\"></textarea>\n" +
    "      <div class=\"color-wrap\"/>\n" +
    "        <a class=\"dropdown-toggle input-type\" ng-style=\"{background : color}\">\n" +
    "          Label Color&nbsp;<i class=\"icon-collapse\"></i>\n" +
    "        </a>\n" +
    "        <ul class=\"dropdown-menu\">\n" +
    "          <li ng-repeat=\"choice in colors\">\n" +
    "            <a class=\"color-choice\" ng-style=\"{background : choice}\" ng-click=\"setListColor(choice)\"><i class=\"icon-check\" ng-show=\"choice==color\"></i>&nbsp;</a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "      <button class=\"btn btn-success\" type=\"button\" ng-click=\"saveList()\" ng-show=\"action == 'create'\">Create</button>\n" +
    "      <button class=\"btn btn-warning\" type=\"button\" ng-click=\"saveList()\" ng-show=\"action == 'edit'\">Save</button>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid list-box-inner\" ng-show=\"action == 'delete'\">\n" +
    "      <h5> {{action}} List </h5>\n" +
    "      <span> Are you sure you want to delete '{{name}}'? </span>\n" +
    "      <button class=\"btn btn-danger\" type=\"button\" ng-click=\"saveList()\" >Delete</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("lists/list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/list.tpl.html",
    "<div class=\"row-fluid search-input\" data-ng-init=\"init()\">\n" +
    "  <input type=\"text\" class=\"span10 offset1\" placeholder=\"Type to search for a movie in '{{name}}'\" ng-model=\"filter\" ng-keyup=\"filterMovie()\"/>\n" +
    "</div>\n" +
    "<h3>{{name}}</h3>\n" +
    "<span class=\"add-list-icon pull-right\" ng-click=\"openAddPopUp(list)\"><i class=\"icon-plus\"></i>Add</span>\n" +
    "<p>{{description}}</p>\n" +
    "<div class=\"row-fluid search-results loading-container\" ng-hide=\"loaded\">\n" +
    "  <div class=\"loader\" ng-class=\"loadingClass\"><h4> Loading.. </h4></div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"loaded && movies\">\n" +
    "  <div class=\"list-result row-fluid\" ng-repeat=\"movie in movies\" >\n" +
    "    <div class=\"span1\">\n" +
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img-rating\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "    </div>\n" +
    "    <button class=\"btn btn-danger pull-right\" type=\"button\" ng-click=\"removeMovie(movie.id)\"><i class=\"icon-remove\"></i></button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"row-fluid search-results\" ng-show=\"!movies.length && loaded\">\n" +
    "  No movies found.\n" +
    "</div>");
}]);

angular.module("lists/lists.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/lists.tpl.html",
    "<button class=\"btn btn-success pull-right\" type=\"button\" ng-click=\"openListBox('create', 0)\" ><i class=\"icon-plus\"> </i>Create</button>\n" +
    "<h3>My Lists</h3>\n" +
    "<div class=\"row-fluid list-wrap\" data-ng-init=\"init()\">\n" +
    "  {{message}}\n" +
    "  <div class=\"list-result-data row-fluid\" ng-repeat=\"list in lists\" >\n" +
    "    <div class=\"span2 list-label\" ng-style=\"{background : list.color}\">\n" +
    "      <i class=\"icon-film span4 offset5\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span7\">\n" +
    "      <h4><a href=\"#/list/{{list._id}}\">{{list.name}}</a></h4>\n" +
    "      <p>{{list.description}}</p>\n" +
    "    </div>\n" +
    "    <div>\n" +
    "      <button class=\"btn btn-danger pull-right\" type=\"button\" ng-click=\"openListBox('delete', list._id)\" ><i class=\"icon-remove\"></i></button>\n" +
    "      <button class=\"btn btn-warning pull-right\" type=\"button\" ng-click=\"openListBox('edit', list._id)\" ><i class=\"icon-edit\"></i></button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("lists/movie.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lists/movie.tpl.html",
    "<div class=\"list-box popup\" ng-init=\"init()\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"row-fuild ribbon\">\n" +
    "      <span class=\"pull-right\" ng-click=\"close()\">\n" +
    "        <i class=\"icon-remove-sign close-btn\"></i>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid movie-list-box-inner\">\n" +
    "      <h5> Add '{{movie.title}}' To Lists </h5>\n" +
    "      <span ng-repeat=\"list in lists\" class=\"list-wrap-outer\">\n" +
    "        <div ng-style=\"{background : list.color}\" class=\"list-wrap span11\">\n" +
    "          <i class=\"icon-check check\" ng-if=\"checked[list._id]\" ng-click=\"toggleMovieList(list._id)\"></i>\n" +
    "          <i class=\"icon-check-empty check\" ng-if=\"!checked[list._id]\" ng-click=\"toggleMovieList(list._id)\"></i>\n" +
    "          <span>{{list.name}}</span>\n" +
    "        </div>\n" +
    "      </span>\n" +
    "      {{lists.length}}\n" +
    "      <span ng-if=\"none\">No lists found.</span>\n" +
    "    </div>\n" +
    "  </div>\n" +
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
    "          <div class=\"row-fluid movie-list-field\" ng-if=\"isLoggedIn\">\n" +
    "            <span class=\"property\" > Lists : </span>\n" +
    "            <span class=\"movie-lists-none\" ng-if=\"userLists['total'] == 0\">None</span>\n" +
    "            <span class=\"movie-lists-all\" ng-if=\"userLists['total'] > 0\">\n" +
    "              <span class=\"list-wrap\" ng-repeat=\"list in userLists['lists']\">\n" +
    "                <span ng-style=\"{background : list.color}\" class=\"movie-list\">\n" +
    "                  <a href=\"#/list/{{list._id}}\">{{list.name}}</a>\n" +
    "                </span>\n" +
    "              </span>\n" +
    "            </span>\n" +
    "            |\n" +
    "            <span class=\"add\" ng-click=\"openListPopUp(movie)\"><i class=\"icon-plus\"></i> Add</span>\n" +
    "          </div>\n" +
    "           <p ng-show=\"movie.genres\" class=\"movie-genre\">\n" +
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
    "      <img ng-src=\"{{imgUrl}}/w92/{{movie.poster_path}}\" ng-if=\"movie.poster_path\" class=\"list-img-rating\"></img>\n" +
    "    </div>\n" +
    "    <div class=\"span8\">\n" +
    "      <h4><a href=\"#/movie/{{movie.id}}\">{{movie.title}} ( {{movie.release_date.substring(0,4)}} )</a></h4>\n" +
    "        <div class=\"row-fluid movie-list-field\"  ng-click=\"setRating(movie.id)\">\n" +
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
    "<div class=\"row-fluid search-results\" ng-if=\"none\">\n" +
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
    "          <span class=\"property\"> Rating (Users) : </span>\n" +
    "          <rating value=\"movie.vote_average\" max=\"10\" readonly=\"true\" class=\"rating\"></rating><br/>\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid movie-list-field\" ng-if=\"isLoggedIn\" ng-click=\"setRating(movie.id)\">\n" +
    "          <span class=\"property\" > Rating (You) : </span>\n" +
    "          <rating value=\"userRatings[movie.id]\" max=\"10\" readonly=\"false\" class=\"rating user-rating\"></rating>\n" +
    "        </div>\n" +
    "        <div class=\"row-fluid movie-list-field\" ng-if=\"isLoggedIn\">\n" +
    "          <span class=\"property\" > Lists : </span>\n" +
    "          <span class=\"movie-lists-none\" ng-if=\"userLists[movie.id]['total'] == 0\">None</span>\n" +
    "          <span class=\"movie-lists-all\" ng-if=\"userLists[movie.id]['total'] > 0\">\n" +
    "            <span class=\"list-wrap\" ng-repeat=\"list in userLists[movie.id]['lists']\">\n" +
    "              <span ng-style=\"{background : list.color}\" class=\"movie-list\">\n" +
    "                <a href=\"#/list/{{list._id}}\">{{list.name}}</a>\n" +
    "              </span>\n" +
    "            </span>\n" +
    "          </span>\n" +
    "          |\n" +
    "          <span class=\"add\" ng-click=\"openListPopUp(movie)\"><i class=\"icon-plus\"></i> Add</span>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "     <div class=\"span3\">\n" +
    "       <div class=\"row-fuild\">\n" +
    "         <div class=\"rating-box pull-right\" ng-class=\"getRatingClass(movie.vote_average)\">\n" +
    "            <div class=\"rating-text\">\n" +
    "              {{movie.vote_average}} <i class=\"icon-star\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"rating-by\">\n" +
    "              {{movie.vote_count}} users\n" +
    "            </div>\n" +
    "         </div>\n" +
    "         <div class=\"rating-box ratings-box-user pull-right\" ng-class=\"getRatingClass(userRatings[movie.id])\" ng-if=\"isLoggedIn\">\n" +
    "            <div class=\"rating-text\" ng-if=\"userRatings[movie.id] > 0\">\n" +
    "              {{userRatings[movie.id]}} <i class=\"icon-star\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"rating-text na-text\" ng-if=\"userRatings[movie.id] == 0\">\n" +
    "              N/A\n" +
    "            </div>\n" +
    "            <div class=\"rating-by\">\n" +
    "              You\n" +
    "            </div>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("user/anon.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/anon.tpl.html",
    "<div class=\"user-box popup\">\n" +
    "  <div class=\"row-fluid\">\n" +
    "    <div class=\"row-fuild ribbon\">\n" +
    "      <span class=\"pull-right\" ng-click=\"close()\">\n" +
    "        <i class=\"icon-remove-sign close-btn\"></i>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "    <div class=\"row-fluid user-box-inner\">\n" +
    "      <div class=\"login-box span4 offset2\">\n" +
    "        <h5>Login</h5>\n" +
    "        <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"name\" ng-keypress=\"keypress('login', $event)\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"pass\" ng-keypress=\"keypress('login', $event)\">\n" +
    "        <button class=\"btn span8 btn-warning\" type=\"button\" ng-click=\"login(name, pass)\" >Login</button>\n" +
    "      </div>\n" +
    "      <div class=\"reg-box span4 \">\n" +
    "        <h5>Register</h5>\n" +
    "        <input type=\"text\" class=\"span8\" placeholder=\"Username\" ng-model=\"rName\" ng-keypress=\"keypress('register', $event)\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Password\" ng-model=\"rPass\" ng-keypress=\"keypress('register', $event)\">\n" +
    "        <input type=\"password\" class=\"span8\" placeholder=\"Confirm password\" ng-model=\"rcPass\" ng-keypress=\"keypress('register', $event)\">\n" +
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
