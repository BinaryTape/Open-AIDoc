import fs from 'node:fs'
import path from 'node:path'
import { CONTENT_LOCALES } from '../../../shared/locales'
import { toContentRelPath } from '../../../shared/content-paths'

/**
 * Redirects for pages removed because upstream moved them.
 *
 * The docs pipeline records them per upstream repository in
 * docs/.vitepress/redirects/<repo>.json (tools/pipeline/utils/stale-pages.mjs),
 * as content paths: `{ "from": "kmp/amper.md", "to": "kmp/kotlin-toolchain.md" }`.
 * After the build they become Cloudflare Pages' _redirects, one rule per
 * locale. Cloudflare follows a redirect even where a page exists, so a rule
 * whose source page is built is left out, as is one whose target is not.
 */
export const REDIRECTS_DIR = 'docs/.vitepress/redirects'

// Cloudflare Pages reads at most 2,000 static redirects
const CLOUDFLARE_LIMIT = 2000

interface Redirect {
  from: string
  to: string
}

/** URL of a page: content path `koog/a2a/index.md` in `ja` → `/ja/koog/a2a/`. */
export function pageUrl(locale: string, contentPath: string): string {
  const [docType, ...rest] = contentPath.split('/')
  const rel = toContentRelPath(locale, docType, rest.join('/'))
  return '/' + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
}

/**
 * `_redirects` lines for the redirects, in every locale.
 * @param isBuilt - Whether a page URL is a built page
 */
export function redirectRules(
  redirects: Redirect[],
  locales: readonly string[],
  isBuilt: (url: string) => boolean
): string[] {
  const rules = new Map<string, string>()
  for (const { from, to } of redirects) {
    for (const locale of locales) {
      const [source, target] = [pageUrl(locale, from), pageUrl(locale, to)]
      if (isBuilt(source) || !isBuilt(target)) continue
      rules.set(source, `${source} ${target} 301`)
    }
  }
  return [...rules.values()].sort()
}

function readRedirects(dir: string): Redirect[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Redirect[])
}

/** Write `_redirects` into the build output (VitePress buildEnd). */
export function writeRedirectsFile(outDir: string, redirectsDir = REDIRECTS_DIR) {
  const isBuilt = (url: string) =>
    fs.existsSync(url.endsWith('/') ? path.join(outDir, url, 'index.html') : path.join(outDir, `${url}.html`))
  const rules = redirectRules(readRedirects(redirectsDir), CONTENT_LOCALES, isBuilt)
  if (rules.length > CLOUDFLARE_LIMIT) {
    console.warn(`_redirects: ${rules.length} rules, Cloudflare Pages reads only the first ${CLOUDFLARE_LIMIT}.`)
  }

  const file = path.join(outDir, '_redirects')
  // Rules from docs/public/_redirects, if the site ever adds some by hand, come first.
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trimEnd() : ''
  const generated = rules.length > 0 ? `# Pages moved upstream (docs/.vitepress/redirects)\n${rules.join('\n')}` : ''
  const content = [existing, generated].filter(Boolean).join('\n\n')
  if (content) fs.writeFileSync(file, content + '\n')
}
