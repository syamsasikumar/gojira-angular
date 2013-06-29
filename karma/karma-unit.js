/** 
 * From where to look for files, starting with the location of this file.
 */
basePath = '../';

/**
 * This is the list of file patterns to load into the browser during testing.
 */
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'build/angular/angular.js',
  'build/angular/angular-mocks.js',
  'src/**/*.js',
  'dist/tmp/**/*.js',
  'vendor/placeholders/*.js',
  'vendor/angular-bootstrap/*.js',
  'vendor/angular-ui-utils/modules/route/*.js'
];

/**
 * How to report, by default.
 */
reporters = 'dots';

/**
 * On which port should the browser connect, on which port is the test runner
 * operating, and what is the URL path for the browser to use.
 */
port = 9018;
runnerPort = 9100;
urlRoot = '/';

/** 
 * Log at a very low level, but not quite debug.
 */
logLevel = LOG_DEBUG;

/** 
 * Disable file watching by default.
 */
autoWatch = false;



