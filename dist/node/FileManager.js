"use strict";

const fs = require('fs');

const path = require('path');

const {
  promisify
} = require('util');

class FileManager {
  constructor({
    bot,
    group
  }) {
    const baseUrl = bot.getBaseUrl();
    const sessionKey = bot.sessionKey(); // core 柯里化，为内部类 File Directory 提供包装的接口

    this._getGroupFileList = ({
      dir
    }) => require('./core/fs/getGroupFileList')({
      baseUrl,
      sessionKey,
      target: group,
      dir
    });

    this._getGroupFileInfo = ({
      id
    }) => require('./core/fs/getGroupFileInfo')({
      baseUrl,
      sessionKey,
      target: group,
      id
    });

    this._uploadFileAndSend = ({
      type,
      path,
      file
    }) => require('./core/fs/uploadGroupFIle')({
      baseUrl,
      sessionKey,
      type,
      target: group,
      path,
      file
    });

    this._groupFileDelete = ({
      id
    }) => require('./core/fs/deleteGroupFile')({
      baseUrl,
      sessionKey,
      target: group,
      id
    });

    this._makeGroupDir = ({
      dir
    }) => require('./core/fs/makeGroupDir')({
      baseUrl,
      sessionKey,
      target: group,
      dir
    });

    this._groupFileRename = ({
      id,
      rename
    }) => require('./core/fs/renameGroupFile')({
      baseUrl,
      sessionKey,
      target: group,
      id,
      rename
    });

    this._groupFileMove = ({
      id,
      movePath
    }) => require('./core/fs/moveGroupFile')({
      baseUrl,
      sessionKey,
      target: group,
      id,
      movePath
    }); // 外部类实例引用


    let FileManager_this = this;

    class File {
      constructor(fileObj) {
        // 将 GET /groupFileList 与 GET /groupFileInfo 的信息放一起 
        this._details = {
          name: fileObj === null || fileObj === void 0 ? void 0 : fileObj.name,
          id: fileObj === null || fileObj === void 0 ? void 0 : fileObj.id,
          path: fileObj === null || fileObj === void 0 ? void 0 : fileObj.path,
          isFile: fileObj === null || fileObj === void 0 ? void 0 : fileObj.isFile
        }; // 按需请求，延后求值

        /*{
            id: undefined,
            path: undefined,
            name: undefined,
            length: undefined,
            downloadTimes: undefined,
            uploaderId: undefined,
            uploadTime: undefined,
            lastModifyTime: undefined,
            downloadUrl: undefined,
            sha1: undefined,
            md5: undefined,
        };*/
      }
      /**
       * @description 移除该文件
       * @returns this
       */


      async delete() {
        await FileManager_this._groupFileDelete({
          id: this._details.id
        });
        return this;
      }
      /**
       * @description 移动文件
       * @returns this
       */


      async move(path) {
        if (!path) {
          throw new Error('Bot.FileManager.File.move 缺少必要的 path 参数');
        }

        await FileManager_this._groupFileMove({
          id: this._details.id,
          movePath: path
        }); // 更新 fields

        await this._requestFields();
        return this;
      }
      /**
       * @description 重命名文件
       * @returns this
       */


      async rename(name) {
        if (!name) {
          throw new Error('Bot.FileManager.File.rename 缺少必要的 name 参数');
        }

        await FileManager_this._groupFileRename({
          id: this._details.id,
          rename: name
        }); // 更新 fields

        await this._requestFields();
        return this;
      }
      /**
       * @private
       * @description 请求 file info 并合并对象至 this._details
       */


      async _requestFields() {
        return Object.assign(this._details, await FileManager_this._getGroupFileInfo({
          id: await this.id()
        }));
      }
      /**
       * @private
       * @description 获取属性的抽象
       */


      async _getField(field) {
        if (!this._details[field]) {
          await this._requestFields();
        }

        return this._details[field];
      }
      /**
       * @description 文件属性
       */


      async allFields() {
        return await this._requestFields();
      }

      async isDir() {
        return !(await this._getField('isFile'));
      }

      async isFile() {
        return await this._getField('isFile');
      }

      async name() {
        return await this._getField('name');
      }

      async path() {
        return await this._getField('path');
      }

      async id() {
        return await this._getField('id');
      }

      async length() {
        return await this._getField('length');
      }

      async downloadTimes() {
        return await this._getField('downloadTimes');
      }

      async uploaderId() {
        return await this._getField('uploaderId');
      }

      async uploadTime() {
        return await this._getField('uploadTime');
      }

      async lastModifyTime() {
        return await this._getField('lastModifyTime');
      }

      async downloadUrl() {
        return await this._getField('downloadUrl');
      }

      async sha1() {
        return await this._getField('sha1');
      }

      async md5() {
        return await this._getField('md5');
      }

    }

    class Directory {
      constructor(fileObj) {
        this._details = {
          name: fileObj === null || fileObj === void 0 ? void 0 : fileObj.name,
          id: fileObj === null || fileObj === void 0 ? void 0 : fileObj.id,
          path: fileObj === null || fileObj === void 0 ? void 0 : fileObj.path,
          isFile: fileObj === null || fileObj === void 0 ? void 0 : fileObj.isFile
        };
      }
      /**
       * @private
       * @description 获取属性的抽象
       */


      async _getField(field) {
        return this._details[field];
      }
      /**
       * @description 目录属性
       */


      async allFields() {
        return await this._details;
      }

      async isDir() {
        return !(await this._getField('isFile'));
      }

      async isFile() {
        return await this._getField('isFile');
      }

      async name() {
        return await this._getField('name');
      }

      async path() {
        return await this._getField('path');
      }

      async id() {
        return await this._getField('id');
      }
      /**
       * @description 获取指定目录下的 文件/目录 数组
       * @param {string} dir 可选，目录，默认为当前实例指代的目录
       * @returns 
       */


      async getFileList(dir = this._details.path) {
        return (await FileManager_this._getGroupFileList({
          dir
        })).map(fileObj => FileManager_this._getInstance(fileObj));
      }
      /**
       * @description 上传文件至当前实例指代的目录下
       * @param {Buffer} file     二选一，文件二进制数据
       * @param {string} filePath 二选一，文件路径
       * @param {string} filename 可选，文件名，默认为指定路径的文件名
       */


      async upload({
        file,
        filePath,
        filename
      }) {
        var _ref;

        // 检查参数
        if (process.browser && filePath) {
          throw new Error('Bot.FileManager.Directory.upload 浏览器端不支持 filePath 参数');
        }

        if (!file && !filePath) {
          throw new Error('Bot.FileManager.Directory.upload 缺少必要的 file 或 filePath 参数');
        } // 若传入 filename 则统一转换为 Buffer


        if (filename) {
          var _file;

          // 优先使用 file 的原值
          file = (_file = file) !== null && _file !== void 0 ? _file : await promisify(fs.readFile)(filename);
        }

        await this._uploadFileAndSend({
          file,
          type: 'group',
          path: (_ref = (await this.path()) + filename) !== null && _ref !== void 0 ? _ref : path.parse(filePath).base
        });
      }

    } // 内部类引用


    this.File = File;
    this.Directory = Directory;
  }
  /**
   * @private
   * @description 工厂方法，返回 File Directory 实例
   * @param {Object} fileObj 
   * @returns 
   */


