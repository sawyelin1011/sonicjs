/**
 * Version utility
 *
 * Provides the current version of @cf-cms/core package
 */

import pkg from '../../package.json'

export const SONICJS_VERSION = pkg.version
export const CF_CMS_VERSION = pkg.version

/**
 * Get the current CF CMS core version
 */
export function getCoreVersion(): string {
  return CF_CMS_VERSION
}

/**
 * Get version information
 */
export function getVersionInfo() {
  return {
    version: CF_CMS_VERSION,
    name: '@cf-cms/core',
    type: 'production'
  }
}
