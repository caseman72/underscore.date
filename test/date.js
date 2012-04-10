/**************************************************
  Node ... uncomment this out for node.js
 *************************************************/

//var _date, _;
//if (typeof window === 'undefined') {
//    _date = require('underscore.date');
//    module = QUnit.module;
//    _ = { date : _date };
//}


/**************************************************
  Tests
 *************************************************/

module("create");


test("array", 8, function() {
    ok(_date([2010]).date instanceof Date, "[2010]");
    ok(_date([2010, 1]).date instanceof Date, "[2010, 1]");
    ok(_date([2010, 1, 12]).date instanceof Date, "[2010, 1, 12]");
    ok(_date([2010, 1, 12, 1]).date instanceof Date, "[2010, 1, 12, 1]");
    ok(_date([2010, 1, 12, 1, 1]).date instanceof Date, "[2010, 1, 12, 1, 1]");
    ok(_date([2010, 1, 12, 1, 1, 1]).date instanceof Date, "[2010, 1, 12, 1, 1, 1]");
    ok(_date([2010, 1, 12, 1, 1, 1, 1]).date instanceof Date, "[2010, 1, 12, 1, 1, 1, 1]");
    deepEqual(_date(new Date(2010, 1, 14, 15, 25, 50, 125)), _date([2010, 1, 14, 15, 25, 50, 125]), "constructing with array === constructing with new Date()");
});


test("date", 1, function() {
    ok(_date(new Date()).date instanceof Date, "new Date()");
});


test("_date", 2, function() {
    ok(_date(_date()).date instanceof Date, "_date(_date())");
    ok(_date(_date(_date())).date instanceof Date, "_date(_date(_date()))");
});

test("undefined", 1, function() {
    ok(_date().date instanceof Date, "undefined");
});


test("string without format", 2, function() {
    ok(_date("Aug 9, 1995").date instanceof Date, "Aug 9, 1995");
    ok(_date("Mon, 25 Dec 1995 13:30:00 GMT").date instanceof Date, "Mon, 25 Dec 1995 13:30:00 GMT");
});

test("isostring without format", 4, function() {
    equal(_date("2012-04-10T14:45:00+00:00").format("YYYY-MM-DD HH:mm:ss z"), "2012-04-10 07:45:00 PDT" , "2012-04-10T15:15:00+00:00");
    equal(_date("2012-04-10T14:45:00-07:00").format("YYYY-MM-DD HH:mm:ss z"), "2012-04-10 14:45:00 PDT" , "2012-04-10T15:15:00-07:00");

    _dt = _date("2012-04-10T14:45:00+00:00");
    equal(_dt.gmt().format("YYYY-MM-DD HH:mm:ss z"), "2012-04-10 14:45:00 PDT" , "2012-04-10T15:15:00+00:00");
    equal(_dt.format("YYYY-MM-DD HH:mm:ss z"), "2012-04-10 07:45:00 PDT" , "2012-04-10T15:15:00+00:00");
});

test("string with format", 11, function() {
    var a = [
            ['MM-DD-YYYY',         '12-02-1999'],
            ['DD-MM-YYYY',         '12-02-1999'],
            ['DD/MM/YYYY',         '12/02/1999'],
            ['DD_MM_YYYY',         '12_02_1999'],
            ['DD:MM:YYYY',         '12:02:1999'],
            ['D-M-YY',             '2-2-99'],
            ['YY',                 '99'],
            ['DDD-YYYY',           '300-1999'],
            ['DD-MM-YYYY h:m:s',   '12-02-1999 2:45:10'],
            ['DD-MM-YYYY h:m:s a', '12-02-1999 2:45:10 am'],
            ['DD-MM-YYYY h:m:s a', '12-02-1999 2:45:10 pm']
        ],
        i;
    for (i = 0; i < a.length; i++) {
        equal(_date(a[i][1], a[i][0]).format(a[i][0]), a[i][1], a[i][0] + ' ---> ' + a[i][1]);
    }
});

