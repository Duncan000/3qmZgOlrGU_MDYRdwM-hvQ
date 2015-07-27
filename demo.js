'use strict';

var child_process = require('child_process');

child_process.fork('./seed_job.js');
child_process.fork('./start_worker.js');
