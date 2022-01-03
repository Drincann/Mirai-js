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
 * @description 设置群配置
 * @param {string}  baseUrl           mirai-api-http server 的地址
 * @param {string}  sessionKey        会话标识
 * @param {string}  name	          群名
 * @param {string}  announcement	  群公告
 * @param {boolean} confessTalk	      是否开启坦白说
 * @param {boolean} allowMemberInvite 是否允许群员邀请
 * @param {boolean} autoApprove	      是否开启自动审批入群
 * @param {boolean} anonymousChat     是否允许匿名聊天
 * @returns {Object} 结构 { message, code }
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  target,
  name,
  announcement,
  confessTalk,
  allowMemberInvite,
  autoApprove,
  anonymousChat
}) => {
  try {
    // 拼接 url
    const url = new URL('/groupConfig', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      target,
      config: {
        name,
        announcement,
        confessTalk,
        allowMemberInvite,
        autoApprove,
        anonymousChat
      }
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