/**
 * MÓDULO CORE: Adaptador de Persistência (Repository Pattern)
 * Isola o LocalStorage/IndexedDB ou futura API em nuvem (Supabase/PostgreSQL).
 * Qualquer alteração futura de banco de dados ocorre APENAS neste arquivo.
 */

const STORAGE_PREFIX = 'consultoria_integrada_v1_';

export const storageAdapter = {
  load(key, fallbackValue) {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return fallbackValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`Erro ao carregar chave [${key}] do storage:`, err);
      return fallbackValue;
    }
  },

  save(key, value) {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`Erro ao salvar chave [${key}] no storage:`, err);
      return false;
    }
  },

  resetAll() {
    try {
      Object.keys(window.localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          window.localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.warn('Erro ao limpar storage:', err);
    }
  },
};
