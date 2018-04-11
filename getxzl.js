var https = require('https');
var cheerio = require('cheerio');// 采用jQuery语法解析html元素
var superagent = require('superagent');//模拟浏览器登录
require('superagent-proxy')(superagent);
var fs = require('fs');
var database = require('./szgjj.js');
// 安居客 福田区 楼盘信息
var url = 'https://sz.xzl.anjuke.com/loupan/';
var dist_page = 'yantian/';
var lastPage = false;

var userAgent = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11'
]

var proxy = process.env.http_proxy || "http://171.36.180.204:8118/"


var i = 1;
var tmpI;
setInterval(function(){
    if(tmpI < i || !tmpI) {
        tmpI = i;
        if(i>1 || lastPage) {
            return;
        }
        getPage(i);
        i++;
    }
},5000)

function getPage(i) {
    dist_page = 'yantian-p' + i + '/';
return superagent
      .get(process.argv[2] || url + dist_page)
      .proxy(proxy)
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36')
      .end(function(err, res) {
        if(err) {
            return console.log(err.stack);
        }
        // filterHtml(res.text);
        fs.writeFile('yantian'+ i +'.html', res.text, function(err) {
             console.log(dist_page);
            if (err) {
                console.log('出现错误!')
            }
            console.log('已输出至yantian'+i);
        }) ;
        console.log(url + dist_page);
    });    
}

for(var i = 1; i < 2; i++) {
// 设置编码格式
fs.readFile('./yantian'+i+'.html', 'utf-8', function(err, data) {
    // 读取文件失败/错误
    if (err) {
        throw err;
    }
    // console.log(data);
    filterHtml(data);
});
}


function filterHtml(html) {
    var $ = cheerio.load(html);
    var xzlList = [];
    var listItem = $('.list-item');
    console.log('h');
    listItem.each(function() {
        var ajk_url = 'https://sz.xzl.anjuke.com' + $(this).attr('link');
        console.log(ajk_url);
        var ele = $(this).find('.item-info');
        var name = ele.find('.item-title a').text();
        // console.log(name);
        var _address = ele.find('.address').text();
        var dist = _address.split('-');
        var district = dist[0].slice(1);
        var sub_dist = dist[1].split(']')[0];
        var address = '深圳市' + district + sub_dist + dist[1].split(']')[1].trim() + name;

        var _type = ele.find('.address').next().text();
        var typeStar = _type.split('').splice(3).join('').split('(');
        var type = typeStar[0];
        var star = typeStar[1].slice(0, -1);
        // console.log(star);

        var _birth_year = ele.find('dd span').first().text();
        var birth_year = parseInt(_birth_year.slice(5));
        if(isNaN(birth_year)) {
            birth_year = 0;
        }

        var _level = ele.find('dd span').first().next().next().text();
        var level = parseInt(_level.slice(3));
        if(isNaN(level)) {
            level = 0;
        }

        var _property_fee = ele.find('dd span').last().text();
        var property_fee = parseFloat(_property_fee.slice(3));
        if(isNaN(property_fee)) {
            property_fee = 0;
        }

        var _rent_fee = $(this).find('.item-price>span>em').text();
        var rent_fee = parseFloat(_rent_fee);
        if(isNaN(rent_fee)) {
            rent_fee = 0;
        }

        var sql = ["'"+name+"'", "'"+address+"'", "'"+district+"'", "'"+sub_dist+"'", "'"+type+"'", "'"+star+"'", birth_year, level, property_fee, rent_fee, "'"+ajk_url+"'"];
        database.insertInfo(sql, function(err, retData) {
            if(err) {
                return console.log(err);
            }
        })
    });
    var nextPage = $('.iNxt')
    if(nextPage.prev().attr('class') == 'curr') {
        lastPage = true;
    }
}

function numInStr(str) {
    var num;
    if(str) {
        var a = str.split('');
        var b = [];
        for(var i = 0; i < a.length; i++) {
            if(typeof a[i] == number) {
                b.push(a[i]);
            }
        }
        num = b.join('');
    }
    return num;
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
        return;
    }
  }