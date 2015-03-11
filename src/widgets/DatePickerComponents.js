/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Date/time components helper class (minute, seconds, full-day, month, etc...).
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Surface = require('famous/core/Surface');
    var EventHandler = require('famous/core/EventHandler');

    /**
     * Helper functions for formatting values with X decimal places.
     */
    function decimal1(date) {
        return ('' + date[this.get]());
    }
    function decimal2(date) {
        return ('0' + date[this.get]()).slice(-2);
    }
    function decimal3(date) {
        return ('00' + date[this.get]()).slice(-3);
    }
    function decimal4(date) {
        return ('000' + date[this.get]()).slice(-4);
    }

    /**
     * Base component class
     */
    function Base(options) {
        this._eventOutput = new EventHandler();
        this._pool = [];
        EventHandler.setOutputHandler(this, this._eventOutput);
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }
    }
    Base.prototype.step = 1;
    Base.prototype.classes = ['item'];
    Base.prototype.getComponent = function(date) {
        return date[this.get]();
    };
    Base.prototype.setComponent = function(date, value) {
        return date[this.set](value);
    };
    Base.prototype.format = function(date) {
        return 'overide to implement';
    };
    Base.prototype.createNext = function(renderable) {
        var date = this.getNext(renderable.date);
        return date ? this.create(date) : undefined;
    };
    Base.prototype.getNext = function(date) {
        date = new Date(date.getTime());
        var newVal = this.getComponent(date) + this.step;
        if ((this.upperBound !== undefined) && (newVal >= this.upperBound)) {
            if (!this.loop) {
                return undefined;
            }
            newVal = Math.max(newVal % this.upperBound, this.lowerBound || 0);
        }
        this.setComponent(date, newVal);
        return date;
    };
    Base.prototype.createPrevious = function(renderable) {
        var date = this.getPrevious(renderable.date);
        return date ? this.create(date) : undefined;
    };
    Base.prototype.getPrevious = function(date) {
        date = new Date(date.getTime());
        var newVal = this.getComponent(date) - this.step;
        if ((this.lowerBound !== undefined) && (newVal < this.lowerBound)) {
            if (!this.loop) {
                return undefined;
            }
            newVal = newVal % this.upperBound;
        }
        this.setComponent(date, newVal);
        return date;
    };
    Base.prototype.installClickHandler = function(renderable) {
        renderable.on('click', function(event) {
            this._eventOutput.emit('click', {
                target: renderable,
                event: event
            });
        }.bind(this));
    };
    Base.prototype.createRenderable = function(classes, data) {
        return new Surface({
            classes: classes,
            content: '<div>' + data + '</div>'
        });
    };
    Base.prototype.create = function(date) {
        date = date || new Date();
        var renderable;
        if (this._pool.length) {
            renderable = this._pool[0];
            this._pool.splice(0, 1);
            renderable.setContent(this.format(date));
        }
        else {
            renderable = this.createRenderable(this.classes, this.format(date));
            this.installClickHandler(renderable);
        }
        renderable.date = date;
        return renderable;
    };
    Base.prototype.destroy = function(renderable) {
        // push the renderable into the pool for re-use
        this._pool.push(renderable);
    };

    /**
     * Year component
     */
    function Year() {
        Base.apply(this, arguments);
    }
    Year.prototype = Object.create(Base.prototype);
    Year.prototype.constructor = Year;
    Year.prototype.classes = ['item', 'year'];
    Year.prototype.format = decimal4;
    Year.prototype.sizeRatio = 1;
    Year.prototype.step = 1;
    Year.prototype.loop = false;
    Year.prototype.set = 'setFullYear';
    Year.prototype.get = 'getFullYear';

    /**
     * Month component
     */
    function Month() {
        Base.apply(this, arguments);
    }
    Month.prototype = Object.create(Base.prototype);
    Month.prototype.constructor = Month;
    Month.prototype.classes = ['item', 'month'];
    Month.prototype.sizeRatio = 2;
    Month.prototype.lowerBound = 0;
    Month.prototype.upperBound = 12;
    Month.prototype.step = 1;
    Month.prototype.loop = true;
    Month.prototype.set = 'setMonth';
    Month.prototype.get = 'getMonth';
    Month.prototype.strings = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    Month.prototype.format = function(date) {
        return this.strings[date.getMonth()];
    };

    /**
     * Full-day component
     */
    function FullDay() {
        Base.apply(this, arguments);
    }
    FullDay.prototype = Object.create(Base.prototype);
    FullDay.prototype.constructor = FullDay;
    FullDay.prototype.classes = ['item', 'fullday'];
    FullDay.prototype.sizeRatio = 2;
    FullDay.prototype.step = 1;
    FullDay.prototype.set = 'setDate';
    FullDay.prototype.get = 'getDate';
    FullDay.prototype.format = function(date) {
        return date.toLocaleDateString();
    };

    /**
     * Week-day component
     */
    function WeekDay() {
        Base.apply(this, arguments);
    }
    WeekDay.prototype = Object.create(Base.prototype);
    WeekDay.prototype.constructor = WeekDay;
    WeekDay.prototype.classes = ['item', 'weekday'];
    WeekDay.prototype.sizeRatio = 2;
    WeekDay.prototype.lowerBound = 0;
    WeekDay.prototype.upperBound = 7;
    WeekDay.prototype.step = 1;
    WeekDay.prototype.loop = true;
    WeekDay.prototype.set = 'setDate';
    WeekDay.prototype.get = 'getDate';
    WeekDay.prototype.strings = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];
    WeekDay.prototype.format = function(date) {
        return this.strings[date.getDay()];
    };

    /**
     * Day component
     */
    function Day() {
        Base.apply(this, arguments);
    }
    Day.prototype = Object.create(Base.prototype);
    Day.prototype.constructor = Day;
    Day.prototype.classes = ['item', 'day'];
    Day.prototype.format = decimal1;
    Day.prototype.sizeRatio = 1;
    Day.prototype.lowerBound = 1;
    Day.prototype.upperBound = 32;
    Day.prototype.step = 1;
    Day.prototype.loop = true;
    Day.prototype.set = 'setDate';
    Day.prototype.get = 'getDate';

    /**
     * Hour component
     */
    function Hour() {
        Base.apply(this, arguments);
    }
    Hour.prototype = Object.create(Base.prototype);
    Hour.prototype.constructor = Hour;
    Hour.prototype.classes = ['item', 'hour'];
    Hour.prototype.format = decimal2;
    Hour.prototype.sizeRatio = 1;
    Hour.prototype.lowerBound = 0;
    Hour.prototype.upperBound = 24;
    Hour.prototype.step = 1;
    Hour.prototype.loop = true;
    Hour.prototype.set = 'setHours';
    Hour.prototype.get = 'getHours';

    /**
     * Minute component
     */
    function Minute() {
        Base.apply(this, arguments);
    }
    Minute.prototype = Object.create(Base.prototype);
    Minute.prototype.constructor = Minute;
    Minute.prototype.classes = ['item', 'minute'];
    Minute.prototype.format = decimal2;
    Minute.prototype.sizeRatio = 1;
    Minute.prototype.lowerBound = 0;
    Minute.prototype.upperBound = 60;
    Minute.prototype.step = 1;
    Minute.prototype.loop = true;
    Minute.prototype.set = 'setMinutes';
    Minute.prototype.get = 'getMinutes';

    /**
     * Second component
     */
    function Second() {
        Base.apply(this, arguments);
    }
    Second.prototype = Object.create(Base.prototype);
    Second.prototype.constructor = Second;
    Second.prototype.classes = ['item', 'second'];
    Second.prototype.format = decimal2;
    Second.prototype.sizeRatio = 1;
    Second.prototype.lowerBound = 0;
    Second.prototype.upperBound = 60;
    Second.prototype.step = 1;
    Second.prototype.loop = true;
    Second.prototype.set = 'setSeconds';
    Second.prototype.get = 'getSeconds';

    /**
     * Millisecond component
     */
    function Millisecond() {
        Base.apply(this, arguments);
    }
    Millisecond.prototype = Object.create(Base.prototype);
    Millisecond.prototype.constructor = Millisecond;
    Millisecond.prototype.classes = ['item', 'millisecond'];
    Millisecond.prototype.format = decimal3;
    Millisecond.prototype.sizeRatio = 1;
    Millisecond.prototype.lowerBound = 0;
    Millisecond.prototype.upperBound = 1000;
    Millisecond.prototype.step = 1;
    Millisecond.prototype.loop = true;
    Millisecond.prototype.set = 'setMilliseconds';
    Millisecond.prototype.get = 'getMilliseconds';

    module.exports = {
        Base: Base,
        Year: Year,
        Month: Month,
        FullDay: FullDay,
        WeekDay: WeekDay,
        Day: Day,
        Hour: Hour,
        Minute: Minute,
        Second: Second,
        Millisecond: Millisecond
    };
});
