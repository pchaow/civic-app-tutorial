// App Version Configuration for Automated Cache Guardrails
export const APP_VERSION = 'v1.1.0';
const CURRENT_CACHE_VERSION_KEY = 'civicsolve_app_version';

/**
 * Version Guardrail Helper:
 * Checks if the user's browser has an outdated cache version.
 * If outdated or missing, automatically purges old LocalStorage keys and registers the new version.
 */
export const enforceVersionCacheGuardrail = () => {
  try {
    const storedVersion = localStorage.getItem(CURRENT_CACHE_VERSION_KEY);

    if (storedVersion !== APP_VERSION) {
      console.log(`[Cache Guardrail] Upgrading client cache from ${storedVersion || 'none'} -> ${APP_VERSION}`);

      // List of legacy cache keys to purge
      const keysToClear = [
        'civicsolve_complaints_v1',
        'civicsolve_registered_users',
        'civicsolve_fresh_setup_v2',
        'civicsolve_user'
      ];

      keysToClear.forEach(key => localStorage.removeItem(key));

      // Register current version tag
      localStorage.setItem(CURRENT_CACHE_VERSION_KEY, APP_VERSION);
    }
  } catch (error) {
    console.warn('[Cache Guardrail] Notice during cache cleanup:', error);
  }
};
