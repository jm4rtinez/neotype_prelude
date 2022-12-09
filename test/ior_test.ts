import { assert } from "chai";
import * as fc from "fast-check";
import { cmb } from "../src/cmb.js";
import { cmp, eq, Ordering } from "../src/cmp.js";
import { Ior } from "../src/ior.js";
import { arb, Str, tuple } from "./common.js";

namespace t {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export function left<A, B>(x: A, _: B): Ior<A, B> {
        return Ior.left(x);
    }

    export function right<A, B>(_: A, y: B): Ior<A, B> {
        return Ior.right(y);
    }

    export function both<A, B>(x: A, y: B): Ior<A, B> {
        return Ior.both(x, y);
    }
}

namespace t.async {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export function left<A, B>(x: A, _: B): Promise<Ior<A, B>> {
        return Promise.resolve(Ior.left(x));
    }

    export function right<A, B>(_: A, y: B): Promise<Ior<A, B>> {
        return Promise.resolve(Ior.right(y));
    }

    export function both<A, B>(x: A, y: B): Promise<Ior<A, B>> {
        return Promise.resolve(Ior.both(x, y));
    }
}

const _1 = 1 as const;
const _2 = 2 as const;
const _3 = 3 as const;
const _4 = 4 as const;

const str_a = new Str("a");
const str_c = new Str("c");

