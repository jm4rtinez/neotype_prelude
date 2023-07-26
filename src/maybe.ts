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

/**
 * Optional values.
 *
 * @remarks
 *
 * `Maybe<T>` is a type that represents an optional value. It is represented by
 * two variants: `Nothing` and `Just<T>`.
 *
 * -   The `Nothing` variant represents an *absent* `Maybe`, and contains no
 *     value.
 * -   The `Just<T>` variant represents a *present* `Maybe`, and contains a
 *     value of type `T`.
 *
 * Common uses for `Maybe` include:
 *
 * -   Initial values
 * -   Nullable values
 * -   Return values for functions that are not defined over their entire input
 *     range (partial functions)
 * -   Return values for reporting simple failures, where `Nothing` is returned
 *     on failure
 *
 * ## Importing from this module
 *
 * This module exports `Maybe` as both a type and a namespace. The `Maybe` type
 * is an alias for a discriminated union, and the `Maybe` namespace provides:
 *
 * -   The `Nothing` and `Just` variant classes
 * -   The abstract `Syntax` class that provides the fluent API for `Maybe`
 * -   The `Kind` enumeration that discriminates `Maybe`
 * -   The `nothing` constant
 * -   Functions for constructing, chaining, collecting into, and lifting into
 *     `Maybe`
 *
 * The type and namespce can be imported under the same alias:
 *
 * ```ts
 * import { Maybe } from "@neotype/prelude/maybe.js";
 * ```
 *
 * Or, the type and namespace can be imported and aliased separately:
 *
 * ```ts
 * import { type Maybe, Maybe as M } from "@neotype/prelude/maybe.js";
 * ```
 *
 * ## Constructing `Maybe`
 *
 * The `nothing` constant is the singleton instance of the absent `Maybe`.
 *
 * These functions construct a `Maybe`:
 *
 * -   `just` constructs a present `Maybe`.
 * -   `fromNullish` constructs a `Maybe` from a value that is potentially
 *     `null` or `undefined`.
 *
 * These functions adapt other functions to return a `Maybe`:
 *
 * -   `wrapFn` adapts a function that may return `null` or `undefined`.
 * -   `wrapPred` adapts a predicate.
 *
 * ## Querying and narrowing the variant
 *
 * The `isNothing` and `isJust` methods return `true` if a `Maybe` is absent or
 * present, respectively. These methods also narrow the type of a `Maybe` to the
 * queried variant.
 *
 * The variant can also be queried and narrowed via the `kind` property, which
 * returns a member of the `Kind` enumeration.
 *
 * ## Extracting values
 *
 * If a `Maybe` is present, its value can be accessed via the `val` property. To
 * access the property, the variant must first be queried and narrowed to
 * `Just`.
 *
 * The `unwrap` method unwraps a `Maybe` by either evaluating a function if
 * absent, or applying a function to its value if present.
 *
 * These methods extract the value from a `Maybe` if present; otherwise:
 *
 * -   `getOrElse` evaluates a function to return a fallback result.
 * -   `getOr` returns a fallback value.
 * -   `toNullish` returns `undefined`.
 *
 * ## Comparing `Maybe`
 *
 * `Maybe` has the following behavior as an equivalence relation:
 *
 * -   A `Maybe<T>` implements `Eq` when `T` implements `Eq`.
 * -   Two `Maybe` values are equal if they are both absent, or they are both
 *     present and and their values are equal.
 *
 * `Maybe` has the following behavior as a total order:
 *
 * -   A `Maybe<T>` implements `Ord` when `T` implements `Ord`.
 * -   When ordered, an absent `Maybe` always compares as less than than any
 *     present `Maybe`. If they are both present, their values are compared to
 *     determine the ordering.
 *
 * ## `Maybe` as a semigroup
 *
 * `Maybe` has the following behavior as a semigroup:
 *
 * -   A `Maybe<T>` implements `Semigroup` when `T` implements `Semigroup`.
 * -   When combined, present `Maybe` values have precedence over absent `Maybe`
 *     values. If they are both present, their values are combined and returned
 *     in a `Just`.
 *
 * ## Transforming values
 *
 * These methods transform the value within a `Maybe` if present, or do nothing
 * if absent:
 *
 * -   `map` applies a function to the value.
 * -   `mapNullish` applies a function to the value that may return a `null` or
 *     an `undefined` result, and converts those results to `Nothing`.
 * -   `filter` keeps the value if it satisfies a predicate, or returns
 *     `Nothing` otherwise.
 *
 * ## Recovering from `Nothing`
 *
 * These methods act on an absent `Maybe` to produce a fallback `Maybe`:
 *
 * -   `orElse` evaluates a function to return a fallback `Maybe`.
 * -   `or` returns a fallback `Maybe`.
 *
 * ## Chaining `Maybe`
 *
 * These methods act on a present `Maybe` to produce another `Maybe`:
 *
 * -   `andThen` applies a function to the value to return another `Maybe`.
 * -   `andThenGo` applies a synchronous generator comprehension function to the
 *     value and evaluates the generator to return another `Maybe`.
 * -   `and` ignores the value and returns another `Maybe`.
 * -   `zipWith` evaluates another `Maybe`, and if present, applies a function
 *     to both values.
 *
 * ## Generator comprehenshions
 *
 * Generator comprehensions provide an imperative syntax for chaining together
 * synchronous or asynchronous computations that return or resolve with `Maybe`
 * values.
 *
 * ### Writing comprehensions
 *
 * Synchronus and asynchronous comprehensions are written using `function*` and
 * `async function*` declarations, respectively.
 *
 * Synchronous generator functions should use the `Maybe.Go` type alias as a
 * return type. A generator function that returns a `Maybe.Go<T>` may `yield*`
 * zero or more `Maybe<any>` values and must return a result of type `T`.
 * Synchronous comprehensions may also `yield*` other `Maybe.Go` generators
 * directly.
 *
 * Async generator functions should use the `Maybe.GoAsync` type alias as a
 * return type. An async generator function that returns a `Maybe.GoAsync<T>`
 * may `yield*` zero or more `Maybe<any>` values and must return a result of
 * type `T`. `PromiseLike` values that resolve with `Maybe` should be awaited
 * before yielding. Async comprehensions may also `yield*` other `Maybe.Go` and
 * `Maybe.GoAsync` generators directly.
 *
 * Each `yield*` expression may bind a variable of the present value type of the
 * yielded `Maybe`. Comprehensions should always use `yield*` instead of
 * `yield`. Using `yield*` allows TypeScript to accurately infer the present
 * value type of the yielded `Maybe` when binding the value of each `yield*`
 * expression.
 *
 * ### Evaluating comprehensions
 *
 * `Maybe.Go` and `Maybe.GoAsync` generators must be evaluated before accessing
 * their results.
 *
 * The `go` function evaluates a `Maybe.Go<T>` generator to return a `Maybe<T>`
 * If any yielded `Maybe` is absent, the generator halts and `go` returns
 * `Nothing`; otherwise, when the generator returns, `go` returns the result in
 * a `Just`.
 *
 * The `goAsync` function evaluates a `Maybe.GoAsync<T>` async generator to
 * return a `Promise<Maybe<T>>`. If any yielded `Maybe` is absent, the generator
 * halts and `goAsync` resolves with the `Nothing`; otherwise, when the
 * generator returns, `goAsync` resolves with the result in a `Just`. Thrown
 * errors are captured as rejections.
 *
 * ## Collecting into `Maybe`
 *
 * These functions map the elements in an iterable to `Maybe` values, evaluate
 * the values, and act on the present values:
 *
 * -   `reduce` accumulates the present values.
 * -   `traverseInto` collects the present values into a `Builder`.
 * -   `traverse` collects the present values in an array.
 * -   `forEach` ignores the present values.
 *
 * These functions evaluate the `Maybe` elements in a structure and collect the
 * present values:
 *
 * -   `allInto` traverses an iterable and collects the present values into
 *     a `Builder`.
 * -   `all` traverses an iterable and collects the present values in an array
 *     or a tuple literal.
 * -   `allProps` traverses a string-keyed record or object literal and collects
 *     the present values in an equivalent structure.
 *
 * ### Collecting concurrently
 *
 * These functions map the elements in an iterable to promise-like `Maybe`
 * values, concurrently evaluate the values, and act on the present values:
 *
 * -   `traverseIntoPar` collects the present values into a `Builder`.
 * -   `traversePar` collects the present values in an array.
 * -   `forEachPar` ignores the present values.
 *
 * These functions concurrently evaluate the promise-like `Maybe` elements in a
 * structure and collect the present values:
 *
 * -   `allIntoPar` traverses an iterable and collects the present values
 *     into a `Builder`.
 * -   `allPar` traverses an iterable and collects the present values in an
 *     array or a tuple literal.
 * -   `allPropsPar` traverses a string-keyed record or object literal and
 *     collects the present values in an equivalent structure.
 *
 * ## Lifting functions into the context of `Maybe`
 *
 * These functions adapt a function to work with `Maybe` values:
 *
 * -   `lift` adapts a synchronous function to accept `Maybe` values as
 *     arguments and return a `Maybe`.
 * -   `liftAsync` adapts a synchronous or an asynchronous function to accept
 *     promise-like `Maybe` values as arguments and return a `Promise` that
 *     resolves with a `Maybe`.
 *
 * @example Basic matching and unwrapping
 *
 * ```ts
 * import { Maybe } from "@neotype/prelude/maybe.js"
 *
 * const maybeNum: Maybe<number> = Maybe.just(1);
 *
 * // Querying and narrowing using methods
 * if (maybeNum.isNothing()) {
 *     console.log("Queried Nothing");
 * } else {
 *     console.log(`Queried Just: ${maybeNum.val}`);
 * }
 *
 * // Querying and narrowing using the `kind` property
 * switch (maybeNum.kind) {
 *     case Maybe.Kind.NOTHING:
 *         console.log("Matched Nothing");
 *         break;
 *     case Maybe.Kind.JUST:
 *         console.log(`Matched Just: ${maybeNum.val}`);
 * }
 *
 * // Case analysis using `unwrap`
 * maybeNum.unwrap(
 *     () => console.log("Unwrapped Nothing"),
 *     (num) => console.log(`Unwrapped Just: ${num}`),
 * );
 * ```
 *
 * @example Parsing with `Maybe`
 *
 * First, the necessary imports:
 *
 * ```ts
 * import { Maybe } from "@neotype/prelude/maybe.js";
 * ```
 *
 * Now, consider a program that uses `Maybe` to parse an even integer:
 *
 * ```ts
 * function parseInt(input: string): Maybe<number> {
 *     const n = Number.parseInt(input);
 *     return Number.isNaN(n) ? Maybe.nothing : Maybe.just(n);
 * }
 *
 * function guardEven(n: number): Maybe<number> {
 *     return n % 2 === 0 ? Maybe.just(n) : Maybe.nothing;
 * }
 *
 * function parseEvenInt(input: string): Maybe<number> {
 *     return parseInt(input).andThen(guardEven);
 * }
 *
 * ["a", "1", "2", "-4", "+42", "0x2A"].forEach((input) => {
 *     const result = JSON.stringify(
 *         parseEvenInt(input).getOr("invalid input"),
 *     );
 *     console.log(`input "${input}": ${result}`);
 * });
 *
 * // input "a": "invalid input"
 * // input "1": "invalid input"
 * // input "2": 2
 * // input "-4": -4
 * // input "+42": 18
 * // input: "0x2A": 18
 * ```
 *
 * Suppose we want to parse an array of inputs and collect the successful
 * results, or fail on the first parse error. We may write the following:
 *
 * ```ts
 * function parseEvenInts(inputs: string[]): Maybe<number[]> {
 *     return Maybe.all(inputs.map(parseEvenInt));
 * }
 *
 * [
 *     ["a", "-4"],
 *     ["2", "-7"],
 *     ["+42", "0x2A"],
 * ].forEach((inputs) => {
 *     const result = JSON.stringify(
 *         parseEvenInts(inputs).getOr("invalid input"),
 *     );
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "invalid input"
 * // inputs ["2","-7"]: "invalid input"
 * // inputs ["+42","0x2A"]: [42,42]
 * ```
 *
 * Perhaps we want to associate the original input strings with our successful
 * parses:
 *
 * ```ts
 * function parseEvenIntsKeyed(
 *     inputs: string[],
 * ): Maybe<Record<string, number>> {
 *     return Maybe.allProps(
 *         Object.fromEntries(
 *             inputs.map((input) => [input, parseEvenInt(input)] as const),
 *         ),
 *     );
 * }
 *
 * [
 *     ["a", "-4"],
 *     ["2", "-7"],
 *     ["+42", "0x2A"],
 * ].forEach((inputs) => {
 *     const result = JSON.stringify(
 *         parseEvenIntsKeyed(inputs).getOr("invalid input"),
 *     );
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "invalid input"
 * // inputs ["2","-7"]: "invalid input"
 * // inputs ["+42","0x2A"]: {"+42":42,"0x2A":42}
 * ```
 *
 * Or, perhaps we want to sum our successful parses and return a total:
 *
 * ```ts
 * function parseEvenIntsAndSum(inputs: string[]): Maybe<number> {
 *     return Maybe.reduce(
 *         inputs,
 *         (total, input) => parseEvenInt(input).map((even) => total + even),
 *         0,
 *     );
 * }
 *
 * [
 *     ["a", "-4"],
 *     ["2", "-7"],
 *     ["+42", "0x2A"],
 * ].forEach((inputs) => {
 *     const result = JSON.stringify(
 *         parseEvenIntsAndSum(inputs).getOr("invalid input"),
 *     );
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "invalid input"
 * // inputs ["2","-7"]: "invalid input"
 * // inputs ["+42","0x2A"]: 84
 * ```
 *
 * @module
 */

