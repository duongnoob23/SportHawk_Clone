# Dev Env set up

In folder load latest expo with blank template, enabling typescript:

```
npx create-expo-app@latest -t expo-template-blank-typescript .
```

Install web dependencies:

```
npx expo install react-dom react-native-web @expo/metro-runtime
```

Try it:

```
npm run web
```

Folders: components, constants, hooks, types

Type spec for images: ./types/images.d.ts

```
declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";
declare module "*.JPG";
declare module "*.gif";
declare module "*.webp";
declare module "*.bmp";
declare module "*.tiff";
declare module "*.ico";
```

Change to use Expo Router: See: [https://docs.expo.dev/router/installation/](https://docs.expo.dev/router/installation/) Delete /index.ts & /App.tsx Make folder /app Create file /app/index.tsx In file use snippet: rnfes (VS Code extension ES7+ React ... by dsznadjer)

Install expo router and dependencies

```
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

Edit package.json to set the ain entry point to be the expo-router

```
"main": "expo-router/entry",
```

If needed to clear WatchMan warning:

```
watchman watch-del '/Users/adimac/Documents/Andrew/Dev/hms_admin_expo_blank-typescript' ; watchman watch-project '/Users/adimac/Documents/Andrew/Dev/hms_admin_expo_blank-typescript'
```

Test of logo gives warning:

```
WARN  Linking requires a build-time setting `scheme` in the project's Expo config (app.config.js or app.json) for production apps, if it's left blank, your app may crash. The scheme does not apply to development in the Expo client but you should add it as soon as you start working with Linking to avoid creating a broken build. Learn more: https://docs.expo.dev/guides/linking/
```

Fix: in app.json with

```
"scheme": "sporthawk",
```

GitHub RPC error: “RPC Failed; HTTP 400” Error in Git :: thewayeye.net Fix is to increase the buffer size:

```
git config --global --get http.postBuffer
git config --global http.postBuffer 157286400
```

SupaBase install JS for client

```
npx expo install @supabase/supabase-js
```

SupaBase: will need URL polyfill (why not: npx expo install expo-url-polyfill)

```
npm install react-native-url-polyfill
```

Supabase: later might need RN async storage

```
npx expo install @react-native-async-storage/async-storage
```

For Welcome Video

```
npx expo install expo-video
```

For Images that support SVG use expo-image

```
npx expo install expo-image
npx expo install expo-linear-gradient
```

Run the interactive installation command:

```
npx bmad-method install.
```

Fix if someone has sync'd changes to GitHub for the same file I'm working on

```
git config pull.rebase false
```

Install BMad latest version

```
npx bmad-method install
```

Install the md-tree module for sharding

```
npm install -g @kayvan/markdown-tree-parser
```

In Claude Code activate Sara the PO

```
/po
```

Get PO to shard the docs:

```
Please shard the prd and architeture Documents
```

Ensure MCP loaded into Claude

```
claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse
```

```
claude mcp add supabase -s local -e SUPABASE_ACCESS_TOKEN=sbp_2ffec55a85fc8273905add9da1da0da22b434fdb -- npx -y @supabase/mcp-server-supabase@latest
```

Ensure local Figma is running

MCP to GitHub

```
claude mcp add-json github '{"command": "docker", "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"], "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_pat"}}'
```

In Claude Code check MCP:

```
/mcp list
```

Fix if not running.

In Claude, running /PO:

```
What's next?
```
