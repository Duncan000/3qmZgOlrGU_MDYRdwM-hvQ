(function() {
	'use strict';
		
	var fivebeans = require('fivebeans');
	var config = require('./config/bs_config');
	
	var PRIOITY = 0;
	var TTR = 60;
	
	/**
	 * @constructor
	 */
	function ExchangeRateEmitter() {}
	
	/**
	 * Emit a job to tube
	 * @param {string} from - from currency
	 * @param {string} to - to currency
	 * @param {string} success_count - exchange rate 
	 * @param {errorCallback} callback - return error
	 */
	ExchangeRateEmitter.prototype.emit = function(from, to, success_count, delay, callback) {
		var job = {
			type: 'exchange_rate',
			payload: {
				from: from,
				to: to,
				success_count: success_count
			}
		};
		
		var client = new fivebeans.client(config.host, config.port);
		client.on('connect', function() {
			client.use(config.tube, function(err, tubename) {
				if (!err) {
					client.put(PRIOITY, delay, TTR, JSON.stringify(job), function(err, job_id) {
						console.log('Seed Job: ' + job_id);
						client.end();
						callback(err);
					});
				} else {
					callback(err);
				}
			});
		}).on('error', function(err) {
			console.log('Beanstalk connection error');
		}).on('close', function() {
			// Do Nothing
		}).connect();
	};
	
	module.exports = ExchangeRateEmitter;
	
})();

