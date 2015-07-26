'use strict';

var handler = require('../lib/exchange_rate_handler');
var should = require('Should');

describe('ExchangeRateHandler', function() {
	describe('#work()', function() {
		this.timeout(8000);
		
		context('when success', function() {
			it('should succeed the exchange rate job once', function(done) {
				var job_id = 0;
				var payload = {
					from: 'USD',
					to: 'HKD',
					success_count: 0,
					failure_count: 0
				};
				
				handler().work(job_id, payload, function(res, delay) {
					should.exist(res);
					should.not.exist(delay);
					
					res.should.equal('success');
					payload.success_count.should.equal(1);
					
					done();
				});
			});
		});
	});
});