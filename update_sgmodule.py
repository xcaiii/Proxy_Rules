#!/usr/bin/env python3
import os

def main():
    list_file = "Rules/HK_Broker.list"
    output_file = "Rules/futu.sgmodule"
    
    if not os.path.exists(list_file):
        print(f"Error: {list_file} does not exist. Run update_rules.py first.")
        return
        
    print(f"Reading rules from {list_file}...")
    with open(list_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    sg_rules = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
            
        parts = line.split(",")
        if len(parts) >= 2:
            r_type = parts[0].strip().upper()
            r_val = parts[1].strip()
            
            # Map rule types from QX to Surge/Shadowrocket
            if r_type == "HOST":
                r_type = "DOMAIN"
            elif r_type == "HOST-SUFFIX":
                r_type = "DOMAIN-SUFFIX"
            elif r_type == "HOST-KEYWORD":
                r_type = "DOMAIN-KEYWORD"
            elif r_type in ("IP-CIDR", "IP-CIDR6", "IP6-CIDR"):
                if r_type == "IP6-CIDR":
                    r_type = "IP-CIDR6"
                # Add no-resolve for IP-CIDR in modules
                sg_rules.append(f"{r_type},{r_val},no-resolve,PROXY")
                continue
                
            sg_rules.append(f"{r_type},{r_val},PROXY")
            
    print(f"Successfully converted {len(sg_rules)} rules.")
    
    # Write to futu.sgmodule
    print(f"Writing to {output_file}...")
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("#!name=港股券商代理规则\n")
            f.write("#!desc=合并港股券商（富途、长桥、老虎等）的分流规则，默认走PROXY节点。由 HK_Broker.list 自动同步更新。\n\n")
            f.write("[Rule]\n")
            for rule in sg_rules:
                f.write(f"{rule}\n")
        print("Done!")
    except Exception as e:
        print(f"Error writing to {output_file}: {e}")

if __name__ == "__main__":
    main()
