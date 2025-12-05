# Serena API Reference

Complete reference for all Serena MCP tools.

## Core Navigation Tools

### get_symbols_overview

Maps file structure without reading implementations.

```bash
mcp__serena__get_symbols_overview --relative_path "src/file.ts"
```

**Parameters**:
- `--relative_path`: Path relative to project root (required)

**Output**: List of all symbols (classes, functions, interfaces, etc.) with their structure.

**Token Cost**: ~200 tokens (vs ~8000 for full file read)

**Use When**: First time exploring file, need to understand structure, deciding which symbol to read.

---

### find_symbol

Locate and optionally read specific symbol by name.

```bash
mcp__serena__find_symbol "SymbolName" \
  --relative_path "src/file.ts" \
  --include_body true \
  --substring_matching false \
  --depth 1
```

**Parameters**:
- Positional: Symbol name or name_path (e.g., "ClassName/methodName")
- `--relative_path`: File path (required)
- `--include_body`: Include implementation code (default: false)
- `--substring_matching`: Allow partial name matches (default: false)
- `--depth`: How deep to traverse nested symbols (default: 1)

**Output**: Symbol definition, optionally with implementation code.

**Token Cost**: ~500 tokens with body, ~100 without

**Use When**: Know symbol name, need implementation, navigating nested structures.

---

### find_referencing_symbols

Find ALL usages of a symbol (CRITICAL for safe refactoring).

```bash
mcp__serena__find_referencing_symbols \
  --name_path "SymbolName" \
  --relative_path "src/file.ts"
```

**Parameters**:
- `--name_path`: Symbol name or path (required)
- `--relative_path`: File where symbol is defined (required)

**Output**: List of all files and line numbers where symbol is used.

**Token Cost**: ~800 tokens (depends on number of references)

**Use When**: Before any refactoring, renaming, or API changes. ALWAYS use before modifying public symbols.

---

## Surgical Editing Tools

### replace_symbol_body

Replace symbol implementation while preserving signature.

```bash
mcp__serena__replace_symbol_body \
  --name_path "FunctionName" \
  --relative_path "src/file.ts" \
  --body "new implementation code here"
```

**Parameters**:
- `--name_path`: Symbol to replace (required)
- `--relative_path`: File path (required)
- `--body`: New implementation code (required)

**Use When**: Changing implementation without changing signature, bug fixes, optimizations.

**Caution**: Does NOT update callers. For signature changes, check references first!

---

### rename_symbol

Safe LSP-powered rename across entire codebase.

```bash
mcp__serena__rename_symbol \
  --name_path "OldName" \
  --relative_path "src/file.ts" \
  --new_name "NewName"
```

**Parameters**:
- `--name_path`: Current symbol name (required)
- `--relative_path`: File where symbol is defined (required)
- `--new_name`: New symbol name (required)

**Output**: All files modified, list of changes made.

**Use When**: Renaming variables, functions, classes. Handles all references automatically.

**Safety**: LSP ensures all references are updated, including imports.

---

### insert_after_symbol

Insert new code after specified symbol.

```bash
mcp__serena__insert_after_symbol \
  --name_path "LastMethod" \
  --relative_path "src/file.ts" \
  --body "
  newMethod() {
    // code
  }
  "
```

**Parameters**:
- `--name_path`: Symbol to insert after (required)
- `--relative_path`: File path (required)
- `--body`: Code to insert (required)

**Use When**: Adding new methods to classes, new functions to modules.

---

### insert_before_symbol

Insert new code before specified symbol.

```bash
mcp__serena__insert_before_symbol \
  --name_path "FirstSymbol" \
  --relative_path "src/file.ts" \
  --body "import statement or code"
```

**Parameters**:
- `--name_path`: Symbol to insert before (required)
- `--relative_path`: File path (required)
- `--body`: Code to insert (required)

**Use When**: Adding imports, adding code before existing symbols.

---

## Name Path Syntax

Serena uses "name_path" to reference nested symbols:

```
TopLevelSymbol          → "ClassName"
Method in class         → "ClassName/methodName"
Nested class            → "OuterClass/InnerClass"
Method in nested class  → "OuterClass/InnerClass/methodName"
```

**Examples**:
```bash
# Top-level function
mcp__serena__find_symbol "utilityFunction" --relative_path "src/utils.ts"

# Class method
mcp__serena__find_symbol "UserService/getUser" --relative_path "src/services/user.ts"

# Deeply nested
mcp__serena__find_symbol "Outer/Inner/deepMethod" --relative_path "src/nested.ts"
```

## Performance Characteristics

| Operation | Token Cost | Speed | Safety |
|-----------|------------|-------|--------|
| get_symbols_overview | ~200 | <1s | Read-only |
| find_symbol (no body) | ~100 | <1s | Read-only |
| find_symbol (with body) | ~500 | <1s | Read-only |
| find_referencing_symbols | ~800 | 1-3s | Read-only |
| replace_symbol_body | ~100 | <1s | Modifies 1 file |
| rename_symbol | ~1000 | 2-5s | Modifies N files |
| insert_after/before_symbol | ~100 | <1s | Modifies 1 file |

## Limitations

- **Language Support**: TypeScript, JavaScript only (uses TypeScript LSP)
- **Project Setup**: Requires valid `tsconfig.json` in project root
- **Generated Code**: May not work well with heavily generated files
- **Minified Code**: Not suitable for minified/obfuscated code
- **File Size**: Very large files (>10k LOC) may be slow

## Troubleshooting

**"Symbol not found"**
- Check spelling and name_path syntax
- Try `substring_matching: true`
- Verify file is TypeScript/JavaScript
- Use `get_symbols_overview` to see available symbols

**"LSP error"**
- Check `tsconfig.json` exists and is valid
- Verify file is part of TypeScript project
- Restart LSP server (usually automatic)

**"Too many results"**
- Be more specific with name_path
- Use full path like "ClassName/methodName"
- Check for duplicate symbol names

**"Rename failed"**
- Symbol might be used in ways LSP can't track
- Check for dynamic imports or string-based references
- Fall back to manual find/replace with `find_referencing_symbols`

