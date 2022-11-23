# 准备工作

**Mirai-js** 运行在 Node.js 平台或现代浏览器中，确保拥有可使用的 **Node.js v12+** 环境或浏览器环境。

**Mirai-js** 还依赖 **mirai-api-http** 服务端，基于该框架开发的 Mirai QQ 机器人应用将作为 **mirai-api-http** 的客户端。

**mirai-api-http** 是 **mirai-console** 的插件，确保 **Java 11+** 环境。

开始前，请确保开启了 **mirai-console**，并在可访问的网络上（例如本地）加载了 **mirai-api-http** 插件。

- Node.js 12+ / browser
- Java 11+

## 不会开启？

1. 使用加载器

   使用 **mirai-console-loader (MCL)** ，它是便捷的 **mirai-console** 的启动器。
   在 [这里](https://github.com/iTXTech/mirai-console-loader/releases) 下载最新的发布版本。

2. 安装 **mirai-api-http**

   使用 **MCL** 安装 **mirai-api-http**，确保位于 **MCL** 的根目录下。

   ~~在命令行中执行：~~

   ~~.\mcl --update-package net.mamoe:mirai-api-http --channel stable --type plugin~~

   ~~然后在命令行中执行 `.\mcl` 以启动 **MCL**，同时会自动安装刚才指定的 mirai-api-http 服务。~~

   划掉部分为 `mcl` 提供的安装方式，这种方式在之前是可以用的，而且非常方便，只不过目前会有奇奇怪怪的问题。

   推荐自行下载插件放入**plugins** 文件夹：

   在命令行中执行 `.\mcl` 以生成 **plugins** 文件夹。

   下载 **mirai-api-http** 插件放入 **plugins** 文件夹。插件可在 [mirai-api-http](https://github.com/project-mirai/mirai-api-http/releases) 下载。

   再次执行 `.\mcl` 以启动 **MCL**。

3. 配置 **mirai-api-http**

   编辑 `config/MiraiApiHttp/setting.yml`。

    ```yml
    ## 启用的 adapter, 内置有 http, ws, reverse-ws, webhook
    adapters:
      - http
      - ws

    ## 是否开启认证流程, 若为 true 则建立连接时需要验证 verifyKey
    ## 建议公网连接时开启
    enableVerify: true
    verifyKey: 123456
    
    ## 是否开启单 session 模式, 若为 true，则自动创建 session 绑定 console 中登录的 bot
    ## 开启后，接口中任何 sessionKey 不需要传递参数
    ## 若 console 中有多个 bot 登录，则行为未定义
    ## 确保 console 中只有一个 bot 登陆时启用
    singleMode: false
    
    ## 历史消息的缓存大小
    ## 同时，也是 http adapter 的消息队列容量
    cacheSize: 4096
    
    ## adapter 的单独配置，键名与 adapters 项配置相同
    adapterSettings:
      ## 详情看 http adapter 使用说明 配置
      http:
         host: 0.0.0.0
         port: 8080
         cors: [*]
      
      ## 详情看 websocket adapter 使用说明 配置
      ws:
         host: 0.0.0.0
         port: 8080
         reservedSyncId: -1
    ```

   按照自身需求编辑 `port`，它将指定该服务将开放在哪个端口。

   更改 `verifyKey`，然后记住它，它是框架与服务端交互的凭证。

   `mirai-api-http` 使用了模块化的适配器设计，在当前版本，我们要求并用 http 与 ws adaptor，且 port 一致。

   在未来，框架将整体迁移至 ws adaptor。

4. 启动

   在命令行中重启 MCL。

>此外，为了应对可能存在的登录问题，建议额外安装 `mirai-login-solver-selenium`：
>
>```
>./mcl --update-package net.mamoe:mirai-login-solver-selenium --channel nightly --type plugin
>```

## 什么是 Mirai？

请移步 [Mirai 生态概览](https://github.com/mamoe/mirai/blob/dev/docs/mirai-ecology.md)。

## 相关仓库

- [mirai](https://github.com/mamoe/mirai)
- [mirai-login-solver-selenium](https://github.com/project-mirai/mirai-login-solver-selenium)
- [mirai-console](https://github.com/mamoe/mirai-console)
- [mirai-console-loader](https://github.com/iTXTech/mirai-console-loader)
- [mirai-api-http](https://github.com/project-mirai/mirai-api-http)
- [Mirai-js](https://github.com/Drincann/Mirai-js)
