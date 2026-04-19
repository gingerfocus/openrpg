# OpenRpg
Renders interactive character sheets.

Web: `https://rpg.kamio.ink`

## Development

Commands:
+ Run: `go run main.go`
+ Test: `go test ./tests/... -v`
+ Check: `bun run build`

API endpoints:
- `GET /api/modules` — list all modules
- `GET /api/modules/{scope}/{name}` — get module bundle

### Module System

Modules live in `modules/` with manifests in a single `manifest.json` and bundles as flattened `.js` files:

**`modules/manifest.json`** — all module manifests:
```json
{
  "modules": [
    {
      "id": "@core/stats",
      "name": "Core Stats",
      "version": "1.0.0",
      "description": "Core stats rendering system",
      "author": "gingerfocus"
    }
  ]
}
```

**`modules/{@scope}/{name}.js`** — module bundle, executed client-side. Registers hooks via `OpenRpg.register(hookName, renderFn)`.

### Client Runtime (`public/core.js`)

`OpenRpg` global provides:

| Method | Description |
|--------|-------------|
| `OpenRpg.register(id, fn)` | Register a hook |
| `OpenRpg.call(name, ...args)` | Invoke a hook |
| `OpenRpg.get(id)` | Get character data by module ID |
| `OpenRpg.set(id, data)` | Set character data |
| `OpenRpg.load(id)` | Fetch and execute a module bundle |
| `OpenRpg.loadFile(file)` | Load a character JSON file |
| `OpenRpg.render()` | Render the character sheet |

Math utilities available globally:
- `dawnParse(expr, context)` — evaluate expressions with `$[var]` references
- `dawnMatch(str)` — find `$[...]` patterns in strings

### Character JSON Format

```json
{
  "version": "v1",
  "name": "My Character",
  "layout": {
    "panes": [{ "id": "stats", "title": "Stats", "hook": "core.renderStats" }]
  },
  "@core/stats": [{ "name": "STR", "score": 10 }],
  "@core/inventory": { "currency": { "gold": 100 }, "items": [], "slots": { "total": 10, "used": 0 } }
}
```

Top-level keys (except `version`, `name`, `layout`) are module IDs whose bundles will be loaded.

