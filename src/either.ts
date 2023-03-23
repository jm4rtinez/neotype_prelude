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
 * Functional unions and railway-oriented programming.
 *
 * @remarks
 *
 * `Either<A, B>` is a type that represents one of two values. It is represented
 * by two variants: `Left<A>` and `Right<B>`.
 *
 * -   The `Left<A>` variant represents a *left-sided* `Either` and contains a
 *     value of type `A`.
 * -   The `Right<B>` variant represents a *right-sided* `Either` and contains a
 *     value of type `B`.
 *
 * ### Handling failure with `Either`
 *
 * `Either` is also used to represent a value which is either a success or a
 * failure. In this context, the type is written as `Either<E, T>` and its two
 * variants are `Left<E>` and `Right<T>`.
 *
 * -   The `Left<E>` variant represents a *failed* `Either` and contains a
 *     *failure* of type `E`.
 * -   The `Right<T>` variant represents a *successful* `Either` and contains a
 *     *success* of type `T`.
 *
 * Some combinators for `Either` are specialized for this failure-handling
 * use case, and provide a right-biased behavior that "short-circuits" a
 * computation on the first failed `Either`. This behavior allows functions
 * that return `Either` to be composed in a way that propogates failures while
 * applying logic to successes -- a useful feature for railway-oriented
 * programming.
 *
 * ## Importing from this module
 *
 * This module exports `Either` as both a type and a namespace. The `Either`
 * type is an alias for a discriminated union, and the `Either` namespace
 * provides:
 *
 * -   The `Left` and `Right` variant classes
 * -   The abstract `Syntax` class that provides the fluent API for `Either`
 * -   The `Kind` enumeration that discriminates `Either`
 * -   Functions for constructing, chaining, collecting into, and lifting into
 *     `Either`
 *
 * The type and namespace can be imported under the same alias:
 *
 * ```ts
 * import { Either } from "@neotype/prelude/either.js";
 * ```
 *
 * Or, the type and namespace can be imported and aliased separately:
 *
 * ```ts
 * import { type Either, Either as E } from "@neotype/prelude/either.js";
 * ```
 *
 * ## Constructing `Either`
 *
 * These functions construct an Either:
 *
 * -   `left` constructs a left-sided `Either`.
 * -   `right` constructs a right-sided `Either`.
 * -   `fromValidation` constructs an `Either` from a `Validation`.
 *
 * ## Querying and narrowing the variant
 *
 * The `isLeft` and `isRight` methods return `true` if an `Either` is left-sided
 * or right-sided, respectively. These methods also narrow the type of an
 * `Either` to the queried variant.
 *
 * The variant can also be queried and narrowed via the `kind` property, which
 * returns a member of the `Kind` enumeration.
 *
 * ## Extracting values
 *
 * The value within an `Either` can be accessed via the `val` property. The type
 * of the property can be narrowed by first querying the variant.
 *
 * The `unwrap` method unwraps an `Either` by applying one of two functions to
 * its value, depending on the variant.
 *
 * ## Comparing `Either`
 *
 * `Either` has the following behavior as an equivalence relation:
 *
 * -   An `Either<A, B>` implements `Eq` when both `A` and `B` implement `Eq`.
 * -   Two `Either` values are equal if they are the same variant and their
 *     values are equal.
 *
 * `Either` has the following behavior as a total order:
 *
 * -   An `Either<A, B>` implements `Ord` when both `A` and `B` implement `Ord`.
 * -   When ordered, a left-sided `Either` always compares as less than any
 *     right-sided `Either`. If the variants are the same, their values are
 *     compared to determine the ordering.
 *
 * ## `Either` as a semigroup
 *
 * `Either` has the following behavior as a semigroup:
 *
 * -   An `Either<E, T>` implements `Semigroup` when `T` implements `Semigroup`.
 * -   When combined, any left-sided `Either` short-circuits the combination and
 *     is returned instead. If both are right-sided, their values are combined
 *     and returned in a `Right`.
 *
 * ## Transforming values
 *
 * These methods transform the value within an `Either`:
 *
 * -   `lmap` applies a function to the value in a left-sided `Either`.
 * -   `map` applies a function to the value in a right-sided `Either`.
 *
 * These methods combine the successes of two successful `Eithers`, or
 * short-circuit on the first failed `Either`:
 *
 * -   `zipWith` applies a function to their successes.
 * -   `zipFst` keeps only the first success, and discards the second.
 * -   `zipSnd` keeps only the second success, and discards the first.
 *
 * ## Chaining `Either`
 *
 * The `flatMap` method chains together computations that return `Either`. If an
 * `Either` succeeds, a function is applied to its success to return another
 * `Either`. If an `Either` fails, the computation halts and the failed `Either`
 * is returned instead.
 *
 * ### Generator comprehenshions
 *
 * Generator comprehensions provide an imperative syntax for chaining together
 * computations that return `Either`. Instead of `flatMap`, a generator is used
 * to unwrap successful `Either` values and apply functions to their successes.
 *
 * The `go` function evaluates a generator to return an `Either`. Within the
 * generator, `Either` values are yielded using the `yield*` keyword. If a
 * yielded `Either` succeeds, its success may be bound to a specified variable.
 * If any yielded `Either` fails, the generator halts and `go` returns the
 * failed `Either`; otherwise, when the computation is complete, the generator
 * may return a final result and `go` returns the result as a success.
 *
 * ### Async generator comprehensions
 *
 * Async generator comprehensions provide `async`/`await` syntax to `Either`
 * generator comprehensions, allowing promise-like computations that fulfill
 * with `Either` to be chained together using the familiar generator syntax.
 *
 * The `goAsync` function evaluates an async generator to return a `Promise`
 * that fulfills with an `Either`. The semantics of `yield*` and `return` within
 * async comprehensions are identical to their synchronous counterparts.
 *
 * ## Recovering from `Left` variants
 *
 * If an `Either` fails, the `recover` method applies a function to its failure
 * to return a fallback `Either`.
 *
 * ## Collecting into `Either`
 *
 * These functions turn a container of `Either` elements "inside out". If the
 * elements all succeed, their successes are collected into an equivalent
 * container and returned as a success. If any element fails, the failed
 * `Either` is returned instead.
 *
 * -   `collect` turns an array or a tuple literal of `Either` elements inside
 *     out. For example:
 *     -   `Either<E, T>[]` becomes `Either<E, T[]>`
 *     -   `[Either<E, T1>, Either<E, T2>]` becomes `Either<E, [T1, T2]>`
 * -   `gather` turns a record or an object literal of `Either` elements inside
 *     out. For example:
 *     -   `Record<string, Either<E, T>>` becomes `Either<E, Record<string, T>>`
 *     -   `{ x: Either<E, T1>, y: Either<E, T2> }` becomes `Either<E, { x: T1,
 *         y: T2 }>`
 *
 * The `reduce` function reduces a finite iterable from left to right in the
 * context of `Either`. This is useful for mapping, filtering, and accumulating
 * values using `Either`.
 *
 * ## Lifting functions to work with `Either`
 *
 * The `lift` function receives a function that accepts arbitrary arguments,
 * and returns an adapted function that accepts `Either` values as arguments
 * instead. The arguments are evaluated from left to right, and if they all
 * succeed, the original function is applied to their successes and the result
 * is returned as a success. If any argument fails, the failed `Either` is
 * returned instead.
 *
 * @example Basic matching and unwrapping
 *
 * ```ts
 * import { Either } from "@neotype/prelude/either.js";
 *
 * const strOrNum: Either<string, number> = Either.right(1);
 *
 * // Querying and narrowing using methods
 * if (strOrNum.isLeft()) {
 *     console.log(`Queried Left: ${strOrNum.val}`);
 * } else {
 *     console.log(`Queried Right: ${strOrNum.val}`);
 * }
 *
 * // Querying and narrowing using the `kind` property
 * switch (strOrNum.kind) {
 *     case Either.Kind.LEFT:
 *         console.log(`Matched Left: ${strOrNum.val}`);
 *         break;
 *     case Either.Kind.RIGHT:
 *         console.log(`Matched Right: ${strOrNum.val}`);
 * }
 *
 * // Case analysis using `unwrap`
 * strOrNum.unwrap(
 *     (str) => console.log(`Unwrapped Left: ${str}`),
 *     (num) => console.log(`Unwrapped Right: ${num}`),
 * );
 * ```
 *
 * @example Parsing with `Either`
 *
 * First, the necessary imports:
 *
 * ```ts
 * import { Either } from "@neotype/prelude/either.js";
 * ```
 *
 * Now, consider a program that uses `Either` to parse an even integer:
 *
 * ```ts
 * function parseInt(input: string): Either<string, number> {
 *     const n = Number.parseInt(input);
 *     return Number.isNaN(n)
 *         ? Either.left(`cannot parse '${input}' as int`)
 *         : Either.right(n);
 * }
 *
 * function guardEven(n: number): Either<string, number> {
 *     return n % 2 === 0
 *         ? Either.right(n)
 *         : Either.left(`${n} is not even`);
 * }
 *
 * function parseEvenInt(input: string): Either<string, number> {
 *     return parseInt(input).flatMap(guardEven);
 * }
 *
 * ["a", "1", "2", "-4", "+42", "0x2A"].forEach((input) => {
 *     const result = JSON.stringify(parseEvenInt(input).val);
 *     console.log(`input "${input}": ${result}`);
 * });
 *
 * // input "a": "cannot parse 'a' as int"
 * // input "1": "1 is not even"
 * // input "2": 2
 * // input "-4": -4
 * // input "+42": 42
 * // input "0x2A": 42
 * ```
 *
 * We can refactor the `parseEvenInt` function to use a generator comprehension
 * instead:
 *
 * ```ts
 * function parseEvenInt(input: string): Either<string, number> {
 *     return Either.go(function* () {
 *         const n = yield* parseInt(input);
 *         const even = yield* guardEven(n);
 *         return even;
 *     });
 * }
 * ```
 *
 * Suppose we want to parse an array of inputs and collect the successful
 * results, or fail on the first parse error. We may write the following:
 *
 * ```ts
 * function parseEvenInts(inputs: string[]): Either<string, number[]> {
 *     return Either.collect(inputs.map(parseEvenInt));
 * }
 *
 * [
 *     ["a", "-4"],
 *     ["2", "-7"],
 *     ["+42", "0x2A"],
 * ].forEach((inputs) => {
 *     const result = JSON.stringify(parseEvenInts(inputs).val);
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "cannot parse 'a' as int"
 * // inputs ["2","-7"]: "-7 is not even"
 * // inputs ["+42","0x2A"]: [42,42]
 * ```
 *
 * Perhaps we want to collect only distinct even numbers using a `Set`:
 *
 * ```ts
 * function parseEvenIntsUniq(inputs: string[]): Either<string, Set<number>> {
 *     return Either.go(function* () {
 *         const results = new Set<number>();
 *         for (const input of inputs) {
 *             results.add(yield* parseEvenInt(input));
 *         }
 *         return results;
 *     });
 * }
 *
 * [
 *     ["a", "-4"],
 *     ["2", "-7"],
 *     ["+42", "0x2A"],
 * ].forEach((inputs) => {
 *     const result = JSON.stringify(
 *         parseEvenIntsUniq(inputs).map(Array.from).val,
 *     );
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "cannot parse 'a' as int"
 * // inputs ["2","-7"]: "-7 is not even"
 * // inputs ["+42","0x2A"]: [42]
 * ```
 *
 * Or, perhaps we want to associate the original input strings with our
 * successful parses:
 *
 * ```ts
 * function parseEvenIntsKeyed(
 *     inputs: string[],
 * ): Either<string, Record<string, number>> {
 *     return Either.gather(
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
 *     const result = JSON.stringify(parseEvenIntsKeyed(inputs).val);
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "cannot parse 'a' as int"
 * // inputs ["2","-7"]: "-7 is not even"
 * // inputs ["+42","0x2A"]: {"+42":42,"0x2A":42}
 * ```
 *
 * Or, perhaps we want to sum our successful parses and return a total:
 *
 * ```ts
 * function parseEvenIntsAndSum(inputs: string[]): Either<string, number> {
 *     return Either.reduce(
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
 *     const result = JSON.strigify(parseEvenIntsAndSum(inputs).val);
 *     console.log(`inputs ${JSON.stringify(inputs)}: ${result}`);
 * });
 *
 * // inputs ["a","-4"]: "cannot parse 'a' as int"
 * // inputs ["2","-7"]: "-7 is not even"
 * // inputs ["+42","0x2A"]: 84
 * ```
 *
 * @module
 */

