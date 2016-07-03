'use strict';

var path = require('path');
var isValid = require('is-valid-app');

module.exports = function(app) {
  if (!isValid(app, 'generate-example')) return;

  /**
   * Generate an `example.txt` file in the current working directory.
   *
   * ```sh
   * $ gen example
   * ```
   * @name example
   * @api public
   */

  app.task('example', function(cb) {
    return app.src('example.txt', {cwd: path.resolve(__dirname, 'templates')})
      .pipe(app.dest(app.options.dest || app.cwd));
  });

  app.task('default', ['example']);
};
