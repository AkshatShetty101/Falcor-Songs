var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var falcorExpress = require('falcor-express');
var falcor = require('falcor');

global.async = require('async');
global.$ref = falcor.Model.ref;
global.model = new falcor.Model({
    cache: {
        temp: [],
        songList: [],
        imgList: []
    }
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var CronJob = require('cron').CronJob;
var job = new CronJob({
    cronTime: '00 */2 * * * *', // Every 2 mins
    onTick: require('./utils/sync'),
    start: true,
    runOnInit: true
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(fileupload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
    return model.asDataSource();
}));
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;