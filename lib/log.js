"use strict";

import logentries from "le_node";
import config from "../config";

var log
  , logConfig = {};

if (config.logentriesToken && config.logentriesToken !== "") {
  logConfig.token = config.logentriesToken;
}

log = logentries.logger(logConfig);

log.on("log", function (line) {
  console.log(line);
});

module.exports = log;
