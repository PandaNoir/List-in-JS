const assert = require('assert');
const List = require('../dist/list.js');

const curry = f => function _curry(xs) {
        return xs.length < f.length ? x => _curry(xs.concat([x])) : f.apply(undefined, xs);
    }([]);
const add = (a, b) => a + b;
const isOdd = n=> n % 2 === 1;
const biggerThan = n=> m => n < m;
const smallerThan = n=> m => n > m;
const id = a => a;

const c_add = curry(add);
const a = new List([1, 2, 3]),
    b = new List([4, 5, 6]),
    c = new List([7, 8, 9]),
    oneToTen = new List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    a1 = a, a2 = a, a3 = a,
    f1 = new List([c_add(1), c_add(2), c_add(3)]),
    f2 = new List([c_add]).ap(new List([1, 2, 3])),
    f = a => a + 3,
    g = a => a * 3,
    x = 100;

describe('list-in-js', () => {
    describe('Setoid', () => {
        it('reflexivity', () => {
            assert.ok(a.equals(a));
        });
        it('symmetry', () => {
            assert.equal(a.equals(b), b.equals(a));
        });
        it('transitivity', () => {
            assert.ok(a1.equals(a2) && a2.equals(a3) && a1.equals(a3));
        });
    });
    describe('Semigroup', () => {
        it('associativity', () => {
            assert.ok(a.concat(b).concat(c).equals(a.concat(b.concat(c))));
        });
    });
    describe('Monoid', () => {
        it ('right identity', () => {
            assert.ok(a.concat(a.empty()).equals(a));
        });
        it ('left identity', () => {
            assert.ok(a.empty().concat(a).equals(a));
        });
    });
    describe('Functor', () => {
        it('identity', () => {
            assert.ok(a.map(id).equals(a));
        });
        it('composition', () => {
            assert.ok(a.map(x => f(g(x))).equals(a.map(g).map(f)));
        });
    });
    describe('Apply', () => {
        it('composition', () => {
            assert.ok(f1.map(f => g => x => f(g(x))).ap(f2).ap(a).equals(f1.ap(f2.ap(a))));
        });
    });
    describe('Applicative', () => {
        it('identity', () => {
            assert.ok(a.of(id).ap(b).equals(b));
        });
        it('homomorphism', () => {
            assert.ok(a.of(f).ap(a.of(x)).equals(a.of(f(x))));
        });
        it('interchange', () => {
            assert.ok(f1.ap(a.of(x)).equals(a.of(f => f(x)).ap(f1)));
        });
    });
    describe('Foldable', () => {
        it('reduce', () => {
            assert.equal(a.reduce(add, 0), a.toArray().reduce(add, 0));
        });
    });
    describe('Chain', () => {
        it('chain', () => {
            assert.ok(a.chain(x => x % 2 === 0 ? List.of(x) : List.empty).equals(List.of(2)));
        });
        it('left identity', () => {
            const _f = x => List.of(x * 2);
            assert.ok(a.of(3).chain(_f).equals(_f(3)));
        });
        it('right identity', () => {
            assert.ok(a.chain(a.of).equals(a));
        });
    });
    describe('Traversable', () => {
        it('traverse1', () => {
            assert.ok(new List([[1, 2], [3, 4]]).sequence().equals(new List([[1, 3], [1, 4], [2, 3], [2, 4]])));
        });
        it('traverse2', () => {
            assert.ok(new List([[1], [2], [3]]).sequence().equals(new List([[1, 2, 3]])));
        });
        it('traverse3', () => {
            assert.ok(new List([[1, 2], [3], [4]]).sequence().equals(new List([[1, 3, 4], [2, 3, 4]])));
        });
    });
    describe('methods', () => {
        it('.all()', () => {
            assert.equal(a.all(isOdd), false);
            assert.equal(a.all(smallerThan(10000)), true);
        });
        it('.and()', () => {
            assert.equal(new List([true, true, true]).and(), true);
            assert.equal(new List([true, true, false]).and(), false);
        });
        it('.any()', () => {
            assert.equal(a.any(isOdd), true);
            assert.equal(a.any(biggerThan(10000)), false);
        });
        it('.break()', () => {
            const res1 = new List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).break(x => x > 4);
            assert.ok(res1[0].equals(new List([1, 2, 3, 4])));
            assert.ok(res1[1].equals(new List([5, 6, 7, 8, 9, 10])));

            const res2 = new List([1, 2, 3, 4, 1, 2, 3, 4]).break(x => x > 3);
            assert.ok(res2[0].equals(new List([1, 2, 3])));
            assert.ok(res2[1].equals(new List([4, 1, 2, 3, 4])));

            const res3 = new List([1, 2, 3]).break(x => x > 9);
            assert.ok(res3[0].equals(new List([1, 2, 3])));
            assert.ok(res3[1].equals(new List([])));

            const res4 = new List([1, 2, 3]).break(x => x < 9);
            assert.ok(res4[0].equals(new List([])));
            assert.ok(res4[1].equals(new List([1, 2, 3])));
        });
        it('.cycle()', () => {
            assert.ok(new List([...'ABC']).cycle().take(10).equals(new List([...'ABCABCABCA'])));
        });
        it('.delete()', () => {
            assert.ok(new List([...'banana']).delete('a').equals(new List([...'bnana'])));
        });
        it('.deleteBy()', () => {
            assert.ok(new List([6, 8, 10, 12]).deleteBy((x, y) => y % x === 0, 4).equals(new List([6, 10, 12])));
        })
        it('.drop()', () => {
            assert.ok(oneToTen.drop(4).equals(new List([5, 6, 7, 8, 9, 10])));
        });
        it('.dropWhile()', () => {
            assert.ok(oneToTen.dropWhile(smallerThan(4)).equals(new List([4, 5, 6, 7, 8, 9, 10])));
        });
        it('.elem()', () => {
            assert.equal(a.elem(1), true);
            assert.equal(a.elem(4), false);
        });
        it('.filter()', () => {
            assert.ok(a.filter(x => x % 2 === 0).equals(new List([2])));
        });
        it('.foldl1()', () => {
            assert.equal(oneToTen.foldl1((a, b) => a - b), -53);
        });
        it('.foldr1()', () => {
            assert.equal(oneToTen.foldr1((a, b) => a - b), -5);
        });
        it('.head()', () => {
            assert.equal(a.head(), 1);
        });
        it('.init()', () => {
            assert.ok(a.init().equals(new List([1, 2])));
        });
        it('.inits()', () => {
            assert.ok(a.inits().equals(new List([[], [1], [1, 2], [1, 2, 3]])));
        });
        it('.intersperse()', () => {
            assert.ok(a.intersperse(0).equals(new List([1, 0, 2, 0, 3])));
            assert.ok(new List([[1], [2], [3]]).intercalate(List.of(0)).equals(new List([1, 0, 2, 0, 3])));
            assert.ok(new List([[1, 2], [3, 4]]).transpose().equals(new List([[1, 3], [2, 4]])));
            assert.ok(new List([[1, 2, 3], [4, 5, 6], [7, 8, 9, 10]]).transpose().equals(new List([[1, 4, 7], [2, 5, 8], [3, 6, 9], [10]])));
        });
        it('.isnull()', () => {
            assert.equal(a.isnull(), false);
            assert.equal(List.empty.isnull(), true);
        });
        it('.iterate()', () => {
            assert.ok(List.iterate(x => x * 10, 1).take(5).equals(new List([1, 10, 100, 1000, 10000])));
        });
        it('.last()', () => {
            assert.equal(a.last(), 3);
        });
        it('.maximum()', () => {
            assert.equal(a.maximum() === 3 && a.reverse().maximum() === 3, true);
        });
        it('.minimum()', () => {
            assert.equal(a.minimum() === 1 && a.reverse().minimum() === 1, true);
        });
        it('.nub()', () => {
            assert.ok(new List([1, 1, 2, 2, 2, 3, 5]).nub().equals(new List([1, 2, 3, 5])));
        });
        it('.or()', () => {
            assert.equal(new List([false, false, false]).or(), false);
            assert.equal(new List([true, false, false]).or(), true);
        });
        it('.product()', () => {
            assert.equal(oneToTen.product(), 3628800);
        });
        it('.repeat()', () => {
            assert.ok(List.repeat(123).take(5).equals(new List([123, 123, 123, 123, 123])));
        });
        it('.replicate()', () => {
            assert.ok(List.replicate(5, 'A').equals(new List([...'AAAAA'])));
        })
        it('.reverse()', () => {
            assert.ok(a.reverse().equals(new List([3, 2, 1])));
        });
        it('.scanl()', () => {
            assert.ok(oneToTen.scanl((a, b) => a + b, 0).equals(new List([0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55])));
        });
        it('.scanr()', () => {
            assert.ok(new List([8, 12, 24, 4]).scanr((a, b) => b / a, 2).equals(new List([8, 1, 12, 2, 2])));
            assert.ok(new List([3, 6, 12, 4, 55, 11]).scanr(Math.max, 18).equals(new List([55, 55, 55, 55, 55, 18, 18])));
        });
        it('.span()', () => {
            const res1 = new List([1, 2, 3, 4, 1, 2, 3, 4]).span(smallerThan(3));
            assert.ok(res1[0].equals(new List([1, 2])));
            assert.ok(res1[1].equals(new List([3, 4, 1, 2, 3, 4])));

            const res2 = new List([1, 2, 3]).span(smallerThan(9));
            assert.ok(res2[0].equals(new List([1, 2, 3])));
            assert.ok(res2[1].equals(new List([])));

            const res3 = new List([1, 2, 3]).span(smallerThan(0));
            assert.ok(res3[0].equals(new List([])));
            assert.ok(res3[1].equals(new List([1, 2, 3])));
        });
        it('.subsequences()', () => {
            assert.ok(a.subsequences().equals(new List([[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]])));
        });
        it('.sum()', () => {
            assert.equal(oneToTen.sum(), 55);
        });
        it('.tail()', () => {
            assert.ok(a.tail().equals(new List([2, 3])));
        });
        it('.tails()', () => {
            assert.ok(a.tails().equals(new List([[1, 2, 3], [2, 3], [3], []])));
        });
        it('.take()', () => {
            assert.ok(oneToTen.take(3).equals(new List([1, 2, 3])));
        });
        it('.takeWhile()', () => {
            assert.ok(oneToTen.takeWhile(smallerThan(4)).equals(new List([1, 2, 3])));
        });
        it('.toArray()', () => {
            assert.equal(JSON.stringify(new List([[1, 2], [3, 4], [5, 6]]).toArray()), JSON.stringify([[1, 2], [3, 4], [5, 6]]));
        });
    });
});