import { Semigroup, cmb } from "./cmb.js";
import { Eq, Ord, Ordering, cmp, eq } from "./cmp.js";
import { id } from "./fn.js";
import type { Validation } from "./validation.js";

/**
 * A type that represents one of two values (`Left` or `Right`).
 */
export type Either<A, B> = Either.Left<A> | Either.Right<B>;

/**
 * The companion namespace for the `Either` type.
 */
export namespace Either {
	/**
	 * Construct a left-sided `Either` from a value.
	 */
	export function left<A, B = never>(val: A): Either<A, B> {
		return new Left(val);
	}

	/**
	 * Construct a right-sided `Either` from a value.
	 */
	export function right<B, A = never>(val: B): Either<A, B> {
		return new Right(val);
	}

	/**
	 * Construct an `Either` from a `Validation`.
	 *
	 * @remarks
	 *
	 * If the `Validation` is an `Err`, return its failure in a `Left`;
	 * otherwise, return its success in a `Right`.
	 */
	export function fromValidation<E, T>(vdn: Validation<E, T>): Either<E, T> {
		return vdn.unwrap(left, right);
	}

	function step<TYield extends Either<any, any>, TReturn>(
		gen: Generator<TYield, TReturn | typeof halt, unknown>,
	): Either<LeftT<TYield>, TReturn> {
		let nxt = gen.next();
		let err: any;
		while (!nxt.done) {
			const either = nxt.value;
			if (either.isRight()) {
				nxt = gen.next(either.val);
			} else {
				err = either.val;
				nxt = gen.return(halt);
			}
		}
		const result = nxt.value;
		return result === halt ? left(err) : right(result);
	}