import {
	ArrayEntryBuilder,
	ArrayPushBuilder,
	NoOpBuilder,
	RecordEntryBuilder,
	type Builder,
} from "./builder.js";
import { Semigroup, cmb } from "./cmb.js";
import { Eq, Ord, Ordering, cmp, eq } from "./cmp.js";
import { id } from "./fn.js";

/**
 * A type that represents either an absent value (`Nothing`) or a present value
 * (`Just`).
 */
export type Maybe<T> = Maybe.Nothing | Maybe.Just<T>;

/**
 * The companion namespace for the `Maybe` type.
 */
export namespace Maybe {
	/**
	 * Construct a present `Maybe` from a value.
	 */
	export function just<T>(val: T): Maybe<T> {
		return new Just(val);
	}

	/**
	 * Consruct a `Maybe` from a value that is potentially `null` or
	 * `undefined`.
	 */
	export function fromNullish<T>(val: T | null | undefined): Maybe<T> {
		return val === null || val === undefined ? nothing : just(val);
	}

	/**
	 * Adapt a function that may return `null` or `undefined` into a function
	 * that returns a `Maybe`.
	 */
	export function wrapFn<TArgs extends unknown[], T>(
		f: (...args: TArgs) => T | null | undefined,
	): (...args: TArgs) => Maybe<T> {
		return (...args) => fromNullish(f(...args));
	}

