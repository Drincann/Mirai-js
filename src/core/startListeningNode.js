const WebSocket = require('ws');
const { URL } = require('../polyfill/URL');
const errorHandler = require('../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';

/**
 * @description 开始侦听事件
 * @param {string}   baseUrl            mirai-api-http server 的地址
 * @param {string}   sessionKey         会话标识
 * @param {function} message            回调函数
 * @param {function} error              回调函数
 * @param {function} close              回调函数
 * @param {function} unexpectedResponse 回调函数
 * @returns {WebSocket} 建立连接的 WebSocket 实例
 */
module.exports = async ({ baseUrl, sessionKey, verifyKey, message, error, close, unexpectedResponse }) => {
    try {
        // 拼接 url
        let url = new URL(`/all?sessionKey=${sessionKey}&verifyKey=${verifyKey}`, baseUrl);
        // 更改协议为 ws
        url.protocol = 'ws';
        url = url.toString();

        const ws = new WebSocket(url);


        // 监听 ws 事件，分发消息
        ws.on('open', () => {
            // 60s 发个心跳
            const interval = setInterval(() => {
                ws.ping((err) => {
                    if (err) {
                        try {
                            console.log(`ws ping error\n${JSON.stringify(err)}`);
                        } catch (error) { }// eslint-disable-line no-empty
                    }
                });
            }, 60000);

            ws.on('message', data => {
                try {
                    message(JSON.parse(data)?.data);
                } catch (error) { }// eslint-disable-line no-empty
            });

            ws.on('error', err => {
                /* 
                    interface Error {
                        name: string;
                        message: string;
                        stack?: string;
                    } 
                    */
                error(err);
            });

            ws.on('close', (code, reason) => {
                // 关闭心跳
                clearInterval(interval);
                close({ code, reason });
            });

            ws.on('unexpectedResponse', ({ req, res }) => {
                unexpectedResponse({ req, res });
            });
        });
        return ws;
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};