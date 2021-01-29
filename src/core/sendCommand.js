const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 * @description 向 mirai-console 发送指令
 * @param {string} baseUrl     mirai-api-http server 的地址
 * @param {string} authKey     mirai-api-http server 设置的 authKey
 * @param {string} command     指令名
 * @param {array[string]} args array[string] 指令的参数
 * @returns {Object} 结构 { message }
 */
module.exports = async ({ baseUrl, authKey, command: name, args }) => {
    try {
        // 拼接 url
        const url = new URL('/command/send', baseUrl).toString();

        // 请求
        const { data: message } = await axios.post(url, { authKey, name, args, });

        return { message };
    } catch (error) {
        errorHandler(error);
    }

};