	/**
	 * Adapt a predicate into a function that returns a `Maybe`.
	 */
	export function wrapPred<T, T1 extends T>(
		f: (val: T) => val is T1,
	): (val: T) => Maybe<T1>;

	export function wrapPred<T>(f: (val: T) => boolean): (val: T) => Maybe<T>;

	export function wrapPred<T>(f: (val: T) => boolean): (val: T) => Maybe<T> {
		return (val) => (f(val) ? just(val) : nothing);
	}

	/**
	 * Evaluate a `Maybe.Go` generator to return a `Maybe.`
	 */
	export function go<TReturn>(gen: Go<TReturn>): Maybe<TReturn> {
		let nxt = gen.next();
		let isHalted = false;
		while (!nxt.done) {
			const maybe = nxt.value;
			if (maybe.isJust()) {
				nxt = gen.next(maybe.val);
			} else {
				isHalted = true;
				nxt = gen.return(undefined as any);
			}
		}
		return isHalted ? nothing : just(nxt.value);
	}

	/**
	 * Accumulate the elements in an iterable using a reducer function that
	 * returns a `Maybe`.
	 */
	export function reduce<T, TAcc>(
		elems: Iterable<T>,
		accum: (acc: TAcc, val: T) => Maybe<TAcc>,
		initial: TAcc,
	): Maybe<TAcc> {
		return go(
			(function* () {
				let acc = initial;
				for (const val of elems) {
					acc = yield* accum(acc, val);
				}
				return acc;
			})(),
		);
	}

