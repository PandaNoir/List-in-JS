var objToString = Object.prototype.toString;
function isArray(arr) {
    return !!arr && typeof arr.length === 'number' && typeof arr === 'object' && objToString.call(arr) === '[object Array]';
};
var List = function(arr) {
    if (!isArray(arr)) {
        throw Error('expect array.got ' + arr);
        return;
    }
    this.value = arr;
    return this;
};
List.fn = List.prototype;
List.empty = List.fn.empty = function() {
    return new List([]);
};
List.fn.map = function(f) {
    if (typeof this.value.map === 'function') {
        return new List(this.value.map(f));
    }
    var res = new Array(this.value.length);
    for (var i = 0, _i = res.length; i < _i; i++) {
        res[i] = f(this.value[i]);
    }
    return new List(res);
};
List.of = List.fn.of = function() {
    var args = new Array(arguments);
    for (var i = 0, _i = args.length; i < _i; i++) {
        args[i] = arguments[i];
    }
    return new List(args);
};
List.fn.ap = function(b) {
    var bLength = b.value.length;
    var res = new Array(this.value.length * bLength);
    for (var i = 0, _i = this.value.length; i < _i; i++) {
        for (var j = 0, _j = bLength; j < _j; j++) {
            res[i * bLength + j] = this.value[i](b.value[j]);
        }
    }
    return new List(res);
};
List.fn.concat = function(b) {
    return new List(this.value.concat(b.value));
};
List.fn.equals = function(b) {
    function isEquals(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0, _i = a.length; i < _i; i++) {
            if (a[i] && typeof a[i].equals === 'function') {
                if (a[i].equals(b[i])) return false;
            } else {
                if (objToString.call(a[i]) !== objToString.call(b[i])) return false;
                if (isArray(a[i])) {
                    if (!isEquals(a[i], b[i])) return false;
                } else {
                    if (a[i] !== b[i]) return false;
                }
            }
        }
        return true;
    };
    return isEquals(this.value, b.value);
};
List.fn.traverse = function(f, of) {
    return this.map(f).sequence(of);
}
List.fn.sequence = function(of) {
     return this.foldr(function(m, ma) {
         return m.chain(function(x) {
             if (ma.value.length === 0) return List.pure(x);
             return ma.chain(function(xs) {
                 var res = xs.concat();
                 res.unshift(x);
                 return List.pure(res);
             });
         })
    }, new List([[]]));
};
//methods
List.fn.foldr = function(f, acc) {
    if (this.value.length === 0) return acc;
    return f(this.head(), this.tail().foldr(f, acc));
};
List.fn.foldr1 = function(f, acc) {
    return this.init().foldr(f, this.last());
};
List.fn.foldl = List.fn.reduce = function(f, acc) {
    if (this.value.length === 0) return acc;
    return this.tail().foldl(f, f(acc, this.head()));
};
List.fn.foldl1 = function(f, acc) {
    return this.tail().foldl(f, this.head());
};
List.fn.scanr = function(f, acc) {
    return this.foldr(function(x, acc) {
        return List.of(f(acc.head(), x)).concat(acc);
    },List.of(acc));
};
List.fn.scanl = function(f, acc) {
    return this.foldl(function(acc, x) {
        return acc.concat(List.of(f(acc.last(), x)));
    },List.of(acc));
};
List.fn.chain = List.fn.concatMap = function(f) {
    return List.concat(this.map(f));
};
List.fn.head = function() {
    return this.value[0];
};
List.fn.tail = function() {
    return new List(this.value.slice(1));
};
List.fn.last = function() {
    return this.value[this.value.length - 1];
};
List.fn.init = function() {
    return new List(this.value.slice(0, -1));
};
List.fn.isnull = function() {
    return this.equals(List.empty());
};
List.fn.length = function() {
    return this.value.length;
};
List.fn.toArray = function() {
    return this.reduce(function(acc, x) {
        return acc.concat(x);
    }, []);
};
List.fn.filter = function(f) {
    return this.chain(function(m) {
        return f(m) ? List.pure(m) : List.empty();
    });
};
List.fn.reverse = function() {
    if (this.value.length === 0) return List.empty();
    return this.tail().reverse().concat(List.of(this.head()));
};
List.fn.and = function() {
    return this.all(function(s) {return s === true;});
};
List.fn.or = function() {
    return this.any(function(s) {return s === true;});
};
List.fn.any = function(f) {
    return this.filter(f).length() > 0;
};
List.fn.all = function(f) {
    return this.filter(function(item) {return !f(item);}).length() === 0;
};
List.fn.sum = function() {
    return this.foldl(function(a, b) {return a + b;}, 0);
};
List.fn.product = function() {
    return this.foldl(function(a, b) {return a * b;}, 1);
};
List.fn.maximum = function() {
    if (this.value.length === 0) return undefined;
    if (this.value.length === 1) return this.value[0];
    var max = this.tail().maximum();
    if (max > this.head()) return max;
    else return this.head();
};
List.fn.minimum = function() {
    if (this.value.length === 0) return undefined;
    if (this.value.length === 1) return this.value[0];
    var min = this.tail().minimum();
    if (min < this.head()) return min;
    else return this.head();
};
List.pure = function(x) {
    return new List([x]);
};
List.concat = function(list) {
    if (list.length() === 0) return List.empty();
    return list.head().concat(List.concat(list.tail()));
};
List.fn.intersperse = function(s) {
    if (this.length() === 0) return List.empty();
    if (this.length() === 1) return this;
    return new List([this.head(), s]).concat(this.tail().intersperse(s));
};
List.fn.intercalate = function(s) {
    return List.concat(this.intersperse(s));
};
List.fn.transpose = function() {
    var max = this.map(function(item) {return item.length;}).maximum();
    var res=[];
    for (var i = 0; i < max; i++) {
        res[i] = [];
        for (var j = 0, _j = this.length(); j < _j; j++) {
            if (this.value[j] && this.value[j][i]) {
                res[i].push(this.value[j][i]);
            }
        }
    }
    return new List(res);
};
List.fn.subsequences = function() {
    return this.foldl(function(acc, x) {
        return acc.concat(acc.map(function(item) {return item.concat(List.of(x))}));
    }, new List([List.empty()]));
};
List.fn.take = function(n) {
    if (n === 0) return List.empty();
    return List.of(this.head()).concat(this.tail().take(n - 1));
};
List.fn.drop = function(n) {
    if (n === 0) return this;
    return this.tail().drop(n-1);
};
List.fn.takeWhile = function(f) {
    if (f(this.head())) {
        return List.of(this.head()).concat(this.tail().takeWhile(f));
    }
    return List.empty();
};
List.fn.dropWhile = function(f) {
    if (f(this.head())) {
        return this.tail().dropWhile(f);
    }
    return this;
};
module.exports = List;
