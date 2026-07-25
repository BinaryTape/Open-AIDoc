import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import KotlinLayout from './KotlinLayout.vue'
import '../../../../docs/.vitepress/theme/style.css'
import './styles.css'

import Deflist from '../../../../docs/.vitepress/component/Deflist.vue'
import Def from '../../../../docs/.vitepress/component/Def.vue'
import List from '../../../../docs/.vitepress/component/List.vue'
import CodeBlock from '../../../../docs/.vitepress/component/CodeBlock.vue'
import TLDR from '../../../../docs/.vitepress/component/TLDR.vue'
import Tabs from '../../../../docs/.vitepress/component/Tabs.vue'
import Tab from '../../../../docs/.vitepress/component/Tab.vue'
import Topic from '../../../../docs/.vitepress/component/Topic.vue'
import TopicTitle from '../../../../docs/.vitepress/component/TopicTitle.vue'
import Page from '../../../../docs/.vitepress/component/Page.vue'
import IgnoreComponent from '../../../../docs/.vitepress/component/IgnoreComponent.vue'
import EmptyComponent from '../../../../docs/.vitepress/component/EmptyComponent.vue'
import Description from '../../../../docs/.vitepress/component/Description.vue'
import TopicCardSection from '../../../../docs/.vitepress/component/TopicCardSection.vue'
import Card from '../../../../docs/.vitepress/component/Card.vue'
import TopicLinkSection from '../../../../docs/.vitepress/component/TopicLinkSection.vue'
import LinkGroup from '../../../../docs/.vitepress/component/LinkGroup.vue'
import Link from '../../../../docs/.vitepress/component/Link.vue'
import Chapter from '../../../../docs/.vitepress/component/Chapter.vue'
import Procedure from '../../../../docs/.vitepress/component/Procedure.vue'
import Step from '../../../../docs/.vitepress/component/Step.vue'
import Highlight from '../../../../docs/.vitepress/component/Highlight.vue'
import Note from '../../../../docs/.vitepress/component/Note.vue'
import Tip from '../../../../docs/.vitepress/component/Tip.vue'
import YouTubeVideo from '../../../../docs/.vitepress/component/YouTubeVideo.vue'

export default {
  extends: DefaultTheme,
  Layout: KotlinLayout,
  enhanceApp({ app }) {
    app.component('deflist', Deflist)
    app.component('def', Def)
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

  }
} satisfies Theme
