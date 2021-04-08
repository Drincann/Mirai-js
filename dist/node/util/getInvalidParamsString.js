"use strict";

/**
 * @description 检查必选参数
 * @param {Object} parametersMap 要检查的参数 map
 * @returns {string} 未提供参数的参数名，以空格隔开
 */
module.exports = parametersMap => {
  return Object.keys(parametersMap).filter(fieldName => {
    return parametersMap[fieldName] === undefined;
  }).join(' ');
};