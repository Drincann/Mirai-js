/**
 * @description 为事件处理器提供中间件
 * 每个方法都是一个中间件，链式调用，最后调用 done 并传入
 * 回调函数将生成一个带有中间件的事件处理器
 * 你的回调函数将在所有链式调用过的中间件结束后被调用
 */
class MiddleWare {
    constructor() {
        this.middleWares = [];
    }

    /**
     * @description 过滤出指定类型的消息，消息类型为 key，对应类型的
     *              message 数组为 value，置于 data.classified
     * @param {array[string]} typeArr message 的类型，例如 Plain Image Voice
     */
    filter(typeArr) {
        this.middleWares.push(data => {
            const result = {};
            typeArr.forEach((type) => {
                result[type] = data.messageChain.filter((message) => message.type == type);
            });
            return {
                result,
                fieldName: 'classified',
            };
        });
        return this;
    }

    /**
     * @description 过滤出字符串类型的 message，并拼接在一起，置于 data.text
     */
    filtText() {
        this.middleWares.push(data => {

            return {
                result: data.messageChain.filter((val) => val.type == 'Plain').map((val) => val.text).join(''),
                fieldName: 'text',
            }
        });
        return this;
    }

    /**
     * @description 生成一个带有中间件的事件处理器
     * @param {function} callback 事件处理器
     */
    done(callback) {
        return async data => {
            this.middleWares.forEach((middleWare) => {
                const { result, fieldName } = middleWare(data);
                data[fieldName] = result;
            });
            callback(data);
        }
    }
}

module.exports = MiddleWare;