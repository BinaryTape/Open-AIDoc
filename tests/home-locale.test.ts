import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createI18n, localeOfPath, useI18n } from '../docs/.vitepress/utils/i18n-utils'
import ja from '../docs/.vitepress/locales/ja.json'
import ko from '../docs/.vitepress/locales/ko.json'
import zhHans from '../docs/.vitepress/locales/zh-Hans.json'

const KEY = 'homepage.hero.subtitle'

// As the home page reads the messages: $t in the template, t from useI18n in setup
const Page = defineComponent({
  setup() {
    const { t } = useI18n()
    return () => h('p', [t(KEY), ' | ', h(Template)])
  },
})
const Template = defineComponent({ template: '<span>{{ $t(KEY) }}</span>', data: () => ({ KEY }) })

/** The app VitePress renders a page with: its own router, at the page's path. */
function appAt(path: string) {
  const router = { route: reactive({ path }) } as any
  const app = createSSRApp(Page)
  app.use(createI18n(router))
  return { app, router }
}

describe('the site messages of a page', () => {
  it('are in the locale of its path', () => {
    expect(localeOfPath('/ja/')).toBe('ja')
    expect(localeOfPath('/zh-Hant/kotlin/home')).toBe('zh-Hant')
    expect(localeOfPath('/')).toBe('zh-Hans')
    expect(localeOfPath('/kotlin/home')).toBe('zh-Hans')
  })

  it('render on the server in that locale, for pages rendered at the same time', async () => {
    // Showed in Simplified Chinese until the browser took over (P2-21)
    const [jaHtml, rootHtml, koHtml] = await Promise.all(['/ja/', '/', '/ko/'].map((path) => renderToString(appAt(path).app)))

    expect(jaHtml).toContain(`${ja[KEY]} | <span>${ja[KEY]}</span>`)
    expect(rootHtml).toContain(`${zhHans[KEY]} | <span>${zhHans[KEY]}</span>`)
    expect(koHtml).toContain(`${ko[KEY]} | <span>${ko[KEY]}</span>`)
  })

  it('follow the route when the reader switches language', async () => {
    const { app, router } = appAt('/ja/')
    expect(await renderToString(app)).toContain(ja[KEY])

    router.route.path = '/ko/'
    await nextTick()
    expect(await renderToString(app)).toContain(ko[KEY])
  })
})
