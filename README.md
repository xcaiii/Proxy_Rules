# Proxy Rules

这是一个自动获取、去重合并并转换为 **Quantumult X** 与 **Shadowrocket** 格式的分流规则集仓库。通过 GitHub Actions 每天自动更新。

> [!NOTE]
> 本仓库已支持同时生成两个客户端的独立规则，分别存放在 **`QuantumultX/`** 和 **`Shadowrocket/`** 目录中。

---

## 🌟 包含的规则集说明

以下是仓库中维护的规则集及其上游源：

### 1. `AI.list` (AI 规则)
* **上游源**：
  * `666OS/rules` (AI.txt)
  * `blackmatrix7/ios_rule_script` (Gemini.list)
  * `ddgksf2013/filter` (Ai.yaml)
  * `fmz200/wool_scripts` (AI.list)

### 2. `Streaming.list` (流媒体规则)
* **上游源**：
  * `ddgksf2013/Filter` (Streaming.list)
  * `blackmatrix7/ios_rule_script` (Netflix.list, Disney.list)

### 3. `Proxy.list` (常用代理规则)
* **上游源**：
  * `blackmatrix7/ios_rule_script` (Proxy.list, Google.list, Spotify.list, GitHub.list, TikTok.list)
  * `ConnersHua/RuleGo` (Proxy.list)

### 4. `direct.list` (直连/修复规则)
* **上游源**：
  * `blackmatrix7/ios_rule_script` (WeChat.list)
  * `ConnersHua/RuleGo` (Direct+.list)
  * `ddgksf2013/Filter` (Unbreak.list)
  * `fmz200/wool_scripts` (filterFix.list)

### 5. `Crypto.list` (加密货币规则)
* **上游源**：
  * `blackmatrix7/ios_rule_script` (Crypto.list, Cryptocurrency.list)

### 6. `advertising.list` (广告拦截规则)
* **上游源**：
  * `fmz200/wool_scripts` (filter.list)

### 7. `apple.list` (Apple 苹果服务规则)
* **上游源**：
  * `blackmatrix7/ios_rule_script` (Apple.list)

### 8. `HK_Broker.list` (港股券商规则 - 富途/长桥/老虎等)
* **上游源**：
  * `LingJingMaster/Shadowrocket-Rules` (HK_Broker.list)
  * 本地源文件 `Source/Filter_HKBroker.snippet`

---

## ⚡ 转换与优化说明

* **Quantumult X 优化**：
  * 补齐对应的文件名作为第三列策略占位符（如 `HOST-SUFFIX,domain.com,AI`），防止远程订阅时报错。
  * 排序优先级：`HOST` -> `HOST-SUFFIX` -> `HOST-KEYWORD` -> `IP-CIDR` -> `IP6-CIDR` -> `USER-AGENT`。
* **Shadowrocket 优化**：
  * 将 Quantumult X 格式的 `HOST` / `HOST-SUFFIX` / `HOST-KEYWORD` / `IP6-CIDR` 自动转换为 Shadowrocket 的 `DOMAIN` / `DOMAIN-SUFFIX` / `DOMAIN-KEYWORD` / `IP-CIDR6`。
  * 排序优先级：`DOMAIN` -> `DOMAIN-SUFFIX` -> `DOMAIN-KEYWORD` -> `IP-CIDR` -> `IP-CIDR6` -> `USER-AGENT`。
* **自动去重与合并**：所有规则在拉取后会自动做合并与去重，保持规则列表精简高效。

---

## ⚙️ 订阅链接

### 1. Quantumult X 订阅链接
请在 Quantumult X **分流 (Filter) -> 引用 (Resource)** 中添加对应规则的 Raw 链接：

* **AI 规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/AI.list`
* **流媒体规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Streaming.list`
* **常用代理规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Proxy.list`
* **直连规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/direct.list`
* **加密货币规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Crypto.list`
* **广告拦截规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/advertising.list`
* **苹果服务规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/apple.list`
* **港股券商规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/HK_Broker.list`

> **提示**：建议在引用时添加 `force-policy`，例如：
> ```text
> https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Proxy.list, tag=Proxy Rules, force-policy=您的代理策略组, update-interval=86400, enabled=true
> ```

### 2. Shadowrocket 订阅链接
请在 Shadowrocket **配置 -> 添加规则集** 中使用以下链接：

* **AI 规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/AI.list`
* **流媒体规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Streaming.list`
* **常用代理规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Proxy.list`
* **直连规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/direct.list`
* **加密货币规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Crypto.list`
* **广告拦截规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/advertising.list`
* **苹果服务规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/apple.list`
* **港股券商规则**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/HK_Broker.list`
* **港股券商模块 (`futu.sgmodule`)**：
  `https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/futu.sgmodule`

---

## 🤖 自动化更新机制
* **自动更新**：GitHub Actions 将在每天的 **北京时间中午 12:00 (04:00 UTC)** 自动运行脚本并推送到本仓库。
* **手动触发**：您也可以在 GitHub 仓库的 **Actions** 标签页中，选择 **Auto Update Proxy Rules** 工作流并点击 **Run workflow** 手动触发更新。