test("string with format - years", 2, function() {
    equal(_date('71', 'YY').format('YYYY'), '1971', '71 > 1971');
    equal(_date('69', 'YY').format('YYYY'), '2069', '69 > 2069');
});


module("format");


test("format", 15, function() {
    var a = [
            ['dddd, MMMM Do YYYY, h:mm:ss a',      'Sunday, February 14th 2010, 3:25:50 pm'],
            ['ddd, hA',                            'Sun, 3PM'],
            ['M Mo MM MMMM MMM',                   '2 2nd 02 February Feb'],
            ['YYYY YY',                            '2010 10'],
            ['D Do DD',                            '14 14th 14'],
            ['d do dddd ddd',                      '0 0th Sunday Sun'],
            ['DDD DDDo DDDD',                      '45 45th 045'],
            ['w wo ww',                            '8 8th 08'],
            ['h hh',                               '3 03'],
            ['H HH',                               '15 15'],
            ['m mm',                               '25 25'],
            ['s ss',                               '50 50'],
            ['a A',                                'pm PM'],
            ['z zz',                               'PST Pacific Standard Time', 'PST PST'],
            ['t\\he DDDo \\d\\ay of t\\he ye\\ar', 'the 45th day of the year']
        ],
        b = _date(new Date(2010, 1, 14, 15, 25, 50, 125)),
        i;
    for (i = 0; i < a.length; i++) {
        equal(b.format(a[i][0]), a[i][1], a[i][0] + ' ---> ' + a[i][1]);
    }
});


module("add and subtract");


test("add and subtract", 3, function() {
    equal(
        _date([2010, 1, 14, 15, 25, 50, 125]).add({ms:200,s:10,m:10,h:2,d:3,M:2,y:3}).format("MMMM Do YYYY, h:mm:ss a"),
        "April 17th 2013, 5:36:00 pm",
        "[2010, 1, 14, 15, 25, 50, 125] + {ms:200,s:10,m:10,h:2,d:3,M:2,y:3} = April 17th 2013, 5:36:00 pm"
    );
    equal(
        _date([2010, 0, 31]).add({M:1}).format("MMMM Do YYYY"),
        "February 28th 2010",
        "[2010, 0, 31] + {M:1} = February 28th 2010"
    );
    equal(
        _date([2007, 1, 28]).subtract({M:1}).format("MMMM Do YYYY"),
        "January 28th 2007",
        "[2007, 1, 28] - {M:1} = January 28th 2010"
    );
});


module("from");


