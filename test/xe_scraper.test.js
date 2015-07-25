'use strict';

var XeScraper = require('../lib/xe_scraper.js');
var Should = require('Should');
var Nock = require('nock');

var SAMPLE_FILE_PATH_SUCCESS = __dirname + '/sample_xe_usd_to_hkd.html';

var prepareNock = function() { 
	return Nock(XeScraper.URL)
	.get('')
    .query({From: 'USD', To: 'HKD', Amount: '1'});
};

describe('XeScraper', function() {
	describe('#scrapeExchangeRate()', function() {
		
		context('when present', function() {
			it('Should return exchange rate', function(done) {
				prepareNock().replyWithFile(200, SAMPLE_FILE_PATH_SUCCESS);
				
				XeScraper.scrapeExchangeRate('USD','HKD', 1, function(err, result) {
					Should.not.exist(err);
					Should.exist(result);
					result.should.equal('7.75');
					done();
				});
			});
		});
		
		context('when response status code other than 200', function() {
			it('Should return status code error', function(done) {
				prepareNock().reply(400, '');
				
				XeScraper.scrapeExchangeRate('USD','HKD', 1, function(err, result) {
					Should.exist(err);
					Should.not.exist(result);
					err.message.should.equal(XeScraper.URL + ' responded with a bad code ' + 400);
 					done();
				});
			});
		});
		
		context('when response data is amended', function() {
			it('Should return parsing error', function(done) {
				prepareNock().reply(200, 'Any unknown data');
				
				XeScraper.scrapeExchangeRate('USD','HKD', 1, function(err, result) {
					// TODO: check parsing error
					Should.exist(err);
					Should.not.exist(result);
 					done();
				});
			});
		});
	});
});