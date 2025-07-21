(function (window, undefined) {
  let savedApiKey = "";
  let currentArticles = [];
  let currentTab = "search";

  function $(id) {
    return document.getElementById(id);
  }

  function setElementState(id, disabled, text) {
    const el = $(id);
    if (el) {
      if (disabled !== undefined) el.disabled = disabled;
      if (text !== undefined) el.textContent = text;
    }
  }

  function showStatus(message, isError) {
    const status = $("status");
    status.textContent = message;
    status.className = isError ? "error" : "success";
    setTimeout(function () {
      status.textContent = "";
      status.className = "";
    }, 4000);
  }

  window.Asc.plugin.init = function () {
    try {
      console.log("GNews sidebar plugin initialized");
      setTimeout(function () {
        initializeDisplayOptions();
        createAdvancedSettings();
        showApiSetup();
        setupEventListeners();
        applyTranslations();
      }, 50);
    } catch (error) {
      console.error("Init error:", error);
    }
  };

  window.Asc.plugin.onThemeChanged = function (theme) {
    const head = document.getElementsByTagName("head")[0];

    const existingLink = document.querySelector('link[href*="theme.css"]');
    if (existingLink) {
      existingLink.remove();
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.media = "all";

    if (theme.type === "dark") {
      link.href = "./style/black-theme.css";
    } else {
      link.href = "./style/white-theme.css";
    }

    head.appendChild(link);
    console.log("Applied theme:", theme.type);
  };

  window.Asc.plugin.onTranslate = function () {
    applyTranslations();
  };

  function applyTranslations() {
    // Main interface elements
    const descriptionText = $("description-text");
    if (descriptionText) {
      descriptionText.textContent = window.Asc.plugin.tr(
        "Search through millions of articles"
      );
    }

    const descriptionText2 = $("description-text-2");
    if (descriptionText2) {
      descriptionText2.textContent = window.Asc.plugin.tr(
        "Search through millions of articles"
      );
    }

    const apiKeyLabel = $("api-key-label");
    if (apiKeyLabel) {
      apiKeyLabel.textContent = window.Asc.plugin.tr("API key");
    }

    const apiKeyInput = $("api-key-setup");
    if (apiKeyInput) {
      apiKeyInput.placeholder = window.Asc.plugin.tr(
        "Enter your GNews API key"
      );
    }

    const getApiKeyText = $("get-api-key-text");
    if (getApiKeyText) {
      getApiKeyText.textContent = window.Asc.plugin.tr("Get your free API key");
    }

    const saveApiBtn = $("save-api-btn");
    if (saveApiBtn && saveApiBtn.textContent.trim() === "Login") {
      saveApiBtn.textContent = window.Asc.plugin.tr("Login");
    }

    // Tab labels
    const searchTabText = $("search-tab-text");
    if (searchTabText) {
      searchTabText.textContent = window.Asc.plugin.tr("Search");
    }

    const headlinesTabText = $("headlines-tab-text");
    if (headlinesTabText) {
      headlinesTabText.textContent = window.Asc.plugin.tr("Top Headlines");
    }

    // Form labels
    const searchPromptLabel = $("search-prompt-label");
    if (searchPromptLabel) {
      searchPromptLabel.textContent = window.Asc.plugin.tr("Prompt");
    }

    const headlinesPromptLabel = $("headlines-prompt-label");
    if (headlinesPromptLabel) {
      headlinesPromptLabel.textContent = window.Asc.plugin.tr("Prompt");
    }

    const searchQuery = $("search-query");
    if (searchQuery) {
      searchQuery.placeholder = window.Asc.plugin.tr("Search with keywords");
    }

    const headlinesQuery = $("headlines-query");
    if (headlinesQuery) {
      headlinesQuery.placeholder = window.Asc.plugin.tr("Search with keywords");
    }

    const searchInLabel = $("search-in-label");
    if (searchInLabel) {
      searchInLabel.textContent = window.Asc.plugin.tr("Search in");
    }

    const titleLabel = $("title-label");
    if (titleLabel) {
      titleLabel.textContent = window.Asc.plugin.tr("Title");
    }

    const descriptionLabel = $("description-label");
    if (descriptionLabel) {
      descriptionLabel.textContent = window.Asc.plugin.tr("Description");
    }

    const contentLabel = $("content-label");
    if (contentLabel) {
      contentLabel.textContent = window.Asc.plugin.tr("Content");
    }

    const advancedSettingsLabel = $("advanced-settings-label");
    if (advancedSettingsLabel) {
      advancedSettingsLabel.textContent =
        window.Asc.plugin.tr("Advanced Settings");
    }

    const headlinesAdvancedSettingsLabel = $(
      "headlines-advanced-settings-label"
    );
    if (headlinesAdvancedSettingsLabel) {
      headlinesAdvancedSettingsLabel.textContent =
        window.Asc.plugin.tr("Advanced Settings");
    }

    // Buttons
    const searchBtn = $("search-btn");
    if (searchBtn && searchBtn.textContent.trim() === "Find") {
      searchBtn.textContent = window.Asc.plugin.tr("Find");
    }

    const headlinesBtn = $("headlines-btn");
    if (headlinesBtn && headlinesBtn.textContent.trim() === "Find") {
      headlinesBtn.textContent = window.Asc.plugin.tr("Find");
    }

    const reconfigureBtn = $("reconfigure-btn");
    if (reconfigureBtn) {
      reconfigureBtn.textContent = window.Asc.plugin.tr("Reconfigure");
    }

    const backToSearchBtn = $("back-to-search-btn");
    if (backToSearchBtn) {
      backToSearchBtn.textContent = window.Asc.plugin.tr("Back to search");
    }

    // Category and country options
    const categoryLabel = $("category-label");
    if (categoryLabel) {
      categoryLabel.textContent = window.Asc.plugin.tr("Category");
    }

    const countryLabel = $("country-label");
    if (countryLabel) {
      countryLabel.textContent = window.Asc.plugin.tr("Country");
    }

    // Select options
    translateSelectOptions();
    translateAdvancedSettings();
  }

  function translateSelectOptions() {
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

    options.forEach(function (option) {
      const element = $(option.id);
      if (element) {
        element.textContent = window.Asc.plugin.tr(option.key);
      }
    });
  }

  function translateAdvancedSettings() {
    // Translate advanced settings options in both tabs
    ["search", "headlines"].forEach(function (prefix) {
      const sortBySelect = $(prefix + "-sortby");
      if (sortBySelect) {
        const options = sortBySelect.querySelectorAll("option");
        if (options[0])
          options[0].textContent = window.Asc.plugin.tr("Publication Date");
        if (options[1])
          options[1].textContent = window.Asc.plugin.tr("Relevance");
      }

      const langSelect = $(prefix + "-lang");
      if (langSelect) {
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
  }

  function performGNewsAPICall(url, callback) {
    fetch(url)
      .then(function (response) {
        if (response.ok) return response.json();
        throw new Error(
          response.status === 401
            ? "Invalid API token"
            : response.status === 429
            ? "API rate limit exceeded"
            : response.status === 400
            ? "Bad request - check your parameters"
            : "HTTP " + response.status
        );
      })
      .then(function (data) {
        if (data.articles && Array.isArray(data.articles)) {
          callback(data.articles);
        } else {
          showStatus(
            "GNews Error: " + (data.error || "No articles found"),
            true
          );
          callback([]);
        }
      })
      .catch(function (error) {
        console.error("API error:", error);
        const message = error.message.includes("Invalid API token")
          ? "Invalid API token. Please check your token and try again."
          : error.message.includes("rate limit")
          ? "API rate limit exceeded. Please try again later."
          : error.message.includes("CORS")
          ? "Network error: CORS issue"
          : "API failed: " + error.message;
        showStatus(message, true);
        callback([]);
      });
  }

  function createAdvancedSettings() {
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

    ["search", "headlines"].forEach(function (prefix) {
      const optionsEl = $(prefix + "-advanced-options");
      if (optionsEl) {
        optionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, prefix);
      }
    });
  }

  function getAdvancedSettings(tabPrefix) {
    const sortElement = $(tabPrefix + "-sortby");
    const langElement = $(tabPrefix + "-lang");

    return {
      sortBy: sortElement ? sortElement.value || "publishedAt" : "publishedAt",
      language: langElement ? langElement.value || "en" : "en",
    };
  }

  function initializeDisplayOptions() {
    const checkboxes = ["show-title", "show-description", "show-content"];
    checkboxes.forEach(function (id, index) {
      const el = $(id);
      if (el) el.checked = index < 2;
    });
  }

  function showApiSetup() {
    $("api-setup").style.display = "block";
    $("search-interface").style.display = "none";
  }

  function showSearchInterface() {
    $("api-setup").style.display = "none";
    $("search-interface").style.display = "block";
  }

  function performSearch(query, callback) {
    try {
      const settings = getAdvancedSettings("search");
      const searchUrl = buildUrl("https://gnews.io/api/v4/search", {
        q: query,
        token: savedApiKey,
        lang: settings.language,
        sortby: settings.sortBy,
        country: "us",
      });

      performGNewsAPICall(searchUrl, callback);
    } catch (error) {
      console.error("Search error:", error);
      showStatus("Error searching: " + error.message, true);
      callback([]);
    }
  }

  function validateApiKey(apiKey, callback) {
    try {
      const testUrl = buildUrl("https://gnews.io/api/v4/search", {
        q: "technology",
        token: apiKey,
        max: 1,
        lang: "en",
      });

      fetch(testUrl)
        .then(function (response) {
          if (response.status === 200) return response.json();
          throw new Error("HTTP " + response.status);
        })
        .then(function (data) {
          callback(
            data.articles && Array.isArray(data.articles),
            data.articles
              ? "API token validated successfully!"
              : "API token validation failed"
          );
        })
        .catch(function (error) {
          const message = error.message.includes("401")
            ? "Invalid API token"
            : error.message.includes("403")
            ? "API token access denied"
            : "Validation failed: " + error.message;
          callback(false, message);
        });
    } catch (error) {
      callback(false, "Error validating API token: " + error.message);
    }
  }

  function buildUrl(base, params) {
    const url = new URL(base);
    Object.keys(params).forEach(function (key) {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    return url.toString();
  }

  window.saveApiKey = function () {
    const apiKeyInput = $("api-key-setup");
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus("Please enter an API token", true);
      return;
    }

    if (apiKey.length < 10) {
      showStatus("API token should be at least 10 characters", true);
      return;
    }

    setElementState("save-api-btn", true, "Validating...");
    showStatus("Validating API token...", false);

    validateApiKey(apiKey, function (isValid, message) {
      setElementState("save-api-btn", false, "Login");

      if (isValid) {
        savedApiKey = apiKey;
        showSearchInterface();
        showStatus(message, false);
        setTimeout(function () {
          const searchInput = $("search-query");
          if (searchInput) searchInput.focus();
        }, 100);
      } else {
        showStatus(message, true);
      }
    });
  };

  function setupEventListeners() {
    const apiKeyInput = $("api-key-setup");
    const queryInput = $("search-query");
    const headlinesQueryInput = $("headlines-query");

    if (apiKeyInput) {
      apiKeyInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") window.saveApiKey();
      });
    }

    if (queryInput) {
      queryInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") window.searchNews();
      });
    }

    if (headlinesQueryInput) {
      headlinesQueryInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") window.getTopHeadlines();
      });
    }
  }

  window.switchTab = function (tabName) {
    currentTab = tabName;

    const searchTab = $("search-tab");
    const headlinesTab = $("headlines-tab");
    const searchContent = $("search-content");
    const headlinesContent = $("headlines-content");

    if (tabName === "search") {
      searchTab.classList.add("active");
      headlinesTab.classList.remove("active");
      searchContent.style.display = "block";
      searchContent.classList.add("active");
      headlinesContent.style.display = "none";
      headlinesContent.classList.remove("active");
    } else {
      headlinesTab.classList.add("active");
      searchTab.classList.remove("active");
      headlinesContent.style.display = "block";
      headlinesContent.classList.add("active");
      searchContent.style.display = "none";
      searchContent.classList.remove("active");
    }

    const advancedBtn = $("advanced-settings-btn");
    if (advancedBtn) {
      advancedBtn.textContent = "Show advanced settings";
    }

    const searchAdvanced = $("search-advanced-settings");
    const headlinesAdvanced = $("headlines-advanced-settings");
    if (searchAdvanced) searchAdvanced.style.display = "none";
    if (headlinesAdvanced) headlinesAdvanced.style.display = "none";

    showSearchForm();
    currentArticles = [];
  };

  function performTopHeadlinesSearch(
    category,
    country,
    language,
    query,
    callback
  ) {
    try {
      const settings = getAdvancedSettings("headlines");
      const searchUrl = buildUrl("https://gnews.io/api/v4/top-headlines", {
        token: savedApiKey,
        lang: settings.language,
        country: country,
        sortby: settings.sortBy,
        category: category,
        q: query && query.trim() ? query.trim() : undefined,
      });

      performGNewsAPICall(searchUrl, callback);
    } catch (error) {
      console.error("Headlines error:", error);
      showStatus("Error getting headlines: " + error.message, true);
      callback([]);
    }
  }

  function getDisplayOptions() {
    if (currentTab === "headlines") {
      return {
        title: true,
        description: true,
        content: false,
      };
    }

    const showTitle = $("show-title").checked;
    const showDescription = $("show-description").checked;
    const showContent = $("show-content").checked;

    if (!showTitle && !showDescription && !showContent) {
      return {
        title: true,
        description: true,
        content: false,
      };
    }

    return {
      title: showTitle,
      description: showDescription,
      content: showContent,
    };
  }

  function handleSearch(searchFunction, buttonId, loadingText, normalText) {
    if (!savedApiKey) {
      showStatus("Please set up your API key first", true);
      return;
    }

    setElementState(buttonId, true, loadingText);
    showStatus("Searching...", false);

    searchFunction(function (articles) {
      setElementState(buttonId, false, normalText);
      try {
        displaySearchResults(articles);
      } catch (error) {
        console.error("Search callback error:", error);
        showStatus("Search error: " + error.message, true);
      }
    });
  }

  window.searchNews = function () {
    const queryInput = $("search-query");
    if (!queryInput) {
      showStatus("Error: Search input not found", true);
      return;
    }

    const query = queryInput.value.trim();
    if (!query) {
      showStatus("Please enter a search query", true);
      return;
    }

    handleSearch(
      function (callback) {
        performSearch(query, callback);
      },
      "search-btn",
      "Searching...",
      "Find"
    );
  };

  window.getTopHeadlines = function () {
    const query = $("headlines-query").value;
    const category = $("headlines-category").value;
    const country = $("headlines-country").value;
    const language = "en";

    handleSearch(
      function (callback) {
        performTopHeadlinesSearch(category, country, language, query, callback);
      },
      "headlines-btn",
      "Loading...",
      "Find"
    );
  };

  function showSearchForm() {
    const searchForm = document.querySelector(".search-form-container");
    const resultsSection = $("results-section");

    if (searchForm) searchForm.style.display = "block";
    if (resultsSection) resultsSection.style.display = "none";
  }

  function showSearchResults() {
    const searchForm = document.querySelector(".search-form-container");
    const resultsSection = $("results-section");

    if (searchForm) searchForm.style.display = "none";
    if (resultsSection) resultsSection.style.display = "block";
  }

  function displaySearchResults(articles, showStatusMessage = true) {
    currentArticles = articles;
    const resultsList = $("articles-list");

    if (!resultsList) return;

    if (articles.length === 0) {
      resultsList.innerHTML =
        '<div class="no-results">No articles found for your search</div>';
      showSearchResults();
      return;
    }

    const displayOptions = getDisplayOptions();

    updateResultsHeader(articles.length, displayOptions);

    let html = "";

    articles.forEach(function (article, index) {
      const title = article.title || "No title";
      const description = article.description || "No description available";
      const content = article.content || "No content available";
      const source = article.source ? article.source.name : "Unknown source";
      const publishedDate =
        article.publishedAt &&
        new Date(article.publishedAt).toLocaleDateString();

      html +=
        '<div class="article-item" onclick="insertSingleArticle(' +
        index +
        ')">';

      html += '<div class="article-meta">';
      html +=
        "<span>" +
        escapeHtml(source) +
        (publishedDate ? " • " + publishedDate : "") +
        "</span>";
      html +=
        '<svg class="open-icon" onclick="event.stopPropagation(); insertSingleArticle(' +
        index +
        ')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link" viewBox="0 0 16 16">' +
        '<path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>' +
        '<path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>' +
        "</svg>";
      html += "</div>";

      if (displayOptions.title) {
        const displayTitle =
          title.length > 60 ? title.substring(0, 60) + "..." : title;
        html +=
          '<div class="article-title">' + escapeHtml(displayTitle) + "</div>";
      }

      if (displayOptions.description) {
        const displayDescription =
          description.length > 120
            ? description.substring(0, 120) + "..."
            : description;
        html +=
          '<div class="article-description">' +
          escapeHtml(displayDescription) +
          "</div>";
      }

      if (displayOptions.content) {
        const displayContent =
          content.length > 150 ? content.substring(0, 150) + "..." : content;
        html +=
          '<div class="article-description">' +
          escapeHtml(displayContent) +
          "</div>";
      }

      html += "</div>";
    });

    resultsList.innerHTML = html;
    showSearchResults();

    if (showStatusMessage) {
      showStatus(
        "Found " +
          articles.length +
          " articles. Click to open articles in new tab.",
        false
      );
    }
  }

  function updateResultsHeader(count, displayOptions) {
    const resultsHeader = document.querySelector(".results-header");
    if (!resultsHeader) return;

    const searchFields = [];
    if (displayOptions.title) searchFields.push("title");
    if (displayOptions.description) searchFields.push("description");
    if (displayOptions.content) searchFields.push("content");

    const searchFieldsText =
      searchFields.length === 0 ? "all fields" : searchFields.join(", ");
    const headerText = `Success! ${count} results were found by ${searchFieldsText}`;

    resultsHeader.textContent = headerText;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  window.insertSingleArticle = function (index) {
    console.log("insertSingleArticle called with index:", index);
    console.log("currentArticles length:", currentArticles.length);

    if (index < 0 || index >= currentArticles.length) {
      console.error("Invalid index:", index);
      showStatus("Invalid article selection", true);
      return;
    }

    const article = currentArticles[index];
    console.log("Opening article:", article.title);
    openArticleLink(article);
  };

  function openArticleLink(article) {
    console.log("openArticleLink called for:", article.title);

    if (!article.url) {
      showStatus("No URL available for this article", true);
      return;
    }

    try {
      console.log("Opening URL:", article.url);
      window.open(article.url, "_blank");
      showStatus("Article opened in new tab", false);
    } catch (error) {
      console.error("Error opening article link:", error);
      showStatus("Error opening article: " + error.message, true);
    }
  }

  window.changeApiKey = function () {
    savedApiKey = "";
    showApiSetup();
    const apiKeyInput = $("api-key-setup");
    if (apiKeyInput) apiKeyInput.value = "";
    const status = $("status");
    if (status) {
      status.textContent = "";
      status.className = "";
    }
  };

  window.toggleAdvancedSettings = function () {
    const advancedSection = $(currentTab + "-advanced-settings");
    const advancedBtn = $("advanced-settings-btn");

    if (advancedSection && advancedBtn) {
      if (advancedSection.style.display === "none") {
        advancedSection.style.display = "block";
        advancedBtn.textContent = window.Asc.plugin.tr
          ? window.Asc.plugin.tr("Hide advanced settings")
          : "Hide advanced settings";
      } else {
        advancedSection.style.display = "none";
        advancedBtn.textContent = window.Asc.plugin.tr
          ? window.Asc.plugin.tr("Show advanced settings")
          : "Show advanced settings";
      }
    }
  };

  window.advancedSettings = function () {
    window.toggleAdvancedSettings();
  };

  window.Asc.plugin.button = function (id) {
    if (id === -1 || id === 0) {
      this.executeCommand("close", "");
    }
  };

  window.Asc.plugin.onExternalMouseUp = function () {
    return false;
  };

  window.addEventListener("beforeunload", function (e) {
    savedApiKey = "";
    currentArticles = [];
    currentTab = "search";
  });

  window.Asc.plugin.executeCommand = function (command, data) {
    if (command === "close") {
      savedApiKey = "";
      currentArticles = [];
      currentTab = "search";
    }
  };

  window.Asc.plugin.onMethodReturn = function (returnValue) {};

  window.goBackToSearch = function () {
    showSearchForm();
    currentArticles = [];
    console.log("test");
    const status = $("status");
    if (status) {
      status.textContent = "";
      status.className = "";
    }
  };

  window.clearResults = function () {
    showSearchForm();
    currentArticles = [];
  };

  window.updateArticleDisplay = function () {
    console.log("updateArticleDisplay called");
    if (currentArticles.length > 0) {
      displaySearchResults(currentArticles, false);
    }
  };
})(window, undefined);
