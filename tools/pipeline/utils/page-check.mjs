/**
 * Would a page build? Checked before a translation is written.
 *
 * One page the site cannot compile stops the whole site from building (in
 * September 2026 one did, for three weeks), and the sync pushes straight to
 * main. So every translation is put through what VitePress does with a page
 * (createMarkdownToVueRenderFn): rendered with the site's own Markdown
 * configuration, wrapped as `<template><div>…</div></template>` and compiled
 * by Vue, and its internal links checked like VitePress's dead-link check,
 * which also fails the build.
 */
import fs from "node:fs";
import path from "node:path";

const CONFIG_FILES = ["config.mts", "config.ts", "config.mjs", "config.js"];

// VitePress's treatAsHtml: a link to a file with one of these extensions is
// not a page (vitepress/dist/node, KNOWN_EXTENSIONS).
const ASSET_EXTENSIONS = new Set(
  ("3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe," +
    "jpeg,jpg,js,json,jsonld,m4a,man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,p10," +
    "p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff," +
    "woff2,xhtml,xml,yaml,yml,zip").split(",")
);
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;

const treatAsHtml = (pathname) => {
  const ext = pathname.split(".").pop();
  return ext == null || !ASSET_EXTENSIONS.has(ext.toLowerCase());
};

/**
 * The dead internal links of a rendered page, by VitePress's rules.
 * @param {string[]} links - `env.links` after rendering
 * @param {string} relativePath - The page, relative to the docs root
 * @param {Set<string>} pages - Pages of the site, relative and without .md
 * @param {*} ignoreDeadLinks - The site's `ignoreDeadLinks` setting
 */
export function deadLinks(links, relativePath, pages, ignoreDeadLinks) {
  if (ignoreDeadLinks === true) return [];
  const ignored = (url) => {
    if (!ignoreDeadLinks) return false;
    if (ignoreDeadLinks === "localhostLinks") return url.replace(EXTERNAL_URL_RE, "").startsWith("//localhost");
    return ignoreDeadLinks.some((rule) =>
      typeof rule === "string" ? url === rule
        : rule instanceof RegExp ? rule.test(url)
          : typeof rule === "function" ? rule(url, relativePath) : false
    );
  };

  const dead = [];
  for (const raw of links) {
    const { pathname } = new URL(raw, "http://a.com");
    if (!treatAsHtml(pathname)) continue;
    let url = raw.replace(/[?#].*$/, "").replace(/\.(html|md)$/, "");
    if (url.endsWith("/")) url += "index";
    let target = url.startsWith("/") ? url.slice(1) : path.posix.join(path.posix.dirname(relativePath), url);
    try {
      target = decodeURIComponent(target);
    } catch {
      // keep it encoded
    }
    if (!pages.has(target) && !ignored(url)) dead.push(raw);
  }
  return dead;
}

/**
 * Load the site's configuration and return a function checking whether a
 * page builds, or null when there is no VitePress site in `root`.
 * @param {string} [root] - The VitePress source directory
 * @returns {Promise<null | ((relativePath: string, content: string) => Promise<string[]>) & {addPages: (relativePaths: string[]) => void}>}
 *   The check returns the problems found, empty when the page builds.
 */
export async function loadPageCheck(root = "docs") {
  if (!CONFIG_FILES.some((file) => fs.existsSync(path.join(root, ".vitepress", file)))) return null;

  const { createMarkdownRenderer, resolveConfig } = await import("vitepress");
  const { compileTemplate, parse } = await import("vue/compiler-sfc");
  const config = await resolveConfig(root, "build", "production");
  // Shiki warns about every unknown code language; the build itself shows those.
  const quiet = { ...config.logger, info() {}, warn() {}, warnOnce() {} };
  const md = await createMarkdownRenderer(config.srcDir, config.markdown, config.site.base, quiet);
  const pages = new Set(config.pages.map((page) => page.replace(/\.md$/, "")));

  const check = async (relativePath, content) => {
    const absolute = path.join(config.srcDir, relativePath);
    const env = { path: absolute, relativePath, cleanUrls: config.cleanUrls, includes: [], realPath: absolute };
    let html;
    try {
      html = await md.renderAsync(content, env);
    } catch (error) {
      return [`render: ${error.message}`];
    }

    const scripts = (env.sfcBlocks?.scripts ?? []).map((block) => block.content).join("\n");
    const sfc = `${scripts}\n<template><div>${html}</div></template>`;
    const { descriptor, errors: parseErrors } = parse(sfc, { filename: relativePath });
    const problems = parseErrors.map((error) => `Vue: ${error.message}`);
    if (problems.length === 0 && descriptor.template) {
      const { errors } = compileTemplate({ source: descriptor.template.content, filename: relativePath, id: "page-check" });
      problems.push(...errors.map((error) => `Vue: ${typeof error === "string" ? error : error.message}`));
    }
    problems.push(...deadLinks(env.links ?? [], relativePath, pages, config.ignoreDeadLinks).map((url) => `dead link ${url}`));
    return problems;
  };

  /** Pages this run is about to write, which links may point at already. */
  check.addPages = (relativePaths) => {
    relativePaths.forEach((page) => pages.add(page.replaceAll("\\", "/").replace(/\.md$/, "")));
  };
  return check;
}
