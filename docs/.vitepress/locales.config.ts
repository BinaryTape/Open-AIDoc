import zh_Hans from './locales/zh-Hans.json'
import zh_Hant from './locales/zh-Hant.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import { DEFAULT_LOCALE } from '../../shared/locales'

export type SideLocaleConfig = {
    lang: string
    label: string
    title: string
    description: string
    messages: {
        [key: string]: string
    }
}

export const SiteLocaleConfig: { [key: string]: SideLocaleConfig } = {
    [DEFAULT_LOCALE]: {
        lang: DEFAULT_LOCALE,
        label: '简体中文',
        title: 'Open AIDoc',
        description: '开发者友好的多语言技术文档中心',
        messages: zh_Hans
    },
    "zh-Hant": {
        lang: 'zh-Hant',
        label: '繁體中文',
        title: 'Open AIDoc',
        description: '對開發者友善的多語言技術文件中心',
        messages: zh_Hant
    },
    ja: {
        lang: 'ja',
        label: '日本語',
        title: 'Open AIDoc',
        description: '開発者向けの多言語技術ドキュメントセンター',
        messages: ja
    },
    ko: {
        lang: 'ko',
        label: '한국어',
        title: 'Open AIDoc',
        description: '개발자를 위한 다국어 기술 문서 센터',
        messages: ko
    }
}

export const SITE_LOCALES = Object.keys(SiteLocaleConfig)
