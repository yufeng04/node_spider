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
    if(i>1) {
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
        console.log(c);
        // var url = 'http://esf.fangdd.com/shenzhen/xiaoqu_s1348_pa'+ c;
        // var url = 'https://sz.fang.anjuke.com/loupan/all/p2_w5/'
        // var url = 'https://sz.fang.anjuke.com/loupan/dapengxinqu/' + (c>1?('p'+c + '_'):'') +'w1/'
        var url = 'https://sz.fang.anjuke.com/loupan/canshu-250724.html';
        getPage(c,url);
    }
    else {
        console.log("fail in"+" "+i);
        var sql = [1,1,1,1,1,1,1,1];
        // database.insertInfo(sql, function(err, ret) {
        //     if(err) { console.log(err)};
        // })
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
            // filterHtml(a,res.text);
            fs.writeFile('_index' + a + '.html', res.text, function (err) {
                if (err) {
                    console.log('出现错误!')
                }
                console.log('已输出至_index' + a);
                // 设置编码格式
                // fs.readFile('./_index'+a+'.html', 'utf-8', function(err, data) {
                //     // 读取文件失败/错误
                //     if (err) {
                //         throw err;
                //     }
                //     filterHtml(a,data);
                // });
            });
        });
}

function filterHtml(b, data) {
    console.log("获取到页面！")
    var $ = cheerio.load(data);
    var mod = $('div.key-list').find('.item-mod');
    if (mod.length) {
        console.log("解析页面！");
        i++;
        var _name,dist, sub_dist, address, type, price, label, ajk_url;
        mod.each(function () {
            var ele = $(this);
            if(ele.find('.items-name').text().trim()=='') {
                return true;
            }
            var _name = ele.find('.items-name').text().trim();
            console.log(_name);

            var _address = ele.find('.address').find('.list-map');
            var tmp_adds = _address.text().trim();
            var _dist = tmp_adds.split(/\s{1}/);
            dist = _dist[1];
            sub_dist = _dist[2];
            address = dist + sub_dist + _dist[4];
            console.log(address);

            // var _area = ele.find('.huxing').text().trim();
            // area = _area.split('：')[1];
            // area = parseInt(area);
            // if(isNaN(area)) { area = 0;}
            // console.log(area);
            var _type = ele.find('.huxing').find('span');
            type = '';
            for(let i = 0; i < _type.length; i++) {
                type += $(_type[i]).text().trim();
            }
            console.log(type);

            var label1 = ele.find('.tag-panel').find('i');
            label = '';
            for(let i = 0; i < label1.length; i++) {
                label += $(label1[i]).text().trim();
            }
            var label2 = ele.find('.tag-panel').find('.tag');
            for(let i = 0; i < label2.length; i++) {
                label += $(label2[i]).text().trim();
            }
            console.log(label);

            if(ele.find('.price').find('span').text()) {
                price = ele.find('.price').find('span').text();
                price = parseInt(price);
            }
            else if(ele.find('.around-price').find('span').text()) {
                price = ele.find('.around-price').find('span').text();
                price = parseInt(price);
            }
            else {
                price = 0;
            }
            console.log(price);

            ajk_url = ele.attr('data-link').trim();
            console.log(ajk_url);

            var sql = ["'" + dist + "'", "'" + sub_dist + "'", "'" + type + "'", "'" + label + "'","'" + _name + "'", "'" + address + "'", price, "'" + ajk_url + "'"];
            database.insertInfo(sql, function (err, ret) {
                if (err) { console.log(err) };
            })
        });
    }else {
        console.log('页面错误！');
        queryAdds(b);
    }
}