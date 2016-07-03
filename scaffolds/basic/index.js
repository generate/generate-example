'use strict';

var path = require('path');
var dest = path.resolve.bind(path, __dirname);
var through = require('through2');

module.exports = function(app, options) {
  options = options || {};

  var destBase = dest(app.cwd, options.dest || 'examples');
  var srcBase = path.resolve.bind(path, options.cwd || __dirname);

  return {
    basic: {
      options: {
        cwd: srcBase('templates'),
        destBase: destBase,
        flatten: true
      },
      files: [
        {src: '*'}
      ]
    }
  };
};
