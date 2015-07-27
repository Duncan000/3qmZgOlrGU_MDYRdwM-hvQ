(function() {
	'use strict';
		
	var fivebeans = require('fivebeans');

	/**
	 * @param {EmitterConfig} config - for putting job
	 * @constructor
	 */
	function ExchangeRateEmitter(config) {
		/**
		 * Exchange rate emitter config
		 * @type {EmitterConfig}
		 * @private
		 */
		this.config = config;
	}
	
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
		
		var self = this;
		var client = new fivebeans.client(this.config.host, this.config.port);
		client.on('connect', function() {
			client.use(self.config.tube, function(err, tubename) {
				if (!err) {
					client.put(self.config.priority, delay, self.config.ttr, JSON.stringify(job), function(err, job_id) {
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

