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

module.exports = {
  miraiJs: {
    Bot,
    Message,
    Middleware
  }
};