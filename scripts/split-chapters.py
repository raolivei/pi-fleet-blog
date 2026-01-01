#!/usr/bin/env python3
"""Split BLOG.md into individual chapter files for VitePress"""

import re
import os

def split_blog():
    blog_path = 'content/BLOG.md'
    chapters_dir = 'chapters'
    
    os.makedirs(chapters_dir, exist_ok=True)
    
    with open(blog_path, 'r') as f:
        content = f.read()
    
    # Split by chapter markers
    chapter_pattern = r'^## (Chapter \d+:|Appendix:) (.+)$'
    chapters = []
    
    # Find all chapter starts
    matches = list(re.finditer(chapter_pattern, content, re.MULTILINE))
    
    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(content)
        chapter_text = content[start:end].strip()
        
        # Extract chapter info
        header_match = re.match(r'^## (Chapter (\d+):|Appendix:) (.+)$', chapter_text, re.MULTILINE)
        if header_match:
            is_appendix = 'Appendix' in header_match.group(1)
            if is_appendix:
                num = 'appendix'
                title = 'Reference Materials'
            else:
                num = int(header_match.group(2))
                title = header_match.group(3).strip()
            
            # Remove the ## header from content
            body = re.sub(r'^## .+$', '', chapter_text, flags=re.MULTILINE).strip()
            
            # Create filename
            if is_appendix:
                filename = f'{chapters_dir}/appendix.md'
                header = '# Appendix: Reference Materials\n\n'
            else:
                slug = re.sub(r'[^\w\s-]', '', title.lower())
                slug = re.sub(r'[-\s]+', '-', slug)
                filename = f'{chapters_dir}/{num:02d}-{slug}.md'
                header = f'# Chapter {num}: {title}\n\n'
            
            # Write file
            with open(filename, 'w') as f:
                f.write(header + body)
            
            print(f'Created: {filename}')
            chapters.append((num, title, filename))
    
    print(f'\nTotal chapters created: {len(chapters)}')
    return chapters

if __name__ == '__main__':
    split_blog()

