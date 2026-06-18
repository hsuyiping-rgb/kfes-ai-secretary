import urllib.request
import re
import json
import os
from datetime import datetime

def fetch_school_news():
    url = "https://www.kfes.ntpc.edu.tw/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"[{datetime.now()}] Fetching school news from {url}...")
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching school website: {e}")
        return None
        
    # Match announcements links which contain '/p/406-1000-' or end with ',r23.php'
    # Example: <a title="..." class="..." href="https://www.kfes.ntpc.edu.tw/p/406-1000-12437,r23.php">📣本校田徑隊...</a>
    pattern = r'<a[^>]+href=["\']([^"\']+(?:/p/406-|r23\.php)[^"\']+)["\'][^>]*>(.*?)</a>'
    matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)
    
    announcements = []
    seen_urls = set()
    
    for href, title_html in matches:
        # Clean title text (remove HTML tags, entities, and excessive whitespace)
        title = re.sub(r'<[^>]+>', '', title_html).strip()
        title = re.sub(r'\s+', ' ', title)
        
        # Standardize URL
        full_url = href
        if href.startswith('/'):
            full_url = f"https://www.kfes.ntpc.edu.tw{href}"
        elif not href.startswith('http'):
            full_url = f"https://www.kfes.ntpc.edu.tw/{href}"
            
        # Avoid duplicates and check for valid length/content
        if full_url not in seen_urls and len(title) > 5 and not title.startswith('Language') and not title.startswith('更多'):
            seen_urls.add(full_url)
            announcements.append({
                "title": title,
                "url": full_url
            })
            
    print(f"Successfully extracted {len(announcements)} announcements.")
    return announcements

def main():
    announcements = fetch_school_news()
    if announcements is None:
        print("Failed to sync news. Exiting.")
        return
        
    data = {
        "last_updated": datetime.now().strftime("%Y/%m/%d %H:%M:%S"),
        "announcements": announcements[:8] # Keep top 8 latest news
    }
    
    # Write to assets/latest_news.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    assets_dir = os.path.join(project_root, "assets")
    
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
        
    output_path = os.path.join(assets_dir, "latest_news.json")
    
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully updated {output_path}")
    except Exception as e:
        print(f"Error saving JSON file: {e}")

if __name__ == "__main__":
    main()
