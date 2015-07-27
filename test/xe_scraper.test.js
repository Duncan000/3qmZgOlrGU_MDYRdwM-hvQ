'use strict';

var XeScraper = require('../lib/xe_scraper.js');
var should = require('Should');
var nock = require('nock');

var SAMPLE_FILE_PATH_SUCCESS = __dirname + '/resource/sample_xe_usd_to_hkd.html';
var SAMPLE_FILE_PATH_INVALID_CURRENY = __dirname + '/resource/sample_xe_unknown_to_hkd.html';

var prepareNock = function() { 
	return nock(XeScraper.URL)
	.get('')
    .query({From: 'USD', To: 'HKD', Amount: '1'});
};

describe('XeScraper', function() {
	describe('#scrapeExchangeRate()', function() {
		var scraper = new XeScraper();
		
		context('when present', function() {
			it('should return exchange rate', function(done) {
				prepareNock().replyWithFile(200, SAMPLE_FILE_PATH_SUCCESS);
				
				scraper.scrapeExchangeRate('USD','HKD', function(err, result) {
					should.not.exist(err);
					should.exist(result);
					result.should.equal('7.75');
					done();
				});
			});
		});
		
		context('when response status code other than 200', function() {
			it('should return status code error', function(done) {
				prepareNock().reply(400, '');
				
				scraper.scrapeExchangeRate('USD','HKD', function(err, result) {
					should.exist(err);
					should.not.exist(result);
					err.message.should.equal(XeScraper.URL + ' responded with a bad code ' + 400);
 					done();
				});
			});
		});
		
		context('when response data is amended', function() {
			it('should return parsing error', function(done) {
				prepareNock().reply(200, 'Any unknown data');
				
				scraper.scrapeExchangeRate('USD','HKD', function(err, result) {
					should.exist(err);
					should.not.exist(result);
 					done();
				});
			});
		});
		
		context('when input unknown currency', function() {
			it('should return invalid parameter error', function(done) {
				nock(XeScraper.URL)
				.get('')
			    .query({From: 'UNKNOWN', To: 'HKD', Amount: '1'})
			    .replyWithFile(200, SAMPLE_FILE_PATH_INVALID_CURRENY);
				
				scraper.scrapeExchangeRate('UNKNOWN','HKD', function(err, result) {
					should.exist(err);
					should.not.exist(result);
					err.message.should.equal('Invalid from/to currencies parameters');
					done();
				});
			});
		});
	});
});