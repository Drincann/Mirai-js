"use strict";

module.exports = {
  URL: process.browser ? window.URL : require('url').URL
};