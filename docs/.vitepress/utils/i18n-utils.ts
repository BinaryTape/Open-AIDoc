import { ref, computed, reactive } from 'vue'
import { SiteLocaleConfig, SITE_LOCALES } from '../locales.config'
import { DEFAULT_LOCALE } from '../../../shared/locales'

// Create a reactive state for the current locale
const currentLocale = ref(DEFAULT_LOCALE)

// Create a computed property for the current messages
const messages = computed(() => {
  return SiteLocaleConfig[currentLocale.value]?.messages || {}
})

// Translation function
function t(key: string): string {
  return messages.value[key] || key
}

// Function to set the locale
function setLocale(locale: string): void {
  if (SITE_LOCALES.includes(locale)) {
    currentLocale.value = locale
  }
}

// Function to get the current locale
function getLocale(): string {
  return currentLocale.value
}

// Create a simple i18n plugin
export function createI18n() {
  return {
    install: (app: any) => {
      // Add global properties
      app.config.globalProperties.$t = t
      app.config.globalProperties.$i18n = {
        locale: currentLocale,
        setLocale,
        getLocale
      }
      
      // Provide the i18n functions to components
      app.provide('i18n', {
        t,
        locale: currentLocale,
        setLocale,
        getLocale
      })
    }
  }
}

// Export individual functions for composition API usage
export { t, currentLocale, setLocale, getLocale }