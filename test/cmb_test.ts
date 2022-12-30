import { expect } from "chai";
import * as fc from "fast-check";
import { cmb, Semigroup } from "../src/cmb.js";
import { arbStr } from "./common.js";

describe("cmb.js", () => {
    describe("cmb", () => {
        it("combines two Semigroup values from left to right", () => {
            fc.assert(
                fc.property(arbStr(), arbStr(), (x, y) => {
                    expect(cmb(x, y)).to.deep.equal(x[Semigroup.cmb](y));
                }),
            );
        });
    });
});
