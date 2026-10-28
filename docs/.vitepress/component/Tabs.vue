<script setup>
import { useSlots, ref, computed, useId } from 'vue';

// Writerside links the tab sets of a group (`<tabs group="build-script">`):
// choosing a tab chooses the tab with the same `group-key` in every set of the
// group. The page carries both, for theme/linked-tabs.ts.
const props = defineProps({ group: { type: String, required: false } });

const slots = useSlots();

const groupKey = (tab) => tab.props?.['group-key'] ?? tab.props?.groupKey;

const tabs = computed(() => {
  return slots.default ? slots.default().filter(child => child.type && child.props) : [];
});

const activeIndex = ref(0);

// Same on the server and in the browser, so hydration matches.
const groupName = `group-${useId()}`;

const isTab = tabs.props?.id;

</script>

<template>
  <div :class="isTab ? 'vp-code-group' : 'ws-tabs-container'" :data-group="props.group || undefined">
    <div :class="isTab ? 'tabs' : 'ws-tablist'">
      <template v-for="(tab, index) in tabs" :key="index">
        <input
            type="radio"
            :name="groupName"
            :id="`${groupName}-${index}`"
            :checked="index === activeIndex"
            @change="activeIndex = index"
        >
        <label
            :class="isTab ? '' : 'ws-tab'"
            :data-title="tab.props?.title"
            :data-key="groupKey(tab)"
            :for="`${groupName}-${index}`"
            @click="activeIndex = index"
        >
          {{ tab.props?.title }}
        </label>
      </template>
    </div>

    <div :class="isTab ? 'blocks' : 'ws-tabcontents'">
      <template v-for="(tab, index) in tabs" :key="index">
        <div v-if="!isTab" class="ws-tabcontent" :class="[{ active: index === activeIndex }]">
          <component :is="tab"/>
        </div>
        <component v-if="isTab" :is="tab" :class="[{ active: index === activeIndex }]"/>
      </template>
    </div>
  </div>
</template>
