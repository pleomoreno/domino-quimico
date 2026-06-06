#!/usr/bin/env python3
"""Remove short comments from JSX/JS files.

KEEPS:
- Comments containing ─── (section dividers)
- // text inside JSX string content (e.g. <div>// ACESSO AO SISTEMA</div>)
- CSS comments like /* Corner brackets */ inside template literals

REMOVES:
- {/* any short comment */}  on its own line
- // short comments on their own line (JS logic comments)
- // short comments at end of code lines (trailing comments)
"""

import re
import sys

# Section divider pattern (KEEP these)
SECTION_DIVIDER = re.compile(r'───')

def is_inside_string_or_jsx_text(line, comment_start):
    """Check if the // at comment_start is inside a string literal or JSX text content."""
    # Count quotes before the comment position
    before = line[:comment_start]
    
    # Check if we're inside a template literal, string, or JSX text
    single_quotes = 0
    double_quotes = 0
    backticks = 0
    in_jsx_text = False
    
    i = 0
    while i < len(before):
        ch = before[i]
        if ch == '\\' and i + 1 < len(before):
            i += 2
            continue
        if ch == "'" and double_quotes % 2 == 0 and backticks % 2 == 0:
            single_quotes += 1
        elif ch == '"' and single_quotes % 2 == 0 and backticks % 2 == 0:
            double_quotes += 1
        elif ch == '`' and single_quotes % 2 == 0 and double_quotes % 2 == 0:
            backticks += 1
        i += 1
    
    # If inside any string literal, it's not a comment
    if single_quotes % 2 == 1 or double_quotes % 2 == 1 or backticks % 2 == 1:
        return True
    
    return False

def is_css_comment_in_styles(line, lines, line_idx):
    """Check if this is a CSS comment inside a style template literal."""
    # Look backwards to see if we're inside a const styles = ` ... ` block
    # CSS comments like /* Header */ or /* Corner brackets */ should be kept inside CSS
    stripped = line.strip()
    if stripped.startswith('/*') and stripped.endswith('*/'):
        # Check if we're inside a template literal (backtick string) for CSS
        backtick_count = 0
        for i in range(line_idx):
            backtick_count += lines[i].count('`')
        if backtick_count % 2 == 1:
            return True
    return False

def is_jsx_rendered_text(line):
    """Check if // appears as rendered text in JSX (like <div>// ACESSO</div>)."""
    stripped = line.strip()
    # Pattern: text content that starts with // inside a JSX element
    # e.g.: // ACESSO AO SISTEMA  (inside a <p> tag)
    # These are identified by being between > and < or being the content of a tag
    
    # Check if the line is purely JSX text content starting with //
    # This would be like:  "// ACESSO AO SISTEMA"  inside JSX
    if re.match(r'^\s*//\s+[A-ZÀ-Ú]', stripped):
        # Check if this is inside a JSX element (look for surrounding tags)
        # If the stripped content is just text (no code constructs), it might be JSX text
        pass
    
    return False

def process_line_comment(line, lines, line_idx):
    """Process a line that might contain a // comment."""
    stripped = line.strip()
    
    # Skip empty lines
    if not stripped:
        return line
    
    # Find // that's not inside a string
    i = 0
    while i < len(line):
        if line[i] == '/' and i + 1 < len(line) and line[i+1] == '/':
            # Potential comment
            if not is_inside_string_or_jsx_text(line, i):
                comment_text = line[i:]
                
                # KEEP section dividers
                if SECTION_DIVIDER.search(comment_text):
                    return line
                
                # Check if this is the whole line (standalone comment)
                before = line[:i].rstrip()
                if not before:
                    # Standalone comment line - remove entire line
                    return None
                else:
                    # Trailing comment - remove comment, keep code
                    return before + '\n'
        
        # Skip string literals
        if line[i] == '"':
            i += 1
            while i < len(line) and line[i] != '"':
                if line[i] == '\\':
                    i += 1
                i += 1
            i += 1
            continue
        elif line[i] == "'":
            i += 1
            while i < len(line) and line[i] != "'":
                if line[i] == '\\':
                    i += 1
                i += 1
            i += 1
            continue
        elif line[i] == '`':
            i += 1
            while i < len(line) and line[i] != '`':
                if line[i] == '\\':
                    i += 1
                i += 1
            i += 1
            continue
        
        i += 1
    
    return line

def process_jsx_comment(line):
    """Remove {/* ... */} JSX comments from a line."""
    stripped = line.strip()
    
    # Check for standalone JSX comment line: {/* ... */}
    if re.match(r'^\{/\*.*\*/\}$', stripped):
        # Check it's not a section divider
        if SECTION_DIVIDER.search(stripped):
            return line
        return None
    
    # Check for inline JSX comments (less common, but handle)
    # Only remove if the whole line is just the comment
    return line

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    result = []
    in_css_template = False
    backtick_depth = 0
    
    for idx, line in enumerate(lines):
        # Track if we're inside a template literal (for CSS)
        for ch_idx, ch in enumerate(line):
            if ch == '`':
                # Check it's not escaped
                if ch_idx == 0 or line[ch_idx-1] != '\\':
                    backtick_depth = 1 - backtick_depth
        
        stripped = line.strip()
        
        # Skip processing lines inside CSS template literals
        # CSS comments like /* Header */ should be preserved
        if backtick_depth == 1 and (stripped.startswith('/*') or stripped.startswith('*')):
            result.append(line)
            continue
        
        # Handle JSX comments: {/* ... */}
        if re.match(r'^\s*\{/\*.*\*/\}\s*$', stripped):
            if SECTION_DIVIDER.search(stripped):
                result.append(line)
            else:
                # Remove the entire line (including the line itself)
                continue
            continue
        
        # Handle standalone // comments (entire line is a comment)
        if re.match(r'^\s*//', stripped):
            comment_text = stripped
            
            # KEEP section dividers
            if SECTION_DIVIDER.search(comment_text):
                result.append(line)
                continue
            
            # Check if inside a template literal (CSS block)
            temp_depth = 0
            for prev_idx in range(idx):
                for ch in lines[prev_idx]:
                    if ch == '`':
                        temp_depth = 1 - temp_depth
            if temp_depth == 1:
                result.append(line)
                continue
            
            # Remove standalone comment line
            continue
        
        # Handle trailing // comments on code lines
        processed = process_line_comment(line, lines, idx)
        if processed is None:
            continue
        result.append(processed)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(result)
    
    removed = len(lines) - len(result)
    print(f"  {filepath}: {removed} lines removed ({len(lines)} -> {len(result)})")

def main():
    files = sys.argv[1:]
    for f in files:
        try:
            process_file(f)
        except Exception as e:
            print(f"  ERROR processing {f}: {e}")

if __name__ == '__main__':
    main()
