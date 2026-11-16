# DSH Gateway SSH 插件

`@lastdreamteam/dsh-gateway-ssh` 让 DeepSeek Harness（DSH）的 Agent 和 DSH Bot 通过 [Gateway SSH](https://trygateway.sh/docs/) 使用你在 Gateway 网站管理的服务器。账号在 DSH **设置 → Gateway SSH** 中用浏览器登录，可以添加多个账号并随时切换。服务器清单、SSH 凭据、sudo 授权和审批始终由 Gateway 管理，DSH 只保存登录令牌。

## 功能

- **浏览器登录**：点「添加账号」，在弹出的 Gateway 页面登录并授权，完成后自动跳回本机，设置页随即显示已连接。授权使用 OAuth 授权码 + PKCE，不需要复制令牌或运行命令。
- **多账号**：每个账号单独保存，Agent 使用标记为「当前使用」的账号；点「使用此账号」立即切换。可改显示名或移除。
- **结果脱敏**：Gateway 返回的工具结果在写入会话、交给模型之前，把 IP 地址替换为 `[redacted-ip]`，把这台电脑的计算机名和系统用户名替换为 `[redacted-host]`。两项可在设置页分别关闭。
- **工具名兼容**：工具仍叫 `mcp__gateway__<工具名>`，与之前按 stdio 配置的 `gateway` 服务一致，旧会话、审批习惯和 Bot 提示不用改。
- **导入旧登录**：如果曾用本仓库的 `node dsh/setup.mjs login` 登录过，设置页会提示导入，不用重新登录。导入只读取旧文件，不修改或删除它。

## 安装

需要 DSH 0.2.x 与 Node.js 22.12 或更高版本。

```powershell
git clone https://github.com/LastDreamTeam/LDAI_GatewaySSHMCP.git
Set-Location LDAI_GatewaySSHMCP/plugin
npm install --omit=dev --ignore-scripts
```

然后任选一种方式安装到 DSH：

- 在 DSH 中让 Agent 用插件管理器安装本目录（`plugin_manager` 的 `install_bundle`，目标填 `plugin` 目录的绝对路径）。
- 或先完全退出 DSH Desktop，再运行 `dsh plugin --profile desktop add "link:<plugin 目录绝对路径>"`，重新打开 DSH。

> 以目录链接方式安装时，DSH 直接使用该目录及其 `node_modules`，所以安装前必须在 `plugin` 目录执行一次 `npm install`，并保留这个目录。

安装后打开 **设置 → Gateway SSH**，点「添加账号」。首次连接可问 Agent「列出我的 Gateway 服务器，仅显示名称」，核对结果与 Gateway 网站一致。

### 已有旧版 stdio 配置时

如果 profile 里已经有 `serverName: gateway` 的 `@deepseek-ai/dsh-mcp-client` 条目（按旧 README 手动添加的），两者的工具同名会冲突：设置页会显示「工具注册冲突」。先在设置页导入旧登录，再到 DSH 插件页停用那个旧条目，然后在设置页点「重新连接」。

## 安全与隐私

- 令牌保存在 DSH 的凭据存储（`ctx.credentials`，记录名 `gateway-ssh/*`），不写入 `cordis.patch.yml`、插件目录或仓库。设置页和接口只返回账号名称与状态，从不返回令牌。
- 设置页接口只接受本机同源请求，并经过 DSH 自己的网页登录校验；OAuth 回调只接受本机请求，且校验 `state`。
- 脱敏只作用于交给 Agent 的结果文本与结构化内容，不改变发往 Gateway 的参数；Gateway 服务端的作业记录与审计照常保留，供第三方监管。脱敏基于规则匹配，不能保证识别所有敏感信息，例如服务器自己的主机名不会被替换。
- 拥有本机文件与终端权限的 Agent 在技术上仍能读到 DSH 凭据文件；请配合 DSH 的权限预设与审批使用。
- 移除账号只删除本机令牌。要彻底撤销，还需在 Gateway 网站撤销对应客户端。

## 开发与验证

```powershell
npm install --ignore-scripts
npm run check   # 语法检查
npm test        # 离线测试：本机假 MCP 服务，不访问 Gateway、不读取真实凭据
```

| 文件 | 作用 |
| --- | --- |
| [index.js](index.js) | Host 入口：路由、资源服务、系统提示、连接生命周期 |
| [client.js](client.js) | 设置页（React，主题变量） |
| [lib/oauth.js](lib/oauth.js) | 发现、动态注册、PKCE 登录、刷新、旧登录读取 |
| [lib/connection.js](lib/connection.js) | 按当前账号连接 Gateway MCP，注册工具并脱敏结果 |
| [lib/store.js](lib/store.js) | 多账号索引与令牌（DSH 凭据记录） |
| [lib/routes.js](lib/routes.js) | 设置页接口与 OAuth 回调 |
| [lib/redact.js](lib/redact.js) | IP 与本机名脱敏 |

维护记录与验证流程见 [Agentic/DEBUG.md](Agentic/DEBUG.md)（共享记忆，跨 Agent 持久保存，修改前先读该文件头部说明）。

许可：AGPL-3.0-only，与仓库根目录 [LICENSE](../LICENSE) 相同。Gateway 服务由原厂运营，能力和账户权限以其服务端为准。
