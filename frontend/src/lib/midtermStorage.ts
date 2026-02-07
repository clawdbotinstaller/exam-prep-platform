/**
 * LocalStorage utilities for saving/loading custom midterm configurations
 */

import type { MidtermWeightingConfig, SavedMidtermConfig } from '../types/midterm';

const STORAGE_KEY = 'epp_midterm_configs';

/**
 * Save a custom configuration to localStorage
 */
export function saveCustomConfig(config: MidtermWeightingConfig): SavedMidtermConfig {
  const configs = loadCustomConfigs();
  const savedConfig: SavedMidtermConfig = {
    ...config,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  configs.push(savedConfig);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  return savedConfig;
}

/**
 * Load all custom configurations from localStorage
 */
export function loadCustomConfigs(): SavedMidtermConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a saved configuration by ID
 */
export function deleteCustomConfig(id: string): void {
  const configs = loadCustomConfigs().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Update an existing saved configuration
 */
export function updateCustomConfig(id: string, updates: Partial<MidtermWeightingConfig>): void {
  const configs = loadCustomConfigs();
  const index = configs.findIndex(c => c.id === id);
  if (index !== -1) {
    configs[index] = { ...configs[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  }
}

/**
 * Clear all saved configurations
 */
export function clearAllConfigs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
