"use strict";

const {
  errCodeMap
} = require('../util/errCode');

const axios = require('axios');

let URL;

if (!process.browser) {
  ({
    URL
  } = require('url'));
} else {
  URL = window.URL;
}

const errorHandler = require('../util/errorHandler');
/**
 * @description 校验 sessionKey，将一个 session 绑定到指定的 qq 上
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {number}  qq         qq 号
 * @param {boolean} throwable  是否抛出已知的 mah 异常，用来在发生异常时获得返回值中的 mah 状态码
 * @returns {Object} 结构 { message, code }
 */


module.exports = async ({
  baseUrl,
  sessionKey,
  qq,
  throwable = true
}) => {
  try {
    // 拼接 auth url
    const url = new URL('/verify', baseUrl).toString(); // 请求

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
      throw new Error('core.verify 请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      if (throwable) throw new Error(message);
    }

    return {
      message,
      code
    };
  } catch (error) {
    errorHandler(error);
  }
};