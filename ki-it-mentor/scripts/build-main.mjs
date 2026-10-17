// Bundles the Electron main process, the preload script and the Claude Code hook CLI.
import { build } from 'esbuild';

const common = { bundle: true, platform: 'node', target: 'node20', sourcemap: true, format: 'cjs', logLevel: 'info' };

await Promise.all([
  build({ ...common, entryPoints: ['src/main/main.ts'], outfile: 'dist/main/main.cjs', external: ['electron'] }),
  build({ ...common, entryPoints: ['src/preload/preload.ts'], outfile: 'dist/preload/preload.cjs', external: ['electron'] }),
  build({ ...common, entryPoints: ['src/integrations/claude-code-hook.ts'], outfile: 'dist/claude-code-hook.cjs', banner: { js: '#!/usr/bin/env node' } }),
]);
