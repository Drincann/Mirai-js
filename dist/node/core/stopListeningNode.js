"use strict";

const errorHandler = require('../util/errorHandler');

const path = require('path');

const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;
/**
 * @description 停止侦听事件
 * @param {WebSocket} 建立连接的 WebSocket 实例
 */

module.exports = async wsConnection => {
  try {
    // 由于在 ws open 之前关闭连接会抛异常，故应先判断此时是否正在连接中
    if (wsConnection.readyState == wsConnection.CONNECTING) {
      // 正在连接中，注册一个 open，等待回调时关闭
      // 由于是一个异步过程，使用 Promise 包装以配合开发者可能存在的同步调用
      await new Promise(resolve => {
        wsConnection.on('open', () => {
          // 关闭 websocket 的连接
          wsConnection.close(1000);
          resolve(undefined);
        });
      });
    } else if (wsConnection.readyState == wsConnection.OPEN) {
      // 关闭 websocket 的连接
      wsConnection.close(1000);
    } else {// CLOSING or CLOSED
      // do nothing
    }
  } catch (error) {
    console.error(`mirai-js: error ${locationStr}`);
    errorHandler(error);
  }
};