var http = require('http');
var url = require('url');
var util = require('util');
var express = require('express');
var database = require('./szgjj');
var app = express();

// get请求
app.get('/user', function (req, res) {
    var params = req.query || req.params;
    console.log(params);
    if (params && params.index) {
        var sql = ['lng,lat,area', 'biz_bld', 1, parseInt(params.index)];
        database.queryArea(sql, function (error, retData) {
            if (error) {
                console.log(error);
            } else {
                res.send(retData);
            }
        })
    }else{
        res.send('请输入地址参数');
    }
})

var server = app.listen(8000, function() {
    // var host = server.address().address;
    // var port = server.address().port;
    console.log("hello");
})