	/**
	 * Construct an `Either` using a generator comprehension.
	 *
	 * @remarks
	 *
	 * The contract for generator comprehensions is as follows:
	 *
	 * -   The generator provided to `go` must only yield `Either` values.
	 * -   `Either` values must only be yielded using the `yield*` keyword, and
	 *     never `yield` (without the `*`). Omitting the `*` inhibits proper
	 *     type inference and may cause undefined behavior.
	 * -   A `yield*` statement may bind a variable provided by the caller. The
	 *     variable inherits the type of the success of the yielded `Either`.
	 * -   If a yielded `Either` succeeds, its success is bound to a variable
	 *     (if provided) and the generator advances.
	 * -   If a yielded `Either` fails, the generator halts and `go` returns the
	 *     failed `Either`.
	 * -   The `return` statement of the generator may return a final result,
	 *     which is returned from `go` as a success if all yielded `Either`
	 *     values succeed.
	 * -   All syntax normally permitted in generators (statements, loops,
	 *     declarations, etc.) is permitted within generator comprehensions.
	 *
	 * @example Basic yielding and returning
	 *
	 * Consider a comprehension that sums the successes of three `Either`
	 * values:
	 *
	 * ```ts
	 * import { Either } from "@neotype/prelude/either.js";
	 *
	 * const errOrOne: Either<string, number> = Either.right(1);
	 * const errOrTwo: Either<string, number> = Either.right(2);
	 * const errOrThree: Either<string, number> = Either.right(3);
	 *
	 * const summed: Either<string, number> = Either.go(function* () {
	 *     const one = yield* errOrOne;
	 *     const two = yield* errOrTwo;
	 *     const three = yield* errOrThree;
	 *
	 *     return one + two + three;
	 * });
	 *
	 * console.log(summed.val); // 6
	 * ```
	 *
	 * Now, observe the change in behavior if one of the yielded arguments was
	 * a failed `Either` instead. Replace the declaration of `errOrTwo` with the
	 * following and re-run the program.
	 *
	 * ```ts
	 * const errOrTwo: Either<string, number> = Either.left("oops");
	 * ```
	 */
	export function go<TYield extends Either<any, any>, TReturn>(
		f: () => Generator<TYield, TReturn, unknown>,
	): Either<LeftT<TYield>, TReturn> {
		return step(f());
	}

