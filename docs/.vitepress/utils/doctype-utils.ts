import { DOCS_TYPES, DocsTypeConfig } from '../docs.config'

/**
 * Get document type from environment object
 * @param env - markdown-it environment object
 * @returns document type string or null
 */
export function getDocType(env: any): string | null {
    if (!env || !env.relativePath) {
        return null
    }

    const parts = env.relativePath.split('/')
    return parts.find(p => DOCS_TYPES.includes(p)) || null
}

/**
 * Check if current document is of specified type
 * @param env - markdown-it environment object
 * @param docType - document type to check
 * @returns whether it matches
 */
export function isDocType(env: any, docType: string): boolean {
    return getDocType(env) === docType
}

/**
 * Check if current document is Docusaurus type
 * @param env - markdown-it environment object
 * @returns whether it is Docusaurus type
 */
export function isDocusaurusDoc(env: any): boolean {
    return isDocType(env, 'koin')
}

/**
 * Check if current document is Writerside type
 * @param env - markdown-it environment object
 * @returns whether it is Writerside type
 */
export function isWritersideDoc(env: any): boolean {
    const docType = getDocType(env)
    return docType !== null && DocsTypeConfig[docType]?.framework === 'Writerside'
}

/**
 * Check if current document is MkDocs type
 * @param env - markdown-it environment object
 * @returns whether it is MkDocs type
 */
export function isMkDocsDoc(env: any): boolean {
    const docType = getDocType(env)
    return docType !== null && DocsTypeConfig[docType]?.framework === 'MKDocs'
}

/**
 * Check if current document is any type from the specified type array
 * @param env - markdown-it environment object
 * @param docTypes - array of document types
 * @returns whether it matches any type
 */
export function isAnyDocType(env: any, docTypes: string[]): boolean {
    const currentDocType = getDocType(env)
    return currentDocType !== null && docTypes.includes(currentDocType)
}
