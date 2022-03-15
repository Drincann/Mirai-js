"use strict";

// 用于与 Bot.sendMessage 耦合的接口
const {
  MessageChainGetable
} = require('./interface');
/**
 * @description http 接口需要的消息类型
 */


class MessageType {
  constructor({
    type
  }) {
    this.type = type;
  }

}

class Plain extends MessageType {
  constructor({
    text
  }) {
    super({
      type: 'Plain'
    });
    this.text = text;
  }

}

class Text extends MessageType {
  constructor({
    text
  }) {
    super({
      type: 'Plain'
    });
    this.text = text;
  }

}

class At extends MessageType {
  constructor({
    target,
    display
  }) {
    super({
      type: 'At'
    });
    this.target = target; // ? 不太清楚这个字段是干啥的

    this.display = display;
  }

}

class AtAll extends MessageType {
  constructor() {
    super({
      type: 'AtAll'
    });
  }

}

class Image extends MessageType {
  constructor({
    imageId,
    url,
    path
  }) {
    super({
      type: 'Image'
    });
    this.imageId = imageId;
    this.url = url; // 图片路径相对于 mirai-console 
    // 的 plugins/MiraiAPIHTTP/images

    this.path = path;
  }

}

class FlashImage extends MessageType {
  constructor({
    imageId,
    url,
    path
  }) {
    super({
      type: 'FlashImage'
    });
    this.imageId = imageId;
    this.url = url; // 图片路径相对于 mirai-console 
    // 的 plugins/MiraiAPIHTTP/images

    this.path = path;
  }

}

class Voice extends MessageType {
  constructor({
    voiceId,
    url,
    path
  }) {
    super({
      type: 'Voice'
    });
    this.voiceId = voiceId;
    this.url = url; // 语音路径相对于 mirai-console 
    // 的 plugins/MiraiAPIHTTP/voices

    this.path = path;
  }

}

class Xml extends MessageType {
  constructor({
    xml
  }) {
    super({
      type: 'Xml'
    });
    this.xml = xml;
  }

}

class Json extends MessageType {
  constructor({
    json
  }) {
    super({
      type: 'Json'
    });
    this.json = json;
  }

}

class App extends MessageType {
  constructor({
    content
  }) {
    super({
      type: 'App'
    });
    this.content = content;
  }

}

const faceMap = new Map([['惊讶', 0], ['撇嘴', 1], ['色', 2], ['发呆', 3], ['得意', 4], ['流泪', 5], ['害羞', 6], ['闭嘴', 7], ['睡', 8], ['大哭', 9], ['尴尬', 10], ['发怒', 11], ['调皮', 12], ['呲牙', 13], ['微笑', 14], ['难过', 15], ['酷', 16], ['抓狂', 18], ['吐', 19], ['偷笑', 20], ['可爱', 21], ['白眼', 22], ['傲慢', 23], ['饥饿', 24], ['困', 25], ['惊恐', 26], ['流汗', 27], ['憨笑', 28], ['悠闲', 29], ['奋斗', 30], ['咒骂', 31], ['疑问', 32], ['嘘', 33], ['晕', 34], ['折磨', 35], ['衰', 36], ['骷髅', 37], ['敲打', 38], ['再见', 39], ['发抖', 41], ['爱情', 42], ['跳跳', 43], ['猪头', 46], ['拥抱', 49], ['蛋糕', 53], ['闪电', 54], ['炸弹', 55], ['刀', 56], ['足球', 57], ['便便', 59], ['咖啡', 60], ['饭', 61], ['玫瑰', 63], ['凋谢', 64], ['爱心', 66], ['心碎', 67], ['礼物', 69], ['太阳', 74], ['月亮', 75], ['赞', 76], ['踩', 77], ['握手', 78], ['胜利', 79], ['飞吻', 85], ['怄火', 86], ['西瓜', 89], ['冷汗', 96], ['擦汗', 97], ['抠鼻', 98], ['鼓掌', 99], ['糗大了', 100], ['坏笑', 101], ['左哼哼', 102], ['右哼哼', 103], ['哈欠', 104], ['鄙视', 105], ['委屈', 106], ['快哭了', 107], ['阴险', 108], ['左亲亲', 109], ['吓', 110], ['可怜', 111], ['菜刀', 112], ['啤酒', 113], ['篮球', 114], ['乒乓', 115], ['示爱', 116], ['瓢虫', 117], ['抱拳', 118], ['勾引', 119], ['拳头', 120], ['差劲', 121], ['爱你', 122], ['不', 123], ['好', 124], ['转圈', 125], ['磕头', 126], ['回头', 127], ['跳绳', 128], ['挥手', 129], ['激动', 130], ['街舞', 131], ['献吻', 132], ['左太极', 133], ['右太极', 134], ['双喜', 136], ['鞭炮', 137], ['灯笼', 138], ['K歌', 140], ['喝彩', 144], ['祈祷', 145], ['爆筋', 146], ['棒棒糖', 147], ['喝奶', 148], ['飞机', 151], ['钞票', 158], ['药', 168], ['手枪', 169], ['茶', 171], ['眨眼睛', 172], ['泪奔', 173], ['无奈', 174], ['卖萌', 175], ['小纠结', 176], ['喷血', 177], ['斜眼笑', 178], ['doge', 179], ['惊喜', 180], ['骚扰', 181], ['笑哭', 182], ['我最美', 183], ['河蟹', 184], ['羊驼', 185], ['幽灵', 187], ['蛋', 188], ['菊花', 190], ['红包', 192], ['大笑', 193], ['不开心', 194], ['冷漠', 197], ['呃', 198], ['好棒', 199], ['拜托', 200], ['点赞', 201], ['无聊', 202], ['托脸', 203], ['吃', 204], ['送花', 205], ['害怕', 206], ['花痴', 207], ['小样儿', 208], ['飙泪', 210], ['我不看', 211], ['托腮', 212], ['啵啵', 214], ['糊脸', 215], ['拍头', 216], ['扯一扯', 217], ['舔一舔', 218], ['蹭一蹭', 219], ['拽炸天', 220], ['顶呱呱', 221], ['抱抱', 222], ['暴击', 223], ['开枪', 224], ['撩一撩', 225], ['拍桌', 226], ['拍手', 227], ['恭喜', 228], ['干杯', 229], ['嘲讽', 230], ['哼', 231], ['佛系', 232], ['掐一掐', 233], ['惊呆', 234], ['颤抖', 235], ['啃头', 236], ['偷看', 237], ['扇脸', 238], ['原谅', 239], ['喷脸', 240], ['生日快乐', 241], ['头撞击', 242], ['甩头', 243], ['扔狗', 244], ['加油必胜', 245], ['加油抱抱', 246], ['口罩护体', 247], ['搬砖中', 260], ['忙到飞起', 261], ['脑阔疼', 262], ['沧桑', 263], ['捂脸', 264], ['辣眼睛', 265], ['哦哟', 266], ['头秃', 267], ['问号脸', 268], ['暗中观察', 269], ['emm', 270], ['吃瓜', 271], ['呵呵哒', 272], ['我酸了', 273], ['太南了', 274], ['辣椒酱', 276], ['汪汪', 277], ['汗', 278], ['打脸', 279], ['击掌', 280], ['无眼笑', 281], ['敬礼', 282], ['狂笑', 283], ['面无表情', 284], ['摸鱼', 285], ['魔鬼笑', 286], ['哦', 287], ['请', 288], ['睁眼', 289], ['敲开心', 290], ['震惊', 291], ['让我康康', 292], ['摸锦鲤', 293], ['期待', 294], ['拿到红包', 295], ['真好', 296], ['拜谢', 297], ['元宝', 298], ['牛啊', 299], ['胖三斤', 300], ['好闪', 301], ['左拜年', 302], ['右拜年', 303], ['红包包', 304], ['右亲亲', 305], ['牛气冲天', 306], ['喵喵', 307], ['求红包', 308], ['谢红包', 309], ['新年烟花', 310], ['打call', 311], ['变形', 312], ['嗑到了', 313], ['仔细分析', 314], ['加油', 315], ['我没事', 316], ['菜狗', 317], ['崇拜', 318], ['比心', 319], ['庆祝', 320], ['老色痞', 321], ['拒绝', 322], ['嫌弃', 323], ['吃糖', 324]]);

