/**
 * Default SyncStrategy for the docs pipeline.
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
