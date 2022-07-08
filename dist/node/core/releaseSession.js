"use strict";

const {
  errCodeMap
} = require('../util/errCode');

const axios = require('axios').default;

const {
  URL
} = require('../polyfill/URL');

const errorHandler = require('../util/errorHandler');

const path = require('path');

const {
  isBrowserEnv
} = require('../util/isBrowserEnv');

const locationStr = isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';
/**
 * @description 关闭一个会话
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} qq         qq 号
 * @returns {Object} 结构 { message, code }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  qq
}) => {
  try {
    // 拼接 url
    const url = new URL('/release', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      qq
    });

    try {
      var {
        data: {
          msg: message,
          code
        }
      } = responseData;
    } catch (error) {
      throw new Error('请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      throw new Error(message);
    }

    return {
      message,
      code
    };
  } catch (error) {
    console.error(`mirai-js: error ${locationStr}`);
    console.error(`mirai-js: error ${locationStr}`);
    errorHandler(error);
  }
};