/** 
 * TODO: Don't use this class for production as
 * <!-- WARNING: Automated extraction of rates is prohibited under the Terms of Use. -->
 */
(function() {
	'use strict';

	var request = require('request');
	var cheerio = require('cheerio');
	
	var URL = 'http://www.xe.com/currencyconverter/convert';
		
	/**
	 * @constructor
	 */
	function XeScraper() {}

	/**
	 * Scrape exchange rate from xe.com
	 * @param {string} from - from currency
	 * @param {string} to - to currency
	 * @param {function(error, string)} callback - return error, rate
	 */
	XeScraper.scrapeExchangeRate = function(from, to, callback) {
		request({
		    url: URL,
		    qs: {From: from, To: to, Amount: 1},
		    method: 'GET',
		}, function(error, res, body) {
			if (error) {
				callback.apply(this, [error]);
			}
			
			if (res.statusCode !== 200) {
	            callback.apply(this, [new Error(URL + ' responded with a bad code ' + res.statusCode)]);
	        }
			
            try {
            	var $ = cheerio.load(body);
            	
            	// error checking for currencies
            	var result_from = $('tr.uccRes > .leftCol > .uccResCde').text();
            	var result_to = $('tr.uccRes > .rightCol > .uccResCde').text();
            	if (result_from === '---' || result_to === '---') {
            		callback.apply(this, [new Error('Invalid from/to currencies parameters')]);
            		return;
            	}
            	
            	// parsing rate
            	var target = $('tr.uccRes > .rightCol').text().split(' ')[0];    
                var rate = parseFloat(target).toFixed(2);
                callback.apply(this, [null, rate]);
            } catch (error) {
                callback.apply(this, [error]);
            }
	    });
	};
	
	module.exports = XeScraper;
	module.exports.URL = URL;
	
})();