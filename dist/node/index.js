"use strict";

const {
  Bot
} = require('./Bot');

const {
  Message
} = require('./Message');

const {
  Middleware
} = require('./Middleware');

if (process.browser) {
  window.miraiJs = {
    Bot,
    Message,
    Middleware
  };
} else {
  module.exports = {
    Bot,
    Message,
    Middleware
  };
}