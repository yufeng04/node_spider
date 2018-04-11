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

updateData = function(data, retResult) {
    connection.table('gjj').where('_index=' + data[3]).update({firm_lng:data[0],firm_lat:data[1],boolean:data[2]})
    .then(data => {
        retResult(null,data);
    }).catch(e => {
        console.log(e);
        retResult(e);
    })
}

updateStation = function(data, retResult) {
    connection.table('gjj').where('_index=' + data[3]).update({station_lng:data[0],station_lat:data[1],boolean:data[2]})
    .then(data => {
        retResult(null,data);
    }).catch(e => {
        console.log(e);
        retResult(e);
    })
}

insertData = function(data, retResult) {
    connection.table('gjj').where('_index=' + data[2]).update({firm_lng:data[0],firm_lat:data[1]})
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })
}

insertStation = function(data, retResult) {
    connection.table('gjj').where('_index=' + data[2]).update({station_lng:data[0],station_lat:data[1]})
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })
}

exports.queryData = queryData;
exports.updateData = updateData;
exports.insertData = insertData;
exports.updateStation = updateStation;
exports.insertStation = insertStation;