	/**
	 * Map the elements in an iterable to `Maybe` values, evaluate the values
	 * from left to right, and collect the present values into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function traverseInto<T, T1, TFinish>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<T1>,
		builder: Builder<T1, TFinish>,
	): Maybe<TFinish> {
		return go(
			(function* () {
				let idx = 0;
				for (const elem of elems) {
					builder.add(yield* f(elem, idx));
					idx++;
				}
				return builder.finish();
			})(),
		);
	}

	/**
	 * Map the elements in an iterable of key-element pairs to `Maybe` values,
	 * evaluate the values from left to right, and collect the key-present-value
	 * pairs into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function traverseEntriesInto<K, V, V1, TFinish>(
		entries: Iterable<readonly [K, V]>,
		f: (elem: V, key: K, idx: number) => Maybe<V1>,
		builder: Builder<readonly [K, V1], TFinish>,
	): Maybe<TFinish> {
		return traverseInto(
			entries,
			([key, elem], idx) =>
				f(elem, key, idx).map((val): [K, V1] => [key, val]),
			builder,
		);
	}

	/**
	 * Map the elements in an iterable to `Maybe` values, evaluate the values
	 * from left to right, and collect the present values in an array.
	 */
	export function traverse<T, T1>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<T1>,
	): Maybe<T1[]> {
		return traverseInto(elems, f, new ArrayPushBuilder());
	}

	/**
	 * Map the elements in an iterable of key-element pairs to `Maybe` values,
	 * evaluate the values from left to right, and collect the key-present-value
	 * pairs in an object.
	 */
	export function traverseEntries<K extends number | string | symbol, V, V1>(
		entries: Iterable<readonly [K, V]>,
		f: (elem: V, key: K, idx: number) => Maybe<V1>,
	): Maybe<Record<K, V1>> {
		return traverseEntriesInto(entries, f, new RecordEntryBuilder());
	}

	/**
	 * Evaluate the `Maybe` elements in an iterable from left to right and
	 * collect the present values into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function allInto<T, TFinish>(
		maybes: Iterable<Maybe<T>>,
		builder: Builder<T, TFinish>,
	): Maybe<TFinish> {
		return traverseInto(maybes, id, builder);
	}

	/**
	 * Evaluate the `Maybe` elements in an iterable of key-`Maybe` pairs from
	 * left to right and collect the key-present-value pairs into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function allEntriesInto<K, V, TFinish>(
		entries: Iterable<readonly [K, Maybe<V>]>,
		builder: Builder<readonly [K, V], TFinish>,
	): Maybe<TFinish> {
		return traverseEntriesInto(entries, id, builder);
	}

	/**
	 * Evaluate the `Maybe` elements in an array or a tuple literal from left
	 * to right and collect the present values in an equivalent structure.
	 *
	 * @remarks
	 *
	 * This function essentially turns an array or a tuple literal of `Maybe`
	 * elements "inside out". For example:
	 *
	 * -   `Maybe<T>[]` becomes `Maybe<T[]>`
	 * -   `[Maybe<T1>, Maybe<T2>]` becomes `Maybe<[T1, T2]>`
	 */
	export function all<TMaybes extends readonly Maybe<any>[] | []>(
		maybes: TMaybes,
	): Maybe<{ -readonly [K in keyof TMaybes]: JustT<TMaybes[K]> }>;

	/**
	 * Evaluate the `Maybe` elements in an iterable from left to right and
	 * collect the present values in an array.
	 *
	 * @remarks
	 *
	 * This function essentially turns an iterable of `Maybe` elements "inside
	 * out". For example, `Iterable<Maybe<T>>` becomes `Maybe<T[]>`.
	 */
	export function all<T>(maybes: Iterable<Maybe<T>>): Maybe<T[]>;

	export function all<T>(maybes: Iterable<Maybe<T>>): Maybe<T[]> {
		return traverse(maybes, id);
	}

	/**
	 * Evaluate the `Maybe` elements in an iterable of key-`Maybe` pairs from
	 * left to right and collect the key-present-value pairs in an object.
	 */
	export function allEntries<K extends number | string | symbol, V>(
		entries: Iterable<readonly [K, Maybe<V>]>,
	): Maybe<Record<K, V>> {
		return traverseEntries(entries, id);
	}

	/**
	 * Evaluate the `Maybe` elements in a string-keyed record or object literal
	 * and collect the present values in an equivalent structure.
	 *
	 * @remarks
	 *
	 * This function essentially turns a string-keyed record or object literal
	 * of `Maybe` elements "inside out". For example:
	 *
	 * -   `Record<string, Maybe<T>>` becomes `Maybe<Record<string, T>>`
	 * -   `{ x: Maybe<T1>, y: Maybe<T2> }` becomes `Maybe<{ x: T1, y: T2 }>`
	 */
	export function allProps<TMaybes extends Record<string, Maybe<any>>>(
		props: TMaybes,
	): Maybe<{ -readonly [K in keyof TMaybes]: JustT<TMaybes[K]> }>;

	export function allProps<T>(
		props: Record<string, Maybe<T>>,
	): Maybe<Record<string, T>> {
		return traverseEntries(Object.entries(props), id);
	}

	/**
	 * Map the elements in an iterable to `Maybe` values, evaluate the values
	 * from left to right, and ignore the present values.
	 */
	export function forEach<T>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<any>,
	): Maybe<void> {
		return traverseInto(elems, f, new NoOpBuilder());
	}

	/**
	 * Adapt a synchronous function to accept `Maybe` values as arguments and
	 * return a `Maybe`.
	 */
	export function lift<TArgs extends unknown[], T>(
		f: (...args: TArgs) => T,
	): (...maybes: { [K in keyof TArgs]: Maybe<TArgs[K]> }) => Maybe<T> {
		return (...maybes) => all(maybes).map((args) => f(...args));
	}

	/**
	 * An enumeration that discriminates `Maybe`.
	 */
	export enum Kind {
		NOTHING,
		JUST,
	}

	/**
	 * The fluent syntax for `Maybe`.
	 */
	export abstract class Syntax {
		/**
		 * The property that discriminates `Maybe`.
		 */
		abstract readonly kind: Kind;

		/**
		 * If this and that `Maybe` are both absent, or they are both present
		 * and their values are equal, return `true`; otherwise, return `false`.
		 */
		[Eq.eq]<T extends Eq<T>>(this: Maybe<T>, that: Maybe<T>): boolean {
			if (this.isNothing()) {
				return that.isNothing();
			}
			return that.isJust() && eq(this.val, that.val);
		}

		/**
		 * Compare this and that `Maybe` to determine their ordering.
		 *
		 * @remarks
		 *
		 * When ordered, an absent `Maybe` always compares as less than than any
		 * present `Maybe`. If they are both present, their values are compared
		 * to determine the ordering.
		 */
		[Ord.cmp]<T extends Ord<T>>(this: Maybe<T>, that: Maybe<T>): Ordering {
			if (this.isNothing()) {
				return that.isNothing() ? Ordering.equal : Ordering.less;
			}
			return that.isNothing()
				? Ordering.greater
				: cmp(this.val, that.val);
		}

		/**
		 * If this and that `Maybe` are both absent, return `Nothing`. If only
		 * one is absent, return the non-absent `Maybe`. If both are present,
		 * combine their values and return the result in a `Just`.
		 */
		[Semigroup.cmb]<T extends Semigroup<T>>(
			this: Maybe<T>,
			that: Maybe<T>,
		): Maybe<T> {
			if (this.isJust()) {
				return that.isJust() ? just(cmb(this.val, that.val)) : this;
			}
			return that;
		}

		/**
		 * Test whether this `Maybe` is absent.
		 */
		isNothing(this: Maybe<any>): this is Nothing {
			return this.kind === Kind.NOTHING;
		}

		/**
		 * Test whether this `Maybe` is present.
		 */
		isJust<T>(this: Maybe<T>): this is Just<T> {
			return this.kind === Kind.JUST;
		}

		/**
		 * If this `Maybe` is present, apply a function to its value and return
		 * the result; otherwise, evaluate a fallback function and return the
		 * result.
		 */
		unwrap<T, T1, T2>(
			this: Maybe<T>,
			ifNothing: () => T1,
			unwrapJust: (val: T) => T2,
		): T1 | T2 {
			return this.isNothing() ? ifNothing() : unwrapJust(this.val);
		}

		/**
		 * If this `Maybe` is present, extract its value; otherwise, evaluate a
		 * function to return a fallback result.
		 */
		getOrElse<T, T1>(this: Maybe<T>, f: () => T1): T | T1 {
			return this.unwrap(f, id);
		}

		/**
		 * If this `Maybe` is present, extract its value; otherwise, return a
		 * fallback value.
		 */
		getOr<T, T1>(this: Maybe<T>, fallback: T1): T | T1 {
			return this.unwrap(() => fallback, id);
		}

		/**
		 * If this `Maybe` is present, extract its value; otherwise, return
		 * `undefined`.
		 */
		toNullish<T>(this: Maybe<T>): T | undefined {
			return this.unwrap(() => undefined, id);
		}

		/**
		 * If this `Maybe` is absent, evaluate a function to return a fallback
		 * `Maybe`; otherwise, return this `Maybe` as is.
		 */
		orElse<T, T1>(this: Maybe<T>, f: () => Maybe<T1>): Maybe<T | T1> {
			return this.isNothing() ? f() : this;
		}

		/**
		 * If this `Maybe` is absent, return that `Maybe`; otherwise, return
		 * this `Maybe` as is.
		 */
		or<T, T1>(this: Maybe<T>, that: Maybe<T1>): Maybe<T | T1> {
			return this.orElse(() => that);
		}

		/**
		 * If this `Maybe` is present, apply a function to its value to return
		 * another `Maybe`; otherwise, return `Nothing`.
		 */
		andThen<T, T1>(this: Maybe<T>, f: (val: T) => Maybe<T1>): Maybe<T1> {
			return this.isNothing() ? this : f(this.val);
		}

		/**
		 * If this `Maybe` is present, apply a generator comprehension function
		 * to its value and evaluate the `Maybe.Go` generator to return another
		 * `Maybe`; otherwise, return `Nothing`.
		 */
		andThenGo<T, T1>(this: Maybe<T>, f: (val: T) => Go<T1>): Maybe<T1> {
			return this.andThen((val) => go(f(val)));
		}

		/**
		 * If this `Maybe` is present, return that `Maybe`; otherwise, return
		 * `Nothing`.
		 */
		and<T1>(this: Maybe<any>, that: Maybe<T1>): Maybe<T1> {
			return this.andThen(() => that);
		}

		/**
		 * If this `Maybe` is present, apply a function to its value. If the
		 * result is `null` or `undefined`, return `Nothing`; otherwise, return
		 * the result in a `Just`. If this `Maybe` is absent, return `Nothing`.
		 */
		mapNullish<T, T1>(
			this: Maybe<T>,
			f: (val: T) => T1 | null | undefined,
		): Maybe<T1> {
			return this.andThen((val) => fromNullish(f(val)));
		}

		/**
		 * If this `Maybe` is present, apply a predicate to its value. If the
		 * predicate returns `true`, return the value in a `Just`; otherwise,
		 * return `Nothing`. If this `Maybe` is absent, return `Nothing`.
		 */
		filter<T, T1 extends T>(
			this: Maybe<T>,
			f: (val: T) => val is T1,
		): Maybe<T1>;

		filter<T>(this: Maybe<T>, f: (val: T) => boolean): Maybe<T>;

		filter<T>(this: Maybe<T>, f: (val: T) => boolean): Maybe<T> {
			return this.andThen((val) => (f(val) ? just(val) : nothing));
		}

		/**
		 * If this and that `Maybe` are both present, apply a function to their
		 * values and return the result in a `Just`; otherwise, return
		 * `Nothing`.
		 */
		zipWith<T, T1, T2>(
			this: Maybe<T>,
			that: Maybe<T1>,
			f: (lhs: T, rhs: T1) => T2,
		): Maybe<T2> {
			return this.andThen((lhs) => that.map((rhs) => f(lhs, rhs)));
		}

		/**
		 * If this `Maybe` is present, apply a function to its value and return
		 * the result in a `Just`; otherwise, return `Nothing`.
		 */
		map<T, T1>(this: Maybe<T>, f: (val: T) => T1): Maybe<T1> {
			return this.andThen((val) => just(f(val)));
		}
	}

	/**
	 * An absent `Maybe`.
	 */
	export class Nothing extends Syntax {
		/**
		 * The singleton instance of the `Nothing` variant of `Maybe`.
		 *
		 * @remarks
		 *
		 * The `nothing` constant is a more accessible alias for this object.
		 */
		static readonly singleton = new Nothing();

		readonly kind = Kind.NOTHING;

		private constructor() {
			super();
		}

		/**
		 * Return a `Maybe.Go` generator that yields this `Maybe` and returns
		 * its value if one is present. This allows `Maybe` values to be yielded
		 * directly in `Maybe` generator comprehensions using `yield*`.
		 */
		*[Symbol.iterator](): Generator<Maybe<never>, never, unknown> {
			return (yield this) as never;
		}
	}

	/**
	 * A present `Maybe`.
	 */
	export class Just<out T> extends Syntax {
		readonly kind = Kind.JUST;

		/**
		 * The value of this `Maybe`.
		 */
		readonly val: T;

		constructor(val: T) {
			super();
			this.val = val;
		}

		/**
		 * Return a `Maybe.Go` generator that yields this `Maybe` and returns
		 * its value if one is present. This allows `Maybe` values to be yielded
		 * directly in `Maybe` generator comprehensions using `yield*`.
		 */
		*[Symbol.iterator](): Generator<Maybe<T>, T, unknown> {
			return (yield this) as T;
		}
	}

	/**
	 * The absent `Maybe`.
	 */
	export const nothing = Maybe.Nothing.singleton as Maybe<never>;

	/**
	 * A generator that yields `Maybe` values and returns a result.
	 *
	 * @remarks
	 *
	 * Synchronous `Maybe` generator comprehensions should use this type alias
	 * as their return type. A generator function that returns a `Maybe.Go<T>`
	 * may `yield*` zero or more `Maybe<any>` values and must return a result of
	 * type `T`. Synchronous comprehensions may also `yield*` other `Maybe.Go`
	 * generators directly.
	 */
	export type Go<TReturn> = Generator<Maybe<unknown>, TReturn, unknown>;

	/**
	 * Extract the present value type `T` from the type `Maybe<T>`.
	 */
	export type JustT<TMaybe extends Maybe<any>> = TMaybe extends Maybe<infer T>
		? T
		: never;
}

