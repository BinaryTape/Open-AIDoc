/**
 * Default SyncStrategy for the docs pipeline (tools/pipeline/sync-strategies/).
 *
 * SyncStrategy runs during sync/detect/translate (CI or local pipeline).
 * It is not used at site-build time — link rewriting lives under
 * docs/.vitepress/link-rewrites/ (LinkRewrite).
 */
export const defaultStrategy = {
  /**
   * Gets the glob patterns for the document files to be processed.
   * @returns {string[]}
   */
  getDocPatterns: () => ["docs/**/*.md"],

  /**
   * Where a document file matched by getDocPatterns is translated from once
   * postDetect has prepared the clone (flattened, converted from .topic,
   * copied into docs/...), or null when it is not a page. postDetect maps the
   * changed files with it, and the page inventory of a sync is built with it.
   * Must be idempotent: a prepared path maps to itself.
   * @param {string} file - Path in the clone, POSIX separators
   * @returns {string | null}
   */
  mapDocPath: (file) => file,

  /**
   * Pages upstream declares as moved, read from the clone: old page → new
   * page, both relative to sourceDocRoot. A page removed upstream is
   * redirected to its new page when there is one.
   * @param {string} repoPath - Path to the cloned repository
   * @returns {Promise<Map<string, string>>}
   */
  getMovedPages: async (repoPath) => new Map(),

  /**
   * On Sync finished.
   * @param {string} repoPath - Path to the cloned repository
   */
  postSync: async (repoPath) => {},

  /**
   * On Detect finished.
   * @param {object} repoConfig 
   * @param {object} task 
   */
  postDetect: async (repoConfig, task) => {},

  /**
   * On Translate finished.
   * @param {object} context - Stage context
   * @param {object} repoConfig - Configuration of the current repository
   */
  postTranslate: async (context, repoConfig) => {},
};
