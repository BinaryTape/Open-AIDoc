<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { breadcrumbTrail } from '../utils/breadcrumbs'

// Above the page title, as on kotlinlang.org, ktor.io and insert-koin.io: the
// sidebar groups down to this page. Worked out from the page's own data, so
// the server and the browser render the same thing.
const { theme, page, lang } = useData()

const crumbs = computed(() =>
  breadcrumbTrail(theme.value.sidebar, page.value.relativePath).map((crumb) => ({
    ...crumb,
    // The full text when a long crumb is cut short with an ellipsis
    title: crumb.text.replace(/<[^>]*>/g, ''),
  }))
)

const LABELS: Record<string, string> = {
  'zh-Hans': '面包屑导航',
  'zh-Hant': '麵包屑導覽',
  ja: 'パンくずリスト',
  ko: '이동 경로',
}
const label = computed(() => LABELS[lang.value] ?? 'Breadcrumbs')
</script>

<template>
  <nav v-if="crumbs.length" class="ws-breadcrumbs" :aria-label="label">
    <ol>
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        :aria-current="index === crumbs.length - 1 ? 'page' : undefined"
      >
        <a v-if="crumb.link" :href="crumb.link" :title="crumb.title" v-html="crumb.text" />
        <span v-else :title="crumb.title" v-html="crumb.text" />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* Writerside's breadcrumbs (kotlinlang.org, ktor.io): one line of 15px text,
   the groups in grey, the page in the text colour, "/" between them; a crumb
   that does not fit is cut short with an ellipsis. */
.ws-breadcrumbs {
  margin: -16px 0 32px;
  font-size: 15px;
  line-height: 24px;
}

.ws-breadcrumbs ol {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ws-breadcrumbs li {
  display: flex;
  min-width: 0;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.ws-breadcrumbs li:not(:last-child)::after {
  content: '/';
  margin: 0 6px 0 4px;
  color: var(--vp-c-gray-1);
}

.ws-breadcrumbs li:last-child {
  color: var(--vp-c-text-1);
}

.ws-breadcrumbs a,
.ws-breadcrumbs span {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* A crumb with its own page is underlined by a thin line at the bottom of
   its line, in the colour of the separators (ktor.io "Templating") */
.ws-breadcrumbs a {
  color: inherit;
  text-decoration: none;
  box-shadow: inset 0 -1px 0 var(--vp-c-gray-1);
  transition: color 0.25s, box-shadow 0.25s;
}

.ws-breadcrumbs a:hover {
  color: var(--vp-c-brand-1);
  box-shadow: inset 0 -1px 0 var(--vp-c-brand-1);
}
</style>
