/**
 * @lastdreamteam/dsh-gateway-ssh — DSH 设置页（Web Client）。
 *
 * Anthropic: 纯 JavaScript + 宿主提供的 React；只用 --dsw-alias-* 主题变量，
 * 不加载任何 DSH 内部 UI 包。界面只有「添加账号」主按钮和每个账号的少量操作。
 */
window.__ModuleLoader__.load({
  id: '@lastdreamteam/dsh-gateway-ssh',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useState } = React

    const API = '/api/lastdreamteam/gateway-ssh'

    /** 中文文案。 */
    const zh = {
      nav: 'Gateway SSH',
      title: 'Gateway SSH 账号',
      intro: '登录后，Agent 和 DSH Bot 可以通过 Gateway 使用你在 Gateway 网站管理的服务器。服务器和 SSH 凭据始终保存在 Gateway，DSH 只保存登录令牌。',
      add: '添加账号',
      adding: '正在打开浏览器…',
      waiting: '请在浏览器中登录并授权。完成后此页面会自动更新。',
      openAgain: '浏览器没有打开？点这里',
      pasteHint: '授权后停在一个打不开的页面？把浏览器地址栏的完整地址粘贴到这里：',
      pastePlaceholder: 'http://127.0.0.1:…/oauth/callback?code=…&state=…',
      finish: '完成登录',
      cancel: '取消',
      empty: '还没有账号。点击「添加账号」，在浏览器里登录 Gateway 即可。',
      current: '当前使用',
      use: '使用此账号',
      rename: '改名',
      remove: '移除',
      removeConfirm: '移除这个账号？DSH 会删除它的登录令牌；Gateway 网站上的服务器不受影响。',
      renamePrompt: '账号显示名（只在本机显示）：',
      legacy: (n) => `发现 ${n} 个旧版命令行登录（mcp-remote）。可以直接导入，不用重新登录。`,
      importLegacy: '导入',
      privacy: '隐私保护（发给 AI 前替换）',
      redactIp: '隐藏 IP 地址',
      redactHost: '隐藏本机电脑名和系统用户名',
      status: {
        'signed-out': '未登录',
        connecting: '正在连接…',
        connected: (n) => `已连接 · ${n} 个工具可用`,
        disconnected: '连接已断开，正在重试…',
        error: '连接失败',
        idle: '准备中…',
      },
      retry: '重新连接',
      note: '多个账号时，Agent 使用「当前使用」的账号；切换后立即生效。要彻底撤销授权，请同时在 Gateway 网站撤销此客户端。',
      failed: '操作失败：',
    }
    /** English copy. */
    const en = {
      nav: 'Gateway SSH',
      title: 'Gateway SSH accounts',
      intro: 'After signing in, agents and DSH Bots can use the servers you manage on Gateway. Servers and SSH credentials stay on Gateway; DSH only keeps sign-in tokens.',
      add: 'Add account',
      adding: 'Opening the browser…',
      waiting: 'Sign in and approve in the browser. This page updates automatically.',
      openAgain: 'Browser did not open? Click here',
      pasteHint: 'Stuck on a page that does not load after approving? Paste the full address from the browser here:',
      pastePlaceholder: 'http://127.0.0.1:…/oauth/callback?code=…&state=…',
      finish: 'Finish sign-in',
      cancel: 'Cancel',
      empty: 'No accounts yet. Click "Add account" and sign in to Gateway in the browser.',
      current: 'In use',
      use: 'Use this account',
      rename: 'Rename',
      remove: 'Remove',
      removeConfirm: 'Remove this account? DSH deletes its sign-in tokens; servers on Gateway are not affected.',
      renamePrompt: 'Account display name (shown on this computer only):',
      legacy: (n) => `Found ${n} earlier command-line sign-in(s) (mcp-remote). Import without signing in again.`,
      importLegacy: 'Import',
      privacy: 'Privacy (replaced before reaching the AI)',
      redactIp: 'Hide IP addresses',
      redactHost: 'Hide this computer name and OS user name',
      status: {
        'signed-out': 'Not signed in',
        connecting: 'Connecting…',
        connected: (n) => `Connected · ${n} tools available`,
        disconnected: 'Disconnected, retrying…',
        error: 'Connection failed',
        idle: 'Starting…',
      },
      retry: 'Reconnect',
      note: 'With several accounts, agents use the one marked "In use"; switching applies immediately. To fully revoke access, also revoke this client on the Gateway website.',
      failed: 'Failed: ',
    }

    /**
     * 选择当前语言的文案。
     * @param {any} locale - ctx.locale 服务（可能不存在）。
     * @returns {typeof zh} 文案表。
     */
    function copyFor(locale) {
      const active = String(locale?.getLocale?.()?.active ?? navigator.language ?? 'zh')
      return active.toLowerCase().startsWith('zh') ? zh : en
    }

    /**
     * 调用 Host 接口。
     * @param {string} path - 接口子路径。
     * @param {object} [payload] - POST 内容；省略时 GET。
     * @returns {Promise<any>} JSON 结果。
     */
    async function call(path, payload) {
      const init = payload === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }
      const response = await fetch(API + path, init)
      return response.json()
    }

    const css = {
      page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, color: 'var(--dsw-alias-label-primary)', fontSize: 13 },
      h: { margin: 0, fontSize: 16, fontWeight: 600 },
      sub: { margin: 0, color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.6 },
      card: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, background: 'var(--dsw-alias-bg-layer-1)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
      row: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      grow: { flex: 1, minWidth: 0 },
      name: { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      meta: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      badge: { fontSize: 11, padding: '1px 8px', borderRadius: 999, color: 'var(--dsw-alias-brand-primary)', border: '1px solid var(--dsw-alias-brand-primary)' },
      primary: { padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--dsw-alias-brand-primary)', color: '#fff', fontSize: 13, fontWeight: 600 },
      button: { padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'inherit', fontSize: 12 },
      danger: { padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'var(--dsw-alias-state-error-primary)', fontSize: 12 },
      input: { flex: 1, minWidth: 200, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'inherit', fontSize: 12 },
      dot: (color) => ({ width: 8, height: 8, borderRadius: 4, background: color, flex: 'none' }),
      link: { color: 'var(--dsw-alias-brand-primary)', cursor: 'pointer', fontSize: 12 },
      error: { color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
      check: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
    }

    /**
     * 连接状态行。
     * @param {{ t: typeof zh, connection: any, onRetry: () => void, busy: boolean }} props - 属性。
     * @returns {any} React 元素。
     */
    function StatusLine({ t, connection, onRetry, busy }) {
      const s = connection?.state ?? 'idle'
      const color = s === 'connected' ? 'var(--dsw-alias-state-success-primary)' : s === 'error' ? 'var(--dsw-alias-state-error-primary)' : s === 'signed-out' ? 'var(--dsw-alias-state-idle-primary)' : 'var(--dsw-alias-state-warn-primary)'
      const text = s === 'connected' ? t.status.connected(connection.toolCount) : (t.status[s] ?? s)
      return h('div', { style: css.row },
        h('span', { style: css.dot(color) }),
        h('span', { style: css.grow }, text),
        (s === 'error' || s === 'disconnected') && h('button', { style: css.button, disabled: busy, onClick: onRetry }, t.retry),
        s === 'error' && connection.lastError && h('div', { style: { ...css.error, width: '100%' } }, connection.lastError))
    }

    /**
     * 设置页主体。
     * @param {{ locale: any }} props - 属性。
     * @returns {any} React 元素。
     */
    function GatewaySettings({ locale }) {
      const t = copyFor(locale)
      const [view, setView] = useState(null)
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')
      const [authorizeUrl, setAuthorizeUrl] = useState('')
      const [pasted, setPasted] = useState('')

      const refresh = useCallback(async () => {
        try {
          const result = await call('/status')
          if (result.view) setView(result.view)
        } catch (failure) {
          setError(t.failed + String(failure?.message ?? failure))
        }
      }, [])

      useEffect(() => { refresh() }, [refresh])
      // Anthropic: 登录进行中或正在连接时每 2 秒刷新，浏览器授权完成后无需手动操作。
      useEffect(() => {
        const live = view?.loginPending || view?.connection?.state === 'connecting' || view?.connection?.state === 'disconnected'
        if (!live) return undefined
        const timer = setInterval(refresh, 2000)
        return () => clearInterval(timer)
      }, [view, refresh])
      useEffect(() => {
        if (view !== null && !view.loginPending) setAuthorizeUrl('')
      }, [view])
      useEffect(() => {
        const onFocus = () => { refresh() }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
      }, [refresh])

      /**
       * 执行一次操作并更新视图。
       * @param {string} path - 接口。
       * @param {object} payload - 请求体。
       * @returns {Promise<any>} 结果。
       */
      const act = async (path, payload = {}) => {
        setBusy(true)
        setError('')
        try {
          const result = await call(path, payload)
          if (result.view) setView(result.view)
          if (!result.ok) setError(t.failed + (result.error ?? ''))
          return result
        } catch (failure) {
          setError(t.failed + String(failure?.message ?? failure))
          return { ok: false }
        } finally {
          setBusy(false)
        }
      }

      const addAccount = async () => {
        const result = await act('/login')
        if (result.ok && result.authorizeUrl) {
          setAuthorizeUrl(result.authorizeUrl)
          window.open(result.authorizeUrl, '_blank', 'noopener')
        }
      }

      const accounts = view?.accounts ?? []
      return h('div', { style: css.page },
        h('div', null, h('h2', { style: css.h }, t.title), h('p', { style: { ...css.sub, marginTop: 6 } }, t.intro)),

        view && h('div', { style: css.card }, h(StatusLine, { t, connection: view.connection, busy, onRetry: () => act('/reconnect') })),

        view && view.legacyAvailable > 0 && h('div', { style: { ...css.card, ...css.row } },
          h('span', { style: css.grow }, t.legacy(view.legacyAvailable)),
          h('button', { style: css.button, disabled: busy, onClick: () => act('/accounts/import-legacy') }, t.importLegacy)),

        h('div', { style: css.card },
          accounts.length === 0 && h('div', { style: css.meta }, t.empty),
          ...accounts.map((account) => h('div', { key: account.id, style: css.row },
            h('div', { style: { ...css.grow, display: 'flex', flexDirection: 'column', gap: 2 } },
              h('div', { style: css.row }, h('span', { style: css.name }, account.label), account.active && h('span', { style: css.badge }, t.current)),
              h('span', { style: css.meta }, new Date(account.createdAt).toLocaleString())),
            !account.active && h('button', { style: css.button, disabled: busy, onClick: () => act('/accounts/activate', { id: account.id }) }, t.use),
            h('button', {
              style: css.button,
              disabled: busy,
              onClick: () => {
                const label = window.prompt(t.renamePrompt, account.label)
                if (label) act('/accounts/rename', { id: account.id, label })
              },
            }, t.rename),
            h('button', { style: css.danger, disabled: busy, onClick: () => { if (window.confirm(t.removeConfirm)) act('/accounts/remove', { id: account.id }) } }, t.remove))),
          h('div', { style: css.row },
            h('button', { style: { ...css.primary, opacity: busy ? 0.6 : 1 }, disabled: busy, onClick: addAccount }, busy && !authorizeUrl ? t.adding : t.add),
            view?.loginPending && h('button', { style: css.button, onClick: () => act('/login/cancel') }, t.cancel)),
          view?.loginPending && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            h('span', { style: css.meta }, t.waiting),
            authorizeUrl && h('a', { style: css.link, href: authorizeUrl, target: '_blank', rel: 'noopener noreferrer' }, t.openAgain),
            h('details', null,
              h('summary', { style: { ...css.meta, cursor: 'pointer' } }, t.pasteHint),
              h('div', { style: { ...css.row, marginTop: 8 } },
                h('input', { style: css.input, value: pasted, placeholder: t.pastePlaceholder, onChange: (e) => setPasted(e.target.value) }),
                h('button', { style: css.button, disabled: busy || pasted.trim() === '', onClick: async () => { const r = await act('/login/finish', { url: pasted }); if (r.ok) setPasted('') } }, t.finish))))),

        view && h('div', { style: css.card },
          h('span', { style: { fontWeight: 600 } }, t.privacy),
          h('label', { style: css.check },
            h('input', { type: 'checkbox', checked: view.redact.ip, disabled: busy, onChange: (e) => act('/prefs', { redact: { ip: e.target.checked } }) }), t.redactIp),
          h('label', { style: css.check },
            h('input', { type: 'checkbox', checked: view.redact.host, disabled: busy, onChange: (e) => act('/prefs', { redact: { host: e.target.checked } }) }), t.redactHost)),

        error && h('div', { style: css.error }, error),
        h('p', { style: { ...css.sub, fontSize: 12 } }, t.note))
    }

    /**
     * 设置导航图标（终端提示符造型）。
     * @param {{ size?: number }} props - 属性。
     * @returns {any} SVG 元素。
     */
    function NavIcon({ size = 16 }) {
      return h('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }),
        h('path', { d: 'M7 10l3 2.5L7 15' }),
        h('path', { d: 'M12.5 15H17' }))
    }

    return {
      inject: ['slots', 'locale'],
      /**
       * 注册设置页与导航图标。
       * @param {any} ctx - Client 根上下文。
       */
      apply(ctx) {
        const locale = ctx.locale
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'gateway-ssh',
          order: 330,
          label: () => copyFor(locale).nav,
        }, () => h(GatewaySettings, { locale })))
        try {
          ctx.slots.inject('settings.section.icon', () => ctx.slots.register({ name: 'settings.section.icon', id: 'gateway-ssh' }, (owner = {}) => h(NavIcon, { size: owner.size ?? 16 })))
        } catch (error) {
          // Anthropic: 旧版 DSH 没有导航图标槽位时只显示文字，不影响设置页。
          console.warn('[gateway-ssh] settings icon slot unavailable:', error)
        }
      },
    }
  },
})
