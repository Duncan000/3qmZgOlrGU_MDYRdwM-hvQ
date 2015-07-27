module.exports = function() {
	'use strict';

	var XeScraper = require('./xe_scraper');
	var MongoDao = require('./mongo_dao');
	var ExchangeRateEmitter = require('./exchange_rate_emitter');
	
	var db_config = require('./config/db_config');
	var handler_config = require('./config/handler_config');
	var emitter_config = require('./config/emitter_config');

	var RESPONSE_SUCCESS = 'success';
	var RESPONSE_RELEASE = 'release';
	var RESPONSE_BURY = 'bury';
	
	/**
	 * @constructor
	 */
	function ExchangeRateHandler() {
		/**
		 * type
		 * @type {string}
		 * @private
		 */
		this.type = 'exchange_rate';
	}
	
	/**
	 * Handler work
	 * @param {string} job_id - for retrieving job status if we want to treat timeouts/exceptions
	 *  as failure (unused)
	 * @param {object} payload - payload of the job
	 * @param {function(string, number)} callback - return worker action and delay
	 */
	ExchangeRateHandler.prototype.work = function(job_id, payload, callback) {
		if (payload === null || payload.from === null || payload.to === null || 
				payload.success_count === null || payload.success_count === null) {
			console.log('Illegal Arguements of payload');
			callback(RESPONSE_BURY);
		}
		
		var self = this;
		var scraper = new XeScraper();
		// start scraping exchange rate
		scraper.scrapeExchangeRate(payload.from, payload.to, function(err, rate) {
			if (!err) {
				console.log('Successful scrape');
				self.storeToDb(rate, payload, callback);
			} else {
				console.log('Failure scrape');
				self.onError(err, payload, callback);
			}
		});
	};
	
	/**
	 * Store exchange rate record to database
	 * @param {string} rate - exchange rate
	 * @param {object} payload - payload of the job
	 * @param {function(string, number)} callback - return worker action and delay
	 */
	ExchangeRateHandler.prototype.storeToDb = function(rate, payload, callback) {
		var self = this;
		
		var dao = new MongoDao(db_config);
		// save rate record to DB
		dao.create(payload.from, payload.to, rate, function(err) {
			if (!err) {
				console.log('Successful store to DB');
				self.onSuccess(payload, callback);
			} else {  
				console.log('Failure store to DB');
				self.onError(err, payload, callback);
			}
			dao.closeConnection();
		});
	};
	
	/**
	 * OnSuccess of the job
	 * @param {object} payload - payload of the job
	 * @param {function(string, number)} callback - return worker action and delay
	 */
	ExchangeRateHandler.prototype.onSuccess = function(payload, callback) {
		// increment success count	
		// reput the job to do next attempt if not yet enough success count
		if (++payload.success_count < handler_config.REQUIRED_SUCCESS_COUNT) {
			this.reputJob(payload, handler_config.SUCCESS_DELAY_TIME);
		}
		callback(RESPONSE_SUCCESS);
	};
	
	/**
	 * OnError of the job
	 * @param {Error} err - error leads to failure
	 * @param {object} payload - payload of the job
	 * @param {function(string, number)} callback - return worker action and delay
	 */
	ExchangeRateHandler.prototype.onError = function(err, payload, callback) {
		console.log(err);
		
		// increment failure count		
		// reput the job to do next attempt if not yet reached max failure count
		if (++payload.failure_count < handler_config.MAX_FAILURE_COUNT) {
			this.reputJob(payload, handler_config.FAILURE_DELAY_TIME);
		}
		callback(RESPONSE_BURY);
	};
	
	/**
	 * Reput job to tube with delay
	 * @param {object} payload - payload of the job
	 * @param {number} delay - delay for allowing reverse the job after reputting
	 * @param {number} [emit_retry_count = 0] - retry count for emitting the job
	 */
	ExchangeRateHandler.prototype.reputJob = function(payload, delay, emit_retry_count) {
		emit_retry_count = emit_retry_count || 0;
		
		var self = this;
		var emitter = new ExchangeRateEmitter(emitter_config);
		// emit reputting job with delay
		emitter.emit(payload.from, payload.to, payload.success_count, payload.failure_count, delay, function(err) {
			if (err) {
				// retry 3 times only
				if (++emit_retry_count >= 3) {
	                throw new Error('Cannot reput job to tube with err: ' + err.message);
				}
				
				// reput job again if emitting error with delay
				setTimeout(function () {
					self.reputJob(payload, delay, emit_retry_count);
	            }, 3000);
			}
		});
	};
	
	var handler = new ExchangeRateHandler();
	return handler;
	
};