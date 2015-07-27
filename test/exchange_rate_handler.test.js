'use strict';

var should = require('Should');
var sinon = require('sinon');
var assert = require('assert');

var handler = require('../lib/exchange_rate_handler');
var XeScraper = require('../lib/xe_scraper');
var MongoDao = require('../lib/mongo_dao');
var ExchangeRateEmitter = require('../lib/exchange_rate_emitter');

describe('ExchangeRateHandler', function() {
	describe('#work()', function() {
		
		var scrape_stub;
		var dao_stub;
		var emitter_stub;
		
		/**
		 * Stub scaper, dao, emitter functions
		 * @param {boolean} is_scrape_success - whether scraping exchange rate would be successful
		 * @param {boolean} is_create_success - whether creating record in dao would be successful
		 * @param {boolean} is_emit_success - whether emitting job would be successful
		 */
		var stub = function(is_scrape_success, is_create_success, is_emit_success) {
			var err = new Error('Mock Error');
			scrape_stub = sinon.stub(XeScraper.prototype, 'scrapeExchangeRate');
			if (is_scrape_success) {
				scrape_stub.yields(null, '7.75');
			} else {
				scrape_stub.yields(err, null);
			}
			dao_stub = sinon.stub(MongoDao.prototype, 'create').yields(is_create_success? null: err);
		    emitter_stub = sinon.stub(ExchangeRateEmitter.prototype, 'emit').yields(is_emit_success? null: err);
		};

		/**
		 * @return {object} - return a sample payload
		 */
		var getSamplePayload = function() {
			return {
				from: 'USD',
				to: 'HKD',
				success_count: 0,
				failure_count: 0
			};
		};
		
		before(function() {
			this.timeout(8000);
		});
		
		afterEach(function() {
			// restore all stubs
		    scrape_stub.restore();
		    dao_stub.restore();
		    emitter_stub.restore();
		});

		context('when success', function() {
			it('should add 1 for success_count for new job and return success', function(done) {
				stub(true, true, true);

				var payload = getSamplePayload();
				handler().work(0, payload, function(res, delay) {
					assert(scrape_stub.calledOnce);
					assert(dao_stub.calledOnce);
					assert(emitter_stub.calledOnce);
					
					should.exist(res);
					should.not.exist(delay);
					
					res.should.equal('success');
					payload.success_count.should.equal(1);
					payload.failure_count.should.equal(0);
					
					done();
				});
			});
		});
		
		context('when scraping error', function() {
			it('should add 1 for failure_count and return bury', function(done) {
				stub(false, true, true);

				var payload = getSamplePayload();
				handler().work(0, payload, function(res, delay) {
					assert(scrape_stub.calledOnce);
					assert(dao_stub.notCalled);
					assert(emitter_stub.calledOnce);
					
					should.exist(res);
					should.not.exist(delay);
					
					res.should.equal('bury');
					payload.success_count.should.equal(0);
					payload.failure_count.should.equal(1);
					
					done();
				});
			});
		});
		
		context('when dao error', function() {
			it('should add 1 for failure_count and return bury', function(done) {
				stub(true, false, true);

				var payload = getSamplePayload();
				handler().work(0, payload, function(res, delay) {
					assert(scrape_stub.calledOnce);
					assert(dao_stub.calledOnce);
					assert(emitter_stub.calledOnce);
					
					should.exist(res);
					should.not.exist(delay);
					
					res.should.equal('bury');
					payload.success_count.should.equal(0);
					payload.failure_count.should.equal(1);
					
					done();
				});
			});
		});
		
		context('when emitter error', function() {
			it('should continue retrying to emit the job every 3s until totally emitting 3 times', function(done) {
				stub(false, false, false);	
				var clock = sinon.useFakeTimers();

				var payload = getSamplePayload();
					try {
						handler().work(0, payload, function(res, delay) {
							assert(scrape_stub.calledOnce);
							assert(dao_stub.notCalled);
							assert(emitter_stub.called);
							
							should.exist(res);
							should.not.exist(delay);
							
							res.should.equal('bury');
							payload.success_count.should.equal(0);
							payload.failure_count.should.equal(1);
							
							done();
							
							// push the time to 9s later, so called emit three times 
							// and then throw Error at forth times
							clock.tick(3000 * 3);
							assert(emitter_stub.thire);
						});
					} catch(err) {
						err.message.should.equal('Cannot reput job to tube with err: Mock Error');
					} finally {
						clock.restore();
					}
			});
		});
	});
});