const { errCodeMap } = require('../../util/errCode');
const axios = require('axios');
let URL;
if (!process.browser) {
    ({ URL } = require('url'));
} else {
    URL = window.URL;
}
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const locationStr = `core.${path.basename(__filename, path.extname(__filename))}`;

/**
 * @description 移动群文件
 * @param {string}  baseUrl    mirai-api-http server 的地址
 * @param {string}  sessionKey 会话标识
 * @param {string}  id         文件夹id, 空串为根目录
 * @param {string}  path       文件夹路径, 文件夹允许重名, 不保证准确, 准确定位使用 id
 * @param {number}  group      群号
 * @param {string}  moveTo     移动目标文件夹id
 * @param {string}  moveToPath 移动目标文件夹path
 * @returns {Object} 结构 { message, code }
 */
module.exports = async ({ baseUrl, sessionKey, id, path, group, moveTo, moveToPath }) => {
    try {
        // 拼接 url
        const url = new URL('/file/move', baseUrl).toString();

        // 请求
        const responseData = await axios.post(url, {
            sessionKey, id, path, target: group, group, moveTo, moveToPath
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