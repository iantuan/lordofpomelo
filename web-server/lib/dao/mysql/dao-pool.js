var _poolModule = require('generic-pool');
var mysqlConfig = require('../../../../shared/config/mysql');
var mysql = require('mysql');

var env = process.env.NODE_ENV || 'development';
if(mysqlConfig[env]) {
  mysqlConfig = mysqlConfig[env];
}

console.log("mysqlConfig %s", mysqlConfig.user);

/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(){
  return _poolModule.createPool({
    name     : "mysql",
    create: function(){
      return new Promise(function(resolve, reject){
        var client = mysql.createConnection({
          host: mysqlConfig.host,
          user: mysqlConfig.user,
          password: mysqlConfig.password,
          database: mysqlConfig.database
        });
        resolve(client);
      })
    },

    destroy  : function(client) {
      return new Promise(function(resolve){
        client.end();
      })
    }
  }, {
    max      : 10,
    idleTimeoutMillis : 30000,
    log : false
  });
};

exports.createMysqlPool = createMysqlPool;
