var mysql = require('node-mysql-promise');
//数据库操作
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'bankdata',
})

queryData = function (sql, retResult) {
    connection.query('SELECT %s FROM %s WHERE %s', sql)
        .then(data => {
            // console.log(data);
            retResult(null, data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })
}

insertData = function(data, retResult) {
    connection.table('bankdata').where('_index=' + data[2]).update({longitude:data[0],latitude:data[1]})
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })

}


exports.queryData = queryData;
exports.insertData = insertData;