// fileSystem
var fs = require('fs');

// express
var express = require('express'),
    path = require("path"),
    app = express(),
    fileUpload = require('express-fileupload');

//파일 업로더
app.use(fileUpload());

//static폴더
app.use(express.static(path.join(__dirname, "/public")))
app.use(express.static('js/lib'));

//ejs 렌더링
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

var cookie = require('cookie-parser');
app.use(cookie('!@#%%@#@'));

// request 모듈
var request = require('request');

//xml -> json
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var REST_API_ADDRESS = 'http://172.30.50.28:3000/api/';

// 엑셀 데이터 json으로 변환
node_xj = require("xls-to-json");


// 회사 목록 블록체인에 넣기.
app.get('/registerCompany', function(req, res) {
    node_xj({
        input: "wrb.xlsx", // input xlsx 
        output: "output.json", // output json 
        sheet: "Company" // specific sheetname 
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            // inputBlockChain(result, res, req);
            result[0].insuJoinDate = new Date().toJSON();

            var options = {
                url: REST_API_ADDRESS + 'Company',
                method: 'POST',
                json: result[0]
            };

            request(options, function(error, response, body) {
                if (error || response.statusCode != 200) {
                    response = makeResponse(0, "블록체인에 접근 실패", {});
                    res.json(response);
                }
                response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
                res.json(response);
            });
        }
    });
});



// 임직원 목록 블록체인에 넣기.
app.get('/registerEmployee', function(req, res) {
    node_xj({
        input: "wrb.xlsx", // input xlsx 
        output: "output.json", // output json 
        sheet: "employee" // specific sheetname 
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            inputBlockChain(result, res, req);
        }
    });
});

// 출퇴근 기록 넣기
app.get('/History', function(req, res) {
    node_xj({
        input: "wrb.xlsx", // input xlsx 
        output: "output2.json", // output json 
        sheet: "History" // specific sheetname 
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            inputBlockChain2(result, res, req);
        }
    });
});

// 모든 블록을 계산해서 실패블록인지 성공블록인지 구한다.
app.get('/evalAllHistory', function(req, res) {

    var nowTime = new Date();

    var requestData = {
        "$class": "org.acme.wrb.evalAllHistory",
        "timestamp": nowTime.toJSON()
    }

    var options = {
        url: REST_API_ADDRESS + 'evalAllHistory',
        method: 'POST',
        json: requestData
    };

    request(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            response = makeResponse(0, "블록체인에 접근 실패", {});
            res.json(response);
        }
    });

    response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
    res.json(response);
});

// 전 직원 쿼리 해서 리스트에 넣고 그 리스트를 통해서 evalfailRateEmployee 함수 호출하기.
// 전 직원들의 워라밸근무실패율을 구함.
app.get('/allFailEval', function(req, res) {
    var url = REST_API_ADDRESS + "employee";
    request(url, function(error, response, body) {
        // console.log('"' + body + '"');
        var jsonArray = JSON.parse(body);
        var length = Object.keys(jsonArray).length
        for (var i = 0; i < length; i++) {
            //1차 여기서 시도
            evalfailRateEmployee(jsonArray[i].ID);
        }
    });
    response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
    res.json(response);
});

function evalfailRateEmployee(employeeID) {
    console.log(employeeID);

    // 블록체인 호출
    var nowTime = new Date();

    var requestJson = {
        "$class": "org.acme.wrb.evalfailRateEmployee",
        "employeeID": employeeID,
        "timestamp": nowTime.toJSON()
    }

    var options = {
        url: REST_API_ADDRESS + 'evalfailRateEmployee',
        method: 'POST',
        json: requestJson
    };

    request(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            response = makeResponse(0, "블록체인에 접근 실패", {});
            res.json(response);
        }
    });
}




// 모든 임직원에 대한 benefitRate를 구한다.
app.get('/evalbenefitRate', function(req, res) {

    var nowTime = new Date();

    var requestData = {
        "$class": "org.acme.wrb.evalbenefitRate",
        "timestamp": nowTime.toJSON()
    }

    var options = {
        url: REST_API_ADDRESS + 'evalbenefitRate',
        method: 'POST',
        json: requestData
    };

    request(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            response = makeResponse(0, "블록체인에 접근 실패", {});
            res.json(response);
        }
    });

    response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
    res.json(response);
});



// 모든 직원의 워라밸포인트를 계산한다.
app.get('/evalWLBPoint', function(req, res) {

    var nowTime = new Date();

    var requestData = {
        "$class": "org.acme.wrb.evalWLBPoint",
        "timestamp": nowTime.toJSON()
    }
    console.log(requestData);
    var options = {
        url: REST_API_ADDRESS + 'evalWLBPoint',
        method: 'POST',
        json: requestData
    };

    request(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            console.log(response.statusCode)
            response = makeResponse(0, "블록체인에 접근 실패", {});
            res.json(response);
        } else {
            response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
            res.json(response);
        }
    });

});


// 기업보험할인혜택적용금액을 구한다.
app.get('/evalCompanyBenefit', function(req, res) {

    var nowTime = new Date();

    var requestData = {
        "company": "20171126-0672",
        "$class": "org.acme.wrb.evalCompanyBenefit",
        "timestamp": nowTime.toJSON()
    }
    console.log(requestData);
    var options = {
        url: REST_API_ADDRESS + 'evalCompanyBenefit',
        method: 'POST',
        json: requestData
    };

    request(options, function(error, response, body) {
        if (error || response.statusCode != 200) {
            console.log(response.statusCode)
            response = makeResponse(0, "블록체인에 접근 실패", {});
            res.json(response);
        } else {
            response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
            res.json(response);
        }
    });

});






//첫 화면
app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(3000, function() {
    console.log("Server listening on http://localhost:3000");
});

// 리스폰스 만드는 함수
function makeResponse(status, message, data) {
    var response = {
        status: status,
        message: message
    };

    for (var key in data) {
        response[key] = data[key];
    }
    return response;
}



// 임직원 정보넣기
function inputBlockChain(jsonDataArray, res, req) {

    for (var i = 0; i < jsonDataArray.length; i++) {
        var options = {
            url: REST_API_ADDRESS + 'employee',
            method: 'POST',
            json: jsonDataArray[i]
        };

        request(options, function(error, response, body) {
            if (error || response.statusCode != 200) {
                response = makeResponse(0, "블록체인에 접근 실패", {});
                res.json(response);
            }
        });
    }
    response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
    res.json(response);
}


// 출퇴근 기록(History) 넣기
function inputBlockChain2(jsonDataArray, res, req) {

    for (var i = 0; i < jsonDataArray.length; i++) {
        var options = {
            url: REST_API_ADDRESS + 'History',
            method: 'POST',
            json: jsonDataArray[i]
        };

        request(options, function(error, response, body) {
            if (error || response.statusCode != 200) {
                response = makeResponse(0, "블록체인에 접근 실패", {});
                res.json(response);
            }
        });
    }
    response = makeResponse(1, "모든 로직이 정상처리 되었습니다.", {});
    res.json(response);
}