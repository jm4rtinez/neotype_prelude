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

import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
    arbNum,
    arbStr,
    expectLawfulEq,
    expectLawfulOrd,
    expectLawfulSemigroup,
    tuple,
} from "./_test/utils.js";
import { cmb } from "./cmb.js";
import { cmp, eq } from "./cmp.js";
import { Pair } from "./pair.js";

describe("Pair", () => {
    function arbPair<A, B>(
        arbFst: fc.Arbitrary<A>,
        arbSnd: fc.Arbitrary<B>,
    ): fc.Arbitrary<Pair<A, B>> {
        return arbFst.chain((x) => arbSnd.map((y) => new Pair(x, y)));
    }

    describe("constructor", () => {
        it("constructs a new Pair", () => {
            const pair = new Pair<1, 2>(1, 2);
            expect(pair).to.be.an.instanceOf(Pair);
            expect(pair.fst).to.equal(1);
            expect(pair.snd).to.equal(2);
            expect(pair.val).to.deep.equal([1, 2]);
        });
    });

    describe("fromTuple", () => {
        it("constructs a Pair from a 2-tuple of values", () => {
            const pair = Pair.fromTuple<1, 2>([1, 2]);
            expect(pair).to.deep.equal(new Pair(1, 2));
        });
    });

    describe("#[Eq.eq]", () => {
        it("compares the first values and the second values lexicographically", () => {
            fc.assert(
                fc.property(
                    arbNum(),
                    arbNum(),
                    arbNum(),
                    arbNum(),
                    (a, x, b, y) => {
                        expect(eq(new Pair(a, x), new Pair(b, y))).to.equal(
                            eq(a, b) && eq(x, y),
                        );
                    },
                ),
            );
        });

        it("implements a lawful equivalence relation", () => {
            expectLawfulEq(arbPair(arbNum(), arbNum()));
        });
    });

    describe("#[Ord.cmp]", () => {
        it("compares the first values and the second values lexicographically", () => {
            fc.assert(
                fc.property(
                    arbNum(),
                    arbNum(),
                    arbNum(),
                    arbNum(),
                    (a, x, b, y) => {
                        expect(cmp(new Pair(a, x), new Pair(b, y))).to.equal(
                            cmb(cmp(a, b), cmp(x, y)),
                        );
                    },
                ),
            );
        });

        it("implements a lawful total order", () => {
            expectLawfulOrd(arbPair(arbNum(), arbNum()));
        });
    });

    describe("#[Semigroup.cmb]", () => {
        it("combines the first values and the second values pairwise", () => {
            fc.assert(
                fc.property(
                    arbStr(),
                    arbStr(),
                    arbStr(),
                    arbStr(),
                    (a, x, b, y) => {
                        expect(
                            cmb(new Pair(a, x), new Pair(b, y)),
                        ).to.deep.equal(new Pair(cmb(a, b), cmb(x, y)));
                    },
                ),
            );
        });

        it("implements a lawful semigroup", () => {
            expectLawfulSemigroup(arbPair(arbStr(), arbStr()));
        });
    });

    describe("#unwrap", () => {
        it("applies the function to the first value and the second value", () => {
            const result = new Pair<1, 2>(1, 2).unwrap(tuple);
            expect(result).to.deep.equal([1, 2]);
        });
    });

    describe("#lmap", () => {
        it("applies the function to the first value", () => {
            const pair = new Pair<1, 2>(1, 2).lmap((x): [1, 3] => [x, 3]);
            expect(pair).to.deep.equal(new Pair([1, 3], 2));
        });
    });

    describe("#map", () => {
        it("applies the function to the second value", () => {
            const pair = new Pair<1, 2>(1, 2).map((x): [2, 4] => [x, 4]);
            expect(pair).to.deep.equal(new Pair(1, [2, 4]));
        });
    });
});