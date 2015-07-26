'use strict';

var ExchangeRateEmitter = require('./lib/exchange_rate_emitter');

var argv = require('yargs')
    .usage('Usage: $0 -from=[from] -to=[to]')
    .default('from', 'USD')
    .default('to', 'HKD')
    .argv;

var from = argv.from;
var to = argv.to;
var emitter = new ExchangeRateEmitter();
emitter.emit(from, to, 0, 0, 0, function() {
	process.exit(0);
});
