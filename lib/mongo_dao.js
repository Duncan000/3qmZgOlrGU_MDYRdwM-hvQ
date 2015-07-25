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
		
		/**
		 * MongoDB connection
		 * @type {Connection}
		 * @private
		 */		
		this.db = mongoose.createConnection(config.uri);

		// setup schema
		var exchange_rate_schema = new Schema({
			from: String,
			to: String,
			rate: String,
			created_at: {type:Date, default:Date.now}
		});
		
		/**
		 * ExchangeRateModel
		 * @type {Model}
		 * @private
		 */	
		this.ExchangeRateModel = this.db.model(config.collection, exchange_rate_schema); 
	}

	/**
	 * Create a record in config's collection
	 * @param {string} from - from currency
	 * @param {string} to - to currency
	 * @param {string} rate - exchange rate 
	 * @param {MongoDao~normalCallback} callback - return error
	 */
	MongoDao.prototype.create = function(from, to, rate, callback) {
		if (from === null || to === null || rate === null) {
			callback(new Error('Illegal parameters'));
			return;
		}
		
		var record = new this.ExchangeRateModel({
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
		this.ExchangeRateModel.find({}, callback);
	};
	
	/**
	 * Delete all record in config's collection
	 * @param {MongoDao~normalCallback} callback - return error
	 */
	MongoDao.prototype.deleteAll = function(callback) {
		this.ExchangeRateModel.remove(callback);
	};
	
	/**
	 * Close MongoDB connection.
	 * @param {MongoDao~normalCallback} callback - return error
	 */
	MongoDao.prototype.closeConnection = function(callback) {
		this.db.close(function () {
			console.log('Mongoose close connection'); 
			if (callback) {
				callback();
			}
		}); 
	};
	
	// If the Node process ends, close all Mongoose connections
	process.on('SIGINT', function() {
		mongoose.disconnect(function() {
			console.log('Mongoose connection disconnected through app termination'); 
			process.exit(0);
		});
	});
	
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