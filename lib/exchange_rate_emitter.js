(function() {
	'use strict';
		
	var fivebeans = require('fivebeans');
	var config = require('./config/emitter_config');
	
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
	 * @param {number} success_count - total success count for checking whether reached REQUIRED_SUCCESS_COUNT
	 * @param {number} failure_count - total failure count for checking whether reached MAX_FAILURE_COUNT
	 * @param {number} delay - delay for executing the job
	 * @param {function(error)} callback - return error
	 */
	ExchangeRateEmitter.prototype.emit = function(from, to, success_count, failure_count, delay, callback) {
		var job = {
			type: 'exchange_rate',
			payload: {
				from: from,
				to: to,
				success_count: success_count,
				failure_count: failure_count
			}
		};
		
		var client = new fivebeans.client(config.host, config.port);
		client.on('connect', function() {
			client.use(config.tube, function(err, tubename) {
				if (!err) {
					client.put(config.priority, delay, config.ttr, JSON.stringify(job), function(err, job_id) {
						console.log('Emit Job: ' + job_id);
						client.end();
						callback(err);
					});
				} else {
					callback(err);
				}
			});
		}).on('error', function(err) {
			console.log('Beanstalk connection error');
			callback(err);
		}).on('close', function() {
			// Do Nothing
		}).connect();
	};
	
	module.exports = ExchangeRateEmitter;
	
})();

