<script setup lang="ts">
import { useData } from 'vitepress';
import { computed } from 'vue';
import DocCard from '../../component/DocCard.vue';
import { t } from '../../utils/i18n-utils';
const { site } = useData();
const docCardConfig = computed(() => [
    {
        href: 'kotlin/home',
        docType: 'kotlin',
        title: 'Kotlin',
        description: t('homepage.card.kotlin.description'),
        tags: [t('homepage.card.kotlin.tag.language'), t('homepage.card.kotlin.tag.crossplatform')],
    },
    {
        href: 'kmp/get-started',
        docType: 'kmp',
        title: 'Kotlin Multiplatform',
        description: t('homepage.card.kmp.description'),
        tags: [t('homepage.card.kmp.tag.1'), t('homepage.card.kmp.tag.2')],
    },
    {
      href: 'ktor/welcome',
      docType: 'ktor',
      title: 'Ktor',
      description: t('homepage.card.ktor.description'),
      tags: [t('homepage.card.ktor.tag.web'), t('homepage.card.ktor.tag.async')]
    },
    {
      href: 'koog/',
      docType: 'koog',
      title: 'Koog',
      description: t('homepage.card.koog.description'),
      tags: [t('homepage.card.koog.tag.1'), t('homepage.card.koog.tag.2')],
    },
    {
        href: 'koin/intro/',
        docType: 'koin',
        title: 'Koin',
        description: t('homepage.card.koin.description'),
        tags: ['DI', 'Kotlin'],
    },
    {
        href: 'sqldelight/index',
        docType: 'sqldelight',
        title: 'SQLDelight',
        description: t('homepage.card.sqldelight.description'),
        tags: [t('homepage.card.sqldelight.tag.sql'), t('homepage.card.sqldelight.tag.database')],
    },
    {
        href: 'coil/overview',
        docType: 'coil',
        title: 'Coil',
        description: t('homepage.card.coil.description'),
        tags: [t('homepage.card.coil.tag.crossplatform'), t('homepage.card.coil.tag.imageloadder')],
    },
])

const sponsors = [
    {
        name: 'JetBrains',
        href: 'https://www.jetbrains.com/',
        logo: 'https://www.jetbrains.com/favicon.ico',
    },
    {
        name: 'Google Developer Program',
        href: 'https://developers.google.com/program',
        logo: 'https://developers.google.com/static/program/images/gdp/join-the-convo-gdp-logo.svg',
    },
    {
        name: 'BinaryTape',
        href: 'https://binarytape.com',
        logo: 'https://2bab-images.lastmayday.com/binarytape-logo.webp?imageslim',
    },
] as const
</script>

<template>
    <main class="mainContainer">
        <div class="heroSection">
            <h1 class="heroTitle">{{ site.title }}</h1>
            <p class="heroSubtitle">
                {{ $t('homepage.hero.subtitle') }}
            </p>
        </div>

        <div class="cardsContainer">
            <DocCard v-for="(card, index) in docCardConfig" :key="index" :href="card.href" :docType="card.docType"
                :title="card.title" :description="card.description" :tags="card.tags" :coming-soon="card.comingSoon"
                :aosDelay="(index + 1 % 2) * 100"></DocCard>
        </div>

        <div class="footerBanner">
            <div class="bannerContent">
                <h2 class="bannerTitle">
                    {{ $t('homepage.banner.title') }}
                </h2>
                <p class="bannerDescription">
                    {{ $t('homepage.banner.description') }}
                </p>
            </div>
        </div>

        <div class="adBanner" aria-label="Sponsors">
            <div class="sponsorList">
                <a v-for="sponsor in sponsors" :key="sponsor.name" class="sponsorItem" :href="sponsor.href"
                    target="_blank" rel="noopener noreferrer">
                    <img :src="sponsor.logo" :alt="`${sponsor.name} logo`" class="sponsorLogo" loading="lazy" />
                    <span class="sponsorName">{{ sponsor.name }}</span>
                </a>
            </div>
        </div>
    </main>
</template>
