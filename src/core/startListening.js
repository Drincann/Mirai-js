const WebSocket = require('ws');
const { URL } = require('url');

/**
 * @description 开始侦听事件
 * @param {string}   baseUrl    mirai-api-http server 的地址
 * @param {string}   sessionKey 会话标识
 * @param {function} callback   毁掉函数
 */
module.exports = async ({ baseUrl, sessionKey, callback }) => {
    // 拼接 url
    let url = new URL(`/all?sessionKey=${sessionKey}`, baseUrl);
    // 更改协议为 ws
    url.protocol = 'ws';
    url = url.toString();

    // 监听
    const ws = new WebSocket(url);
    ws.on('open', () => {
        ws.on('message', data => {
            callback(JSON.parse(data));
        });
    });
    return ws;
};