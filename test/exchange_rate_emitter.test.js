'use strict';

var ExchangeRateEmitter = require('../lib/exchange_rate_emitter');
var fivebeans = require('fivebeans');
var emitter_config = require('./config/emitter_config.test');
var should = require('Should');

describe('ExchangeRateEmitter', function() {
	describe('#emit()', function() {
		context('when success', function() {
			it('should have the emitted job on the tube', function(done) {
				var emitter = new ExchangeRateEmitter(emitter_config);
				var from = 'USD';
				var to = 'HKD';
				var success_count = 1;
				var failure_count = 1;
				var delay = 0;
				
				emitter.emit(from, to, success_count, failure_count, delay, function(err) {
					should.not.exist(err);
					
					// peek_ready to check it is the emitted job
					var client = new fivebeans.client(emitter_config.host, emitter_config.port);
					client.on('connect', function() {
						client.use(emitter_config.tube, function(err, tubename) {
							should.not.exist(err);
							client.peek_ready(function(err, job_id, payload) {
								//check existance
								should.not.exist(err);
								should.exist(job_id);
								should.exist(payload);
								
								// parse buffer to JSON
								var string = payload.toString('utf8');
								var json = JSON.parse(string);
								var data = json.payload;

								// compare payload data
								data.from.should.equal(from);
								data.to.should.equal(to);
								data.success_count.should.equal(success_count);
								data.failure_count.should.equal(failure_count);
								
								client.end();
								done();
							});
						});
					}).on('error', function(err) {
						should.not.exist(err);
					}).on('close', function() {
						// Do Nothing
					}).connect();
					
				});
			});
		});
	});
});