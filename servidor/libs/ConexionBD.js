var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : 3306,
  user     : 'root',
  password : '1231maxi',
 // password : 'password',
  database : 'competencias'
});

module.exports = connection;

