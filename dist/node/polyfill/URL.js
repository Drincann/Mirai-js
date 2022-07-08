"use strict";

const {
  isBrowserEnv
} = require('../util/isBrowserEnv');

module.exports = {
  URL: isBrowserEnv() ? window.URL : require('url').URL
};