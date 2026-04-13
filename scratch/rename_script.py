import os
import re

replacements = [
    # Paths and Imports
    (re.compile(r'composition/manager'), 'composition/composite-select'),
    (re.compile(r'composition/selected-section'), 'composition/selected-section'),
    (re.compile(r'composite-select/manager'), 'composite-select/composite-select'),
    (re.compile(r'composite-select/selected-section'), 'composite-select/selected-section'),
    (re.compile(r'\.\./composite-select/'), '../composite-select/'),
    (re.compile(r'\./composite-select/'), './composite-select/'),
    (re.compile(r'\.\./selected-section/'), '../selected-section/'),
    (re.compile(r'\./selected-section/'), './selected-section/'),
    
    # Filenames in imports
    (re.compile(r'selected-section\.js'), 'selected-section.js'),
    (re.compile(r'options-section\.js'), 'options-section.js'),
    (re.compile(r'selected-section\.ts'), 'selected-section.ts'),
    (re.compile(r'options-section\.ts'), 'options-section.ts'),
    
    # Custom Element Tags
    (re.compile(r'<selected-section'), '<selected-section'),
    (re.compile(r'</selected-section>'), '</selected-section>'),
    (re.compile(r'<options-section'), '<options-section'),
    (re.compile(r'</options-section>'), '</options-section>'),
    (re.compile(r'"selected-section"'), '"selected-section"'),
    (re.compile(r'"options-section"'), '"options-section"'),
    (re.compile(r"'selected-section'"), "'selected-section'"),
    (re.compile(r"'options-section'"), "'options-section'"),
    (re.compile(r'selected-section-manager'), 'selected-section-manager'),
    (re.compile(r'options-section-manager'), 'options-section-manager'),
]

exclude_dirs = {'.git', 'node_modules', 'dist'}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return

    new_content = content
    for pattern, replacement in replacements:
        new_content = pattern.sub(replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.sh', '.cjs')):
            process_file(os.path.join(root, file))
