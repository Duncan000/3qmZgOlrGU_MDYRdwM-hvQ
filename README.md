##  Job payload format
---
	{
	    "type":"exchange_rate",
	    "payload":{
	        "from":"HKD",
	        "to":"USD",
	        "success_count":2,
	        "failure_count":0
	    }
	}
	
In this project, we directly put success count and failure count in the payload. The job is reput to tube everytime succeeded or failed with amending the counts until reaching required success count or maximum failure count.

##  How to use
---
Install dependencies by `npm install`

Config the files under /lib/config if necessary.

####demo.js
`node demo.js`

Script to start a default worker & seed a default job.

####start_worker.js
`node start_worker.js --id=[ID] --config=[worker_config.yml]`

`node start_worker.js --id="defaultID" --config="./lib/config/worker_config.yml"`

Script to start a single worker. If args are not provided, the deafault is same as above command.

####seed_job.js
`node seed_job.js --from=[from] --to=[to] --config=[config]`

`node seed_job.js --from="USD" --to="HKD" --config="./lib/config/emitter_config"`

Script to seed a single job. If args are not provided, the deafault is same as above command.

##Testing
---
`npm test`

Config the files under /test/config if necessary.

##Alternative
---
Use single job for getting 10 records instead of putting new job.

####Worker
* `release` the job no matter every single request succeeds or fails
* `succeed` the job after getting 10 records in DB
* `bury` the job after 3 failures

####Calculation
1. Store also job_id in mongoDB exchange rate record to get success_count
	
	`success_count = counting records with this job_id`

2. Use release_count in Beanstalk to calucalate failure_count
	
	`failure count = release_count - success_count`

3. Involve timeout/server exceptions in the calculation if we count them as request failure

It is based on we can use another schema different from requirement. It can be more tolerant of server faults because success_count is based on record count in DB.
