(function() {
	'use strict';

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	/**
	 * MongoDB Config
	 * @typedef {object} MongoConfig
	 * @property {string} uri - uri to MongoDB server
	 * @property {string} collection - collection name
	 */
	
	/**
	 * @constructor
	 * @param {MongoConfig} config
	 */
	function MongoDao(config) {
		/**
		 * MongoDB config
		 * @type {MongoConfig}
		 * @private
		 */
		this.config = config;
			
		// setup DB
		mongoose.connect(config.uri);
		var exchange_rate_schema = new Schema({
			from: String,
			to: String,
			rate: String,
			created_at: {type:Date, default:Date.now}
		});
		mongoose.model(config.collection, exchange_rate_schema);
	}

	/**
	 * Create a record in config's collection
	 * @param {string} from - from currency
	 * @param {string} to - to currency
	 * @param {string} rate - exchange rate 
	 * @param {MongoDao~normalCallback} callback - return error
	 */
	MongoDao.prototype.create = function(from, to, rate, callback) {
		if (from == null || to == null || rate == null) {
			callback(new Error('Illegal parameters'));
			return;
		}
		
		var ExchangeRate = mongoose.model(this.config.collection);
		var record = new ExchangeRate({
			from: from,
			to: to,
			rate: rate
		});
		
		record.save(callback);
	};

	/**
	 * Read all record in config's collection
	 * @param {MongoDao~recordCallback} callback - return records or error
	 */
	MongoDao.prototype.readAll = function(callback) {
		var ExchangeRate = mongoose.model(this.config.collection);
		ExchangeRate.find({}, callback);
	};
	
	/**
	 * Delete all record in config's collection
	 * @param {MongoDao~normalCallback} callback - return error
	 */
	MongoDao.prototype.deleteAll = function(callback) {
		var ExchangeRate = mongoose.model(this.config.collection);
		ExchangeRate.remove(callback);
	};
	
	/**
	 * Close MongoDB connection.
	 */
	MongoDao.prototype.closeConnection = function() {
		mongoose.connection.close();
	};

	/**
	 * @callback MongoDao~normalCallback
	 * @param {error} err
	 */
	
	/**
	 * This callback is displayed as part of the Requester class.
	 * @callback MongoDao~recordCallback
	 * @param {error} err
	 * @param {Array} records
	 */
	
	module.exports = MongoDao;

})();