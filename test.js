'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('./');
var app;

var dest = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    var filepath = dest(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      del(path.dirname(filepath), cb);
    });
  };
}

describe('generate-example', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = dest();
    app.option('dest', dest());
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-example') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });

    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('example'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists('example.txt', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('example.txt', cb));
    });

    it('should run the `example` task with .build', function(cb) {
      app.use(generator);
      app.build('example', exists('example.txt', cb));
    });

    it('should run the `example` task with .generate', function(cb) {
      app.use(generator);
      app.generate('example', exists('example.txt', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      it('should run the default task using the `generate-example` name', function(cb) {
        app.use(generator);
        app.generate('generate-example', exists('example.txt', cb));
      });

      it('should run the default task using the `example` generator alias', function(cb) {
        app.use(generator);
        app.generate('example', exists('example.txt', cb));
      });
    });
  }

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('example', generator);
      app.generate('example', exists('example.txt', cb));
    });

    it('should run the `example` task', function(cb) {
      app.register('example', generator);
      app.generate('example:example', exists('example.txt', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('example', generator);
      app.generate('example:default', exists('example.txt', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('example', generator);
      });
      app.generate('foo.example', exists('example.txt', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('example', generator);
      });
      app.generate('foo.example', exists('example.txt', cb));
    });

    it('should run the `example:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('example', generator);
      });
      app.generate('foo.example:default', exists('example.txt', cb));
    });

    it('should run the `example:example` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('example', generator);
      });
      app.generate('foo.example:example', exists('example.txt', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator)

      app.generate('foo.bar.baz', exists('example.txt', cb));
    });
  });
});
