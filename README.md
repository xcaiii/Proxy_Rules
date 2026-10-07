# Proxy Rules

这是一个自动获取、去重合并并转换为 **Clash (Mihomo)**、**Quantumult X** 与 **Shadowrocket** 格式的分流规则集仓库。通过 GitHub Actions 每天自动更新。

> [!NOTE]
> 本仓库支持同时生成三个客户端的独立规则，分别存放在 **`Clash/Rules/`**、**`QuantumultX/Rules/`** 和 **`Shadowrocket/Rules/`** 目录中。同时在 **`QuantumultX/Rewrite/`** 中维护重写脚本。

---

## 📁 目录结构说明

```text
Proxy_Rules/
├── .github/workflows/
│   └── auto-update.yml       # GitHub Actions 每天自动更新工作流
├── Clash/
│   └── Rules/                # Clash / Mihomo 格式规则 (.yaml)
├── QuantumultX/
│   ├── Rules/                # Quantumult X 分流规则 (.list)
│   └── Rewrite/              # Quantumult X 重写脚本与 snippet
├── Shadowrocket/
│   └── Rules/                # Shadowrocket 分流规则 (.list)
├── Source/
│   └── Filter_HKBroker.snippet  # 自定义港股券商本地补充规则源
├── update_rules.py           # 自动化规则拉取、去重与转换脚本
└── README.md
```

---

## 🌟 包含的规则集说明

| 规则集 | 说明 | 主要上游源 |
| :--- | :--- | :--- |
| **`AI`** | 常用 AI 服务（ChatGPT, Claude, Gemini, Copilot 等） | 666OS, blackmatrix7, fmz200 |
| **`Streaming`** | 常用流媒体服务（Netflix, Disney+, YouTube 等） | ddgksf2013, blackmatrix7 |
| **`Proxy`** | 常用海外代理规则（Google, Spotify, GitHub, TikTok 等） | blackmatrix7, ConnersHua |
| **`direct`** | 国内直连与防误杀修复规则（微信、国内常用直连等） | blackmatrix7, ConnersHua, ddgksf2013, fmz200 |
| **`Crypto`** | 加密货币交易所与行情服务 | blackmatrix7 |
| **`advertising`** | 广告与隐私追踪拦截规则 | fmz200 |
| **`apple`** | Apple 苹果专属服务规则 | blackmatrix7 |
| **`HK_Broker`** | 港股券商规则（富途、长桥、老虎等） | LingJingMaster, 本地 `Source/Filter_HKBroker.snippet` |

---

## ⚡ 转换与优化说明

* **Clash / Mihomo 优化**：
  * 输出为符合 `rule-providers` 规范的 Payload 格式（`payload: - DOMAIN-SUFFIX,...`）。
* **Quantumult X 优化**：
  * 补齐对应的文件名作为第三列策略占位符（如 `HOST-SUFFIX,domain.com,AI`），防止远程订阅时报错。
  * 排序优先级：`HOST` -> `HOST-SUFFIX` -> `HOST-KEYWORD` -> `IP-CIDR` -> `IP6-CIDR` -> `USER-AGENT`。
* **Shadowrocket 优化**：
  * 将 Quantumult X 格式的 `HOST` / `HOST-SUFFIX` / `HOST-KEYWORD` / `IP6-CIDR` 自动转换为 Shadowrocket 的 `DOMAIN` / `DOMAIN-SUFFIX` / `DOMAIN-KEYWORD` / `IP-CIDR6`。
  * 排序优先级：`DOMAIN` -> `DOMAIN-SUFFIX` -> `DOMAIN-KEYWORD` -> `IP-CIDR` -> `IP-CIDR6` -> `USER-AGENT`。
* **自动去重与合并**：所有规则在拉取后会自动做合并与去重，保持规则列表精简高效。

---

## ⚙️ 订阅链接

### 1. Clash / Mihomo 订阅链接 (Rule Provider)
在 Clash 配置文件的 `rule-providers` 中引用：
* **AI 规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/AI.yaml`
* **流媒体规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Streaming.yaml`
* **常用代理规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Proxy.yaml`
* **直连规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/direct.yaml`
* **加密货币规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Crypto.yaml`
* **广告拦截规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/advertising.yaml`
* **苹果服务规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/apple.yaml`
* **港股券商规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/HK_Broker.yaml`

### 2. Quantumult X 订阅链接
请在 Quantumult X **分流 (Filter) -> 引用 (Resource)** 中添加对应规则的 Raw 链接：
* **AI 规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/AI.list`
* **流媒体规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Streaming.list`
* **常用代理规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Proxy.list`
* **直连规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/direct.list`
* **加密货币规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Crypto.list`
* **广告拦截规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/advertising.list`
* **苹果服务规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/apple.list`
* **港股券商规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/HK_Broker.list`

> **提示**：建议在引用时添加 `force-policy`，例如：
> ```text
> https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Proxy.list, tag=Proxy Rules, force-policy=您的代理策略组, update-interval=86400, enabled=true
> ```

### 3. Shadowrocket 订阅链接
请在 Shadowrocket **配置 -> 添加规则集** 中使用以下链接：
* **AI 规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/AI.list`
* **流媒体规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Streaming.list`
* **常用代理规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Proxy.list`
* **直连规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/direct.list`
* **加密货币规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Crypto.list`
* **广告拦截规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/advertising.list`
* **苹果服务规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/apple.list`
* **港股券商规则**：`https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/HK_Broker.list`

---

## 🤖 自动化更新机制
* **自动更新**：GitHub Actions 将在每天的 **北京时间中午 12:00 (04:00 UTC)** 自动运行脚本并推送到本仓库。
* **手动触发**：您也可以在 GitHub 仓库的 **Actions** 标签页中，选择 **Auto Update Proxy Rules** 工作流并点击 **Run workflow** 手动触发更新。
