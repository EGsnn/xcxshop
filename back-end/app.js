let express = require('express');
let bodyParser = require('body-parser');
require("body-parser-xml")(bodyParser);

let path = require('path');
let session = require('express-session');
let router = require('./routes/router');

let port = process.env.PORT || 9999;
let app = express();

var request = require('request');



app.use(session({
    secret: 'fuckupig',
    cookie: {maxAge: 3600000},
    resave: true,
    saveUninitialized: true,
}));



app.use(function(req, res, next){
    //设置跨域访问
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    // console.log(req.url === '/api/order/pay/notify' );
    if (req.url === '/api/order/pay/notify') {
        req.headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    if (req.method == 'OPTIONS') {
        res.send(200); /*让options请求快速返回*/
    }else {
        next();
    }
})


app.use(bodyParser.xml({
    limit: "1MB",   // Reject payload bigger than 1 MB
    xmlParseOptions: {
        normalize: true,     // Trim whitespace inside text nodes
        normalizeTags: true, // Transform tags to lowercase
        explicitArray: false // Only put nodes in array if >1
    },
    verify: function(req, res, buf, encoding) {
        console.log(buf);
        if(buf && buf.length) {
        // Store the raw XML
        req.rawBody = buf.toString(encoding || "utf8");
        }
    }
}));
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.use(router);

app.listen(port, () => {
    console.log(`devServer start on port:${ port}`);
});