import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { rebaseSnippetLinks } from './mkdocs-snippet-links'

// [ \t], not \s: in multiline mode \s also matches the newlines of the blank
// lines around a directive, which then became part of the "indent" put before
// every line of the snippet (a blank line after each of them).
const snippetDirective = /^([ \t]*)--8<--[ \t]+["']([^"']+)["'][ \t]*(?=\r?$)/gm
const snippetBlockDelimiter = /^(\s*)--8<--\s*$/
const regionMarker = /^\s*(?:#\s*)?--8<--\s+\[(start|end):([^\]]+)\]\s*$/

export type SnippetExpansionOptions = {
  onDependency?: (file: string) => void
}

/**
 * Expand pymdownx.snippets directives used by Koog before VitePress parses the
 * Markdown. Keeping this at the Vite transform layer gives us the absolute
 * source path and lets dev mode watch included files.
 */
export function expandMkDocsSnippets(
  content: string,
  currentFile: string,
  options: SnippetExpansionOptions = {},
  stack: string[] = []
): string {
  if (!isKoogMarkdown(currentFile) || !content.includes('--8<--')) return content

  const currentPath = resolve(currentFile)
  if (stack.includes(currentPath)) {
    throw new Error(`Circular MkDocs snippet include: ${[...stack, currentPath].join(' -> ')}`)
  }

  const nextStack = [...stack, currentPath]
  const withBlocks = expandSnippetBlocks(content, currentPath, options, nextStack)
  return withBlocks.replace(snippetDirective, (_match, indent: string, target: string) =>
    expandTarget(target, indent, currentPath, options, nextStack)
  )
}

function expandSnippetBlocks(
  content: string,
  currentFile: string,
  options: SnippetExpansionOptions,
  stack: string[]
): string {
  const lines = content.split('\n')
  const output: string[] = []

  for (let index = 0; index < lines.length; index++) {
    const opening = lines[index].match(snippetBlockDelimiter)
    if (!opening) {
      output.push(lines[index])
      continue
    }

    const targets: string[] = []
    let cursor = index + 1
    while (cursor < lines.length && !snippetBlockDelimiter.test(lines[cursor])) {
      if (lines[cursor].trim()) targets.push(lines[cursor].trim())
      cursor++
    }
    if (cursor >= lines.length) {
      throw new Error(`Unclosed MkDocs snippet block in ${currentFile}:${index + 1}`)
    }
    if (targets.length === 0) {
      throw new Error(`Empty MkDocs snippet block in ${currentFile}:${index + 1}`)
    }

    output.push(...targets.map((target) =>
      expandTarget(target, opening[1], currentFile, options, stack)
    ))
    index = cursor
  }

  return output.join('\n')
}

function expandTarget(
  target: string,
  indent: string,
  currentFile: string,
  options: SnippetExpansionOptions,
  stack: string[]
): string {
  const { fileName, region } = parseTarget(target, currentFile)
  const snippetFile = resolveSnippetFile(currentFile, fileName)
  options.onDependency?.(snippetFile)

  const source = readFileSync(snippetFile, 'utf8')
  const selected = region ? extractRegion(source, region, snippetFile) : stripFrontmatter(source)
  const expanded = expandMkDocsSnippets(selected, snippetFile, options, stack)

  // Nested includes have already been rebased to this snippet's directory.
  // Move their links, and this snippet's own links, to the caller's directory.
  return rebaseSnippetLinks(expanded, snippetFile, currentFile)
    .split('\n')
    .map((line) => line.length > 0 ? indent + line : '')
    .join('\n')
}

function isKoogMarkdown(file: string): boolean {
  const normalized = resolve(file).split(sep)
  return file.endsWith('.md') && normalized.includes('koog')
}

function parseTarget(target: string, currentFile: string): { fileName: string, region?: string } {
  const match = target.match(/^(.+\.md)(?::([A-Za-z0-9_.-]+))?$/)
  if (!match) {
    throw new Error(`Invalid MkDocs snippet target "${target}" in ${currentFile}`)
  }
  return { fileName: match[1], region: match[2] }
}

function resolveSnippetFile(currentFile: string, fileName: string): string {
  if (isAbsolute(fileName)) {
    throw new Error(`Absolute MkDocs snippet paths are not allowed: ${fileName}`)
  }

  const koogRoot = findKoogRoot(currentFile)
  const candidates = [
    resolve(dirname(currentFile), fileName),
    resolve(koogRoot, fileName),
    resolve(koogRoot, 'snippets', fileName),
  ]

  for (const candidate of candidates) {
    if (!isInside(candidate, koogRoot)) continue
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }

  throw new Error(
    `MkDocs snippet file "${fileName}" referenced by ${currentFile} was not found under ${koogRoot}`
  )
}

function findKoogRoot(file: string): string {
  let current = dirname(resolve(file))
  while (true) {
    if (current.split(sep).at(-1) === 'koog') return current
    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }
  throw new Error(`Unable to determine the Koog documentation root for ${file}`)
}

function isInside(file: string, root: string): boolean {
  const rel = relative(root, file)
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel))
}

function extractRegion(source: string, region: string, file: string): string {
  const lines = source.split('\n')
  let start = -1

  for (let index = 0; index < lines.length; index++) {
    const marker = lines[index].match(regionMarker)
    if (!marker || marker[2] !== region) continue

    if (start === -1) {
      if (marker[1] === 'start') start = index + 1
      continue
    }

    // Koog currently contains a few translated files whose closing marker is
    // another `start`. Pymdown's intended form is `end`, but treating the
    // repeated marker as a close preserves the upstream content.
    return trimBlankEdges(lines.slice(start, index)).join('\n')
  }

  const detail = start === -1 ? 'was not found' : 'has no closing marker'
  throw new Error(`MkDocs snippet region "${region}" ${detail} in ${file}`)
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, '')
}

function trimBlankEdges(lines: string[]): string[] {
  while (lines[0]?.trim() === '') lines.shift()
  while (lines.at(-1)?.trim() === '') lines.pop()
  return lines
}
