'use strict';

var MongoDao = require('../lib/mongo_dao');
var should = require('Should');
var test_config = require('./config/db_config.test');

describe('MongoDao', function() {
	describe('#create()', function() {
		var mongo_dao;

		before(function() {
			this.timeout(8000);
		});
		
		beforeEach(function(done) {
			mongo_dao = new MongoDao(test_config);
			// delete all data first
			mongo_dao.deleteAll(done);
		});
		 
		afterEach(function(done) {
			mongo_dao.closeConnection(done);
		});
		
		context('when success', function() {
			it('should save the exchange rate record to database', function(done) {
				var from = 'USD';
				var to = 'HKD';
				var rate = '7.75';

				// create one sample data
				mongo_dao.create(from, to, rate, function(err) {
					should.not.exist(err);

					// read all data
					mongo_dao.readAll(function(err, exchange_rates) {
						// check correctness
						should.not.exist(err);
						should.exist(exchange_rates);
						exchange_rates.should.have.length(1);
						var sample = exchange_rates[0];
						sample.from.should.equal(from);
						sample.to.should.equal(to);
						sample.rate.should.equal(rate);

						done();
					});
				});
			});
		});
		
		context('when passing null parameter from', function() {
			it('should return illegal parameters error', function(done) {
				var from = null;
				var to = 'HKD';
				var rate = '7.75';

				// create one sample data
				mongo_dao.create(from, to, rate, function(err) {
					should.exist(err);
					err.message.should.equal('Invalid parameters');
					done();
				});
			});
		});
		
		context('when passing null parameter to', function() {
			it('should return illegal parameters error', function(done) {
				var from = 'USD';
				var to = null;
				var rate = '7.75';

				// create one sample data
				mongo_dao.create(from, to, rate, function(err) {
					should.exist(err);
					err.message.should.equal('Invalid parameters');
					done();
				});
			});
		});
		
		context('when passing null parameter rate', function() {
			it('should return illegal parameters error', function(done) {
				var from = 'USD';
				var to = 'HKD';
				var rate = null;

				// create one sample data
				mongo_dao.create(from, to, rate, function(err) {
					should.exist(err);
					err.message.should.equal('Invalid parameters');
					done();
				});
			});
		});
		
	});
});