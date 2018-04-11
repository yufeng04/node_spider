var https = require('https');
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
    if(i>470) {
        console.log('结束');
        failPage = [];
        clearInterval(timer);
        return;
    }
    if(tmpI < i || !tmpI) {
        tmpI = i;
        failTimes = 20;
        queryAdds(i);
    }
},2000);

function queryAdds(c) {
    if(failTimes>0) {
        failTimes--;
        var sql = ['ajk_url', 'ajk_newxq', '_index='+c];
        database.queryData(sql,function(err, ret) {
            if(err) {
                console.log(err);
            }
            else {
                console.log(c);
                var url = 'https://sz.fang.anjuke.com/loupan/canshu-' + ret[0].ajk_url.slice(34);
                getPage(c,url);
            }
        })
    }
    else {
        console.log("fail in"+" "+i);
        var sql = [i,1,1,1];
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
    var mod = $('div.can-left').find('.can-item');
    if (mod.length) {
        console.log("解析页面！");
        i++;
        var openDay,houseDay,house;
        mod.each(function (k,data) {
            var ele = $(data);
            if(k==1) {
                var list = ele.find('.list').find('li');
                for(let i = 0; i < list.length; i++) {
                    var tmp = $(list[i]).find('.name').text().trim();
                    if(tmp == '最新开盘') {
                        openDay = $(list[i]).find('.des').text().trim();
                        if(openDay == '暂无数据') { openDay = '0-0-0'; }
                        console.log(openDay);
                    }
                    if(tmp == '交房时间') {
                        houseDay = $(list[i]).find('.des').text().trim();
                        if(houseDay == '暂无数据') { houseDay = '0-0-0'; }
                        console.log(houseDay);
                    }
                }
            }

            if(k==2) {
                var list = ele.find('.list').find('li');
                for(let i = 0; i < list.length; i++) {
                    var tmp = $(list[i]).find('.name').text().trim();
                    if(tmp == '规划户数') {
                        house = $(list[i]).find('.des').text();
                        house = parseInt(house);
                        if(isNaN(house)) { house=0 }
                        console.log(house);
                    }
                }
            }
        });
        var sql = [b,  openDay,houseDay, house];
        database.updateBuidingDetail(sql, function (err, ret) {
            if (err) { console.log(err) };
        })
    } else {
        console.log('页面错误！');
        queryAdds(b);
    }
}

// function filterHtml(b, data) {
//     console.log("获取到页面！")
//     var $ = cheerio.load(data);
//     var mod = $('ul.param-detail-mod.clearfix');
//     if(mod.length) {
//         console.log("解析页面！");
//         i++;
//         var park_fee, parking_space, area, bz_area, floor_height, real_fheight, hall_height, kj_area;
//         mod.each(function(k,data) {
//             var ele = $(data);
//             if(k == 1) {
//                 var li_Item = ele.find('li');
//                 park_fee = $(li_Item[6]).find('span').text();
//                 park_fee = parseFloat(park_fee);
//                 if(isNaN(park_fee)) {park_fee = 0};
                
//                 sup_park = $(li_Item[7]).find('span').text();
//                 sup_park = parseInt(sup_park);
//                 if(isNaN(sup_park)) {sup_park = 0};

//                 sub_park = $(li_Item[9]).find('span').text();
//                 sub_park = parseInt(sub_park);
//                 if(isNaN(sub_park)) {sub_park = 0};
//                 parking_space = sup_park + sub_park;             
//             }
//             if(k == 2) {
//                 var li_Item = ele.find('li');
//                 area = $(li_Item[2]).find('span').text();
//                 area = parseInt(area);
//                 if(isNaN(area)) {area = 0};

//                 bz_area = $(li_Item[3]).find('span').text();
//                 bz_area = parseInt(bz_area);
//                 if(isNaN(bz_area)) {bz_area = 0};

//                 floor_height = $(li_Item[5]).find('span').text();
//                 floor_height = parseFloat(floor_height);
//                 if(isNaN(floor_height)) {floor_height = 0};

//                 real_fheight = $(li_Item[7]).find('span').text();
//                 real_fheight = parseFloat(real_fheight);
//                 if(isNaN(real_fheight)) {real_fheight = 0};

//                 hall_height = $(li_Item[9]).find('span').text();
//                 hall_height = parseFloat(hall_height);
//                 if(isNaN(hall_height)) {hall_height = 0};

//                 kj_area = $(li_Item[11]).find('span').text();
//                 kj_area = parseInt(kj_area);
//                 if(isNaN(kj_area)) {kj_area = 0};
//             }   
//         });
//         var sql = [b, park_fee, parking_space, area, bz_area, floor_height, real_fheight, hall_height, kj_area];
//         database.updateBuidingDetail(sql, function(err, ret) {
//             if(err) { console.log(err)};
//         })
//     }else {
//         console.log('页面错误！');
//         queryAdds(b);
//     }
// }
