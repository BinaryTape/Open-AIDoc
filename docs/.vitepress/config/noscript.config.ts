import type { HeadConfig } from 'vitepress'

/**
 * aos.css hides every [data-aos] element (the home page cards) until AOS runs
 * in the browser and animates it in; without JavaScript it never runs, so show
 * them as they are (P3-26).
 */
export const NOSCRIPT_AOS: HeadConfig = [
  'noscript', {}, '<style>[data-aos]{opacity:1!important;transform:none!important}</style>'
]
