import { defineConfig } from 'vitepress'
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

// ===== Vite plugins =====
import liquidIncludePlugin from "./plugins/vite/vite-liquid-include"

// ===== Constants =====
const mkDiffGrammarPath = resolve(__dirname, './plugins/shiki/shiki-mk-diff.json')
const mkDiffGrammar = JSON.parse(readFileSync(mkDiffGrammarPath, 'utf-8'))

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
    plugins: [liquidIncludePlugin()]
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
