/**
 * API Manager for GNews Plugin
 * Handles all interactions with the GNews API
 */

(function (window) {
  "use strict";

  const BASE_URL = "https://gnews.io/api/v4";

  var APIManager = {
    apiKey: "",

    setApiKey: function (key) {
      this.apiKey = key;
    },

    /**
     * Build URL with query parameters
     * @param {string} base - Base URL
     * @param {object} params - Query parameters
     * @returns {string} - Complete URL with parameters
     */
    buildUrl: function (base, params) {
      const url = new URL(base);
      Object.keys(params).forEach(function (key) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          url.searchParams.append(key, params[key]);
        }
      });
      return url.toString();
    },

    /**
     * Perform a generic API call
     * @param {string} url - The API endpoint URL
     * @param {function} callback - Callback function(articles)
     */
    performAPICall: function (url, callback) {
      fetch(url)
        .then(function (response) {
          if (response.ok) return response.json();
          
          // Handle HTTP errors
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
            callback({ success: true, articles: data.articles });
          } else {
            callback({
              success: false,
              error: data.error || "No articles found",
              articles: [],
            });
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

          callback({ success: false, error: message, articles: [] });
        });
    },

    /**
     * Validate an API key
     * @param {string} apiKey - The API key to validate
     * @param {function} callback - Callback function(isValid, message)
     */
    validateApiKey: function (apiKey, callback) {
      try {
        const testUrl = this.buildUrl(BASE_URL + "/search", {
          q: "technology",
          token: apiKey,
          max: 1,
          lang: "en",
        });

        fetch(testUrl)
          .then(function (response) {
            if (response.ok) return response.json();
            throw new Error(
              response.status === 401
                ? "Invalid API token"
                : "API validation failed"
            );
          })
          .then(function (data) {
            callback(true, "API key is valid");
          })
          .catch(function (error) {
            console.error("Validation error:", error);
            callback(false, error.message);
          });
      } catch (error) {
        console.error("Validation error:", error);
        callback(false, "Error validating API key: " + error.message);
      }
    },

    /**
     * Search for articles
     * @param {string} query - Search query
     * @param {object} settings - Additional settings (language, sortBy, etc.)
     * @param {function} callback - Callback function(result)
     */
    search: function (query, settings, callback) {
      try {
        const searchUrl = this.buildUrl(BASE_URL + "/search", {
          q: query,
          token: this.apiKey,
          lang: settings.language || "en",
          sortby: settings.sortBy || "publishedAt",
          country: settings.country || "us",
        });

        this.performAPICall(searchUrl, callback);
      } catch (error) {
        console.error("Search error:", error);
        callback({ success: false, error: error.message, articles: [] });
      }
    },

    /**
     * Get top headlines
     * @param {object} params - Parameters (category, country, language, query)
     * @param {function} callback - Callback function(result)
     */
    getTopHeadlines: function (params, callback) {
      try {
        const urlParams = {
          token: this.apiKey,
          lang: params.language || "en",
        };

        if (params.category) urlParams.category = params.category;
        if (params.country) urlParams.country = params.country;
        if (params.query) urlParams.q = params.query;

        const headlinesUrl = this.buildUrl(BASE_URL + "/top-headlines", urlParams);

        this.performAPICall(headlinesUrl, callback);
      } catch (error) {
        console.error("Headlines error:", error);
        callback({ success: false, error: error.message, articles: [] });
      }
    },
  };

  window.GNewsAPI = APIManager;
})(window);
