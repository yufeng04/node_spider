var database = require('./szgjj.js');

var baiduMap = require('baidumap');
var bdmap = baiduMap.create({ 'ak': 'ijeNGcdnqAj9v06I9L989Rs5xcohB9LY' });

// 请求数据
var lngLatData;
var geocoderOption;

var i = 1;
var tmpI;
setInterval(function() {
    if(i>470) {
        return;
    }
    if(tmpI < i || !tmpI) {
        let sql = ['address, _name', 'ajk_newxq', '_index='+i];
        tmpI = i;
        database.queryData(sql, function (error, retData) {
            if (error) {
                console.log(error);
            }
            else {
                // address = JSON.stringify(retData);
                // console.log(typeof retData);
                console.log(retData[0].address + retData[0]._name);
                geocoderOption = { 'address': retData[0].address + retData[0]._name, 'city': '深圳市' };
                console.log(i);
                getLngLat(i);
                i++;
            }
    
        }); 
    }
},200)



function getLngLat(a) { 
   return bdmap.geocoder(geocoderOption, function (err, result) {
        if (err) {
            console.log('地址错误！')
            database.updateData([0,0,1,a],function (err, retData) {
                if(err) {
                    console.log(err);
                }
            });
            console.log(err);
        }
       else {
           data = JSON.parse(result);
           console.log(data.result);
           if (data.result && data.result.location && data.result.location.lng
               && data.result.location.lng>113 && data.result.location.lng<115
               && data.result.location.lat>22 && data.result.location.lat<23) {
               console.log("处理返回数据！"); 
               lngLatData = [];
               lngLatData.push(data.result.location.lng);
               lngLatData.push(data.result.location.lat);
               lngLatData.push(a);
               if (lngLatData && lngLatData.length) {
                   database.insertData(lngLatData, function (err, retData) {
                       if (err) {
                           console.log(err);
                       }
                   });
               }
           }
           else {
               console.log("返回数据错误！");
               database.updateData([0,0,1,a],function (err, retData) {
                   if(err) {
                       console.log(err);
                   }
               });
           }
       }
   })
}
