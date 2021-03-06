// Underscore.date
//
// (c) 2011 Tim Wood
// Underscore.date is freely distributable under the terms of the MIT license.
//
// Version 0.5.3

(function (undefined) {

  var _date
    , round = Math.round
    , isoDate = new Date("2011-11-11T11:11:11+00:00")
    , noIsoParse = isNaN(isoDate.getTime())
    , iso8601Format = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})([Z+-])(?:(\d{2}):(\d{2}))?$/;

  // left zero fill a number
  // see http://jsperf.com/left-zero-filling for performance comparison
  function leftZeroFill(number, targetLength) {
    var output = number + "";
    while(output.length < targetLength) {
      output = "0" + output;
    }
    return output;
  }

  // helper function for _.addTime and _.subtractTime
  function dateAddRemove(date, input, adding) {
    var ms = (input.ms || 0) +
             (input.s  || 0) * 1e3 +   // 1000
             (input.m  || 0) * 6e4 +   // 1000 * 60
             (input.h  || 0) * 36e5 +  // 1000 * 60 * 60
             (input.d  || 0) * 864e5 + // 1000 * 60 * 60 * 24
             (input.w  || 0) * 6048e5  // 1000 * 60 * 60 * 24 * 7
      , M  = (input.M  || 0) + (input.y || 0) * 12;

    if(ms) {
      date.setMilliseconds(date.getMilliseconds() + ms * adding);
    }

    if(M) {
      var currentDate = date.getDate();
      date.setDate(1);
      date.setMonth(date.getMonth() + M * adding);
      date.setDate(Math.min(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(), currentDate));
    }
    return date;
  }

  // helper function for _.changeTime
  function dateReset(date, input) {
    var ms = 0
      , key = _.first(_.filter(["y","M","d","h","m","s","ms"], function(key){ return (key in input) }));

    switch (key) {
      case "y":
        date.setFullYear(0);
      case "M":
        date.setMonth(0);
      case "d":
        input.d
          ? ms += date.getDate() * 864e5  // 0; if we add days start with zero
          : date.setDate(1);              // 1;
      case "h":
        ms += date.getHours() * 36e5;
      case "m":
        ms += date.getMinutes() * 6e4;
      case "s":
        ms += date.getSeconds() * 1e3;
      case "ms":
        ms += date.getMilliseconds();
    }

    if(ms) {
      date.setMilliseconds(date.getMilliseconds() - ms);
    }

    return date;
  }

  // check if is an array
  function isArray(input) {
    return Object.prototype.toString.call(input) === "[object Array]";
  }

  // check if is a string
  function isString(input) {
    return Object.prototype.toString.call(input) === "[object String]";
  }

  // convert an array to a date.
  // the array should mirror the parameters below
  // note: all values past the year are optional and will default to the lowest possible value.
  // [year, month, day , hour, minute, second, millisecond]
  function dateFromArray(input) {
    return new Date(input[0], input[1] || 0, input[2] || 1, input[3] || 0, input[4] || 0, input[5] || 0, input[6] || 0);
  }

  // date from string and format string
  function makeDateFromStringAndFormat(string, format) {
    var inArray = [0, 0, 0, 0, 0, 0, 0]
      , charactersToPutInArray = /[0-9a-zA-Z]+/g
      , inputParts = string.match(charactersToPutInArray)
      , formatParts = format.match(charactersToPutInArray)
      , isPm = false
      , addTime = function addTime(format, input) {
        // function to convert string input to date
        switch (format) {
          // Month
          case "M" :
          case "MM" :
            inArray[1] = ~~input - 1;
            break;
          // Day of Month
          case "D" :
          case "DD" :
          case "DDD" :
          case "DDDD" :
            inArray[2] = ~~input;
            break;
          // Year
          case "YY" :
            input = ~~input;
            inArray[0] = input + (input > 70 ? 1900 : 2000);
            break;
          case "YYYY" :
            inArray[0] = ~~input;
            break;
          // AM / PM
          case "a" :
          case "A" :
            isPm = (input.toLowerCase() === "pm");
            break;
          // 24 Hour
          case "H" :
          case "HH" :
          case "h" :
          case "hh" :
            inArray[3] = ~~input;
            break;
          // Minute
          case "m" :
          case "mm" :
            inArray[4] = ~~input;
            break;
          // Second
          case "s" :
          case "ss" :
            inArray[5] = ~~input;
            break;
        }
      };

    for(var i=0, n=formatParts.length; i<n; i++) {
      addTime(formatParts[i], inputParts[i]);
    }

    // handle am pm
    if(isPm && inArray[3] < 12) {
      inArray[3] += 12;
    }
    return dateFromArray(inArray);
  }

  // UnderscoreDate prototype object
  function UnderscoreDate(input, format) {
    if(input === undefined) {
      this.date = new Date();
    }
    else if(input.date instanceof Date) {
      if(format === "") {
        this.date = new Date(input.date.toString());
      }
      else {
        this.date = input.date;
      }
    }
    else if(input instanceof Date) {
      if(format === "") {
        this.date = new Date(input.toString());
      }
      else {
        this.date = input;
      }
    }
    else if(format) {
      this.date = makeDateFromStringAndFormat(input, format);
    }
    else if(isArray(input)) {
      this.date = dateFromArray(input);
    }
    else if(noIsoParse && isString(input)) {
      var parts = iso8601Format.exec(input);
      if(parts) {
        this.date = new Date(parts[1], parts[2]-1, parts[3], parts[4], parts[5], parts[6]);
        if(parts[7] !== "Z") {
          var offset = ((parts[8] * 60) + (parts[9] * 1)) * (parts[7] == "-" ? 1 : -1) - this.date.getTimezoneOffset();
          if(offset) {
            this.date.setTime(this.date.getTime() + offset * 60e3);
          }
        }
      }
      else {
        this.date = new Date(input); // try browser parse if not isoFormat
      }
    }
    else {
      this.date = new Date(input); // browser parse
    }
  }

  _date = function (input, format) {
    return new UnderscoreDate(input, format);
  };

  _date.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  _date.monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  _date.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  _date.weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  _date.relativeTime = {
    future: "in %s",
    past: "%s ago",
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
  _date.ordinal = function (number) {
    var b = number % 10;
    return (~~ (number % 100 / 10) === 1)
            ? "th" : (b === 1)
            ? "st" : (b === 2)
            ? "nd" : (b === 3)
            ? "rd" : "th";
  };

  // convert any input to milliseconds
  function makeInputMilliseconds(input) {
    return isNaN(input) ? new UnderscoreDate(input).date.getTime() : input;
  }

  // helper function for _date.from() and _date.fromNow()
  function substituteTimeAgo(string, number) {
    return _date.relativeTime[string].replace(/%d/i, number || 1);
  }

  function msApart(time, now) {
    return makeInputMilliseconds(time) - makeInputMilliseconds(now);
  }

  function relativeTime(milliseconds) {
    var seconds = Math.abs(milliseconds) / 1000
      , minutes = seconds / 60
      , hours = minutes / 60
      , days = hours / 24
      , years = days / 365;

    return seconds < 45 && substituteTimeAgo("s", round(seconds)) ||
      round(minutes) === 1 && substituteTimeAgo("m") ||
      minutes < 45 && substituteTimeAgo("mm", round(minutes)) ||
      round(hours) === 1 && substituteTimeAgo("h") ||
      hours < 22 && substituteTimeAgo("hh", round(hours)) ||
      round(days) === 1 && substituteTimeAgo("d") ||
      days < 25 && substituteTimeAgo("dd", round(days)) ||
      days < 45 && substituteTimeAgo("M") ||
      days < 345 && substituteTimeAgo("MM", round(days / 30)) ||
      round(years) === 1 && substituteTimeAgo("y") ||
      substituteTimeAgo("yy", round(years));
  }

  UnderscoreDate.prototype = {
    format : function (inputString) {
      // shortcuts to this and getting time functions
      // done to save bytes in minification
      var date = this.date
        , currentMonth = date.getMonth()
        , currentDate = date.getDate()
        , currentYear = date.getFullYear()
        , currentDay = date.getDay()
        , currentHours = date.getHours()
        , currentMinutes = date.getMinutes()
        , currentSeconds = date.getSeconds()
        , currentString = date.toString()
        , currentOffset = date.getTimezoneOffset()/60
        , charactersToReplace = /(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|zz?|ZZ)/g
        , nonuppercaseLetters = /[^A-Z]/g;
      // check if the character is a format
      // return formatted string or non string.
      //
      // uses switch/case instead of an object of named functions (like http://phpjs.org/functions/date:380)
      // for minification and performance
      // see http://jsperf.com/object-of-functions-vs-switch for performance comparison
      function replaceFunction(input) {
        // create a couple variables to be used later inside one of the cases.
        var a, b;
        switch (input) {
        // Month
        case "M" :
          return currentMonth + 1;
        case "Mo" :
          return (currentMonth + 1) + _date.ordinal(currentMonth + 1);
        case "MM" :
          return leftZeroFill(currentMonth + 1, 2);
        case "MMM" :
          return _date.monthsShort[currentMonth];
        case "MMMM" :
          return _date.months[currentMonth];
        // Day of Month
        case "D" :
          return currentDate;
        case "Do" :
          return currentDate + _date.ordinal(currentDate);
        case "DD" :
          return leftZeroFill(currentDate, 2);
        // Day of Year
        case "DDD" :
          a = new Date(currentYear, currentMonth, currentDate);
          b = new Date(currentYear, 0, 1);
          return ~~ (((a - b) / 864e5) + 1.5);
        case "DDDo" :
          a = replaceFunction("DDD");
          return a + _date.ordinal(a);
        case "DDDD" :
          return leftZeroFill(replaceFunction("DDD"), 3);
        // Weekday
        case "d" :
          return currentDay;
        case "do" :
          return currentDay + _date.ordinal(currentDay);
        case "ddd" :
          return _date.weekdaysShort[currentDay];
        case "dddd" :
          return _date.weekdays[currentDay];
        // Week of Year
        case "w" :
          a = new Date(currentYear, currentMonth, currentDate - currentDay + 5);
          b = new Date(a.getFullYear(), 0, 4);
          return ~~ ((a - b) / 864e5 / 7 + 1.5);
        case "wo" :
          a = replaceFunction("w");
          return a + _date.ordinal(a);
        case "ww" :
          return leftZeroFill(replaceFunction("w"), 2);
        // Year
        case "YY" :
          return (currentYear + "").slice(-2);
        case "YYYY" :
          return currentYear;
        // AM / PM
        case "a" :
          return currentHours > 11 ? "pm" : "am";
        case "A" :
          return currentHours > 11 ? "PM" : "AM";
        // 24 Hour
        case "H" :
          return currentHours;
        case "HH" :
          return leftZeroFill(currentHours, 2);
        // 12 Hour
        case "h" :
          return currentHours % 12 || 12;
        case "hh" :
          return leftZeroFill(currentHours % 12 || 12, 2);
        // Minute
        case "m" :
          return currentMinutes;
        case "mm" :
          return leftZeroFill(currentMinutes, 2);
        // Second
        case "s" :
          return currentSeconds;
        case "ss" :
          return leftZeroFill(currentSeconds, 2);
        // Timezone
        case "ZZ":
          return (currentOffset > 0 ? "-" : "+") + leftZeroFill(currentOffset, 2) + ":00";
        case "z" :
          return replaceFunction("zz").replace(nonuppercaseLetters, "");
        case "zz" :
          a = currentString.indexOf("(");
          if(a > -1) {
            return currentString.slice(a + 1, currentString.indexOf(")"));
          }
          return currentString.slice(currentString.indexOf(":")).replace(nonuppercaseLetters, "");
        // Default
        default :
          return input.replace("\\", "");
        }
      }
      return inputString.replace(charactersToReplace, replaceFunction);
    },

    add : function (input) {
      input = input || {};
      this.date = dateAddRemove(this.date, input, 1);
      return this;
    },

    subtract : function (input) {
      input = input || {};
      this.date = dateAddRemove(this.date, input, -1);
      return this;
    },

    change : function (input) {
      input = input || {};
      this.date = dateAddRemove(dateReset(this.date, input), input, 1);
      return this;
    },

    gmt : function() {
      var offset = this.date.getTimezoneOffset();
      return this.clone().add({m: offset});
    },

    clone: function() {
      return new UnderscoreDate(this.date, "");
    },

    toString : function() {
      return this.date.toString();
    },

    valueOf : function () {
      return this.date.getTime();
    },

    getTime : function () {
      return this.date.getTime();
    },

    from : function (time, withoutSuffix, asMilliseconds) {
      var difference = msApart(this.date, time)
        , string = difference < 0 ? _date.relativeTime.past : _date.relativeTime.future;
      return asMilliseconds ? difference :
        withoutSuffix ? relativeTime(difference) :
        string.replace(/%s/i, relativeTime(difference));
    },

    fromNow : function (withoutSuffix, asMilliseconds) {
      return this.from(new UnderscoreDate(), withoutSuffix, asMilliseconds);
    },

    isLeapYear : function () {
      var year = this.date.getFullYear();
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
  };

  // CommonJS module is defined
  if(typeof window === "undefined" && typeof module !== "undefined") {
    // Export module
    module.exports = _date;
  }
  // Integrate with Underscore.js
  else {
    if(this._ !== undefined && this._.mixin !== undefined) {
      this._.mixin({date : _date});
    }
    this._date = _date;
  }

}());
