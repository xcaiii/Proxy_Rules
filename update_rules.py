#!/usr/bin/env python3
import urllib.request
import re
import os
import time

# Configuration of output files and their upstream rule sources
RULE_CONFIGS = {
    "AI.list": [
        "https://raw.githubusercontent.com/666OS/rules/refs/heads/release/mihomo/AI.txt",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Gemini/Gemini.list",
        "https://ddgksf2013.top/filter/Ai.yaml",
        "https://github.com/fmz200/wool_scripts/raw/main/Loon/rule/AI.list"
    ],
    "Streaming.list": [
        "https://raw.githubusercontent.com/ddgksf2013/Filter/master/Streaming.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Netflix/Netflix.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Disney/Disney.list"
    ],
    "Proxy.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Proxy/Proxy.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Google/Google.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Spotify/Spotify.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/GitHub/GitHub.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/TikTok/TikTok.list",
        "https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Proxy.list"
    ],
    "direct.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/WeChat/WeChat.list",
        "https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Direct+.list",
        "https://raw.githubusercontent.com/ddgksf2013/Filter/master/Unbreak.list",
        "https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/filter/filterFix.list"
    ],
    "Crypto.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Crypto/Crypto.list",
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/QuantumultX/Cryptocurrency/Cryptocurrency.list"
    ],
    "advertising.list": [
        "https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/filter/filter.list"
    ],
    "apple.list": [
        "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Apple/Apple.list"
    ],
    "HK_Broker.list": [
        "https://raw.githubusercontent.com/LingJingMaster/Shadowrocket-Rules/main/HK_Broker.list",
        "Rules/Source/Filter_HKBroker.snippet"
    ]
}

def fetch_content(url, retries=3):
    for i in range(retries):
        print(f"Fetching (Attempt {i+1}/{retries}): {url}")
        # Use Quantumult X User-Agent to bypass browser check on some rule hosting servers
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Quantumult X/1.4.3'}
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode('utf-8')
        except Exception as e:
            print(f"Error fetching {url} on attempt {i+1}: {e}")
            if i == retries - 1:
                return ""
            time.sleep(2)

def read_local_file(filepath):
    print(f"Reading local file: {filepath}")
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading local file {filepath}: {e}")
    else:
        print(f"Local file not found: {filepath}")
    return ""

def parse_rules(content):
    rules = set()
    # Regex to match rule types and values
    pattern = re.compile(
        r'\b(DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|HOST|HOST-SUFFIX|HOST-KEYWORD|IP-CIDR|IP-CIDR6|IP6-CIDR|USER-AGENT),\s*([a-zA-Z0-9_\-\.\:\/*?]+)',
        re.IGNORECASE
    )
    
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith(('#', '//', ';', '!')):
            continue
            
        for comment_char in ('#', ';', '//'):
            if comment_char in line:
                line = line.split(comment_char)[0].strip()
                
        if line.startswith('- '):
            line = line[2:].strip()
            
        matches = pattern.findall(line)
        for rule_type, rule_val in matches:
            rule_type = rule_type.upper()
            if rule_type == 'DOMAIN':
                rule_type = 'HOST'
            elif rule_type == 'DOMAIN-SUFFIX':
                rule_type = 'HOST-SUFFIX'
            elif rule_type == 'DOMAIN-KEYWORD':
                rule_type = 'HOST-KEYWORD'
            elif rule_type == 'IP-CIDR6':
                rule_type = 'IP6-CIDR'
            elif rule_type == 'IP6-CIDR':
                rule_type = 'IP6-CIDR'
            elif rule_type == 'USER-AGENT':
                rule_type = 'USER-AGENT'
                
            if rule_type in ('HOST', 'HOST-SUFFIX'):
                rule_val = rule_val.lower()
                
            rules.add((rule_type, rule_val))
            
    return rules

def main():
    output_dir = "Rules"
    os.makedirs(output_dir, exist_ok=True)
    
    # Remove old AI.list from root if it exists
    old_ai_list = "AI.list"
    if os.path.exists(old_ai_list):
        try:
            os.remove(old_ai_list)
            print(f"Removed old {old_ai_list} from root directory.")
        except Exception as e:
            print(f"Error removing old {old_ai_list}: {e}")
            
    # Process rule lists
    for filename, urls in RULE_CONFIGS.items():
        print(f"\n=== Processing Rule List: {filename} ===")
        all_rules = set()
        for url_or_path in urls:
            if url_or_path.startswith(('http://', 'https://')):
                content = fetch_content(url_or_path)
            else:
                content = read_local_file(url_or_path)
                
            if content:
                rules = parse_rules(content)
                print(f"Parsed {len(rules)} unique rules from {url_or_path}")
                all_rules.update(rules)
                
        print(f"Total unique rules merged for {filename}: {len(all_rules)}")
        
        type_priority = {
            'HOST': 1,
            'HOST-SUFFIX': 2,
            'HOST-KEYWORD': 3,
            'IP-CIDR': 4,
            'IP6-CIDR': 5,
            'USER-AGENT': 6
        }
        
        sorted_rules = sorted(
            all_rules,
            key=lambda r: (type_priority.get(r[0], 99), r[1])
        )
        
        output_file = os.path.join(output_dir, filename)
        policy_placeholder = filename.split('.')[0]
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"# NAME: {filename.split('.')[0]} Rules\n")
                f.write(f"# TOTAL: {len(sorted_rules)}\n")
                f.write("# UPDATED: Auto-updated\n\n")
                for r_type, r_val in sorted_rules:
                    f.write(f"{r_type},{r_val},{policy_placeholder}\n")
            print(f"Successfully wrote {len(sorted_rules)} rules to {output_file}")
        except Exception as e:
            print(f"Error writing {output_file}: {e}")

if __name__ == "__main__":
    main()
