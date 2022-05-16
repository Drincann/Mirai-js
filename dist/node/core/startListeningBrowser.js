"use strict";

const WebSocket = window.WebSocket;

const {
  URL
} = require('../polyfill/URL');

const errorHandler = require('../util/errorHandler');

const path = require('path');

const locationStr = window === undefined ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';
/**
 * @description 开始侦听事件
 * @param {string}   baseUrl            mirai-api-http server 的地址
 * @param {string}   sessionKey         会话标识
 * @param {function} message            回调函数
 * @param {function} error              回调函数
 * @param {function} close              回调函数
 * @returns {WebSocket} 建立连接的 WebSocket 实例
 */

module.exports = async ({
  baseUrl,
  sessionKey,
  verifyKey,
  message,
  error,
  close
}) => {
  try {
    // 拼接 url
    let url = new URL(`/all?sessionKey=${sessionKey}&verifyKey=${verifyKey}`, baseUrl); // 更改协议为 ws

    url.protocol = 'ws';
    url = url.toString();
    const ws = new WebSocket(url); // 监听 ws 事件，分发消息

    ws.onopen = () => {
      // 10s 发个心跳，浏览器会过早关闭没有发生交互的连接
      const interval = setInterval(() => {
        ws.send(1);
      }, 10000);

      ws.onmessage = ({
        data
      }) => {
        try {
          var _JSON$parse;

          message((_JSON$parse = JSON.parse(data)) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.data);
        } catch (error) {} // eslint-disable-line no-empty

      };

      ws.onerror = err => {
        /* 
        interface Error {
            name: string;
            message: string;
            stack?: string;
        } 
        */
        error(err);
      };

      ws.onclose = ({
        code,
        reason
      }) => {
        // 关闭心跳
        clearInterval(interval);
        close({
          code,
          reason
        });
      };
    };

    return ws;
  } catch (error) {
    console.error(`mirai-js: error ${locationStr}`);
    errorHandler(error);
  }
};