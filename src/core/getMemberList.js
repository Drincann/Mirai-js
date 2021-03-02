const errCode = require('../util/errCode');
const axios = require('axios').default;
const { URL } = require('url');
const errorHandler = require('../util/errorHandler');

/**
 * @description 获取指定群的成员列表
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     欲获取成员列表的群号
 * @returns {array[Object]} 
 * 结构 array[{
 * 
 *  id, memberName, permission, 
 *  group: { id, name, permission },
 * 
 * }]
 */
module.exports = async ({ baseUrl, sessionKey, target }) => {
    try {
        // 拼接 url
        const url = new URL('/memberList', baseUrl).toString();

        // 请求
        const responseData = await axios.get(url, { params: { sessionKey, target } });
        try {
            var { data, data: { msg: message, code }} = responseData;
        } catch (error) {
            throw new Error('core.getMemberList 请求返回格式出错，请检查 mirai-console');
        }

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return data;
    } catch (error) {
        errorHandler(error);
    }
};