test("from", 30, function() {
    var start = _date([2007, 1, 28]);
    equal(start.from(_date([2007, 1, 28]).add({s:44}), true),  "seconds",    "44 seconds = seconds");
    equal(start.from(_date([2007, 1, 28]).add({s:45}), true),  "a minute",   "45 seconds = a minute");
    equal(start.from(_date([2007, 1, 28]).add({s:89}), true),  "a minute",   "89 seconds = a minute");
    equal(start.from(_date([2007, 1, 28]).add({s:90}), true),  "2 minutes",  "90 seconds = 2 minutes");
    equal(start.from(_date([2007, 1, 28]).add({m:44}), true),  "44 minutes", "44 minutes = 44 minutes");
    equal(start.from(_date([2007, 1, 28]).add({m:45}), true),  "an hour",    "45 minutes = an hour");
    equal(start.from(_date([2007, 1, 28]).add({m:89}), true),  "an hour",    "89 minutes = an hour");
    equal(start.from(_date([2007, 1, 28]).add({m:90}), true),  "2 hours",    "90 minutes = 2 hours");
    equal(start.from(_date([2007, 1, 28]).add({h:5}), true),   "5 hours",    "5 hours = 5 hours");
    equal(start.from(_date([2007, 1, 28]).add({h:21}), true),  "21 hours",   "21 hours = 21 hours");
    equal(start.from(_date([2007, 1, 28]).add({h:22}), true),  "a day",      "22 hours = a day");
    equal(start.from(_date([2007, 1, 28]).add({h:35}), true),  "a day",      "35 hours = a day");
    equal(start.from(_date([2007, 1, 28]).add({h:36}), true),  "2 days",     "36 hours = 2 days");
    equal(start.from(_date([2007, 1, 28]).add({d:1}), true),   "a day",      "1 day = a day");
    equal(start.from(_date([2007, 1, 28]).add({d:5}), true),   "5 days",     "5 days = 5 days");
    equal(start.from(_date([2007, 1, 28]).add({d:25}), true),  "25 days",    "25 days = 25 days");
    equal(start.from(_date([2007, 1, 28]).add({d:26}), true),  "a month",    "26 days = a month");
    equal(start.from(_date([2007, 1, 28]).add({d:30}), true),  "a month",    "30 days = a month");
    equal(start.from(_date([2007, 1, 28]).add({d:45}), true),  "a month",    "45 days = a month");
    equal(start.from(_date([2007, 1, 28]).add({d:46}), true),  "2 months",   "46 days = 2 months");
    equal(start.from(_date([2007, 1, 28]).add({d:75}), true),  "2 months",   "75 days = 2 months");
    equal(start.from(_date([2007, 1, 28]).add({d:76}), true),  "3 months",   "76 days = 3 months");
    equal(start.from(_date([2007, 1, 28]).add({M:1}), true),   "a month",    "1 month = a month");
    equal(start.from(_date([2007, 1, 28]).add({M:5}), true),   "5 months",   "5 months = 5 months");
    equal(start.from(_date([2007, 1, 28]).add({d:344}), true), "11 months",  "344 days = 11 months");
    equal(start.from(_date([2007, 1, 28]).add({d:345}), true), "a year",     "345 days = a year");
    equal(start.from(_date([2007, 1, 28]).add({d:547}), true), "a year",     "547 days = a year");
    equal(start.from(_date([2007, 1, 28]).add({d:548}), true), "2 years",    "548 days = 2 years");
    equal(start.from(_date([2007, 1, 28]).add({y:1}), true),   "a year",     "1 year = a year");
    equal(start.from(_date([2007, 1, 28]).add({y:5}), true),   "5 years",    "5 years = 5 years");
});


test("milliseconds", 5, function() {
    equal(_date(1000).from(0, true, true), 1000, "1 second - 0 = 1000");
    equal(_date(1000).from(500, false, true), 500, "1 second - .5 second = -500");
    equal(_date(0).from(1000, false, true), -1000, "0 - 1 second = -1000");
    equal(_date(new Date(1000)).from(1000, false, true), 0, "1 second - 1 second = 0");
    var oneHourDate = new Date(),
    nowDate = new Date();
    oneHourDate.setHours(oneHourDate.getHours() + 1);
    equal(_date(oneHourDate).from(nowDate, false, true), 60 * 60 * 1000, "1 hour from now = 360000");
});


test("suffix", 2, function() {
    equal(_date(30000).from(0), "in seconds", "prefix");
    equal(_date(0).from(30000), "seconds ago", "suffix");
});


test("fromNow", 2, function() {
    equal(_date().add({s:30}).fromNow(), "in seconds", "in seconds");
    equal(_date().add({d:5}).fromNow(), "in 5 days", "in 5 days");
});


module("leap year");


test("leap year", function() {
    expect(4);
    equal(_date([2010, 0, 1]).isLeapYear(), false, '2010');
    equal(_date([2100, 0, 1]).isLeapYear(), false, '2100');
    equal(_date([2008, 0, 1]).isLeapYear(), true, '2008');
    equal(_date([2000, 0, 1]).isLeapYear(), true, '2000');
});


module("underscore mixin");


test("underscore mixin", 6, function() {
    ok(_.date([2010, 1, 12]).date instanceof Date, "[2010, 1, 12]");
    ok(_.date([2010, 1, 12, 1]).date instanceof Date, "[2010, 1, 12, 1]");
    ok(_.date().date instanceof Date, "undefined");
    ok(_.date("Aug 9, 1995").date instanceof Date, "Aug 9, 1995");
    ok(_.date("Mon, 25 Dec 1995 13:30:00 GMT").date instanceof Date, "Mon, 25 Dec 1995 13:30:00 GMT");
    deepEqual(_.date(new Date(2010, 1, 14, 15, 25, 50, 125)), _.date([2010, 1, 14, 15, 25, 50, 125]), "constructing with array === constructing with new Date()");
});