/**
 * A `PromiseLike` object that fulfills with a `Maybe`.
 */
export type AsyncMaybeLike<T> = PromiseLike<Maybe<T>>;

/**
 * A `Promise` that fulfills with a `Maybe`.
 */
export type AsyncMaybe<T> = Promise<Maybe<T>>;

/**
 * The companion namespace for the `AsyncMaybe` type.
 */
export namespace AsyncMaybe {
	/**
	 * Evaluate a `Maybe.GoAsync` async generator to return a `Promise` that
	 * resolves with a `Maybe`.
	 */
	export async function go<TReturn>(
		gen: Go<TReturn>,
	): Promise<Maybe<TReturn>> {
		let nxt = await gen.next();
		let isHalted = false;
		while (!nxt.done) {
			const maybe = nxt.value;
			if (maybe.isJust()) {
				nxt = await gen.next(maybe.val);
			} else {
				isHalted = true;
				nxt = await gen.return(undefined as any);
			}
		}
		return isHalted ? Maybe.nothing : Maybe.just(nxt.value);
	}

	/**
	 * Map the elements in an iterable to promise-like `Maybe` values,
	 * concurrently evaluate the values, and collect the present values into a
	 * `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function traverseIntoPar<T, T1, TFinish>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<T1> | AsyncMaybeLike<T1>,
		builder: Builder<T1, TFinish>,
	): AsyncMaybe<TFinish> {
		return new Promise((resolve, reject) => {
			let remaining = 0;
			for (const elem of elems) {
				const idx = remaining;
				remaining++;
				Promise.resolve(f(elem, idx)).then((maybe) => {
					if (maybe.isNothing()) {
						resolve(maybe);
						return;
					}
					builder.add(maybe.val);
					remaining--;
					if (remaining === 0) {
						resolve(Maybe.just(builder.finish()));
						return;
					}
				}, reject);
			}
		});
	}

	/**
	 * Map the elements in an iterable of key-element pairs to promise-like
	 * `Maybe` values, concurrently evaluate the values, and collect the
	 * key-present-value pairs into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function traverseEntriesIntoPar<K, V, V1, TFinish>(
		entries: Iterable<readonly [K, V]>,
		f: (elem: V, key: K, idx: number) => Maybe<V1> | AsyncMaybeLike<V1>,
		builder: Builder<readonly [K, V1], TFinish>,
	): AsyncMaybe<TFinish> {
		return traverseIntoPar(
			entries,
			async ([key, elem], idx) =>
				(await f(elem, key, idx)).map((val): [K, V1] => [key, val]),
			builder,
		);
	}

	/**
	 * Map the elements in an iterable to promise-like `Maybe` values,
	 * concurrently evaluate the values, and collect the present values in an
	 * array.
	 */
	export function traversePar<T, T1>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<T1> | AsyncMaybeLike<T1>,
	): AsyncMaybe<T1[]> {
		return traverseIntoPar(
			elems,
			async (elem, idx) =>
				(await f(elem, idx)).map((val): [number, T1] => [idx, val]),
			new ArrayEntryBuilder(),
		);
	}

	/**
	 * Map the elements in an iterable of key-element pairs to promise-like
	 * `Maybe` values, concurrently evaluate the values, and collect the
	 * key-present-value pairs in an object.
	 */
	export function traverseEntriesPar<
		K extends number | string | symbol,
		V,
		V1,
	>(
		entries: Iterable<readonly [K, V]>,
		f: (elem: V, key: K, idx: number) => Maybe<V1> | AsyncMaybeLike<V1>,
	): AsyncMaybe<Record<K, V1>> {
		return traverseEntriesIntoPar(entries, f, new RecordEntryBuilder());
	}

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in an iterable
	 * and collect the present values into a `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function allIntoPar<T, TFinish>(
		elems: Iterable<Maybe<T> | AsyncMaybeLike<T>>,
		builder: Builder<T, TFinish>,
	): AsyncMaybe<TFinish> {
		return traverseIntoPar(elems, id, builder);
	}

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in an iterable
	 * of key-element pairs and collect the key-present-value pairs into a
	 * `Builder`.
	 *
	 * @remarks
	 *
	 * If any `Maybe` is absent, the state of the provided `Builder` is
	 * undefined.
	 */
	export function allEntriesIntoPar<K, V, TFinish>(
		entries: Iterable<readonly [K, Maybe<V> | AsyncMaybeLike<V>]>,
		builder: Builder<readonly [K, V], TFinish>,
	): AsyncMaybe<TFinish> {
		return traverseEntriesIntoPar(entries, id, builder);
	}

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in an array or a
	 * tuple literal and collect the present values in an equivalent structure.
	 *
	 * @remarks
	 *
	 * This function essentially turns an array or a tuple literal of
	 * promise-like `Maybe` elements "inside out". For example:
	 *
	 * -   `Promise<Maybe<T>>[]` becomes `Promise<Maybe<T[]>>`
	 * -   `[Promise<Maybe<T1>>, Promise<Maybe<T2>>]`
	 *     `Promise<Maybe<[T1, T2]>>`
	 */
	export function allPar<
		TElems extends readonly (Maybe<any> | AsyncMaybeLike<any>)[] | [],
	>(
		elems: TElems,
	): AsyncMaybe<{ [K in keyof TElems]: Maybe.JustT<Awaited<TElems[K]>> }>;

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in an iterable
	 * and collect the present values in an array.
	 *
	 * @remarks
	 *
	 * This function essentially turns an iterable of promise-like `Maybe`
	 * elements "inside out". For example, `Iterable<Promise<Maybe<T>>>` becomes
	 * `Promise<Maybe<T[]>>`.
	 */
	export function allPar<T>(
		elems: Iterable<Maybe<T> | AsyncMaybeLike<T>>,
	): AsyncMaybe<T[]>;

	export function allPar<T>(
		elems: Iterable<Maybe<T> | AsyncMaybeLike<T>>,
	): AsyncMaybe<T[]> {
		return traversePar(elems, id);
	}

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in an iterable of
	 * key-element pairs and collect the key-present-value pairs in an object.
	 */
	export function allEntriesPar<K extends number | string | symbol, V>(
		entries: Iterable<readonly [K, Maybe<V> | AsyncMaybeLike<V>]>,
	): AsyncMaybe<Record<K, V>> {
		return traverseEntriesPar(entries, id);
	}

	/**
	 * Concurrently evaluate the promise-like `Maybe` elements in a string-keyed
	 * record or object literal and collect the present values in an equivalent
	 * structure.
	 *
	 * @remarks
	 *
	 * This function essentially turns a string-keyed record or object literal
	 * of promise-like `Maybe` elements "inside out". For example:
	 *
	 * -   `Record<string, Promise<Maybe<T>>>` becomes
	 *     `Promise<Maybe<Record<string, T>>>`
	 * -   `{ x: Promise<Maybe<T1>>, y: Promise<Maybe<T2>> }` becomes
	 *     `Promise<Maybe<{ x: T1, y: T2 }>>`
	 */
	export function allPropsPar<
		TProps extends Record<string, Maybe<any> | AsyncMaybeLike<any>>,
	>(
		props: TProps,
	): AsyncMaybe<{ [K in keyof TProps]: Maybe.JustT<Awaited<TProps[K]>> }>;

	export function allPropsPar<T>(
		props: Record<string, Maybe<T> | AsyncMaybeLike<T>>,
	): AsyncMaybe<Record<string, T>> {
		return traverseEntriesPar(Object.entries(props), id);
	}

	/**
	 * Map the elements in an iterable to promise-like `Maybe` values,
	 * concurrently evaluate the values, and ignore the present values.
	 */
	export function forEachPar<T>(
		elems: Iterable<T>,
		f: (elem: T, idx: number) => Maybe<any> | AsyncMaybeLike<any>,
	): AsyncMaybe<void> {
		return traverseIntoPar(elems, f, new NoOpBuilder());
	}

	/**
	 * Adapt a synchronous or an asynchronous function to accept promise-like
	 * `Maybe` values as arguments and return a `Promise` that resolves with a
	 * `Maybe`.
	 *
	 * @remarks
	 *
	 * The lifted function's arguments are evaluated concurrently.
	 */
	export function liftPar<TArgs extends unknown[], T>(
		f: (...args: TArgs) => T | PromiseLike<T>,
	): (
		...elems: {
			[K in keyof TArgs]: Maybe<TArgs[K]> | AsyncMaybeLike<TArgs[K]>;
		}
	) => Promise<Maybe<T>> {
		return (...elems) =>
			go(
				(async function* () {
					return f(...(yield* await allPar(elems)));
				})(),
			);
	}

	/**
	 * An async generator that yields `Maybe` values and returns a result.
	 *
	 * @remarks
	 *
	 * Async `Maybe` generator comprehensions should use this type alias as
	 * their return type. An async generator function that returns an
	 * `AsyncMaybe.Go<T>` may `yield*` zero or more `Maybe<any>` values and must
	 * return a result of type `T`. `PromiseLike` values that resolve with
	 * `Maybe` should be awaited before yielding. Async comprehensions may also
	 * `yield*` other `Maybe.Go` and `AsyncMaybe.Go` generators directly.
	 */
	export type Go<TReturn> = AsyncGenerator<Maybe<unknown>, TReturn, unknown>;
}
