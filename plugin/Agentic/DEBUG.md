# plugin/ 缺陷与验证记录（DEBUG）

> 本文件是 `plugin/`（DSH Gateway SSH 插件）的持久共享记忆，供任何 Agent 或人类维护者阅读，不是临时笔记或某个 Bot 的私有记忆。作用域只限 `plugin/` 目录，入口与模块说明见同级 [README.md](../README.md)。只记录已验证的缺陷、修复与正确操作流程；新增、修改或删除条目时在末尾变更记录写明日期、条目号和原因。不得写入令牌、IP、计算机名或个人路径。内容为当前理解，遇到反例先标「待复核」再修改。

创建：2026-11-17 · 最近修改：2026-11-17

## D1 链接安装时找不到 `@modelcontextprotocol/sdk`（暂定）

- 现象：`install_bundle` 指向本目录后激活失败，`ERR_MODULE_NOT_FOUND: @modelcontextprotocol/sdk`。
- 原因：目录链接安装时 DSH 从本目录解析依赖，不使用 profile 的 `node_modules`。
- 处理：安装前在 `plugin/` 执行 `npm install --omit=dev --ignore-scripts`，再用插件管理器启用。
- 验证：2026-11-17，DSH Desktop 0.2.x，补装后插件行 `gateway-ssh` 为 active。

## D2 修改 Host 代码后行为不变（暂定）

- 现象：编辑 `index.js`/`lib/*.js` 后，接口仍按旧代码响应。
- 处理：在插件页停用再启用 `gateway-ssh` 行（或重启 DSH）；替换已安装包需要重启才能加载新模块。
- 验证：2026-11-17，停用/启用后新加入的宿主登录校验生效（未登录网页请求返回 401）。

## 正确的验收流程

1. `npm run check` 与 `npm test` 通过（离线，不触网）。
2. 设置 → Gateway SSH：点「添加账号」，浏览器登录授权后自动返回，状态显示「已连接 · N 个工具可用」。
3. 问 Agent「列出我的 Gateway 服务器，仅显示名称」，结果应与 Gateway 网站一致；返回内容中的 IP 显示为 `[redacted-ip]`。
4. 添加第二个账号，点「使用此账号」切换，再次列出服务器，结果应属于新账号。
5. 关闭「隐藏 IP 地址」后再查询，IP 原样出现；验证后恢复开启。
6. 与旧版 `serverName: gateway` 条目同时启用时，状态应显示「工具注册冲突」提示，而不是静默失败。

未验收（截至 2026-11-17）：第 2–5 步的真实 Gateway 账号登录、多账号切换与设置页视觉效果需在已登录 DSH 网页中由人工完成。

## 变更记录

- 2026-11-17 D1、D2、验收流程：新建。操作：Claude Opus 5.5。