	/**
	 * Construct a function that returns an `Either` using a generator
	 * comprehension.
	 *
	 * @remarks
	 *
	 * This is the higher-order function variant of `go`.
	 */
	export function goFn<
		TArgs extends unknown[],
		TYield extends Either<any, any>,
		TReturn,
	>(
		f: (...args: TArgs) => Generator<TYield, TReturn, unknown>,
	): (...args: TArgs) => Either<LeftT<TYield>, TReturn> {
		return (...args) => step(f(...args));
	}

	/**
	 * Reduce a finite iterable from left to right in the context of `Either`.
	 *
	 * @remarks
	 *
	 * Start with an initial accumulator and reduce the elements of an iterable
	 * using a reducer function that returns an `Either`. While the function
	 * returns a successful `Either`, continue the reduction using the success
	 * as the new accumulator until there are no elements remaining, and then
	 * succeed with the final accumulator; otherwise, return the first failed
	 * `Either`.
	 */
	export function reduce<T, TAcc, E>(
		vals: Iterable<T>,
		accum: (acc: TAcc, val: T) => Either<E, TAcc>,
		initial: TAcc,
	): Either<E, TAcc> {
		return go(function* () {
			let acc = initial;
			for (const val of vals) {
				acc = yield* accum(acc, val);
			}
			return acc;
		});
	}

