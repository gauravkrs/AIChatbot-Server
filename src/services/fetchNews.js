const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Fetches and parses news articles from a given RSS feed URL.
 *
 * @param {string} url - The URL of the RSS feed to fetch.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of news articles,
 * each containing a title, content snippet, and URL.
 */
async function fetchNews(url) {
  const feed = await parser.parseURL(url);
  return feed.items.map(item => ({
    title: item.title,
    content: item.contentSnippet,
    url: item.link
  }));
}

module.exports = fetchNews;