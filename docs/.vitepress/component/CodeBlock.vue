<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { codeToHtml } from 'shiki'
import { useData } from 'vitepress'

const props = defineProps({
  lang: { type: String, required: false },
  code: { type: String, required: false },
  src: { type: String, required: false }
})

const highlightedCode = ref('')
const { isDark } = useData()

// 1. 把常见 HTML 实体转回原字符
function decodeHtmlEntities(str) {
  // 如果在 SSR（没有 document）时，直接返回
  if (typeof document === 'undefined') return str
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

// 2. 去掉首尾空行 & 统一缩进
function normalizeIndent(code) {
  code = code.replace(/^\s*\n/, '').replace(/\n\s*$/, '')
  const lines = code.split('\n')
  // 找最小缩进
  let minIndent = lines
      .filter(l => l.trim())
      .reduce((min, l) => {
        const m = l.match(/^(\s*)/)
        const len = m ? m[1].length : 0
        return min === null ? len : Math.min(min, len)
      }, null)
  if (minIndent > 0) {
    return lines.map(l => l.slice(minIndent)).join('\n')
  }
  return lines.join('\n')
}

const getTheme = () => (isDark.value ? 'github-dark' : 'github-light')

function langAlias(lang) {
  switch (lang) {
    case 'Kotlin': return 'kotlin'
    default: return lang
  }
}

// 只在客户端高亮（确保 document 存在）
onMounted(() => {
  watchEffect(async () => {
    let raw = props.code || ''

    raw = decodeHtmlEntities(raw)
    raw = normalizeIndent(raw)

    const lang = langAlias(props.lang)

    try {
      highlightedCode.value = await codeToHtml(raw, {
        lang: lang,
        theme: getTheme(),
        transformers: [
          {
            pre(node) {
              node.properties.class += ' shiki-themes'
              node.properties.style = null
              return node
            }
          }
        ]
      })
    } catch (err) {
      highlightedCode.value = await codeToHtml(raw, {
        lang: 'md',
        theme: getTheme(),
        transformers: [
          {
            pre(node) {
              node.properties.class += ' shiki-themes'
              node.properties.style = null
              return node
            }
          }
        ],
      })
    }
  })
})
</script>

<template>
  <div :class="`language-${lang}`">
    <button title="复制代码" class="copy"></button>
    <span class="lang">{{ lang }}</span>
    <div v-html="highlightedCode"/>
  </div>
</template>

<style scoped>
.vp-doc div[class*="language-"] {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 8px;
}
</style>