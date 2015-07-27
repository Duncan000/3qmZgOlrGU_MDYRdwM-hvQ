'use strict';

var ExchangeRateEmitter = require('./lib/exchange_rate_emitter');
var argv = require('yargs')
    .usage('Usage: $0 --from=[from] --to=[to] --config=[config]')
    .default('from', 'USD')
    .default('to', 'HKD')
    .default('config', './lib/config/emitter_config')
    .argv;
var config = require(argv.config);

var from = argv.from;
var to = argv.to;
var emitter = new ExchangeRateEmitter(config);
emitter.emit(from, to, 0, 0, 0, function() {
	process.exit(0);
});
