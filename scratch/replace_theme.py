import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Backgrounds
    content = re.sub(r'bg-slate-900/?[0-9]*', 'bg-white', content)
    content = re.sub(r'bg-slate-800', 'bg-slate-50', content)
    
    # Borders
    content = re.sub(r'border-slate-800/?[0-9]*', 'border-slate-200', content)
    content = re.sub(r'border-slate-700/?[0-9]*', 'border-slate-200', content)
    
    # Text
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('text-slate-400', 'text-slate-500')
    content = content.replace('text-slate-300', 'text-slate-600')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    dirs_to_process = ['src/components', 'src/pages']
    for d in dirs_to_process:
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