	/**
	 * Turn an array or a tuple literal of `Either` elements "inside out".
	 *
	 * @remarks
	 *
	 * Evaluate the `Either` elements in an array or a tuple literal from left
	 * to right. If they all succeed, collect their successes in an array or a
	 * tuple literal, respectively, and succeed with the result; otherwise,
	 * return the first failed `Either`.
	 *
	 * For example:
	 *
	 * -   `Either<E, T>[]` becomes `Either<E, T[]>`
	 * -   `[Either<E, T1>, Either<E, T2>]` becomes `Either<E, [T1, T2]>`
	 */
	export function collect<TEithers extends readonly Either<any, any>[] | []>(
		eithers: TEithers,
	): Either<
		LeftT<TEithers[number]>,
		{ -readonly [K in keyof TEithers]: RightT<TEithers[K]> }
	> {
		return go(function* () {
			const results = new Array(eithers.length);
			for (const [idx, either] of eithers.entries()) {
				results[idx] = yield* either;
			}
			return results as any;
		});
	}

	/**
	 * Turn a record or an object literal of `Either` elements "inside out".
	 *
	 * @remarks
	 *
	 * Evaluate the `Either` elements in a record or an object literal. If they
	 * all succeed, collect their successes in a record or an object literal,
	 * respectively, and succeed with the result; otherwise, return the first
	 * failed `Either`.
	 *
	 * For example:
	 *
	 * -   `Record<string, Either<E, T>>` becomes `Either<E, Record<string, T>>`
	 * -   `{ x: Either<E, T1>, y: Either<E, T2> }` becomes `Either<E, { x: T1,
	 *     y: T2 }>`
	 */
	export function gather<TEithers extends Record<any, Either<any, any>>>(
		eithers: TEithers,
	): Either<
		LeftT<TEithers[keyof TEithers]>,
		{ -readonly [K in keyof TEithers]: RightT<TEithers[K]> }
	> {
		return go(function* () {
			const results: Record<any, any> = {};
			for (const [key, either] of Object.entries(eithers)) {
				results[key] = yield* either;
			}
			return results as any;
		});
	}

