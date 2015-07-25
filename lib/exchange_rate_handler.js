module.exports = function() {
	'use strict';

	var scraper = require('./xe_scraper');
	var MongoDao = require('./mongo_dao');
	var ExchangeRateEmitter = require('./exchange_rate_emitter');
	var db_config = require('./config/db_config');
	var handler_config = require('./config/handler_config');
	
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
	 * Store exchange rate record to database
	 * @param {string} rate - exchange rate
	 * @param {object} payload - payload of the job
	 * @param {workCallback} callback(action, delay) - return worker action and delay
	 */
	ExchangeRateHandler.prototype.work = function(jobId, payload, callback) {
		if (payload === null || payload.from === null || payload.to === null || payload.success_count === null) {
			throw new Error('Illegal Arguements of payload');
		}
		
		var self = this;
		scraper.scrapeExchangeRate(payload.from, payload.to, 1, function(err, rate) {
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
	 * @param {workCallback} callback(action, delay) - return worker action and delay
	 */
	ExchangeRateHandler.prototype.storeToDb = function(rate, payload, callback) {
		var self = this;
		
		var dao = new MongoDao(db_config);
		dao.create(payload.from, payload.to, rate, function(err) {
			dao.closeConnection();
			if (!err) {
				console.log('Successful store to DB');
				self.onSuccess(payload, callback);
			} else {  
				console.log('Failure store to DB');
				self.onError(err, payload, callback);
			}
		});
	};
	
	/**
	 * OnSuccess of the job
	 * @param {object} payload - payload of the job
	 * @param {workCallback} callback(action, delay) - return worker action and delay
	 */
	ExchangeRateHandler.prototype.onSuccess = function(payload, callback) {
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
	 * @param {workCallback} callback(action, delay) - return worker action and delay
	 */
	ExchangeRateHandler.prototype.onError = function(err, payload, callback) {
		console.log(err);
		// reput the job to do next attempt if not yet reached max failure count
		// TODO: handle max failure count
//		if (release_count + timeout_count - success_count < handler_config.MAX_FAILURE_COUNT) {
			this.reputJob(payload, handler_config.FAILURE_DELAY_TIME);
//		}
		callback(RESPONSE_BURY);
	};
	
	/**
	 * Reput job to tube with delay
	 * @param {object} payload - payload of the job
	 * @param {int} delay - delay for allowing reverse the job after reputting
	 */
	ExchangeRateHandler.prototype.reputJob = function(payload, delay) {
		var emitter = new ExchangeRateEmitter();
		emitter.emit(payload.from, payload.to, payload.success_count, delay, function() {
		});
	};
	
	var handler = new ExchangeRateHandler();
	return handler;
	
};