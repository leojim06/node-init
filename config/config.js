"use strict"

const config = {
	port: process.env.PORT || 3000,
	db: process.env.MONGOLAB_URI || "mongodb://localhost/ccco",
	// db: process.env.MONGOLAB_URI || "mongodb://leojim06:leojim06@ds015730.mlab.com:15730/escuela-test",
	test_port: 3001,
	test_db: "mongodb://localhost/ccco_test",
	secret: 'super.super.secret.shhh'
}
module.exports = config;