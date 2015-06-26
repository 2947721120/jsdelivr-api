#!/usr/bin/env node
'use strict';

require('log-timestamp');
require('babel/register');

var express = require('express')
  , morgan = require('morgan')
  , async = require('async')
  , _ = require('lodash')

  , dbs = require('./db')
  , config = require('./config')
  , log = require('./lib/log');

var db = config.db
  , taskUpdating = {};

if (require.main === module) {
  main();
}

module.exports = main;
function main(cb) {

  async.series([
    init,
    serve,
    runTasks
  ], function (err) {

    if (err) {
      log.err('Error starting application!', err);
      log.err(err);
      process.exit();
    }
    else if (cb)
      cb();
  });
}

var intervalSet = false;
function runTasks(cb) {
  log.info('Running tasks');

  // first kick off the tasks
  async.eachSeries(Object.keys(config.tasks), function (name, done) {
    taskUpdating[name] = false;
    runTask(name, done);
  }, function (err) {

    if (err) {
      log.err('Error initializing tasks');
      log.err(err);
    }

    //then set the interval
    if (!intervalSet) {
      intervalSet = true;
      var interval = 6 * (10 * 1e4);

      // we want to space out the start of each sync cycle by 10 minutes each
      setInterval(function () {
        runTasks(function () {
          log.info('libraries synced!');
          return true;
        });
      }, interval);
    }

    if (cb) cb();
  });
}

function runTask(name, cb) {

  if(!taskUpdating[name]) {
    taskUpdating[name] = true;
    console.log('running task...', name);

    try {
      require('./tasks/' + name + '.js')(dbs, function (err) {

        if (err)
          console.error('Error in task ', name, err);
        else
          console.log('Task %s complete', name);

        // don't wait for the cache to be cleared
        taskUpdating[name] = false;
        cb();

        log.info('Purging cache');

        var purgeCache = require('./lib/purge')(config.maxcdn);
        purgeCache(function (err) {
          if (err) {
            return log.err(err);
          }

          log.info('Cache purged');
        });
      });
    } catch (e) {
      log.err(e);
      cb();
    }
  }
  else {
    log.info('Task %s is already running', name);
    cb();
  }
}

function serve(cb) {
  cb = cb || _.noop;

  var app = express()
    , port = config.port;

  app.use(morgan('dev'));
  app.set('json spaces', 2);

  // setup CORS
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // v1 routes
  app.use('/v1', require('./routes.v1/libraries'));

  // v2 routes
  app.use('/v2', require('./routes.v2/libraries'));

  // catch all
  app.all('*', function (req, res) {
    res.status(404).json({status: 404, message: 'Requested url ' + req.url + ' not found.'});
  });

  app.listen(port, function () {
    console.log('Node (version: %s) %s started on %d ...', process.version, process.argv[1], port);
    cb();
  });

  return app;
}

function init(cb) {

  process.on('exit', terminator);

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
    'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
  ].forEach(function(element) {
      process.on(element, function() { terminator(element); });
    });

  cb();
}

function terminator(sig) {

  // close loki db
  dbs._db.close();

  if (typeof sig === 'string') {
    console.log('%s: Received %s - terminating Node server ...',
      new Date(), sig);

    process.exit(1);
  }

  console.log('%s: Node server stopped.', new Date());
}