describe("ior.js", () => {
    describe("Ior", () => {
        specify("go", () => {
            const t0 = Ior.go(function* () {
                const x = yield* t.left(str_a, _2);
                const [y, z] = yield* t.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t0, Ior.left(str_a));

            const t1 = Ior.go(function* () {
                const x = yield* t.left(str_a, _2);
                const [y, z] = yield* t.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t1, Ior.left(str_a));

            const t2 = Ior.go(function* () {
                const x = yield* t.left(str_a, _2);
                const [y, z] = yield* t.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t2, Ior.left(str_a));

            const t3 = Ior.go(function* () {
                const x = yield* t.right(str_a, _2);
                const [y, z] = yield* t.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t3, Ior.left(str_c));

            const t4 = Ior.go(function* () {
                const x = yield* t.right(str_a, _2);
                const [y, z] = yield* t.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t4, Ior.right([_2, _2, _4] as const));

            const t5 = Ior.go(function* () {
                const x = yield* t.right(str_a, _2);
                const [y, z] = yield* t.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t5, Ior.both(str_c, [_2, _2, _4] as const));

            const t6 = Ior.go(function* () {
                const x = yield* t.both(str_a, _2);
                const [y, z] = yield* t.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t6, Ior.left(cmb(str_a, str_c)));

            const t7 = Ior.go(function* () {
                const x = yield* t.both(str_a, _2);
                const [y, z] = yield* t.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t7, Ior.both(str_a, [_2, _2, _4] as const));

            const t8 = Ior.go(function* () {
                const x = yield* t.both(str_a, _2);
                const [y, z] = yield* t.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(
                t8,
                Ior.both(cmb(str_a, str_c), [_2, _2, _4] as const),
            );
        });

        specify("reduce", () => {
            const t0 = Ior.reduce(
                ["x", "y"],
                (xs, x) => t.both(str_a, xs + x),
                "",
            );
            assert.deepEqual(t0, Ior.both(cmb(str_a, str_a), "xy"));
        });

        specify("collect", () => {
            const t0 = Ior.collect([
                t.both(str_a, _2),
                t.both(str_c, _4),
            ] as const);
            assert.deepEqual(
                t0,
                Ior.both(cmb(str_a, str_c), [_2, _4] as const),
            );
        });

        specify("gather", () => {
            const t0 = Ior.gather({
                x: t.both(str_a, _2),
                y: t.both(str_c, _4),
            });
            assert.deepEqual(t0, Ior.both(cmb(str_a, str_c), { x: _2, y: _4 }));
        });

        specify("lift", () => {
            const t0 = Ior.lift(tuple<2, 4>)(
                t.both(str_a, _2),
                t.both(str_c, _4),
            );
            assert.deepEqual(
                t0,
                Ior.both(cmb(str_a, str_c), [_2, _4] as const),
            );
        });

        specify("goAsync", async () => {
            const t0 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.left(str_a, _2);
                const [y, z] = yield* await t.async.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t0, Ior.left(str_a));

            const t1 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.left(str_a, _2);
                const [y, z] = yield* await t.async.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t1, Ior.left(str_a));

            const t2 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.left(str_a, _2);
                const [y, z] = yield* await t.async.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t2, Ior.left(str_a));

            const t3 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.right(str_a, _2);
                const [y, z] = yield* await t.async.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t3, Ior.left(str_c));

            const t4 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.right(str_a, _2);
                const [y, z] = yield* await t.async.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t4, Ior.right([_2, _2, _4] as const));

            const t5 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.right(str_a, _2);
                const [y, z] = yield* await t.async.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t5, Ior.both(str_c, [_2, _2, _4] as const));

            const t6 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.both(str_a, _2);
                const [y, z] = yield* await t.async.left(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t6, Ior.left(cmb(str_a, str_c)));

            const t7 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.both(str_a, _2);
                const [y, z] = yield* await t.async.right(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(t7, Ior.both(str_a, [_2, _2, _4] as const));

            const t8 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.both(str_a, _2);
                const [y, z] = yield* await t.async.both(str_c, tuple(x, _4));
                return [x, y, z] as const;
            });
            assert.deepEqual(
                t8,
                Ior.both(cmb(str_a, str_c), [_2, _2, _4] as const),
            );

            const t9 = await Ior.goAsync(async function* () {
                const x = yield* await t.async.both(str_a, Promise.resolve(_2));
                const [y, z] = yield* await t.async.both(
                    str_c,
                    Promise.resolve(tuple(x, _4)),
                );
                return Promise.resolve([x, y, z] as const);
            });
            assert.deepEqual(
                t9,
                Ior.both(cmb(str_a, str_c), [_2, _2, _4] as const),
            );
        });

        specify("#[Eq.eq]", () => {
            fc.assert(
                fc.property(
                    arb.num(),
                    arb.num(),
                    arb.num(),
                    arb.num(),
                    (a, x, b, y) => {
                        const t0 = eq(Ior.left(a), Ior.left(b));
                        assert.strictEqual(t0, eq(a, b));

                        const t1 = eq(Ior.left(a), Ior.right(y));
                        assert.strictEqual(t1, false);

                        const t2 = eq(Ior.left(a), Ior.both(b, y));
                        assert.strictEqual(t2, false);

                        const t3 = eq(Ior.right(x), Ior.left(b));
                        assert.strictEqual(t3, false);

                        const t4 = eq(Ior.right(x), Ior.right(y));
                        assert.strictEqual(t4, eq(x, y));

                        const t5 = eq(Ior.right(x), Ior.both(b, y));
                        assert.strictEqual(t5, false);

                        const t6 = eq(Ior.both(a, x), Ior.left(b));
                        assert.strictEqual(t6, false);

                        const t7 = eq(Ior.both(a, x), Ior.right(y));
                        assert.strictEqual(t7, false);

                        const t8 = eq(Ior.both(a, x), Ior.both(b, y));
                        assert.strictEqual(t8, eq(a, b) && eq(x, y));
                    },
                ),
            );
        });

        specify("#[Ord.cmp]", () => {
            fc.assert(
                fc.property(
                    arb.num(),
                    arb.num(),
                    arb.num(),
                    arb.num(),
                    (a, x, b, y) => {
                        const t0 = cmp(Ior.left(a), Ior.left(b));
                        assert.strictEqual(t0, cmp(a, b));

                        const t1 = cmp(Ior.left(a), Ior.right(y));
                        assert.strictEqual(t1, Ordering.less);

                        const t2 = cmp(Ior.left(a), Ior.both(b, y));
                        assert.strictEqual(t2, Ordering.less);

                        const t3 = cmp(Ior.right(x), Ior.left(b));
                        assert.strictEqual(t3, Ordering.greater);

                        const t4 = cmp(Ior.right(x), Ior.right(y));
                        assert.strictEqual(t4, cmp(x, y));

                        const t5 = cmp(Ior.right(x), Ior.both(b, y));
                        assert.strictEqual(t5, Ordering.less);

                        const t6 = cmp(Ior.both(a, x), Ior.left(b));
                        assert.strictEqual(t6, Ordering.greater);

                        const t7 = cmp(Ior.both(a, x), Ior.right(y));
                        assert.strictEqual(t7, Ordering.greater);

                        const t8 = cmp(Ior.both(a, x), Ior.both(b, y));
                        assert.strictEqual(t8, cmb(cmp(a, b), cmp(x, y)));
                    },
                ),
            );
        });

        specify("#[Semigroup.cmb]", () => {
            fc.assert(
                fc.property(
                    arb.str(),
                    arb.str(),
                    arb.str(),
                    arb.str(),
                    (a, x, b, y) => {
                        const t0 = cmb(Ior.left(a), Ior.left(b));
                        assert.deepEqual(t0, Ior.left(cmb(a, b)));

                        const t1 = cmb(Ior.left(a), Ior.right(y));
                        assert.deepEqual(t1, Ior.both(a, y));

                        const t2 = cmb(Ior.left(a), Ior.both(b, y));
                        assert.deepEqual(t2, Ior.both(cmb(a, b), y));

                        const t3 = cmb(Ior.right(x), Ior.left(b));
                        assert.deepEqual(t3, Ior.both(b, x));

                        const t4 = cmb(Ior.right(x), Ior.right(y));
                        assert.deepEqual(t4, Ior.right(cmb(x, y)));

                        const t5 = cmb(Ior.right(x), Ior.both(b, y));
                        assert.deepEqual(t5, Ior.both(b, cmb(x, y)));

                        const t6 = cmb(Ior.both(a, x), Ior.left(b));
                        assert.deepEqual(t6, Ior.both(cmb(a, b), x));

                        const t7 = cmb(Ior.both(a, x), Ior.right(y));
                        assert.deepEqual(t7, Ior.both(a, cmb(x, y)));

                        const t8 = cmb(Ior.both(a, x), Ior.both(b, y));
                        assert.deepEqual(t8, Ior.both(cmb(a, b), cmb(x, y)));
                    },
                ),
            );
        });

        specify("#unwrap", () => {
            const t0 = t.left(_1, _2).unwrap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
                tuple,
            );
            assert.deepEqual(t0, [_1, _3]);

            const t1 = t.right(_1, _2).unwrap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
                tuple,
            );
            assert.deepEqual(t1, [_2, _4]);

            const t2 = t.both(_1, _2).unwrap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
                tuple,
            );
            assert.deepEqual(t2, [_1, _2]);
        });

        specify("#isLeft", () => {
            const t0 = t.left(_1, _2).isLeft();
            assert.strictEqual(t0, true);

            const t1 = t.right(_1, _2).isLeft();
            assert.strictEqual(t1, false);

            const t2 = t.both(_1, _2).isLeft();
            assert.strictEqual(t2, false);
        });

        specify("#isRight", () => {
            const t0 = t.left(_1, _2).isRight();
            assert.strictEqual(t0, false);

            const t1 = t.right(_1, _2).isRight();
            assert.strictEqual(t1, true);

            const t2 = t.both(_1, _2).isRight();
            assert.strictEqual(t2, false);
        });

        specify("#isBoth", () => {
            const t0 = t.left(_1, _2).isBoth();
            assert.strictEqual(t0, false);

            const t1 = t.right(_1, _2).isBoth();
            assert.strictEqual(t1, false);

            const t2 = t.both(_1, _2).isBoth();
            assert.strictEqual(t2, true);
        });

        specify("#flatMap", () => {
            const t0 = t
                .left(str_a, _2)
                .flatMap((x) => t.left(str_c, tuple(x, _4)));
            assert.deepEqual(t0, Ior.left(str_a));

            const t1 = t
                .left(str_a, _2)
                .flatMap((x) => t.right(str_c, tuple(x, _4)));
            assert.deepEqual(t1, Ior.left(str_a));

            const t2 = t
                .left(str_a, _2)
                .flatMap((x) => t.both(str_c, tuple(x, _4)));
            assert.deepEqual(t2, Ior.left(str_a));

            const t3 = t
                .right(str_a, _2)
                .flatMap((x) => t.left(str_c, tuple(x, _4)));
            assert.deepEqual(t3, Ior.left(str_c));

            const t4 = t
                .right(str_a, _2)
                .flatMap((x) => t.right(str_c, tuple(x, _4)));
            assert.deepEqual(t4, Ior.right([_2, _4] as const));

            const t5 = t
                .right(str_a, _2)
                .flatMap((x) => t.both(str_c, tuple(x, _4)));
            assert.deepEqual(t5, Ior.both(str_c, [_2, _4] as const));

            const t6 = t
                .both(str_a, _2)
                .flatMap((x) => t.left(str_c, tuple(x, _4)));
            assert.deepEqual(t6, Ior.left(cmb(str_a, str_c)));

            const t7 = t
                .both(str_a, _2)
                .flatMap((x) => t.right(str_c, tuple(x, _4)));
            assert.deepEqual(t7, Ior.both(str_a, [_2, _4] as const));

            const t8 = t
                .both(str_a, _2)
                .flatMap((x) => t.both(str_c, tuple(x, _4)));
            assert.deepEqual(
                t8,
                Ior.both(cmb(str_a, str_c), [_2, _4] as const),
            );
        });

        specify("#zipWith", () => {
            const t0 = t.both(str_a, _2).zipWith(t.both(str_c, _4), tuple);
            assert.deepEqual(
                t0,
                Ior.both(cmb(str_a, str_c), [_2, _4] as const),
            );
        });

        specify("#zipFst", () => {
            const t0 = t.both(str_a, _2).zipFst(t.both(str_c, _4));
            assert.deepEqual(t0, Ior.both(cmb(str_a, str_c), _2));
        });

        specify("#zipSnd", () => {
            const t0 = t.both(str_a, _2).zipSnd(t.both(str_c, _4));
            assert.deepEqual(t0, Ior.both(cmb(str_a, str_c), _4));
        });

        specify("#map", () => {
            const t0 = t.left(_1, _2).map((x) => tuple(x, _4));
            assert.deepEqual(t0, Ior.left(_1));

            const t1 = t.right(_1, _2).map((x) => tuple(x, _4));
            assert.deepEqual(t1, Ior.right([_2, _4] as const));

            const t2 = t.both(_1, _2).map((x) => tuple(x, _4));
            assert.deepEqual(t2, Ior.both(_1, [_2, _4] as const));
        });

        specify("#lmap", () => {
            const t0 = t.left(_1, _2).lmap((x) => tuple(x, _3));
            assert.deepEqual(t0, Ior.left([_1, _3] as const));

            const t1 = t.right(_1, _2).lmap((x) => tuple(x, _3));
            assert.deepEqual(t1, Ior.right(_2));

            const t2 = t.both(_1, _2).lmap((x) => tuple(x, _3));
            assert.deepEqual(t2, Ior.both([_1, _3] as const, _2));
        });

        specify("#bimap", () => {
            const t0 = t.left(_1, _2).bimap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
            );
            assert.deepEqual(t0, Ior.left([_1, _3] as const));

            const t1 = t.right(_1, _2).bimap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
            );
            assert.deepEqual(t1, Ior.right([_2, _4] as const));

            const t2 = t.both(_1, _2).bimap(
                (x) => tuple(x, _3),
                (x) => tuple(x, _4),
            );
            assert.deepEqual(
                t2,
                Ior.both([_1, _3] as const, [_2, _4] as const),
            );
        });
    });
});
