<script setup lang="ts">
import {computed} from "vue";
import {useData} from "vitepress";
import {findLabel, labelColorClass, labelsDocType} from "../utils/writerside-labels";

const props = defineProps({
  id: {
    type: String,
    required: false
  },
  level: {
    type: Number,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  labelRef: {
    type: String,
    required: true
  }
})

const {page} = useData()

// The label of the page's doc type, from its labels.list (utils/writerside-labels.ts);
// colours in styles/ws-label.css. An id labels.list does not have shows as itself, in grey.
const label = computed(() => findLabel('primary', labelsDocType(page.value.relativePath), props.labelRef))
const labelText = computed(() => label.value?.name ?? props.labelRef)
const colorClass = computed(() => labelColorClass(label.value))

const levelClass = computed(() => props.level ? `ws-topic-title--h${props.level}` : '')
</script>

<template>
  <div class="ws-topic-title" :class="levelClass">
    <div v-if="labelRef" class="ws-topic-label" :class="colorClass">
      <div class="ws-topic-label-background"></div>
      <span class="ws-topic-label-text" :title="label?.description">{{ labelText }}</span>
    </div>
    <component
        :is="props.level ? 'h' + props.level : 'h1'"
        :id="props.id"
    >{{ props.title }}</component>
  </div>
</template>

<style scoped>
.ws-topic-title--h2 {
  margin-top: 48px;
}

.ws-topic-title--h3 {
  margin-top: 32px;
}

.ws-topic-title h1, .ws-topic-title h2, .ws-topic-title h3, .ws-topic-title h4, .ws-topic-title h5, .ws-topic-title h6{
  margin: auto;
  border-top: 0;
  padding-top: 0;
}

.ws-topic-label {
  position: relative;
  left: -24px;
  margin-bottom: 16px;
  width: 100%;
}

/* As on kotlinlang.org: the label's colour at 20%, fading out towards the bottom right */
.ws-topic-label-background {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 330px;
  border-radius: 4px;
  background-image: linear-gradient(155deg, color-mix(in srgb, var(--ws-label-color, #8e8e93) 20%, transparent), transparent 24%);
}

/* Values of .label__content on kotlinlang.org */
.ws-topic-label-text {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: default;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: #fff;
  background-color: var(--ws-label-color, #8e8e93);
}
</style>
