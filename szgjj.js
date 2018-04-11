var mysql = require('node-mysql-promise');
//数据库操作
var connection = mysql.createConnection({
    host: '118.190.153.225',
    user: 'szgjj',
    password: 'N96kmOgn',
    port: '3306',
    database: 'szgjj',
})

insertInfo = function(data, retResult) {
    connection.execute('INSERT INTO ajk_newxq ( dist, sub_dist, type, label, _name, address, price, ajk_url) VALUES (%s,%s,%s,%s,%s,%s,%s,%s);',data)
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })

}

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

queryArea = function (sql, retResult) {
    connection.query('SELECT %s FROM %s WHERE _index BETWEEN %s AND %s', sql)
        .then(data => {
            // console.log(data);
            retResult(null, data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })
}

insertData = function(data, retResult) {
    connection.table('ajk_newxq').where('_index=' + data[2]).update({lng:data[0],lat:data[1]})
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })

}

updateData = function(data, retResult) {
    connection.table('ajk_newxq').where('_index=' + data[3]).update({lng:data[0],lat:data[1],boolean:data[2]})
    .then(data => {
        retResult(null,data);
    }).catch(e => {
        console.log(e);
        retResult(e);
    })
}

updateBuidingDetail = function(data, retResult) {
    connection.table('ajk_newxq').where('_index=' + data[0]).update({open_day:data[1],house_day:data[2],house_num:data[3]})
    .then(data => {
        retResult(null,data);
    }).catch(e => {
        console.log(e);
        retResult(e);
    })
}

isExist = function(data, retResult) {
    connection.query('SELECT _index FROM fdd_xq WHERE district=%s AND _name=%s', data)
    .then(data => {
        // console.log(data);
        retResult(null, data);
    }).catch(e => {
        console.log(e);
        retResult(e);
    })
}

exports.insertInfo = insertInfo;
exports.queryData = queryData;
exports.insertData = insertData;
exports.updateData = updateData;
exports.updateBuidingDetail = updateBuidingDetail;
exports.queryArea = queryArea;
exports.isExist = isExist;