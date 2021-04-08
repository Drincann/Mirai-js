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
 * @description 获取群成员信息
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     群成员所在群号
 * @param {number} memberId   群成员的 qq 号
 * @returns {Object} 结构 { name, specialTitle } 群名片和群头衔
 */


module.exports = async ({
  baseUrl,
  sessionKey,
  target,
  memberId
}) => {
  try {
    // 拼接 url
    const url = new URL('/memberInfo', baseUrl).toString(); // 请求

    const responseData = await axios.get(url, {
      params: {
        sessionKey,
        target,
        memberId
      }
    });

    try {
      var {
        data: {
          msg: message,
          code,
          name,
          specialTitle
        }
      } = responseData;
    } catch (error) {
      throw new Error('core.getMemberInfo 请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      throw new Error(message);
    }

    return {
      name,
      specialTitle
    };
  } catch (error) {
    errorHandler(error);
  }
};