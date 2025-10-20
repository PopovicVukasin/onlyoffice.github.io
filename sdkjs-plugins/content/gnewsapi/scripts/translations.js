/**
 * Translation Manager for GNews Plugin
 * Handles all UI translations
 */

(function (window) {
  "use strict";

  var TranslationManager = {
    $: function (id) {
      return document.getElementById(id);
    },

    translateElement: function (elementId, key) {
      const element = this.$(elementId);
      if (element && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
        element.textContent = window.Asc.plugin.tr(key);
      }
    },

    translatePlaceholder: function (elementId, key) {
      const element = this.$(elementId);
      if (element && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
        element.placeholder = window.Asc.plugin.tr(key);
      }
    },

    /**
     * Apply all translations to the UI
     */
    applyTranslations: function () {
      // Main interface elements
      this.translateElement("description-text", "Search through millions of articles");
      this.translateElement("description-text-2", "Search through millions of articles");
      this.translateElement("api-key-label", "API key");
      this.translatePlaceholder("api-key-setup", "Enter your GNews API key");
      this.translateElement("get-api-key-text", "Get your free API key");

      // Check button text before translating
      const saveApiBtn = this.$("save-api-btn");
      if (saveApiBtn && saveApiBtn.textContent.trim() === "Login") {
        this.translateElement("save-api-btn", "Login");
      }

      // Tab labels
      this.translateElement("search-tab-text", "Search");
      this.translateElement("headlines-tab-text", "Top Headlines");

      // Form labels
      this.translateElement("search-prompt-label", "Prompt");
      this.translateElement("headlines-prompt-label", "Prompt");
      this.translatePlaceholder("search-query", "Search with keywords");
      this.translatePlaceholder("headlines-query", "Search with keywords");
      this.translateElement("search-in-label", "Search in");
      this.translateElement("title-label", "Title");
      this.translateElement("description-label", "Description");
      this.translateElement("content-label", "Content");
      this.translateElement("advanced-settings-label", "Advanced Settings");
      this.translateElement("headlines-advanced-settings-label", "Advanced Settings");

      // Buttons
      const searchBtn = this.$("search-btn");
      if (searchBtn && searchBtn.textContent.trim() === "Find") {
        this.translateElement("search-btn", "Find");
      }

      const headlinesBtn = this.$("headlines-btn");
      if (headlinesBtn && headlinesBtn.textContent.trim() === "Find") {
        this.translateElement("headlines-btn", "Find");
      }

      this.translateElement("advanced-settings-btn", "Show advanced settings");
      this.translateElement("reconfigure-btn", "Reconfigure");
      this.translateElement("back-to-search-btn", "Back to search");

      // Category and country options
      this.translateElement("category-label", "Category");
      this.translateElement("country-label", "Country");

      // Select options
      this.translateSelectOptions();
      this.translateAdvancedSettings();
    },

    /**
     * Translate select dropdown options
     */
    translateSelectOptions: function () {
      const options = [
        { id: "all-categories-option", key: "All Categories" },
        { id: "general-option", key: "General" },
        { id: "business-option", key: "Business" },
        { id: "entertainment-option", key: "Entertainment" },
        { id: "health-option", key: "Health" },
        { id: "science-option", key: "Science" },
        { id: "sports-option", key: "Sports" },
        { id: "technology-option", key: "Technology" },
        { id: "us-option", key: "United States" },
        { id: "gb-option", key: "United Kingdom" },
        { id: "ca-option", key: "Canada" },
        { id: "au-option", key: "Australia" },
        { id: "de-option", key: "Germany" },
        { id: "fr-option", key: "France" },
        { id: "jp-option", key: "Japan" },
        { id: "in-option", key: "India" },
      ];

      var self = this;
      options.forEach(function (option) {
        const element = self.$(option.id);
        if (element && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
          element.textContent = window.Asc.plugin.tr(option.key);
        }
      });
    },

    /**
     * Translate advanced settings options
     */
    translateAdvancedSettings: function () {
      var self = this;
      ["search", "headlines"].forEach(function (prefix) {
        const sortBySelect = self.$(prefix + "-sortby");
        if (sortBySelect && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
          const options = sortBySelect.querySelectorAll("option");
          if (options[0]) {
            options[0].textContent = window.Asc.plugin.tr("Publication Date");
          }
          if (options[1]) {
            options[1].textContent = window.Asc.plugin.tr("Relevance");
          }
        }

        const langSelect = self.$(prefix + "-lang");
        if (langSelect && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
          const langOptions = langSelect.querySelectorAll("option");
          const langKeys = [
            "English",
            "Spanish",
            "French",
            "German",
            "Italian",
            "Portuguese",
            "Japanese",
            "Chinese",
            "Arabic",
            "Russian",
            "Hindi",
            "Korean",
          ];
          langOptions.forEach(function (option, index) {
            if (langKeys[index]) {
              option.textContent = window.Asc.plugin.tr(langKeys[index]);
            }
          });
        }
      });
    },
  };

  window.GNewsTranslations = TranslationManager;
})(window);
