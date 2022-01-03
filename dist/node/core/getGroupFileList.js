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

const path = require('path');

const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
/**
 * @description 获取群文件列表
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     群号
 * @param {string} dir        可选，查询目录，默认为根目录
 * @returns {Object[]}   结构 array[...{ id, name, path, isFile }]
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  target,
  dir
}) => {
  try {
    // 拼接 url
    const url = new URL('/groupFileList', baseUrl).toString(); // 请求

    const responseData = await axios.get(url, {
      params: {
        sessionKey,
        target,
        dir
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
      throw new Error('请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`mirai-js: error ${locationStr}`);
    errorHandler(error);
  }
};