'use strict';

var ExchangeRateEmitter = require('./lib/exchange_rate_emitter');

var from = process.argv[2] || 'USD';
var to = process.argv[3] || 'HKD';
var emitter = new ExchangeRateEmitter();
emitter.emit(from, to, 0, 0, function() {
	process.exit(0);
});
