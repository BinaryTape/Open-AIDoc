// Builds a VitePress site in three processes: client bundle, server bundle,
// then page rendering (VITEPRESS_BUILD_STEP, see patches/vitepress@*.patch).
// Rolldown keeps a bundle's native memory until its process exits, so in one
// process the steps stack up: about 6.8 GB peak for docs, against about
// 5.4 GB for the largest single step. Cloudflare Pages builds have 8 GB.
//
// Usage: node scripts/build-docs.mjs [site root, default docs]
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const vitepress = fileURLToPath(new URL('../node_modules/vitepress/bin/vitepress.js', import.meta.url))
const root = process.argv[2] ?? 'docs'
// A 4 GB heap makes V8 collect earlier while rendering (see
// contribute/add-new-doc-guide-zh.md).
const nodeArgs = ['--max-old-space-size=4096']

for (const step of ['client', 'server', 'render']) {
  const { status, signal, error } = spawnSync(
    process.execPath,
    [...nodeArgs, vitepress, 'build', root],
    { stdio: 'inherit', env: { ...process.env, VITEPRESS_BUILD_STEP: step } }
  )
  if (status !== 0) {
    console.error(`build-docs: ${step} step failed (${error?.message ?? signal ?? `exit code ${status}`})`)
    process.exit(status || 1)
  }
}
