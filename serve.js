#!/usr/bin/env node
'use strict';

require('log-timestamp');

var express = require('express')
  , morgan = require('morgan')
  , async = require('async')
  , _ = require('lodash')

  , dbs = require("./db")
  , config = require('./config');

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
      console.log("Error starting application!", err);
      process.exit();
    }
    else if (cb)
      cb();
  });
}

var intervalSet = false;
function runTasks(cb) {
  console.log('Running tasks');

  // 首先揭开任务首先揭开任务=first kick off the tasks
  async.eachSeries(Object.keys(config.tasks), function (name, done) {
    taskUpdating[name] = false;
    runTask(name, done);
  }, function (err) {

    if (err) console.error("Error initializing tasks", err);

    //然后设置间隔
    if (!intervalSet) {
      intervalSet = true;
      var interval = 6 * (10 * 1e4);

      //我们想空间出每个同步周期开始时由每次10分钟
      setInterval(function () {
        runTasks(function () {
          console.log("libraries synced!");
          return true;
        });
      }, interval);
    }

    if (cb)
      cb();
  });
}

function runTask(name, cb) {

  if(!taskUpdating[name]) {
    taskUpdating[name] = true;
    console.log("running task...", name);

    try {
      require("./tasks/" + name + ".js")(dbs, function (err) {

        if (err)
          console.error("Error in task ", name, err);
        else
          console.log("Task %s complete", name);

        // 不用于高速缓存等待被清除
        taskUpdating[name] = false;
        cb();

        console.log('Purging cache');

        var purgeCache = require('./lib/purge')(config.maxcdn);
        purgeCache(function (err) {
          if (err) {
            return console.error(err);
          }

          console.log('Cache purged');
        });
      });
    } catch (e) {
      console.error(e);
      cb();
    }
  }
  else {
    console.log("Task %s is already running", name);
    cb();
  }
}

function serve(cb) {
  cb = cb || _.noop;

  var app = express()
    , port = config.port;

  app.use(morgan('dev'));
  app.set('json spaces', 2);

  //HEARTS设置
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  // v1 路线
  app.use("/v1", require("./routes.v1/libraries"));

  // 捕捉所有
  app.all("*", function (req, res) {
    res.status(404).json({status: 404, message: "Requested url " + req.url + " not found."});
  });

  app.listen(port, function () {
    console.log('Node (version: %s) %s started on %d ...', process.version, process.argv[1], port);
    cb();
  });
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
      Date(Date.now()), sig);

    process.exit(1);
  }

  console.log('%s: Node server stopped.', Date(Date.now()));
}
