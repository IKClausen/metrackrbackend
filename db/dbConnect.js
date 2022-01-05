const { Pool } = require('pg');

//Connects to db and allows objects to be passed to DB
const pool = new Pool({
	user: 'sspyeydgieomyn',
	password: '41164e93df6731ff6f83a149c27e5945151056186abf76c025047089665a845b',
	host: 'ec2-176-34-168-83.eu-west-1.compute.amazonaws.com',
	port: '5432',
	database: 'd91mmkie52bjv5',
	ssl: {
		rejectUnauthorized: false,
	},
});

module.exports = { pool };
