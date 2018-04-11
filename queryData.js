var http = require('http');

var url = require('url');
var util = require('util');

var database = require('./database.js');

// 获取get请求内容
var params;
var queryAdrs;
var queryTel;
// 请求数据
var ak = 'ijeNGcdnqAj9v06I9L989Rs5xcohB9LY';


http.createServer(function (req, res) {
    if (req.url !== '/favicon.ico') {

        // 解析url
        params = url.parse(req.url, true).query;
        queryAdrs = params.address;
        queryTel = params.Tel;
        var content;

        database.queryData(queryTel, function (error, retData) {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            if (error) {
                res.write(error);
            }
            else {
                content = JSON.stringify(retData);
                // 发送get请求
                http.get('http://api.map.baidu.com/geocoder/v2/?address=' + queryAdrs + '&output=json&ak=' + ak ,
                    function (req, res) {
                        var content = '';
                        req.on('data', function (data) {
                            content += data;
                        });
                        req.on('end', function () {
                            console.info(content);
                        });
                    });
            }

        });
    }
    res.end();
}).listen(3000);

