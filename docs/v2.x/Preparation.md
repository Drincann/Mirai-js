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

   在命令行中执行：

   ```
   .\mcl --update-package net.mamoe:mirai-api-http --channel stable --type plugin
   ```

   然后在命令行中执行 `.\mcl` 以启动 **MCL**，同时会自动安装刚才指定的 mirai-api-http 服务。

3. 配置 **mirai-api-http**

   编辑 `config/MiraiApiHttp/setting.yml`。

    ```yml
    adapters: 
    - http
    - ws
    debug: false
    enableVerify: true
    verifyKey: INITKEYpff86IGV
    singleMode: false
    cacheSize: 4096
    adapterSettings: 
        http:
            ## http server 监听的本地地址
            ## 一般为 localhost 即可, 如果多网卡等情况，自定设置
            host: localhost

            ## http server 监听的端口
            ## 与 websocket server 可以重复, 由于协议与路径不同, 不会产生冲突
            port: 8080

            ## 配置跨域, 默认允许来自所有域名
            cors: [*]
        ws:
            ## websocket server 监听的本地地址
            ## 一般为 localhost 即可, 如果多网卡等情况，自定设置
            host: localhost

            ## websocket server 监听的端口
            ## 与 http server 可以重复, 由于协议与路径不同, 不会产生冲突
            port: 8080

            ## websocket 用于消息同步的字段为 syncId, 一般值为请求时的原值，用于同步一次请求与响应
            ## 对于由 websocket server 主动发出的通知, 固定使用一个 syncId, 默认为 ”-1“
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
