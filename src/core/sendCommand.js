const axios = require('axios').default;
let URL;
if (!process.browser) {
    ({ URL } = require('url'));
} else {
    URL = window.URL;
}
const errorHandler = require('../util/errorHandler');

/**
 * @description 向 mirai-console 发送指令
 * @param {string} baseUrl mirai-api-http server 的地址
 * @param {string} verifyKey mirai-api-http server 设置的 verifyKey
 * @param {string} command 指令名
 * @param {string[]} args  指令的参数
 * @returns {Object} 结构 { message }
 */
module.exports = async ({ baseUrl, verifyKey, command: name, args }) => {
    try {
        // 拼接 url
        const url = new URL('/command/send', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, { verifyKey, name, args, });
        try {
            var {
                data: message
            } = responseData;
        } catch (error) {
            throw new Error('core.sendCommand 请求返回格式出错，请检查 mirai-console');
        }
        return { message };
    } catch (error) {
        errorHandler(error);
    }

};
