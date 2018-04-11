var mysql = require('node-mysql-promise');
//数据库操作
var connection = mysql.createConnection({
    host: '118.190.153.225',
    user: 'szgjj',
    password: 'N96kmOgn',
    port: '3306',
    database: 'szgjj',
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
    connection.table('bankdata').where('_index=' + data[1]).update({bsum:data[0]})
        .then(data => {
            retResult(null,data);
        }).catch(e => {
            console.log(e);
            retResult(e);
        })

}

for(let i = 1; i < 348; i++) {
    console.log(i);
    var sql = ['cnt','lable','_index='+i]
    queryData(sql,function(err,ret){
        if(err) {
            console.log(err);
        }else {
            var data = [ret[0].cnt,i]
            insertData(data,function(err,ret){
                if(err) {
                    console.log(err);
                }
            })
        }

    })
}

