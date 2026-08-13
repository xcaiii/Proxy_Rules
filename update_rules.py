#!/usr/bin/env python3
import os
import re
import time
import urllib.request

# Configuration of output files and their upstream rule sources
RULE_CONFIGS = {
    "AI.list": [
        "https://raw.githubusercontent.com/666OS/rules/refs/heads/release/mihomo/AI.txt",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Gemini/Gemini.list",
        "https://ddgksf2013.top/filter/Ai.yaml",
        "https://github.com/fmz200/wool_scripts/raw/main/Loon/rule/AI.list",
    ],
    "Streaming.list": [
        "https://raw.githubusercontent.com/ddgksf2013/Filter/master/Streaming.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Netflix/Netflix.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Disney/Disney.list",
    ],
    "Proxy.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Proxy/Proxy.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Google/Google.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Spotify/Spotify.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/GitHub/GitHub.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/TikTok/TikTok.list",
        "https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Proxy.list",
    ],
    "direct.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/WeChat/WeChat.list",
        "https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Direct+.list",
        "https://raw.githubusercontent.com/ddgksf2013/Filter/master/Unbreak.list",
        "https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/filter/filterFix.list",
    ],
    "Crypto.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Crypto/Crypto.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Cryptocurrency/Cryptocurrency.list",
    ],
    "advertising.list": [
        "https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/filter/filter.list"
    ],
    "apple.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Apple/Apple.list"
    ],
    "HK_Broker.list": [
        "https://raw.githubusercontent.com/LingJingMaster/Shadowrocket-Rules/main/HK_Broker.list",
        "Source/Filter_HKBroker.snippet",
    ],
}


def fetch_content(url, retries=3):
    for i in range(retries):
        print(f"Fetching (Attempt {i + 1}/{retries}): {url}")
        # Use Quantumult X User-Agent to bypass browser check on some rule hosting servers
        req = urllib.request.Request(url, headers={"User-Agent": "Quantumult X/1.4.3"})
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode("utf-8")
        except Exception as e:  # noqa: BLE001
            print(f"Error fetching {url} on attempt {i + 1}: {e}")
            if i == retries - 1:
                return ""
            time.sleep(2)


def read_local_file(filepath):
    print(f"Reading local file: {filepath}")
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:  # noqa: BLE001
            print(f"Error reading local file {filepath}: {e}")
    else:
        print(f"Local file not found: {filepath}")
    return ""


def parse_rules(content):
    rules = set()
    # Regex to match rule types and values
    pattern = re.compile(
        r"\b(DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|HOST|HOST-SUFFIX|HOST-KEYWORD|IP-CIDR|IP-CIDR6|IP6-CIDR|USER-AGENT),\s*([a-zA-Z0-9_\-\.\:\/*?]+)",
        re.IGNORECASE,
    )

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith(("#", "//", ";", "!")):
            continue

        for comment_char in ("#", ";", "//"):
            if comment_char in line:
                line = line.split(comment_char)[0].strip()

        if line.startswith("- "):
            line = line[2:].strip()

        matches = pattern.findall(line)
        for rule_type, rule_val in matches:
            rule_type = rule_type.upper()
            if rule_type == "DOMAIN":
                rule_type = "HOST"
            elif rule_type == "DOMAIN-SUFFIX":
                rule_type = "HOST-SUFFIX"
            elif rule_type == "DOMAIN-KEYWORD":
                rule_type = "HOST-KEYWORD"
            elif rule_type == "IP-CIDR6" or rule_type == "IP6-CIDR":
                rule_type = "IP6-CIDR"
            elif rule_type == "USER-AGENT":
                rule_type = "USER-AGENT"

            if rule_type in ("HOST", "HOST-SUFFIX"):
                rule_val = rule_val.lower()

            rules.add((rule_type, rule_val))

    return rules


def to_shadowrocket_rule(r_type, r_val):
    """将 Quantumult X 的规则类型映射为 Shadowrocket 的规则类型"""
    sr_type = r_type
    if r_type == "HOST":
        sr_type = "DOMAIN"
    elif r_type == "HOST-SUFFIX":
        sr_type = "DOMAIN-SUFFIX"
    elif r_type == "HOST-KEYWORD":
        sr_type = "DOMAIN-KEYWORD"
    elif r_type == "IP6-CIDR":
        sr_type = "IP-CIDR6"
    return sr_type, r_val


