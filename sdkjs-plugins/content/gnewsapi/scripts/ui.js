/**
 * UI Manager for News Plugin
 * Handles all UI state management and DOM manipulation
 */

(function (window) {
  "use strict";

  var UIManager = {
    currentArticles: [],
    currentTab: "search",
    currentProvider: "gnews",

    /**
     * Helper function to get element by ID
     */
    $: function (id) {
      return document.getElementById(id);
    },

    /**
     * Set element state (disabled/enabled and text)
     */
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
     * Update provider information in UI
     */
    updateProviderInfo: function (providerId) {
      if (providerId) {
        this.currentProvider = providerId;
      }
      
      var provider = window.NewsProviders.getCurrentProvider();
      
      // Update API key link
      var apiKeyLink = this.$("provider-website-link");
      if (apiKeyLink && provider) {
        apiKeyLink.href = provider.website;
        apiKeyLink.textContent = provider.website.replace("https://", "").replace("www.", "");
      }
      
      // Update placeholder
      var apiKeyInput = this.$("api-key-setup");
      if (apiKeyInput && provider) {
        apiKeyInput.placeholder = "Enter your " + provider.name + " API key";
      }
      
      // Recreate advanced settings with provider-specific options
      this.createAdvancedSettings();
    },

    /**
     * Create provider selector HTML
     */
    createProviderSelector: function () {
      var providers = window.NewsProviders.getProviders();
      var html = '<div class="form-group"><label for="provider-select" id="provider-label">News Provider:</label><select id="provider-select" onchange="changeProvider()">';
      
      providers.forEach(function (provider) {
        html += '<option value="' + provider.id + '">' + provider.name + '</option>';
      });
      
      html += '</select></div>';
      return html;
    },

    /**
     * Initialize provider selector
     */
    initializeProviderSelector: function (selectedProvider) {
      var providerSelect = this.$("provider-select");
      if (providerSelect && selectedProvider) {
        providerSelect.value = selectedProvider;
        this.currentProvider = selectedProvider;
        
        // Update UI for the selected provider
        window.NewsProviders.setProvider(selectedProvider);
        this.updateProviderInfo(selectedProvider);
      }
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
      const domainsElement = this.$(tabPrefix + "-domains");
      const excludeDomainsElement = this.$(tabPrefix + "-exclude-domains");
      const searchFieldsElement = this.$(tabPrefix + "-search-fields");

      var settings = {
        sortBy: sortElement ? sortElement.value || "publishedAt" : "publishedAt",
        language: langElement ? langElement.value || "en" : "en",
      };
      
      // Add provider-specific settings
      if (domainsElement && domainsElement.value) {
        settings.domains = domainsElement.value;
      }
      
      if (excludeDomainsElement && excludeDomainsElement.value) {
        settings.exclude_domains = excludeDomainsElement.value;
      }
      
      if (searchFieldsElement && searchFieldsElement.value) {
        settings.search_fields = searchFieldsElement.value;
      }
      
      return settings;
    },

    /**
     * Get provider-specific advanced settings configuration
     */
    getProviderAdvancedConfig: function (providerId) {
      if (providerId === "gnews") {
        return {
          supportsDomains: false,
          supportsSearchIn: true,
          supportsLocale: false,
          supportsSearchFields: false,
          supportsExcludeDomains: false,
          supportsCategories: false,
          supportsExcludeCategories: false,
          sortOptions: [
            { value: "publishedAt", label: "Publication Date" },
            { value: "relevance", label: "Relevance" }
          ]
        };
      } else if (providerId === "thenewsapi") {
        return {
          supportsDomains: true,
          supportsSearchIn: false,
          supportsLocale: false,
          supportsSearchFields: true,
          supportsExcludeDomains: true,
          supportsCategories: true,
          supportsExcludeCategories: true,
          sortOptions: [
            { value: "published_at", label: "Publication Date" },
            { value: "relevance_score", label: "Relevance" }
          ]
        };
      }
      // Default configuration
      return {
        supportsDomains: false,
        supportsSearchIn: true,
        supportsLocale: false,
        supportsSearchFields: false,
        supportsExcludeDomains: false,
        supportsCategories: false,
        supportsExcludeCategories: false,
        sortOptions: [
          { value: "publishedAt", label: "Publication Date" },
          { value: "relevance", label: "Relevance" }
        ]
      };
    },

    /**
     * Create advanced settings HTML based on provider
     */
    createAdvancedSettings: function () {
      var config = this.getProviderAdvancedConfig(this.currentProvider);
      var tr = window.Asc && window.Asc.plugin && window.Asc.plugin.tr ? window.Asc.plugin.tr : function(s) { return s; };
      
      var advancedHTML = "";
      
      // Sort by dropdown (common to all providers)
      advancedHTML += '<div class="form-group">';
      advancedHTML += '<label for="PREFIX-sortby">' + tr("Sort by") + ':</label>';
      advancedHTML += '<select id="PREFIX-sortby">';
      config.sortOptions.forEach(function(opt) {
        advancedHTML += '<option value="' + opt.value + '">' + tr(opt.label) + '</option>';
      });
      advancedHTML += '</select>';
      advancedHTML += '</div>';
      
      // Language dropdown (common to all providers)
      advancedHTML += '<div class="form-group">';
      advancedHTML += '<label for="PREFIX-lang">' + tr("Language") + ':</label>';
      advancedHTML += '<select id="PREFIX-lang">';
      advancedHTML += '<option value="en">' + tr("English") + '</option>';
      advancedHTML += '<option value="es">' + tr("Spanish") + '</option>';
      advancedHTML += '<option value="fr">' + tr("French") + '</option>';
      advancedHTML += '<option value="de">' + tr("German") + '</option>';
      advancedHTML += '<option value="it">' + tr("Italian") + '</option>';
      advancedHTML += '<option value="pt">' + tr("Portuguese") + '</option>';
      advancedHTML += '<option value="ja">' + tr("Japanese") + '</option>';
      advancedHTML += '<option value="zh">' + tr("Chinese") + '</option>';
      advancedHTML += '<option value="ar">' + tr("Arabic") + '</option>';
      advancedHTML += '<option value="ru">' + tr("Russian") + '</option>';
      advancedHTML += '<option value="hi">' + tr("Hindi") + '</option>';
      advancedHTML += '<option value="ko">' + tr("Korean") + '</option>';
      advancedHTML += '</select>';
      advancedHTML += '</div>';
      
      // Provider-specific: Domains (TheNewsAPI)
      if (config.supportsDomains) {
        advancedHTML += '<div class="form-group">';
        advancedHTML += '<label for="PREFIX-domains">' + tr("Domains") + ':</label>';
        advancedHTML += '<input type="text" id="PREFIX-domains" placeholder="' + tr("e.g., bbc.co.uk, cnn.com") + '" />';
        advancedHTML += '<div class="help-text">' + tr("Comma-separated list of domains to include") + '</div>';
        advancedHTML += '</div>';
      }
      
      // Provider-specific: Exclude Domains (TheNewsAPI)
      if (config.supportsExcludeDomains) {
        advancedHTML += '<div class="form-group">';
        advancedHTML += '<label for="PREFIX-exclude-domains">' + tr("Exclude Domains") + ':</label>';
        advancedHTML += '<input type="text" id="PREFIX-exclude-domains" placeholder="' + tr("e.g., example.com") + '" />';
        advancedHTML += '<div class="help-text">' + tr("Comma-separated list of domains to exclude") + '</div>';
        advancedHTML += '</div>';
      }
      
      // Provider-specific: Search Fields (TheNewsAPI, search only)
      if (config.supportsSearchFields) {
        var searchFieldsHTML = '<div class="form-group">';
        searchFieldsHTML += '<label for="PREFIX-search-fields">' + tr("Search Fields") + ':</label>';
        searchFieldsHTML += '<select id="PREFIX-search-fields">';
        searchFieldsHTML += '<option value="title,main_text">' + tr("Title and Content") + '</option>';
        searchFieldsHTML += '<option value="title">' + tr("Title Only") + '</option>';
        searchFieldsHTML += '<option value="description">' + tr("Description Only") + '</option>';
        searchFieldsHTML += '<option value="main_text">' + tr("Content Only") + '</option>';
        searchFieldsHTML += '<option value="title,description,keywords">' + tr("Title, Description & Keywords") + '</option>';
        searchFieldsHTML += '<option value="title,description,keywords,main_text">' + tr("All Fields") + '</option>';
        searchFieldsHTML += '</select>';
        searchFieldsHTML += '<div class="help-text">' + tr("Fields to search within") + '</div>';
        searchFieldsHTML += '</div>';
        
        // Only add to search tab
        var searchOptionsEl = this.$('search-advanced-options');
        if (searchOptionsEl) {
          searchOptionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, 'search') + searchFieldsHTML.replace(/PREFIX/g, 'search');
        }
        
        // For headlines, use regular HTML without search fields
        var headlinesOptionsEl = this.$('headlines-advanced-options');
        if (headlinesOptionsEl) {
          headlinesOptionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, 'headlines');
        }
        
        // Update "Search In" visibility
        this.updateSearchInVisibility(config.supportsSearchIn);
        return; // Early return since we handled both tabs
      }

      // For providers without search fields, use same HTML for both tabs
      var self = this;
      ["search", "headlines"].forEach(function (prefix) {
        const optionsEl = self.$(prefix + "-advanced-options");
        if (optionsEl) {
          optionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, prefix);
        }
      });
      
      // Update "Search In" visibility for search tab
      this.updateSearchInVisibility(config.supportsSearchIn);
    },

    /**
     * Update "Search In" section visibility
     */
    updateSearchInVisibility: function (visible) {
      var searchInSection = this.$('search-in-section');
      if (searchInSection) {
        searchInSection.style.display = visible ? 'block' : 'none';
      }
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

  // Export to global scope
  window.GNewsUI = UIManager;
})(window);
