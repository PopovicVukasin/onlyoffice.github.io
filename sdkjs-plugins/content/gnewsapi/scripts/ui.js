/**
 * UI Manager for GNews Plugin
 * Handles all UI state management and DOM manipulation
 */

(function (window) {
  "use strict";

  var UIManager = {
    currentArticles: [],
    currentTab: "search",

    /**
     * Helper function to get element by ID
     */
    $: function (id) {
      return document.getElementById(id);
    },
    setElementState: function (id, disabled, text) {
      const el = this.$(id);
      if (el) {
        if (disabled !== undefined) el.disabled = disabled;
        if (text !== undefined) el.textContent = text;
      }
    },

    /**
     * Show status message
     */
    showStatus: function (message, isError) {
      const status = this.$("status");
      if (!status) return;

      status.textContent = message;
      status.className = isError ? "error" : "success";
      
      setTimeout(function () {
        status.textContent = "";
        status.className = "";
      }, 4000);
    },

    /**
     * Show API setup screen
     */
    showApiSetup: function () {
      this.$("api-setup").style.display = "block";
      this.$("search-interface").style.display = "none";
    },

    /**
     * Show search interface
     */
    showSearchInterface: function () {
      this.$("api-setup").style.display = "none";
      this.$("search-interface").style.display = "block";
    },

    /**
     * Show search form
     */
    showSearchForm: function () {
      const searchForm = document.querySelector(".search-form-container");
      const resultsSection = this.$("results-section");

      if (searchForm) searchForm.style.display = "block";
      if (resultsSection) resultsSection.style.display = "none";
    },

    /**
     * Show search results
     */
    showSearchResults: function () {
      const searchForm = document.querySelector(".search-form-container");
      const resultsSection = this.$("results-section");

      if (searchForm) searchForm.style.display = "none";
      if (resultsSection) resultsSection.style.display = "block";
    },

    /**
     * Switch between tabs
     */
    switchTab: function (tabName) {
      this.currentTab = tabName;

      const searchTab = this.$("search-tab");
      const headlinesTab = this.$("headlines-tab");
      const searchContent = this.$("search-content");
      const headlinesContent = this.$("headlines-content");

      if (tabName === "search") {
        searchTab.classList.add("active");
        headlinesTab.classList.remove("active");
        searchContent.style.display = "block";
        headlinesContent.style.display = "none";
      } else {
        searchTab.classList.remove("active");
        headlinesTab.classList.add("active");
        searchContent.style.display = "none";
        headlinesContent.style.display = "block";
      }

      const advancedBtn = this.$("advanced-settings-btn");
      if (advancedBtn && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
        advancedBtn.textContent = window.Asc.plugin.tr("Show advanced settings");
      }

      const searchAdvanced = this.$("search-advanced-settings");
      const headlinesAdvanced = this.$("headlines-advanced-settings");
      if (searchAdvanced) searchAdvanced.style.display = "none";
      if (headlinesAdvanced) headlinesAdvanced.style.display = "none";

      this.showSearchForm();
      this.currentArticles = [];
    },

    /**
     * Toggle advanced settings visibility
     */
    toggleAdvancedSettings: function () {
      const advancedSection = this.$(this.currentTab + "-advanced-settings");
      const advancedBtn = this.$("advanced-settings-btn");

      if (advancedSection && advancedBtn && window.Asc && window.Asc.plugin && window.Asc.plugin.tr) {
        if (advancedSection.style.display === "none") {
          advancedSection.style.display = "block";
          advancedBtn.textContent = window.Asc.plugin.tr("Hide advanced settings");
        } else {
          advancedSection.style.display = "none";
          advancedBtn.textContent = window.Asc.plugin.tr("Show advanced settings");
        }
      }
    },

    /**
     * Get display options from checkboxes
     */
    getDisplayOptions: function () {
      if (this.currentTab === "headlines") {
        return { title: true, description: true, content: false };
      }

      const showTitle = this.$("show-title").checked;
      const showDescription = this.$("show-description").checked;
      const showContent = this.$("show-content").checked;

      if (!showTitle && !showDescription && !showContent) {
        return { title: true, description: true, content: false };
      }

      return {
        title: showTitle,
        description: showDescription,
        content: showContent,
      };
    },

    /**
     * Get advanced settings for a tab
     */
    getAdvancedSettings: function (tabPrefix) {
      const sortElement = this.$(tabPrefix + "-sortby");
      const langElement = this.$(tabPrefix + "-lang");

      return {
        sortBy: sortElement ? sortElement.value || "publishedAt" : "publishedAt",
        language: langElement ? langElement.value || "en" : "en",
      };
    },

    /**
     * Create advanced settings HTML
     */
    createAdvancedSettings: function () {
      const advancedHTML = `
        <div class="form-group">
          <label for="PREFIX-sortby">${
            window.Asc.plugin.tr ? window.Asc.plugin.tr("Sort by") : "Sort by:"
          }</label>
          <select id="PREFIX-sortby">
            <option value="publishedAt">${
              window.Asc.plugin.tr
                ? window.Asc.plugin.tr("Publication Date")
                : "Publication Date (newest first)"
            }</option>
            <option value="relevance">${
              window.Asc.plugin.tr
                ? window.Asc.plugin.tr("Relevance")
                : "Relevance (best match first)"
            }</option>
          </select>
        </div>
        <div class="form-group">
          <label for="PREFIX-lang">${
            window.Asc.plugin.tr ? window.Asc.plugin.tr("Language") : "Language:"
          }</label>
          <select id="PREFIX-lang">
            <option value="en">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("English") : "English"
            }</option>
            <option value="es">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Spanish") : "Spanish"
            }</option>
            <option value="fr">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("French") : "French"
            }</option>
            <option value="de">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("German") : "German"
            }</option>
            <option value="it">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Italian") : "Italian"
            }</option>
            <option value="pt">${
              window.Asc.plugin.tr
                ? window.Asc.plugin.tr("Portuguese")
                : "Portuguese"
            }</option>
            <option value="ja">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Japanese") : "Japanese"
            }</option>
            <option value="zh">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Chinese") : "Chinese"
            }</option>
            <option value="ar">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Arabic") : "Arabic"
            }</option>
            <option value="ru">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Russian") : "Russian"
            }</option>
            <option value="hi">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Hindi") : "Hindi"
            }</option>
            <option value="ko">${
              window.Asc.plugin.tr ? window.Asc.plugin.tr("Korean") : "Korean"
            }</option>
          </select>
        </div>
      `;

      var self = this;
      ["search", "headlines"].forEach(function (prefix) {
        const optionsEl = self.$(prefix + "-advanced-options");
        if (optionsEl) {
          optionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, prefix);
        }
      });
    },

    /**
     * Initialize display options checkboxes
     */
    initializeDisplayOptions: function () {
      const checkboxes = ["show-title", "show-description", "show-content"];
      var self = this;
      checkboxes.forEach(function (id, index) {
        const el = self.$(id);
        if (el) el.checked = index < 2;
      });
    },

    /**
     * Display search results
     */
    displaySearchResults: function (articles, showStatusMessage) {
      this.currentArticles = articles;
      const resultsList = this.$("articles-list");
      
      if (!resultsList) return;

      if (articles.length === 0) {
        resultsList.innerHTML =
          '<div class="no-results">' +
          (window.Asc.plugin.tr
            ? window.Asc.plugin.tr("No articles found")
            : "No articles found. Try a different search query.") +
          "</div>";
        this.showSearchResults();
        if (showStatusMessage) {
          this.showStatus("No articles found", true);
        }
        return;
      }

      const displayOptions = this.getDisplayOptions();
      this.updateResultsHeader(articles.length, displayOptions);

      let html = "";
      articles.forEach(function (article, index) {
        html += '<div class="article-item">';
        html += '<div class="article-content">';
        html += '<h3 class="article-title">' + UIManager.escapeHtml(article.title) + "</h3>";
        html +=
          '<p class="article-source">' +
          UIManager.escapeHtml(article.source.name) +
          " • " +
          new Date(article.publishedAt).toLocaleDateString() +
          "</p>";
        if (article.description) {
          html +=
            '<p class="article-description">' +
            UIManager.escapeHtml(article.description) +
            "</p>";
        }
        html += "</div>";
        html +=
          '<button class="btn-open" onclick="insertSingleArticle(' +
          index +
          ')">' +
          (window.Asc.plugin.tr ? window.Asc.plugin.tr("Open") : "Open") +
          "</button>";
        html += "</div>";
      });

      resultsList.innerHTML = html;
      this.showSearchResults();

      if (showStatusMessage) {
        this.showStatus("Found " + articles.length + " articles", false);
      }
    },

    /**
     * Update results header
     */
    updateResultsHeader: function (count, displayOptions) {
      const resultsHeader = document.querySelector(".results-header");
      if (!resultsHeader) return;

      if (count === 0) {
        resultsHeader.textContent = "";
        return;
      }

      const searchFields = [];
      if (displayOptions.title) {
        searchFields.push(
          window.Asc.plugin.tr ? window.Asc.plugin.tr("title") : "title"
        );
      }
      if (displayOptions.description) {
        searchFields.push(
          window.Asc.plugin.tr
            ? window.Asc.plugin.tr("description")
            : "description"
        );
      }
      if (displayOptions.content) {
        searchFields.push(
          window.Asc.plugin.tr ? window.Asc.plugin.tr("content") : "content"
        );
      }

      const allFieldsText = window.Asc.plugin.tr
        ? window.Asc.plugin.tr("all fields")
        : "all fields";
      const searchFieldsText =
        searchFields.length === 0 ? allFieldsText : searchFields.join(", ");
      const successText = window.Asc.plugin.tr
        ? window.Asc.plugin.tr("Success! {0} results were found by {1}")
        : "Success! {0} results were found by {1}";
      const headerText = successText
        .replace("{0}", count)
        .replace("{1}", searchFieldsText);

      resultsHeader.textContent = headerText;
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml: function (text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Open article link in browser
     */
    openArticleLink: function (article) {
      console.log("openArticleLink called for:", article.title);

      if (!article.url) {
        this.showStatus("Article URL not available", true);
        return;
      }

      try {
        window.open(article.url, "_blank");
        console.log("Opened article in new tab:", article.url);
      } catch (error) {
        console.error("Failed to open article:", error);
        this.showStatus("Failed to open article", true);
      }
    },

    /**
     * Clear results and go back to search
     */
    goBackToSearch: function () {
      this.showSearchForm();
      this.currentArticles = [];
      const status = this.$("status");
      if (status) {
        status.textContent = "";
        status.className = "";
      }
    },
  };

  window.GNewsUI = UIManager;
})(window);