module("custom");

test("format", 9, function() {
    var dateTest = _date(new Date(2010, 1, 14, 15, 25, 50, 125)),
        _months = _date.months,
        _monthsShort = _date.monthsShort,
        _weekdays = _date.weekdays,
        _weekdaysShort = _date.weekdaysShort,
        _ordinal = _date.ordinal,
        a = [
            ['dddd, MMMM Do YYYY, h:mm:ss a',      'domingo, febrero 14o 2010, 3:25:50 pm'],
            ['ddd, hA',                            'dom, 3PM'],
            ['M Mo MM MMMM MMM',                   '2 2o 02 febrero feb'],
            ['YYYY YY',                            '2010 10'],
            ['D Do DD',                            '14 14o 14'],
            ['d do dddd ddd',                      '0 0o domingo dom'],
            ['DDD DDDo DDDD',                      '45 45o 045'],
            ['w wo ww',                            '8 8o 08'],
            ['t\\he DDDo \\d\\ay of t\\he ye\\ar', 'the 45o day of the year']
        ],
        b = _date(new Date(2010, 1, 14, 15, 25, 50, 125)),
        i;

    _date.months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    _date.monthsShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    _date.weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    _date.weekdaysShort = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    _date.ordinal = function() {
        return 'o';
    }

    for (i = 0; i < a.length; i++) {
        equal(b.format(a[i][0]), a[i][1], a[i][0] + ' ---> ' + a[i][1]);
    }

    _date.months = _months;
    _date.monthsShort = _monthsShort;
    _date.weekdays = _weekdays;
    _date.weekdaysShort = _weekdaysShort;
    _date.ordinal = _ordinal;
});


test("from date parts", 11, function() {
    var backup = _date.relativeTime,
        start = _date([2007, 1, 28]);

    _date.relativeTime = {
        future: "%s testing a",
        past: "%s testing b",
        s: "seconds!",
        m: "a minute!",
        mm: "%d minutes!",
        h: "an hour!",
        hh: "%d hours!",
        d: "a day!",
        dd: "%d days!",
        M: "a month!",
        MM: "%d months!",
        y: "a year!",
        yy: "%d years!"
    };

    equal(start.from(_date([2007, 1, 28]).add({s:30}), true), "seconds!", "seconds");
    equal(start.from(_date([2007, 1, 28]).add({s:60}), true), "a minute!", "minute");
    equal(start.from(_date([2007, 1, 28]).add({m:5}), true), "5 minutes!", "minutes");
    equal(start.from(_date([2007, 1, 28]).add({h:1}), true), "an hour!", "hour");
    equal(start.from(_date([2007, 1, 28]).add({h:5}), true), "5 hours!", "hours");
    equal(start.from(_date([2007, 1, 28]).add({d:1}), true), "a day!", "day");
    equal(start.from(_date([2007, 1, 28]).add({d:5}), true), "5 days!", "days");
    equal(start.from(_date([2007, 1, 28]).add({M:1}), true), "a month!", "month");
    equal(start.from(_date([2007, 1, 28]).add({M:5}), true), "5 months!", "months");
    equal(start.from(_date([2007, 1, 28]).add({y:1}), true), "a year!", "year");
    equal(start.from(_date([2007, 1, 28]).add({y:5}), true), "5 years!", "years");

    _date.relativeTime = backup;
});

test("from future past", 2, function() {
    var backup = _date.relativeTime;

    _date.relativeTime = {
        future: "%s testing a",
        past: "%s testing b",
        s: "seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
    };

    equal(_date(30000).from(0), "seconds testing a", 'future');
    equal(_date(0).from(30000), "seconds testing b", 'past');

    _date.relativeTime = backup;
});
