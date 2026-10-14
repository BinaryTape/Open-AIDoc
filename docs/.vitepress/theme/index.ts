// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'aos/dist/aos.css'
import './style.css'
import './home.style.css'
import '../styles/ws-callout.css'
import HomeLayout from './layout/Home.vue' // 调整路径，如果它在子目录，例如 './layouts/MyHomeLayout.vue'
import { SiteLocaleConfig } from '../locales.config'
import { createI18n, setLocale } from '../utils/i18n-utils'
import Deflist from '../component/Deflist.vue'
import Def from '../component/Def.vue'
import List from "../component/List.vue";
import CodeBlock from "../component/CodeBlock.vue";
import TLDR from "../component/TLDR.vue";
import Tabs from "../component/Tabs.vue";
import Tab from "../component/Tab.vue";
import Topic from "../component/Topic.vue";
import TopicTitle from "../component/TopicTitle.vue";
import Page from "../component/Page.vue";
import IgnoreComponent from "../component/IgnoreComponent.vue";
import EmptyComponent from "../component/EmptyComponent.vue";
import Description from "../component/Description.vue";
import TopicCardSection from "../component/TopicCardSection.vue";
import Card from "../component/Card.vue";
import TopicLinkSection from "../component/TopicLinkSection.vue";
import LinkGroup from "../component/LinkGroup.vue";
import Link from "../component/Link.vue";
import Chapter from "../component/Chapter.vue";
import Procedure from "../component/Procedure.vue";
import Step from "../component/Step.vue";
import Highlight from "../component/Highlight.vue";
import Note from "../component/Note.vue";
import Tip from "../component/Tip.vue";
import YouTubeVideo from "../component/YouTubeVideo.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
    app.component('HomeLayout', HomeLayout)

    app.component('deflist', Deflist);
    app.component('def', Def);
    app.component('list', List)

    app.component('tldr', TLDR)
    app.component('tabs', Tabs)
    app.component('tab', Tab)
    app.component('Tabs', Tabs)
    app.component('TabItem', Tab)
    app.component('code-block', CodeBlock)

    app.component('topic', Topic)
    app.component('TopicTitle', TopicTitle)
    app.component('section-starting-page', Page)

    app.component('show-structure', IgnoreComponent)
    app.component('link-summary', IgnoreComponent)
    app.component('card-summary', IgnoreComponent)
    app.component('web-summary', IgnoreComponent)
    app.component('snippet', EmptyComponent)

    app.component('description', Description)

    app.component('spotlight', TopicCardSection)
    app.component('primary', TopicCardSection)
    app.component('secondary', TopicCardSection)
    app.component('misc', EmptyComponent)

    app.component('cards', TopicCardSection)
    app.component('card', Card)

    app.component('links', TopicLinkSection)
    app.component('group', LinkGroup)
    app.component('Links', Link)

    app.component('chapter', Chapter)
    app.component('procedure', Procedure)
    app.component('step', Step)

    app.component('control', Highlight)
    app.component('Path', Highlight)
    app.component('ui-path', Highlight)
    app.component('emphasis', Highlight)

    app.component('note', Note)
    app.component('tip', Tip)

    app.component('YouTubeVideo', YouTubeVideo)

    // Use our custom i18n implementation
    app.use(createI18n())

    // Only for testing
    // document.addEventListener('keydown', handleKeyPress)
    router.onAfterRouteChange = () => {
      setupInterceptor()

      if (typeof window !== 'undefined') {
        import('aos').then((AOS) => {
          AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
          });
        })
      }

      if (typeof location !== 'undefined') {
        const path = location.pathname
        const locale = Object.keys(SiteLocaleConfig).find(locale => path.startsWith(`/${locale}/`)) || 'zh-Hans';
        setLocale(locale);
      }
    }
  }
} satisfies Theme

function setupInterceptor() {
  if (typeof document === 'undefined') return

  // 移除旧的监听器
  document.removeEventListener('click', interceptLinks, true)

  // 添加新的监听器
  document.addEventListener('click', interceptLinks, true)
}

function interceptLinks(event) {
  const link = event.target.closest('a')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href) return

  // 匹配 JetBrains 链接
  const kmpMatch = href.match(/https:\/\/www\.jetbrains\.com\/help\/kotlin-multiplatform-dev\/([^)]+)\.html/)

  if (kmpMatch) {
    // 阻止默认跳转
    event.preventDefault()
    event.stopPropagation()

    // 构造新链接
    const newPath = `../kmp/${kmpMatch[1]}.html`

    // 跳转
    if (link.target === '_blank') {
      window.open(newPath, '_blank')
    } else {
      window.location.href = newPath
    }
  }

  const koogMatch = href.match(/https:\/\/koog\.ai/)

  if (koogMatch) {
    event.preventDefault()
    event.stopPropagation()

    const newPath = `../koog/`

    if (link.target === '_blank') {
      window.open(newPath, '_blank')
    } else {
      window.location.href = newPath
    }
  }
}

function handleKeyPress(event) {
    if (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
        return
    }

    switch(event.key) {
        case 'ArrowRight':
        case 'j':
            event.preventDefault()
            clickNextButton()
            break

        case 'ArrowLeft':
        case 'k':
            event.preventDefault()
            clickPrevButton()
            break
    }
}

function clickNextButton() {
    const nextButton = document.querySelector('.pager-link.next, .VPDocFooter .next')
    if (nextButton && nextButton instanceof HTMLElement) {
        nextButton.click()
    }
}

function clickPrevButton() {
    const prevButton = document.querySelector('.pager-link.prev, .VPDocFooter .prev')
    if (prevButton && prevButton instanceof HTMLElement) {
        prevButton.click()
    }
}