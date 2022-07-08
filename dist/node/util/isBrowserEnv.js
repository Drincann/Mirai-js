"use strict";

exports.isBrowserEnv = () => {
  return typeof window !== 'undefined';
};