	/**
	 * Lift a function into the context of `Either`.
	 *
	 * @remarks
	 *
	 * Given a function that accepts arbitrary arguments, return an adapted
	 * function that accepts `Either` values as arguments. When applied,
	 * evaluate the arguments from left to right. If they all succeed, apply the
	 * original function to their successes and succeed with the result;
	 * otherwise, return the first failed `Either`.
	 */
	export function lift<TArgs extends unknown[], T>(
		f: (...args: TArgs) => T,
	): <TEithers extends { [K in keyof TArgs]: Either<any, TArgs[K]> }>(
		...eithers: TEithers
	) => Either<LeftT<TEithers[number]>, T> {
		return (...eithers) =>
			collect(eithers).map((args) => f(...(args as TArgs)));
	}

	async function stepAsync<TYield extends Either<any, any>, TReturn>(
		gen: AsyncGenerator<TYield, TReturn | typeof halt, unknown>,
	): Promise<Either<LeftT<TYield>, TReturn>> {
		let nxt = await gen.next();
		let err: any;
		while (!nxt.done) {
			const either = nxt.value;
			if (either.isRight()) {
				nxt = await gen.next(either.val);
			} else {
				err = either.val;
				nxt = await gen.return(halt);
			}
		}
		const result = nxt.value;
		return result === halt ? left(err) : right(result);
	}

	/**
	 * Construct a `Promise` that fulfills with an `Either` using an async
	 * generator comprehension.
	 *
	 * @remarks
	 *
	 * The contract for async generator comprehensions is as follows:
	 *
	 * -   The async generator provided to `goAsync` must only yield `Either`
	 *     values.
	 *     -   `Promise` values must never be yielded. If a `Promise` contains
	 *         an `Either`, the `Promise` must first be awaited to access and
	 *         yield the `Either`. This is done with a `yield* await` statement.
	 * -   `Either` values must only be yielded using the `yield*` keyword, and
	 *     never `yield` (without the `*`). Omitting the `*` inhibits proper
	 *     type inference and may cause undefined behavior.
	 * -   A `yield*` statement may bind a variable provided by the caller. The
	 *     variable inherits the type of the success of the yielded `Either`.
	 * -   If a yielded `Either` succeeds, its success is bound to a variable
	 *     (if provided) and the generator advances.
	 * -   If a yielded `Either` fails, the generator halts and `goAsync`
	 *     fulfills with the failed `Either`.
	 * -   If a `Promise` rejects or an operation throws, the generator halts
	 *     and `goAsync` rejects with the error.
	 * -   The `return` statement of the generator may return a final result,
	 *     and `goAsync` fulfills with the result as a success if all yielded
	 *     `Either` values succeed and no errors are encountered.
	 * -   All syntax normally permitted in async generators (the `await`
	 *     keyword, statements, loops, declarations, etc.) is permitted within
	 *     async generator comprehensions.
	 */
	export function goAsync<TYield extends Either<any, any>, TReturn>(
		f: () => AsyncGenerator<TYield, TReturn, unknown>,
	): Promise<Either<LeftT<TYield>, TReturn>> {
		return stepAsync(f());
	}

