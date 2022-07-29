const { errCodeMap } = require('../../util/errCode');
const axios = require('axios');
const { URL } = require('../../polyfill/URL');
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';

/**
 * @description 重命名群文件
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} id         文件 id
 * @param {number} group      群号
 * @param {string} rename     重命名
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, id, path, group, renameTo }) => {
    try {
        // 拼接 url
        const url = new URL('/file/rename', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, {
            sessionKey, id, path, target: group, group, renameTo
        });

        try {
            var {
                data: { msg: message, code }
            } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }
        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return { message, code };
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};