"use strict";

const {
  errCodeMap
} = require('../util/errCode');

const axios = require('axios').default;

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
 * @description 获取群列表
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @returns {Object[]} 结构 array[...{ id, name, permission }]
 */


module.exports = async ({
  baseUrl,
  sessionKey
}) => {
  try {
    // 拼接 url
    const url = new URL('/groupList', baseUrl).toString(); // 请求

    const responseData = await axios.get(url, {
      params: {
        sessionKey
      }
    });

    try {
      var {
        data,
        data: {
          msg: message,
          code
        }
      } = responseData;
    } catch (error) {
      throw new Error('core.getGroupList 请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      throw new Error(message);
    }

    return data;
  } catch (error) {
    errorHandler(error);
  }
};