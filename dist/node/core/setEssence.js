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

const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';
/**
 * @description 设置群精华消息
 * mirai-api-http v2.6.0 后该接口由 { target } 变更到 { messageId, target }, 原
 * target 为 messageId, 在新接口中变更为 messageId, 新增 target 为目标群号，
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {number}  messageId  消息 id
 * @param {number}  target	   目标群号
 * @returns {Object} 结构 { message, code }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  messageId,
  target
}) => {
  try {
    // 拼接 url
    const url = new URL('/setEssence', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      messageId,
      target
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