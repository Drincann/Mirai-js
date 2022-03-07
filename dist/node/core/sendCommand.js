"use strict";

const axios = require('axios').default;

const {
  errCodeMap
} = require('../util/errCode');

const {
  URL
} = require('../polyfill/URL');

const errorHandler = require('../util/errorHandler');

const path = require('path');

const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
/**
 * @description 向 mirai-console 发送指令
 * @param {string} baseUrl mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {string} command 指令名
 * @param {MessageChain[]} args  指令的参数
 * @returns {Object} 结构 { message, code }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  command
}) => {
  try {
    // 拼接 url
    const url = new URL('/cmd/execute', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      command
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
    errorHandler(error);
  }
};