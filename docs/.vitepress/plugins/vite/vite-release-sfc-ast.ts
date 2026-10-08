// Vite plugin to keep @vitejs/plugin-vue from holding every page's template AST
import type { Plugin } from 'vite';
import * as defaultCompiler from 'vue/compiler-sfc';

type SfcCompiler = typeof defaultCompiler;

const WRAPPED = Symbol('release-sfc-ast');

/**
 * @vitejs/plugin-vue caches each SFC descriptor in a module-level Map for the
 * whole build, and the descriptor keeps its parsed template AST, which the
 * template compiler then decorates with codegen nodes. With ~4k Markdown pages
 * that retained ~6 GB of heap and pushed Cloudflare Pages (8 GB) into OOM.
 *
 * During builds we drop `descriptor.template.ast` for Markdown pages right after
 * parsing. compileTemplate then parses `template.content` itself and the AST is
 * garbage as soon as the page is compiled. The cached descriptor still has the
 * template/script/style content that later `?vue&type=...` requests need.
 *
 * Build only: in dev, `<script setup>` usage analysis reads `template.ast`.
 */
export default function releaseSfcAstPlugin(): Plugin {
  return {
    name: 'vite-plugin-release-sfc-ast',
    apply: 'build',
    configResolved(config) {
      const vue = config.plugins.find((p) => p.name === 'vite:vue');
      const api = vue?.api;
      if (!api?.options) {
        config.logger.warn('[release-sfc-ast] vite:vue not found; template ASTs stay cached.');
        return;
      }

      const compiler: SfcCompiler = api.options.compiler ?? defaultCompiler;
      if ((compiler as any)[WRAPPED]) return;

      api.options = {
        ...api.options,
        compiler: {
          ...compiler,
          [WRAPPED]: true,
          parse(source, options) {
            const result = compiler.parse(source, options);
            const template = result.descriptor.template;
            if (template && options?.filename?.endsWith('.md')) {
              template.ast = undefined;
            }
            return result;
          },
        } as SfcCompiler,
      };
    },
  };
}
