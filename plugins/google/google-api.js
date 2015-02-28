/*
 * Google API 
 */
var googleApi = require('googleapis'),
    search = require('google'),
    config = require('./config.js'),
    urlShort = googleApi.urlshortener('v1');

search.resultsPerPage = 3; 

module.exports.search = function(query, callback) {
  search(query, function (err, next, links) {
    if (err && config.debug) {
      console.log('Search Error', err);
    } else {
      for (var i = 0; i < links.length; ++i) {
        callback(links[i].title + " - " + links[i].link);
      }
    }
  });
};

module.exports.shorten = function(url, callback) {
  urlShort.url.insert({resource: { longUrl: url }}, function(err, result){
    if (err && config.debug) {
      console.log("URL Shortening Error", err);
    } else {
      callback("Short URL for " + result.longUrl + " : " + result.id);
    }
  });
};
