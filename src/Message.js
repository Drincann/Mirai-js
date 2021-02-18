// 用于与 Bot.sendMessage 耦合的接口
const { MessageChainGetable } = require('./interface');

/**
 * @description http 接口需要的消息类型
 */
class MessageType {
    constructor({ type }) {
        this.type = type;
    }
}

class Text extends MessageType {
    constructor({ text }) {
        super({ type: 'Plain' });
        this.text = text;
    }
}

class At extends MessageType {
    constructor({ target, display }) {
        super({ type: 'At' });
        this.target = target;

        // ? 不太清楚这个字段是干啥的
        this.display = display;
    }
}

class AtAll extends MessageType {
    constructor() {
        super({ type: 'AtAll' });
    }
}

class Image extends MessageType {
    constructor({ imageId, url, path }) {
        super({ type: 'Image' });
        this.imageId = imageId;
        this.url = url;

        // 图片路径相对于 mirai-console 
        // 的 plugins/MiraiAPIHTTP/images
        this.path = path;
    }
}

class FlashImage extends MessageType {
    constructor({ imageId, url, path }) {
        super({ type: 'FlashImage' });
        this.imageId = imageId;
        this.url = url;

        // 图片路径相对于 mirai-console 
        // 的 plugins/MiraiAPIHTTP/images
        this.path = path;
    }
}

class Voice extends MessageType {
    constructor({ voiceId, url, path }) {
        super({ type: 'Voice' });
        this.voiceId = voiceId;
        this.url = url;

        // 语音路径相对于 mirai-console 
        // 的 plugins/MiraiAPIHTTP/voices
        this.path = path;
    }
}


/**
 * @description 本框架抽象的消息类型，getMessageChainable
 */
class Message extends MessageChainGetable {
    constructor() {
        super();
        this.messageChain = [];
    }

    // 文本
    addText(text) {
        this.messageChain.push(new Text({ text }));
        return this;
    }

    // At@
    addAt(target) {
        this.messageChain.push(new At({ target }));
        return this;
    }
    addAtAll() {
        this.messageChain.push(new AtAll());
        return this;
    }

    // 图片
    addImageId(imageId) {
        this.messageChain.push(new Image({ imageId }));
        return this;
    }
    addImageUrl(url) {
        this.messageChain.push(new Image({ url }));
        return this;
    }
    addImagePath(path) {
        this.messageChain.push(new Image({ path }));
        return this;
    }

    // 闪照
    addFlashImageId(imageId) {
        this.messageChain.push(new FlashImage({ imageId }));
        return this;
    }
    addFlashImageUrl(url) {
        this.messageChain.push(new FlashImage({ url }));
        return this;
    }
    addFlashImagePath(path) {
        this.messageChain.push(new FlashImage({ path }));
        return this;
    }

    // 语音
    addVoiceId(voiceId) {
        this.messageChain.push(new Voice({ voiceId }));
        return this;
    }
    addVoiceUrl(url) {
        this.messageChain.push(new Voice({ url }));
        return this;
    }
    addVoicePath(path) {
        this.messageChain.push(new Voice({ path }));
        return this;
    }
    // get 原接口格式的信息链
    getMessageChain() {
        return this.messageChain;
    }
}

module.exports = { Message };