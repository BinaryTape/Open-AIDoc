import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PageData } from 'vitepress'
import {
  extractDescription,
  extractTitle
} from '../../../docs/.vitepress/config/seo.config'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function applyKotlinCnMetadata(pageData: PageData) {
  const sourcePath = resolve(siteRoot, pageData.relativePath)
  if (!existsSync(sourcePath)) return

  const source = readFileSync(sourcePath, 'utf8')
  const title = extractTitle(source)
  const description = extractDescription(source) ||
    fallbackDescription(pageData.relativePath)

  if (title) pageData.title = title
  if (description) pageData.description = description
}

function fallbackDescription(relativePath: string) {
  if (relativePath === 'docs/language/home.md') {
    return 'Kotlin 中文文档：学习语言基础、标准库、协程、开发工具与平台相关指南。'
  }
  if (relativePath === 'docs/multiplatform/get-started.md') {
    return 'Kotlin Multiplatform 中文文档：在 Android、iOS、桌面端与 Web 之间共享代码和用户界面。'
  }
  if (relativePath === 'docs/koog/index.md') {
    return 'Koog 中文文档：使用 Kotlin 和 Java 构建类型安全的 AI 智能体、工具和工作流。'
  }
  return ''
}
