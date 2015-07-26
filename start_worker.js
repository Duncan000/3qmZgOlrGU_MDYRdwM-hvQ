'use strict';

var argv = require('yargs')
    .usage('Usage: $0 --id=[ID] --config=[worker_config.yml]')
    .default('id', 'defaultID')
    .default('config', './lib/config/worker_config.yml')
    .argv;

var FiveBeans = require('fivebeans');

var runner = new FiveBeans.runner(argv.id, argv.config);
runner.go();