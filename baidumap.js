var baiduMap = require('baidumap');
var bdmap = baiduMap.create({'ak':'ijeNGcdnqAj9v06I9L989Rs5xcohB9LY'});

var geocoderOption = {'address':'北京东城区方家胡同','city':'', 'callback':'showMap'};
bdmap.geocoder(geocoderOption,function(err,result){
    if(err) {
        console.log(err);
    }
    else{
        console.log(result);
    }
});