  _getInstance(fileObj) {
    if ((fileObj === null || fileObj === void 0 ? void 0 : fileObj.isFile) === true) {
      return new this.File(fileObj);
    } else if ((fileObj === null || fileObj === void 0 ? void 0 : fileObj.isFile) === false) {
      return new this.Directory(fileObj);
    }

    return undefined;
  }
  /**
   * @description 获取指定目录下的 文件/目录 数组
   * @param {string} dir 可选，目录，默认为根目录
   * @returns 
   */


  async getFileList(dir) {
    return (await this._getGroupFileList({
      dir
    })).map(fileObj => this._getInstance(fileObj));
  }
  /**
   * @description 上传文件至指定的绝对路径
   * @param {string} uploadPath 必须，上传的绝对路径
   * @param {Buffer} file       二选一，文件二进制数据
   * @param {string} filePath   二选一，文件路径
   */


  async uploadTo({
    uploadPath,
    file,
    filePath
  }) {
    // 检查参数
    if (process.browser && filePath) {
      throw new Error('Bot.FileManager.uploadTo 浏览器端不支持 filePath 参数');
    }

    if (!file && !filePath) {
      throw new Error('Bot.FileManager.uploadTo 缺少必要的 file 或 filePath 参数');
    } // 若传入 filename 则统一转换为 Buffer


    if (filePath) {
      var _file2;

      // 优先使用 file 的原值
      file = (_file2 = file) !== null && _file2 !== void 0 ? _file2 : await promisify(fs.readFile)(filePath);
    }

    await this._uploadFileAndSend({
      type: 'Group',
      path: uploadPath,
      file
    });
  }

}

module.exports = {
  FileManager
};