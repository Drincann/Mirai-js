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

const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
/**
 * @description 撤回由 messageId 确定的消息
 * @param {string} baseUrl    mirai-api-http server 的主机地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲撤回消息的 messageId
 * @returns {Object} 结构 { message, code }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  target
}) => {
  try {
    // 拼接 URL
    const url = new URL('/recall', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      target
    });

    try {
      var {
        data: {
          code,
          msg: message
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
    errorHandler(error);
  }
};