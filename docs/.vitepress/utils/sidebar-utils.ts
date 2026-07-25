import { DocsTypeConfig, DOCS_TYPES } from '../docs.config';
import { SiteLocaleConfig } from '../locales.config';
import generateSidebar from '../config/sidebar.config';
import { splitLocalePath } from '../../../shared/content-paths';

/**
 * 根据相对路径获取侧栏标题
 * @param relativePath 文档的相对路径
 * @returns 侧栏标题或undefined
 */
export function getSidebarTitle(relativePath: string): string | undefined {
  if (!relativePath) return undefined;

  const { locale, contentPath } = splitLocalePath(relativePath);
  const pathWithoutExt = contentPath.replace(/\.md$/, '');
  const parts = pathWithoutExt.split('/').filter(Boolean);

  const section = parts[0];
  if (!section || !DOCS_TYPES.includes(section)) return undefined;

  const docType = DocsTypeConfig[section];
  if (!docType) return undefined;

  const localeConfig = SiteLocaleConfig[locale];
  if (!localeConfig) return undefined;

  const sidebarConfig = generateSidebar(localeConfig, docType);
  const rest = parts.slice(1).join('/');
  return findTitleInSidebar(sidebarConfig, rest);
}

/**
 * 在侧栏配置中递归查找标题
 * @param items 侧栏项目
 * @param path 查找路径
 * @returns 找到的标题或undefined
 */
function findTitleInSidebar(items: any[], path: string): string | undefined {
  if (!items || !Array.isArray(items)) return undefined;

  for (const item of items) {
    // 直接匹配当前项
    if (item.link && item.link.endsWith(path)) {
      return item.text;
    }

    // 检查子项
    if (item.items && Array.isArray(item.items)) {
      const foundInChild = findTitleInSidebar(item.items, path);
      if (foundInChild) return foundInChild;
    }
  }

  return undefined;
}