def main():
    qx_dir = "QuantumultX"
    sr_dir = "Shadowrocket"
    clash_dir = "ClashRules"
    os.makedirs(qx_dir, exist_ok=True)
    os.makedirs(sr_dir, exist_ok=True)
    os.makedirs(clash_dir, exist_ok=True)

    # Remove old AI.list from root if it exists
    old_ai_list = "AI.list"
    if os.path.exists(old_ai_list):
        try:
            os.remove(old_ai_list)
            print(f"Removed old {old_ai_list} from root directory.")
        except Exception as e:  # noqa: BLE001
            print(f"Error removing old {old_ai_list}: {e}")

    # Process rule lists
    for filename, urls in RULE_CONFIGS.items():
        print(f"\n=== Processing Rule List: {filename} ===")
        all_rules = set()
        for url_or_path in urls:
            if url_or_path.startswith(("http://", "https://")):
                content = fetch_content(url_or_path)
            else:
                content = read_local_file(url_or_path)

            if content:
                rules = parse_rules(content)
                print(f"Parsed {len(rules)} unique rules from {url_or_path}")
                all_rules.update(rules)

        print(f"Total unique rules merged for {filename}: {len(all_rules)}")

        # 1. 写入 Quantumult X 格式
        qx_type_priority = {
            "HOST": 1,
            "HOST-SUFFIX": 2,
            "HOST-KEYWORD": 3,
            "IP-CIDR": 4,
            "IP6-CIDR": 5,
            "USER-AGENT": 6,
        }

        sorted_qx_rules = sorted(
            all_rules, key=lambda r: (qx_type_priority.get(r[0], 99), r[1])
        )

        qx_output_file = os.path.join(qx_dir, filename)
        policy_placeholder = filename.split(".")[0]
        try:
            with open(qx_output_file, "w", encoding="utf-8") as f:
                f.write(f"# NAME: {filename.split('.')[0]} Rules\n")
                f.write(f"# TOTAL: {len(sorted_qx_rules)}\n")
                f.write("# UPDATED: Auto-updated\n\n")
                f.writelines(
                    f"{r_type},{r_val},{policy_placeholder}\n"
                    for r_type, r_val in sorted_qx_rules
                )
            print(
                f"Successfully wrote {len(sorted_qx_rules)} QX rules to {qx_output_file}"
            )
        except Exception as e:  # noqa: BLE001
            print(f"Error writing QX file {qx_output_file}: {e}")

        # 2. 写入 Shadowrocket 格式
        sr_rules = {to_shadowrocket_rule(r_type, r_val) for r_type, r_val in all_rules}

        sr_type_priority = {
            "DOMAIN": 1,
            "DOMAIN-SUFFIX": 2,
            "DOMAIN-KEYWORD": 3,
            "IP-CIDR": 4,
            "IP-CIDR6": 5,
            "USER-AGENT": 6,
        }

        sorted_sr_rules = sorted(
            sr_rules, key=lambda r: (sr_type_priority.get(r[0], 99), r[1])
        )

        sr_output_file = os.path.join(sr_dir, filename)
        try:
            with open(sr_output_file, "w", encoding="utf-8") as f:
                f.write(f"# NAME: {filename.split('.')[0]} Shadowrocket Rules\n")
                f.write(f"# TOTAL: {len(sorted_sr_rules)}\n")
                f.write("# UPDATED: Auto-updated\n\n")
                f.writelines(
                    f"{r_type},{r_val},{policy_placeholder}\n"
                    for r_type, r_val in sorted_sr_rules
                )
            print(
                f"Successfully wrote {len(sorted_sr_rules)} Shadowrocket rules to {sr_output_file}"
            )
        except Exception as e:  # noqa: BLE001
            print(f"Error writing SR file {sr_output_file}: {e}")

        # 3. 写入 Clash (Mihomo) 格式
        clash_output_file = os.path.join(clash_dir, filename.replace(".list", ".yaml"))
        try:
            with open(clash_output_file, "w", encoding="utf-8") as f:
                f.write("payload:\n")
                f.writelines(
                    f"  - {r_type},{r_val}\n"
                    for r_type, r_val in sorted_sr_rules
                )
            print(
                f"Successfully wrote {len(sorted_sr_rules)} Clash rules to {clash_output_file}"
            )
        except Exception as e:  # noqa: BLE001
            print(f"Error writing Clash file {clash_output_file}: {e}")


if __name__ == "__main__":
    main()
