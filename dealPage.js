/*
 *解析安居客新写字楼页面
 *
*/

var cheerio = require('cheerio');// 采用jQuery语法解析html元素
var fs = require('fs');
var database = require('./szgjj.js');

for(let a = 1; a <2; a++) {
    fs.readFile('./_index' + a + '.html', 'utf-8', function (err, data) {
        // 读取文件失败/错误
        if (err) {
            throw err;
        }
        filterHtml(a, data);
    });
}


function filterHtml(b, data) {
    console.log("获取到页面！")
    var $ = cheerio.load(data);
    var mod = $('div.can-left').find('.can-item');
    if (mod.length) {
        console.log("解析页面！");
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

            // var sql = ["'" + dist + "'", "'" + sub_dist + "'", "'" + label + "'","'" + _name + "'", "'" + address + "'", price, area, "'" + ajk_url + "'"];
            // database.insertInfo(sql, function (err, ret) {
            //     if (err) { console.log(err) };
            // })
        });
    } else {
        console.log('页面错误！');
        // queryAdds(b);
    }
}

// function filterHtml(b, data) {
//     console.log("获取到页面！")
//     var $ = cheerio.load(data);
//     var mod = $('div.key-list').find('.item-mod');
//     if (mod.length) {
//         console.log("解析页面！");
//         var _name,dist, sub_dist, address, type, price, label, ajk_url;
//         mod.each(function () {
//             var ele = $(this);
//             if(ele.find('.items-name').text().trim()=='') {
//                 return true;
//             }
//             var _name = ele.find('.items-name').text().trim();
//             console.log(_name);

//             var _address = ele.find('.address').find('.list-map');
//             var tmp_adds = _address.text().trim();
//             var _dist = tmp_adds.split(/\s{1}/);
//             dist = _dist[1];
//             sub_dist = _dist[2];
//             address = dist + sub_dist + _dist[4];
//             console.log(address);

//             // var _area = ele.find('.huxing').text().trim();
//             // area = _area.split('：')[1];
//             // area = parseInt(area);
//             // if(isNaN(area)) { area = 0;}
//             // console.log(area);
//             var _type = ele.find('.huxing').find('span');
//             type = '';
//             for(let i = 0; i < _type.length; i++) {
//                 type += $(_type[i]).text().trim();
//             }
//             console.log(type);

//             var label1 = ele.find('.tag-panel').find('i');
//             label = '';
//             for(let i = 0; i < label1.length; i++) {
//                 label += $(label1[i]).text().trim();
//             }
//             var label2 = ele.find('.tag-panel').find('.tag');
//             for(let i = 0; i < label2.length; i++) {
//                 label += $(label2[i]).text().trim();
//             }
//             console.log(label);

//             if(ele.find('.price').find('span').text()) {
//                 price = ele.find('.price').find('span').text();
//                 price = parseInt(price);
//             }
//             else if(ele.find('.around-price').find('span').text()) {
//                 price = ele.find('.around-price').find('span').text();
//                 price = parseInt(price);
//             }
//             else {
//                 price = 0;
//             }
//             console.log(price);

//             ajk_url = ele.attr('data-link').trim();
//             console.log(ajk_url);

//             // var sql = ["'" + dist + "'", "'" + sub_dist + "'", "'" + label + "'","'" + _name + "'", "'" + address + "'", price, area, "'" + ajk_url + "'"];
//             // database.insertInfo(sql, function (err, ret) {
//             //     if (err) { console.log(err) };
//             // })
//         });
//     } else {
//         console.log('页面错误！');
//         // queryAdds(b);
//     }
// }