# 从 v1 迁移到 v2

## sendCommand 现在是成员方法

`sendCommand` 现在被实现在 `Bot` 实例上。

必须在开启状态的 `Bot` 实例上调用 `sendCommand` 方法，即该实例必须已经成功调用了 `open` 方法。

`sendCommand` 现在仅接收一个指令列表参数 `command: string[]`，例如:

```js
const { message } = await bot.sendCommand({
    command: ['/login', '1019933576', 'password'],
});
```

## authKey 更名为 verifyKey

所有 `authKey` 符号都被更改为 `verifyKey`

一个最明显的变化是，调用 `Bot` 实例的 `open` 方法传入的 `authKey` 现在必须改为 `verifyKey`。