	/**
	 * Construct a function that returns a `Promise` that fulfills with an
	 * `Either` using an async generator comprehension.
	 *
	 * @remarks
	 *
	 * This is the higher-order function variant of `goAsync`.
	 */
	export function goAsyncFn<
		TArgs extends unknown[],
		TYield extends Either<any, any>,
		TReturn,
	>(
		f: (...args: TArgs) => AsyncGenerator<TYield, TReturn, unknown>,
	): (...args: TArgs) => Promise<Either<LeftT<TYield>, TReturn>> {
		return (...args) => stepAsync(f(...args));
	}

	/**
	 * The fluent syntax for `Either`.
	 */
	export abstract class Syntax {
		/**
		 * If this and that `Either` are the same variant and their values are
		 * equal, return `true`; otherwise, return `false`.
		 */
		[Eq.eq]<A extends Eq<A>, B extends Eq<B>>(
			this: Either<A, B>,
			that: Either<A, B>,
		): boolean {
			if (this.isLeft()) {
				return that.isLeft() && eq(this.val, that.val);
			}
			return that.isRight() && eq(this.val, that.val);
		}

		/**
		 * Compare this and that `Either` to determine their ordering.
		 *
		 * @remarks
		 *
		 * When ordered, a left-sided `Either` always compares as less than any
		 * right-sided `Either`. If the variants are the same, their values are
		 * compared to determine the ordering.
		 */
		[Ord.cmp]<A extends Ord<A>, B extends Ord<B>>(
			this: Either<A, B>,
			that: Either<A, B>,
		): Ordering {
			if (this.isLeft()) {
				return that.isLeft() ? cmp(this.val, that.val) : Ordering.less;
			}
			return that.isRight() ? cmp(this.val, that.val) : Ordering.greater;
		}

		/**
		 * If this and that `Either` both succeed, combine their successes and
		 * succeed with the result; otherwise, return the first failed `Either`.
		 */
		[Semigroup.cmb]<E, T extends Semigroup<T>>(
			this: Either<E, T>,
			that: Either<E, T>,
		): Either<E, T> {
			return this.zipWith(that, cmb);
		}

		/**
		 * Test whether this `Either` is left-sided.
		 */
		isLeft<A>(this: Either<A, any>): this is Left<A> {
			return this.kind === Kind.LEFT;
		}

		/**
		 * Test whether this `Either` is right-sided.
		 */
		isRight<B>(this: Either<any, B>): this is Right<B> {
			return this.kind === Kind.RIGHT;
		}

		/**
		 * Apply one of two functions to the value of this `Either` depending
		 * on its variant, and return the result.
		 */
		unwrap<A, B, T1, T2>(
			this: Either<A, B>,
			unwrapLeft: (val: A) => T1,
			unwrapRight: (val: B) => T2,
		): T1 | T2 {
			return this.isLeft() ? unwrapLeft(this.val) : unwrapRight(this.val);
		}

		/**
		 * If this `Either` fails, apply a function to its failure to return
		 * another `Either`; otherwise, return this `Either` as is.
		 */
		recover<E, T, E1, T1>(
			this: Either<E, T>,
			f: (val: E) => Either<E1, T1>,
		): Either<E1, T | T1> {
			return this.isLeft() ? f(this.val) : this;
		}

		/**
		 * If this `Either` succeeds, apply a function to its success to return
		 * another `Either`; otherwise, return this `Either` as is.
		 */
		flatMap<E, T, E1, T1>(
			this: Either<E, T>,
			f: (val: T) => Either<E1, T1>,
		): Either<E | E1, T1> {
			return this.isLeft() ? this : f(this.val);
		}

