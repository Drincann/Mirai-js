const WebSocket = require('ws');
const { URL } = require('url');

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
module.exports = async ({ baseUrl, sessionKey, message, error, close, unexpectedResponse }) => {
    // 拼接 url
    let url = new URL(`/all?sessionKey=${sessionKey}`, baseUrl);
    // 更改协议为 ws
    url.protocol = 'ws';
    url = url.toString();

    // 监听
    const ws = new WebSocket(url);
    ws.on('open', () => {

    });
    ws.on('message', data => {
        message(JSON.parse(data));
    });
    ws.on('error', (err) => {
        /* 
        interface Error {
            name: string;
            message: string;
            stack?: string;
        } 
        */
        error(err);
    })
    ws.on('close', (code, reason) => {
        close(code, reason);
    })
    ws.on('unexpectedResponse', (req, res) => {
        unexpectedResponse(req, res);
    })
    return ws;
};