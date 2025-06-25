(function (window, undefined) {
  var savedApiKey = "";
  var currentArticles = [];
  var currentTab = "search";

  function $(id) {
    return document.getElementById(id);
  }

  function setElementState(id, disabled, text) {
    var el = $(id);
    if (el) {
      if (disabled !== undefined) el.disabled = disabled;
      if (text !== undefined) el.textContent = text;
    }
  }

  function showStatus(message, isError) {
    var status = $("status");
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
      }, 50);
    } catch (error) {
      console.error("Init error:", error);
    }
  };

  window.Asc.plugin.onThemeChanged = function (theme) {
    var head = document.getElementsByTagName("head")[0];

    var existingLink = document.querySelector('link[href*="theme.css"]');
    if (existingLink) {
      existingLink.remove();
    }

    var link = document.createElement("link");
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
        var message = error.message.includes("Invalid API token")
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
    var advancedHTML = `
      <div class="form-group">
        <label for="PREFIX-sortby">Sort by:</label>
        <select id="PREFIX-sortby">
          <option value="publishedAt">Publication Date (newest first)</option>
          <option value="relevance">Relevance (best match first)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="PREFIX-lang">Language:</label>
        <select id="PREFIX-lang">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
          <option value="ar">Arabic</option>
          <option value="ru">Russian</option>
          <option value="hi">Hindi</option>
          <option value="ko">Korean</option>
        </select>
      </div>
    `;

    ["search", "headlines"].forEach(function (prefix) {
      var optionsEl = $(prefix + "-advanced-options");
      if (optionsEl) {
        optionsEl.innerHTML = advancedHTML.replace(/PREFIX/g, prefix);
      }
    });
  }

  function getAdvancedSettings(tabPrefix) {
    var sortElement = $(tabPrefix + "-sortby");
    var langElement = $(tabPrefix + "-lang");

    return {
      sortBy: sortElement ? sortElement.value || "publishedAt" : "publishedAt",
      language: langElement ? langElement.value || "en" : "en",
    };
  }

  function initializeDisplayOptions() {
    var checkboxes = ["show-title", "show-description", "show-content"];
    checkboxes.forEach(function (id, index) {
      var el = $(id);
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
      var settings = getAdvancedSettings("search");
      var searchUrl = buildUrl("https://gnews.io/api/v4/search", {
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
      var testUrl = buildUrl("https://gnews.io/api/v4/search", {
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
          var message = error.message.includes("401")
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
    var url = new URL(base);
    Object.keys(params).forEach(function (key) {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    return url.toString();
  }

  window.saveApiKey = function () {
    var apiKeyInput = $("api-key-setup");
    var apiKey = apiKeyInput.value.trim();

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
          var searchInput = $("search-query");
          if (searchInput) searchInput.focus();
        }, 100);
      } else {
        showStatus(message, true);
      }
    });
  };

  function setupEventListeners() {
    var apiKeyInput = $("api-key-setup");
    var queryInput = $("search-query");
    var headlinesQueryInput = $("headlines-query");

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

    var searchTab = $("search-tab");
    var headlinesTab = $("headlines-tab");
    var searchContent = $("search-content");
    var headlinesContent = $("headlines-content");

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

    var advancedBtn = $("advanced-settings-btn");
    if (advancedBtn) {
      advancedBtn.textContent = "Show advanced settings";
    }

    var searchAdvanced = $("search-advanced-settings");
    var headlinesAdvanced = $("headlines-advanced-settings");
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
      var settings = getAdvancedSettings("headlines");
      var searchUrl = buildUrl("https://gnews.io/api/v4/top-headlines", {
        token: savedApiKey,
        max: 10,
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

    var showTitle = $("show-title").checked;
    var showDescription = $("show-description").checked;
    var showContent = $("show-content").checked;

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
    var queryInput = $("search-query");
    if (!queryInput) {
      showStatus("Error: Search input not found", true);
      return;
    }

    var query = queryInput.value.trim();
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
    var query = $("headlines-query").value;
    var category = $("headlines-category").value;
    var country = $("headlines-country").value;
    var language = "en";

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
    var searchForm = document.querySelector(".search-form-container");
    var resultsSection = $("results-section");

    if (searchForm) searchForm.style.display = "block";
    if (resultsSection) resultsSection.style.display = "none";
  }

  function showSearchResults() {
    var searchForm = document.querySelector(".search-form-container");
    var resultsSection = $("results-section");

    if (searchForm) searchForm.style.display = "none";
    if (resultsSection) resultsSection.style.display = "block";
  }

  function displaySearchResults(articles) {
    currentArticles = articles;
    var resultsList = $("articles-list");

    if (!resultsList) return;

    if (articles.length === 0) {
      resultsList.innerHTML =
        '<div class="no-results">No articles found for your search</div>';
      showSearchResults();
      return;
    }

    var displayOptions = getDisplayOptions();

    updateResultsHeader(articles.length, displayOptions);

    var html = "";

    articles.forEach(function (article, index) {
      var title = article.title || "No title";
      var description = article.description || "No description available";
      var content = article.content || "No content available";
      var source = article.source ? article.source.name : "Unknown source";
      var publishedDate =
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
        var displayTitle =
          title.length > 60 ? title.substring(0, 60) + "..." : title;
        html +=
          '<div class="article-title">' + escapeHtml(displayTitle) + "</div>";
      }

      if (displayOptions.description) {
        var displayDescription =
          description.length > 120
            ? description.substring(0, 120) + "..."
            : description;
        html +=
          '<div class="article-description">' +
          escapeHtml(displayDescription) +
          "</div>";
      }

      if (displayOptions.content) {
        var displayContent =
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

    showStatus(
      "Found " +
        articles.length +
        " articles. Click to open articles in new tab.",
      false
    );
  }

  function updateResultsHeader(count, displayOptions) {
    var resultsHeader = document.querySelector(".results-header");
    if (!resultsHeader) return;

    var searchFields = [];
    if (displayOptions.title) searchFields.push("title");
    if (displayOptions.description) searchFields.push("description");
    if (displayOptions.content) searchFields.push("content");

    var searchFieldsText =
      searchFields.length === 0 ? "all fields" : searchFields.join(", ");
    var headerText = `Success! ${count} results were found by ${searchFieldsText}`;

    resultsHeader.textContent = headerText;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
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

    var article = currentArticles[index];
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
    var apiKeyInput = $("api-key-setup");
    if (apiKeyInput) apiKeyInput.value = "";
    var status = $("status");
    if (status) {
      status.textContent = "";
      status.className = "";
    }
  };

  window.toggleAdvancedSettings = function () {
    var advancedSection = $(currentTab + "-advanced-settings");
    var advancedBtn = $("advanced-settings-btn");

    if (advancedSection && advancedBtn) {
      if (advancedSection.style.display === "none") {
        advancedSection.style.display = "block";
        advancedBtn.textContent = "Hide advanced settings";
      } else {
        advancedSection.style.display = "none";
        advancedBtn.textContent = "Show advanced settings";
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
    var status = $("status");
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
      displaySearchResults(currentArticles);
    }
  };
})(window, undefined);
