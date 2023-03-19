/*
 * Copyright 2022-2023 Josh Martinez
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
import * as fc from "fast-check";
import { arbStr, expectLawfulSemigroup, tuple } from "./_test/utils.js";
import { Semigroup, cmb } from "./cmb.js";
import { Eq, eq } from "./cmp.js";
import { Eval } from "./eval.js";

describe("eval.js", () => {
    describe("Eval", () => {
        describe("now", () => {
            it("constructs an Eval eagerly from the the value", () => {
                const ev = Eval.now<1>(1);
                const outcome = ev.run();
                expect(outcome).to.equal(1);
            });
        });

        describe("once", () => {
            it("constructs an Eval that evaluates the thunk at most once", () => {
                function f(): 1 {
                    f.counter++;
                    return 1;
                }
                f.counter = 0;

                const once = Eval.once(f);
                const ev = once.zipWith(once, tuple);
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 1]);
                expect(f.counter).to.equal(1);
            });
        });

        describe("always", () => {
            it("constructs an Eval that evaluates the thunk on every reference", () => {
                function f(): 1 {
                    f.counter++;
                    return 1;
                }
                f.counter = 0;

                const always = Eval.always(f);
                const ev = always.zipWith(always, tuple);
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 1]);
                expect(f.counter).to.equal(2);
            });
        });

        describe("defer", () => {
            it("constructs an Eval lazily from the function", () => {
                const ev = Eval.defer(() => Eval.now<1>(1));
                const outcome = ev.run();
                expect(outcome).to.equal(1);
            });
        });

        describe("go", () => {
            it("constructs an Eval using the generator comprehension", () => {
                const ev = Eval.go(function* () {
                    const x = yield* Eval.now<1>(1);
                    const [y, z] = yield* Eval.now(tuple<[1, 2]>(x, 2));
                    return tuple(x, y, z);
                });
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 1, 2]);
            });
        });

        describe("goFn", () => {
            it("accesses the parameters of the generator function", () => {
                const f = Eval.goFn(function* <T>(w: T) {
                    const x = yield* Eval.now<1>(1);
                    const [y, z] = yield* Eval.now(tuple<[1, 2]>(x, 2));
                    return tuple(w, x, y, z);
                });
                const ev = f<0>(0);
                const outcome = ev.run();
                expect(outcome).to.deep.equal([0, 1, 1, 2]);
            });
        });

        describe("reduce", () => {
            it("reduces the finite iterable from left to right in the context of Eval", () => {
                const ev = Eval.reduce(
                    ["x", "y"],
                    (xs, x) => Eval.now(xs + x),
                    "",
                );
                const outcome = ev.run();
                expect(outcome).to.equal("xy");
            });
        });

        describe("collect", () => {
            it("turns the array or the tuple literal of Eval elements inside out", () => {
                const ev = Eval.collect([Eval.now<1>(1), Eval.now<2>(2)]);
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 2]);
            });
        });

        describe("gather", () => {
            it("turns the record or the object literal of Eval elements inside out", () => {
                const ev = Eval.gather({
                    x: Eval.now<1>(1),
                    y: Eval.now<2>(2),
                });
                const outcome = ev.run();
                expect(outcome).to.deep.equal({ x: 1, y: 2 });
            });
        });

        describe("lift", () => {
            it("lifts the function into the context of Eval", () => {
                const ev = Eval.lift(tuple)(Eval.now<1>(1), Eval.now<2>(2));
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 2]);
            });
        });

        describe("#[Semigroup.cmb]", () => {
            it("combines the outcomes", () => {
                fc.assert(
                    fc.property(arbStr(), arbStr(), (x, y) => {
                        expect(
                            cmb(Eval.now(x), Eval.now(y)).run(),
                        ).to.deep.equal(cmb(x, y));
                    }),
                );
            });

            it("implements a lawful semigroup", () => {
                class RunEval<out T> {
                    constructor(readonly val: Eval<T>) {}

                    [Eq.eq]<T extends Eq<T>>(
                        this: RunEval<T>,
                        that: RunEval<T>,
                    ): boolean {
                        return eq(this.val.run(), that.val.run());
                    }

                    [Semigroup.cmb]<T extends Semigroup<T>>(
                        this: RunEval<T>,
                        that: RunEval<T>,
                    ): RunEval<T> {
                        return new RunEval(cmb(this.val, that.val));
                    }
                }

                function arbRunEval<T>(
                    arb: fc.Arbitrary<T>,
                ): fc.Arbitrary<RunEval<T>> {
                    return arb.chain((x) =>
                        fc
                            .oneof(
                                fc.constant(Eval.now(x)),
                                fc.constant(Eval.once(() => x)),
                                fc.constant(Eval.always(() => x)),
                            )
                            .map((ev) => new RunEval(ev)),
                    );
                }

                expectLawfulSemigroup(arbRunEval(arbStr()));
            });
        });

        describe("#flatMap", () => {
            it("applies the continuation to the outcome", () => {
                const ev = Eval.now<1>(1).flatMap(
                    (x): Eval<[1, 2]> => Eval.now([x, 2]),
                );
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 2]);
            });
        });

        describe("#zipWith", () => {
            it("applies the function to the outcomes", () => {
                const ev = Eval.now<1>(1).zipWith(Eval.now<2>(2), tuple);
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 2]);
            });
        });

        describe("#zipFst", () => {
            it("keeps only the first outcome", () => {
                const ev = Eval.now<1>(1).zipFst(Eval.now<2>(2));
                const outcome = ev.run();
                expect(outcome).to.equal(1);
            });
        });

        describe("#zipSnd", () => {
            it("keeps only the second outcome", () => {
                const ev = Eval.now<1>(1).zipSnd(Eval.now<2>(2));
                const outcome = ev.run();
                expect(outcome).to.equal(2);
            });
        });

        describe("#map", () => {
            it("applies the function to the outcome", () => {
                const ev = Eval.now<1>(1).map((x): [1, 2] => tuple(x, 2));
                const outcome = ev.run();
                expect(outcome).to.deep.equal([1, 2]);
            });
        });
    });
});