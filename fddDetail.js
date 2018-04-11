var cheerio = require('cheerio');// 采用jQuery语法解析html元素
var superagent = require('superagent');//模拟浏览器登录
require('superagent-proxy')(superagent);//ip代理
var fs = require('fs');
var database = require('./szgjj.js');
//更换 user-agent
var userAgent = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
    'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.17 Safari/537.11',
    'Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11',
    'Mozilla/5.0 (Windows NT 5.2; WOW64) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7',
    'Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.2 (KHTML, like Gecko) Ubuntu/11.10 Chromium/15.0.874.120 Chrome/15.0.874.120 Safari/535.2',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.861.0 Safari/535.2',
]
// 代理
var IP = ["http://122.72.18.35:80/","http://122.72.18.61:80/",
          "http://122.72.18.34:80/"];

// 查询url
var i = 1;
var tmpI;
// 设置失败次数，没拿到则进行下一条
var failTimes;
var timer = setInterval(function(){
    if(i>3293) {
        console.log('结束');
        clearInterval(timer);
        return;
    }
    if(tmpI < i || !tmpI) {
        tmpI = i;
        failTimes = 20;
        queryAdds(i);
    }
},1000);

function queryAdds(c) {
    if(failTimes>0) {
        failTimes--;
        var sql = ['fdd_url', 'fdd_xq', '_index='+c];
        database.queryData(sql,function(err, ret) {
            if(err) {
                console.log(err);
            }
            else {
                console.log(c);
                var url = ret[0].fdd_url;
                getPage(c,url);
            }
        })
    }
    else {
        console.log("fail in"+" "+i);
        var sql = [i,1,1,1,1,1];
        database.updateBuidingDetail(sql, function(err, ret) {
            if(err) { console.log(err)};
        })
        i++;
    }
}


function getPage(a, url) {
    var random = Math.floor(IP.length*Math.random());
    var proxy = process.env.http_proxy || IP[random];
    console.log(url);
    console.log(IP[random]);
    superagent
        .get(process.argv[2] || url)
        .proxy(proxy)
        .set('User-Agent', userAgent[a%userAgent.length])
        .end(function (err, res) {
            if (err) {
                queryAdds(a);
                return console.log(err.stack);
            }
            filterHtml(a,res.text);
            // fs.writeFile('_index' + a + '.html', res.text, function (err) {
            //     if (err) {
            //         console.log('出现错误!')
            //     }
            //     console.log('已输出至_index' + a);
            //     // 设置编码格式
            //     fs.readFile('./_index'+a+'.html', 'utf-8', function(err, data) {
            //         // 读取文件失败/错误
            //         if (err) {
            //             throw err;
            //         }
            //         filterHtml(a,data);
            //     });
            // });
        });
}

function filterHtml(b, data) {
    console.log("获取到页面！")
    var $ = cheerio.load(data);
    var box = $('div.cell-detail-info-box');
    if(box.length) {
        console.log("解析页面！");
        i++;
        var total_house, property_fee, plot_rate, developer, green_rate;
        var box_left = $('ul.cell-detail-info-left');
        box_left.each(function() {
            var ele = $(this);
            var leftItem = ele.find('.cell-detail-info-li');
            var _developer = $(leftItem[2]).text().trim();
            developer = _developer.slice(4);
            // console.log(developer);

            var _total_house = $(leftItem[4]).text().trim();
            total_house = _total_house.slice(4,-1);
            total_house = parseInt(total_house);
            if(isNaN(total_house)) { total_house = 0};
            // console.log(total_house);    
        });
        
        var box_right = $('ul.cell-detail-info-right');
        box_right.each(function() {
            var r_ele = $(this);
            var rightItem = r_ele.find('.cell-detail-info-li');
            var _plot_rate = $(rightItem[0]).text().trim();
            plot_rate = _plot_rate.slice(4);
            plot_rate = parseFloat(plot_rate);
            if(isNaN(plot_rate)) { plot_rate = 0};
            // console.log(plot_rate);

            var _green_rate = $(rightItem[1]).text().trim();
            green_rate = _green_rate.slice(4,-1);
            green_rate = parseInt(green_rate)
            if(isNaN(green_rate)) { green_rate = 0} else { green_rate = green_rate/100};
            // console.log(green_rate);

            var _property_fee = $(rightItem[3]).text().trim();
            property_fee = _property_fee.slice(4);
            property_fee = parseFloat(property_fee);
            if(isNaN(property_fee)) { property_fee = 0};
            // console.log(property_fee);

            // park_space = $(rightItem[4]).text().trim();
            // console.log(park_space);

        });

        var sql = [b, total_house, property_fee, plot_rate, developer, green_rate];
        console.log(sql)
        database.updateBuidingDetail(sql, function(err, ret) {
            if(err) { console.log(err)};
        })
    }else {
        console.log('页面错误！');
        queryAdds(b);
    }
}