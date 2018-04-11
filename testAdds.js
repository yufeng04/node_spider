var database = require('./testData.js');

var baiduMap = require('baidumap');
var bdmap = baiduMap.create({ 'ak': 'ijeNGcdnqAj9v06I9L989Rs5xcohB9LY' });

// 请求数据
var lngLatData;
var geocoderOption1;
var geocoderOption2;

var i = 1;
var tmpI;
setInterval(function() {
    if(i>3) {
        return;
    }
    if(tmpI < i || !tmpI) {
        let sql = ['firm_adds, station_adds', 'gjj', '_index='+i];
        tmpI = i;
        database.queryData(sql, function (error, retData) {
            if (error) {
                console.log(error);
            }
            else {
                // address = JSON.stringify(retData);
                // console.log(typeof retData);
                console.log(retData[0].firm_adds.trim() + retData[0].station_adds.trim());
                geocoderOption1 = { 'address':retData[0].firm_adds.trim(), 'city': '' };
                geocoderOption2 = { 'address':retData[0].station_adds.trim(), 'city': ''};
                console.log(i);
                getLngLat1(i);
                getLngLat2(i);
                i++;
            }
    
        }); 
    }
},200)



function getLngLat1(a) { 
   return bdmap.geocoder(geocoderOption1, function (err, result) {
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

function getLngLat2(a) { 
    return bdmap.geocoder(geocoderOption2, function (err, result) {
         if (err) {
             console.log('地址错误！')
             database.updateStation([0,0,1,a],function (err, retData) {
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
                    database.insertStation(lngLatData, function (err, retData) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
            else {
                console.log("返回数据错误！");
                database.updateStation([0,0,1,a],function (err, retData) {
                    if(err) {
                        console.log(err);
                    }
                });
            }
        }
    })
 }
