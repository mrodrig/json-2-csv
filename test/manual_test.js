let converter = require('../src/converter');

let documents =  [
        {"eventId": 185919,
            "productId": 1,
            "productName": "ABC",
            "cId": "10696e00-dcd5-11e8-9075-0e75adsh",
            "apiName": "Search",
            "userId": 10000001,
            "logSource": "get:/search/data",
            "logLevel": "Activity",
            "logType": "Success",
            "dateCreated": "2018-10-31T07:40:01",
            "processingTimeMs": 309,
            "clientAddress": "111.00.00.000",
            "message": {type: "Search", countries: "nl", query:{}}
        },
        {
            "eventId": 185920,
            "productId": 1,
            "productName": "Search",
            "cId": "10232e00-dcd5-11e8-9075-0p75adsh",
            "apiName": "Search",
            "userId": 100000002,
            "logSource": "/get:\\/companies:data.xml:113 (HttpException)",
            "logLevel": "Activity",
            "logType": "Exception",
            "dateCreated": "2018-10-31T05:19:46",
            "processingTimeMs": 385,
            "clientAddress": "111.00.00.000",
            "message": {orderType: "Search", countries: "nl", query:{pageSize: "10]", tradeName: "apple", page: "1"}}
        },
        {
            "eventId": 185921,
            "productId": 1,
            "productName": "Search",
            "cId": "10985e00-dcd5-11e8-9075-0p750dsh",
            "apiName": "search",
            "userId": 100000005,
            "logSource": "/get:\\/companies:data.xml:113 (HttpException)",
            "logLevel": "Activity",
            "logType": "Exception",
            "dateCreated": "2018-10-31T07:19:55",
            "processingTimeMs": 237,
            "clientAddress": "111.00.00.000",
            "message": {orderType: "Search", countries: "nl", query:{pageSize: "10", tradeName: "apple", page: "1"}}
        },
        {
            "eventId": 185922,
            "productId": 1,
            "productName": "Search",
            "cId": null,
            "apiName": "search",
            "userId": 1000000008,
            "logSource": "get:/companies",
            "logLevel": "Activity",
            "logType": "Success",
            "dateCreated": "2018-10-31T08:20:02",
            "processingTimeMs": 585,
            "clientAddress": "111.00.00.000",
            "message": {orderType: "Search", countries: "nl", query:{tradeName :"apple", name: "apple", pageSize: "10", page: "1", id: null, type: null}, totalResults: 372}
        },
        {
            "eventId": 185923,
            "productId": 1,
            "productName": "Search",
            "cId": "015l5170-eryt-11e8-9075-06yusdb427c2",
            "apiName": "search",
            "userId": 1000000002,
            "logSource": "/get:\\/companies:data.xml:113 (HttpException)",
            "logLevel": "Activity",
            "logType": "Exception",
            "dateCreated": "2018-10-31T08:20:17",
            "processingTimeMs": 201,
            "clientAddress": "111.00.00.000",
            "message": {orderType: "Search", countries: "fr", query: {pageSize: "10", tradeName: "apple", page: "1"}}
        },
        {
            "eventId": 185924,
            "productId": 1,
            "productName": "Search",
            "cId": null,
            "apiName": "search",
            "userId": 1000000008,
            "logSource": "get:/companies",
            "logLevel": "Activity",
            "logType": "Success",
            "dateCreated": "2018-10-31T06:20:31",
            "processingTimeMs": 339,
            "clientAddress": "111.00.00.000",
            "message": {orderType: "Search", countries: "fr", query: {tradeName: "apple", name: "apple", pageSize:"10", page:"1", id:null, type:null}, totalResults:599}
        },
        {
            "eventId": 185925,
            "productId": 1,
            "productName": "Search",
            "cId": "10677e00-dcd5-11e8-9075-0p75adsh",
            "apiName": "cs-ggs-p-search",
            "userId": 100000008,
            "logSource": "/get:\\/companies:data.xml:113 (HttpException)",
            "logLevel": "Activity",
            "logType": "Exception",
            "dateCreated": "2018-10-31T06:20:38",
            "processingTimeMs": 120,
            "clientAddress": "111.93.14.242",
            "message": {orderType: "Search", countries: "fr", query:{pageSize: 10,tradeName:"apple",page:"1"}}
        }
    ];

let json2csvCallback = function (err, csv) {
    if (err) throw err;
    console.log(csv);
};

converter.json2csv(documents, json2csvCallback);