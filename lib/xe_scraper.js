(function() {
	'use strict';

	var Request = require('request');
	var Cheerio = require('cheerio');
	
	var URL = 'http://www.xe.com/currencyconverter/convert';
		
	/**
	 * @constructor
	 */
	function XeScraper() {}

	XeScraper.scrapeExchangeRate = function(from, to, amount, callback) {
		Request({
		    url: URL,
		    qs: {From: from, To: to, Amount: amount},
		    method: 'GET',
		}, function(error, res, body) {
			if (error) {
				callback.apply(this, [error]);
			}
			
			if (res.statusCode !== 200) {
	            callback.apply(this, [new Error(URL + ' responded with a bad code ' + res.statusCode)]);
	        }
			
            try {
            	var target = Cheerio.load(body)('tr.uccRes > .rightCol').text().split(' ')[0];
                var rate = parseFloat(target).toFixed(2);
                callback.apply(this, [null, rate]);
            }
            catch (error) {
                callback.apply(this, [error]);
            }
	    });
	};
	
	module.exports = XeScraper;
	module.exports.URL = URL;
	
})();