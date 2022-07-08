const { errCodeMap } = require('../../util/errCode');
const axios = require('axios').default;
const { URL } = require('../../polyfill/URL');
const errorHandler = require('../../util/errorHandler');
const path = require('path');
const { isBrowserEnv } = require('../../util/isBrowserEnv');
const locationStr = !isBrowserEnv() ? `core.${path.basename(__filename, path.extname(__filename))}` : 'borwser';

/**
 * @description 获取群文件列表
 * @param {string}  baseUrl          mirai-api-http server 的地址
 * @param {string}  sessionKey       会话标识
 * @param {string}  id               文件夹id, 空串为根目录
 * @param {string}  path             文件夹路径, 文件夹允许重名, 不保证准确, 准确定位使用 id
 * @param {number}  group            群号
 * @param {boolern} withDownloadInfo 是否携带下载信息，额外请求，无必要不要携带
 * @param {number}  offset	         分页偏移
 * @param {number}  size	         分页大小
 * @returns {Object[]}   结构 array[...{ id, name, path, parent, contact, isFile, isDirectory, downloadInfo }]
 */
module.exports = async ({ baseUrl, sessionKey, id, path, group/*, qq 字段保留 */, withDownloadInfo, offset, size }) => {
    try {
        // 拼接 url
        const url = new URL('/file/list', baseUrl).toString();

        // 请求
        const responseData = await axios.get(url, {
            params: {
                sessionKey, id, path, target: group, group, withDownloadInfo, offset, size
            }
        });
        try {
            var { data: { msg: message, code, data } } = responseData;
        } catch (error) {
            throw new Error(('请求返回格式出错，请检查 mirai-console'));
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCodeMap) {
            throw new Error(message);
        }
        return data;
    } catch (error) {
        console.error(`mirai-js: error ${locationStr}`);
        errorHandler(error);
    }
};