class Face extends MessageType {
  constructor({
    faceId,
    name
  }) {
    super({
      type: 'Face'
    });
    this.faceId = faceId;
    this.name = name;
  }

}
/**
 * @description 本框架抽象的消息类型，getMessageChainable
 */


class Message extends MessageChainGetable {
  constructor() {
    super();
    this.messageChain = [];
  } // 文本


  addText(text) {
    this.messageChain.push(new Text({
      text
    }));
    return this;
  }

  addPlain(text) {
    this.messageChain.push(new Plain({
      text
    }));
    return this;
  } // At@


  addAt(target) {
    this.messageChain.push(new At({
      target
    }));
    return this;
  }

  addAtAll() {
    this.messageChain.push(new AtAll());
    return this;
  } // 图片


  addImageId(imageId) {
    this.messageChain.push(new Image({
      imageId
    }));
    return this;
  }

  addImageUrl(url) {
    this.messageChain.push(new Image({
      url
    }));
    return this;
  }

  addImagePath(path) {
    this.messageChain.push(new Image({
      path
    }));
    return this;
  } // 闪照


  addFlashImageId(imageId) {
    this.messageChain.push(new FlashImage({
      imageId
    }));
    return this;
  }

  addFlashImageUrl(url) {
    this.messageChain.push(new FlashImage({
      url
    }));
    return this;
  }

  addFlashImagePath(path) {
    this.messageChain.push(new FlashImage({
      path
    }));
    return this;
  } // 语音


  addVoiceId(voiceId) {
    this.messageChain.push(new Voice({
      voiceId
    }));
    return this;
  }

  addVoiceUrl(url) {
    this.messageChain.push(new Voice({
      url
    }));
    return this;
  }

  addVoicePath(path) {
    this.messageChain.push(new Voice({
      path
    }));
    return this;
  } // xml


  addXml(xml) {
    this.messageChain.push(new Xml({
      xml
    }));
    return this;
  } // json


  addJson(json) {
    this.messageChain.push(new Json({
      json
    }));
    return this;
  } // app


  addApp(content) {
    this.messageChain.push(new App({
      content
    }));
    return this;
  } // face


  addFace(name) {
    const idx = faceMap.get(name);

    if (idx) {
      this.messageChain.push(new Face({
        faceId: idx,
        name
      }));
    }

    return this;
  } // get 原接口格式的信息链


  getMessageChain() {
    return this.messageChain;
  }

}

module.exports = {
  Message
};