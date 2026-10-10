import { defineConfig } from 'vitepress'
import { availableParallelism } from 'node:os'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

// ===== Configuration imports =====
import { generateAllLocales } from './config/locale.config'
import {
  registerMarkdownPlugins,
  markdownItMkLiquidCondition,
  shikiRemoveDiffMarker
} from './config/markdown.config'
import { applySeoMetadata } from './config/seo.config'
import { writeRedirectsFile } from './config/redirects.config'

// ===== Vite plugins =====
import liquidIncludePlugin from "./plugins/vite/vite-liquid-include"
import releaseSfcAstPlugin from "./plugins/vite/vite-release-sfc-ast"

// ===== Constants =====
const mkDiffGrammarPath = resolve(__dirname, './plugins/shiki/shiki-mk-diff.json')
const mkDiffGrammar = JSON.parse(readFileSync(mkDiffGrammarPath, 'utf-8'))

/**
 * VitePress defaults to 64 concurrent SSR renders. On Cloudflare Pages
 * (2–4 vCPU, 8 GB) that keeps too many large pages in the heap and GC-thrashes.
 */
function resolveBuildConcurrency(): number {
  const fromEnv = Number(process.env.DOCS_BUILD_CONCURRENCY)
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv)
  if (process.env.CF_PAGES === '1') return 4
  return Math.max(4, availableParallelism())
}

// ===== Main configuration =====
// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Basic configuration
  cleanUrls: true,
  lastUpdated: false,
  // Localhost URLs are runnable examples, not public-site routes. All other
  // dead links remain build-breaking.
  ignoreDeadLinks: 'localhostLinks',
  metaChunk: true,
  buildConcurrency: resolveBuildConcurrency(),
  // Default content locale is zh-Hans (root; no URL prefix). See shared/locales.ts.
  lang: 'zh-Hans',
  title: 'Open AIDoc',
  description: '开发者友好的多语言技术文档中心',
  sitemap: {
    hostname: 'https://openaidoc.org'
  },

  // Head configuration
  head: [
    ['link', { rel: 'icon', href: '/img/favicon.ico' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-HLCXSW4HH1' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-HLCXSW4HH1');`
    ]
  ],

  // Vite configuration
  vite: {
    resolve: {
      alias: { '@': resolve(__dirname, '../.vitepress') }
    },
    plugins: [liquidIncludePlugin(), releaseSfcAstPlugin()],
    build: {
      // Gzipping ~8k page chunks just to print sizes is minutes on 2 vCPU CI.
      reportCompressedSize: false,
    },
  },

  // Global theme configuration
  themeConfig: {
    outline: [2, 3],
    logo: '/img/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BinaryTape/Open-AIDoc' }
    ],
    footer: {
      copyright: 'Copyright © 2026 Open AIDoc.'
    },
  },

  // All locale configurations are now generated automatically
  locales: generateAllLocales(),

  transformPageData(pageData) {
    applySeoMetadata(pageData)
  },

  // Redirects for pages moved upstream (Cloudflare Pages' _redirects)
  buildEnd(siteConfig) {
    writeRedirectsFile(siteConfig.outDir, resolve(__dirname, 'redirects'))
  },

  // Markdown configuration
  markdown: {
    attrs: {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: []
    },
    preConfig: (md) => {
      md.use(markdownItMkLiquidCondition)
    },
    shikiSetup: (shiki) => {
      shiki.loadLanguage(mkDiffGrammar)
    },
    codeTransformers: [
      shikiRemoveDiffMarker()
    ],
    config: (md) => {
      registerMarkdownPlugins(md)
    },
  },
})
