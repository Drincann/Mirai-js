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
 * @description 发送戳一戳消息
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     戳一戳的目标
 * @param {number} subject    戳一戳的上下文，群或好友
 * @param {string} kind       上下文类型, 可选值 Friend, Group
 * @returns {Object} 结构 { message, code, messageId }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  target,
  subject,
  kind
}) => {
  try {
    // 拼接 url
    const url = new URL('/sendNudge', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      target,
      subject,
      kind
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