var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : 3306,
  user     : 'root',
  password : 'password',//'1231maxi',
  database : 'competencias'
});

module.exports = connection;