		/**
		 * If this and that `Either` both succeed, apply a function to their
		 * successes and succeed with the result; otherwise, return the first
		 * failed `Either`.
		 */
		zipWith<E, T, E1, T1, T2>(
			this: Either<E, T>,
			that: Either<E1, T1>,
			f: (lhs: T, rhs: T1) => T2,
		): Either<E | E1, T2> {
			return this.flatMap((lhs) => that.map((rhs) => f(lhs, rhs)));
		}

		/**
		 * If this and that `Either` both succeed, succeed with only the first
		 * success and discard the second; otherwise, return the first failed
		 * `Either`.
		 */
		zipFst<E, T, E1>(
			this: Either<E, T>,
			that: Either<E1, any>,
		): Either<E | E1, T> {
			return this.zipWith(that, id);
		}

		/**
		 * If this and that `Either` both succeed, succeed with only the second
		 * success and discard the first; otherwise, return the first failed
		 * `Either`.
		 */
		zipSnd<E, E1, T1>(
			this: Either<E, any>,
			that: Either<E1, T1>,
		): Either<E | E1, T1> {
			return this.flatMap(() => that);
		}

		/**
		 * If this `Either` is left-sided, apply a function to its value and
		 * return the result in a `Left`; otherwise, return this `Either` as is.
		 */
		lmap<A, B, A1>(this: Either<A, B>, f: (val: A) => A1): Either<A1, B> {
			return this.recover((val) => left(f(val)));
		}

		/**
		 * If this `Either` is right-sided, apply a function to its value and
		 * return the result in a `Right`; otherwise, return this `Either` as
		 * is.
		 */
		map<A, B, B1>(this: Either<A, B>, f: (val: B) => B1): Either<A, B1> {
			return this.flatMap((val) => right(f(val)));
		}
	}

	/**
	 * An enumeration that discriminates `Either`.
	 */
	export enum Kind {
		LEFT,
		RIGHT,
	}

	/**
	 * A left-sided Either.
	 */
	export class Left<out A> extends Syntax {
		/**
		 * The property that discriminates `Either`.
		 */
		readonly kind = Kind.LEFT;

		/**
		 * The value of this `Either`.
		 */
		readonly val: A;

		constructor(val: A) {
			super();
			this.val = val;
		}

		/**
		 * Defining iterable behavior for `Either` allows TypeScript to infer
		 * right-sided value types when yielding `Either` values in generator
		 * comprehensions using `yield*`.
		 *
		 * @hidden
		 */
		*[Symbol.iterator](): Iterator<Either<A, never>, never, unknown> {
			return (yield this) as never;
		}
	}

	/**
	 * A right-sided Either.
	 */
	export class Right<out B> extends Syntax {
		/**
		 * The property that discriminates `Either`.
		 */
		readonly kind = Kind.RIGHT;

		/**
		 * The value of this `Either`.
		 */
		readonly val: B;

		constructor(val: B) {
			super();
			this.val = val;
		}

		/**
		 * Defining iterable behavior for `Either` allows TypeScript to infer
		 * right-sided value types when yielding `Either` values in generator
		 * comprehensions using `yield*`.
		 *
		 * @hidden
		 */
		*[Symbol.iterator](): Iterator<Either<never, B>, B, unknown> {
			return (yield this) as B;
		}
	}

	/**
	 * Extract the left-sided value type `A` from the type `Either<A, B>`.
	 */
	export type LeftT<TEither extends Either<any, any>> = [TEither] extends [
		Either<infer A, any>,
	]
		? A
		: never;

	/**
	 * Extract the right-sided value type `B` from the type `Either<A, B>`.
	 */
	export type RightT<TEither extends Either<any, any>> = [TEither] extends [
		Either<any, infer B>,
	]
		? B
		: never;

	// A unique symbol used by the `Either` generator comprehension
	// implementation to signal the underlying generator to return early. This
	// ensures `try...finally` blocks can execute.
	const halt = Symbol();
}
