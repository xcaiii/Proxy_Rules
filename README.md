# Proxy Rules

自动获取、去重合并并转换为 **Clash (Mihomo)**、**Quantumult X** 与 **Shadowrocket** 格式的分流规则集仓库。通过 GitHub Actions 每天自动更新。

---

## 📁 目录结构

```text
Proxy_Rules/
├── .github/workflows/auto-update.yml  # 每日定时自动更新
├── Clash/Rules/                       # Clash / Mihomo 规则 (.yaml)
├── QuantumultX/Rules/                 # Quantumult X 分流规则 (.list)
├── Shadowrocket/Rules/                # Shadowrocket 分流规则 (.list)
├── Source/Filter_HKBroker.snippet     # 港股券商本地补充源
└── update_rules.py                    # 自动拉取、转换与去重脚本
```

---

## 📋 规则集订阅地址对照表

> 💡 **复制提示**：右键点击表格中的链接，选择「**复制链接地址**」即可直接粘贴使用。

| 规则集 | 说明 | Clash (YAML) | Quantumult X (LIST) | Shadowrocket (LIST) |
| :--- | :--- | :---: | :---: | :---: |
| **Trading** | 证券交易 (IBKR, Firstrade, TOS, TradingView 等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Trading.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Trading.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Trading.list) |
| **HK_Broker** | 港股券商 (富途, 长桥, 老虎证券等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/HK_Broker.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/HK_Broker.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/HK_Broker.list) |
| **Crypto** | 加密货币交易所与行情 (Binance, OKX 等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Crypto.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Crypto.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Crypto.list) |
| **AI** | 常用 AI 服务 (ChatGPT, Claude, Gemini 等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/AI.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/AI.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/AI.list) |
| **Streaming** | 流媒体 (Netflix, Disney+, YouTube 等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Streaming.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Streaming.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Streaming.list) |
| **Proxy** | 常用海外代理 (Google, GitHub, Spotify 等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Proxy.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Proxy.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/Proxy.list) |
| **direct** | 国内直连与防误杀白名单 (微信等) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/direct.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/direct.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/direct.list) |
| **advertising** | 广告与隐私追踪拦截 | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/advertising.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/advertising.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/advertising.list) |
| **apple** | Apple 苹果专属服务 | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/apple.yaml) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/apple.list) | [订阅链接](https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Shadowrocket/Rules/apple.list) |

---

## 🔧 客户端配置示例

### 1. Clash / Mihomo (`rule-providers`)
```yaml
rule-providers:
  Trading:
    type: http
    behavior: classical
    url: "https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/Clash/Rules/Trading.yaml"
    path: ./ruleset/Trading.yaml
    interval: 86400
```

### 2. Quantumult X (`[filter_remote]`)
```text
https://raw.githubusercontent.com/xcaiii/Proxy_Rules/main/QuantumultX/Rules/Trading.list, tag=Trading, force-policy=PROXIES, update-interval=86400, opt-parser=false, enabled=true
```

### 3. Shadowrocket (`配置 -> 添加规则集`)
复制表格中对应规则的链接，直接在 Shadowrocket 添加为规则集即可。

---

## 🤖 自动化更新机制
* **自动更新**：GitHub Actions 在每天 **北京时间 12:00 (UTC 04:00)** 自动同步上游规则、去重合并并提交。
* **手工规则**：`Trading` 规则为静态自维护规则，不受定时脚本覆写。
