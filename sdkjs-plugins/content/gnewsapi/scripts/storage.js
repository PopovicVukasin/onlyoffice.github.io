/**
 * Storage Manager for GNews Plugin
 * Handles all localStorage operations for API key persistence
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "gnews-api-key";
  var StorageManager = {
    /**
     * Check if localStorage is available
     */
    isAvailable: function () {
      try {
        return "localStorage" in window && window.localStorage !== null;
      } catch (e) {
        console.error("localStorage not available:", e);
        return false;
      }
    },

    /**
     * Save API key to localStorage
     * @param {string} apiKey - The API key to save
     * @returns {boolean} - Success status
     */
    saveApiKey: function (apiKey) {
      if (!this.isAvailable()) {
        console.error("localStorage is not available");
        return false;
      }

      try {
        localStorage.setItem(STORAGE_KEY, apiKey);
        return true;
      } catch (error) {
        console.error("Failed to save API key to localStorage:", error);
        return false;
      }
    },

    /**
     * Load API key from localStorage
     * @returns {string} - The stored API key or empty string
     */
    loadApiKey: function () {
      if (!this.isAvailable()) {
        return "";
      }

      try {
        return localStorage.getItem(STORAGE_KEY) || "";
      } catch (error) {
        console.error("Failed to load API key from localStorage:", error);
        return "";
      }
    },

    /**
     * Remove API key from localStorage
     * @returns {boolean} - Success status
     */
    removeApiKey: function () {
      if (!this.isAvailable()) {
        return false;
      }

      try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (error) {
        console.error("Failed to remove API key from localStorage:", error);
        return false;
      }
    },
  };

  window.GNewsStorage = StorageManager;
})(window);
