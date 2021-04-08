"use strict";

module.exports = (min, max) => {
  return () => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
};