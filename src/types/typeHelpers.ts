/**
 * merge and cover comming type to origin type
 * @example
 * type A = { a: number, b: number }
 * type B = { b: string }
 * type C = Cover<A, B> // { a: number, b: string }
 */
export type Cover<Origin, Comming>
  = Origin extends Record<PropertyKey, any>
  ? (
    Comming extends Record<PropertyKey, any>
    ? {
      [K in keyof Origin | keyof Comming]: K extends keyof Comming ? Comming[K] : Origin[K]
    }
    : Origin
  )
  : Comming extends Record<PropertyKey, any> ? Comming : {}

/**
 * trigger isTypeIdenticalTo in typescript compiler
 * @see https://www.zhihu.com/question/577318797/answer/2834044827 TypeScript 实践中的 Equals 类型的实现原理是什么？ - 高厉害的回答 - 知乎 
 * @see https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript stackoverflow: How does the Equals work in TypeScript?
 */
export type Equals<O1, O2> = (<T>(arg: T extends O1 ? T : T) => void) extends (<T>(arg: T extends O2 ? T : T) => void) ? true : false

type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

type UnionToTuple<U, A extends any[] = []> = UnionToIntersection<U extends any ? () => U : never> extends () => infer R ? UnionToTuple<Exclude<U, R>, [R, ...A]> : [...A]

/**
 * cover tuple type to object type
 */
export type CoverTuple<T> = T extends [infer Head, ...infer Tail] ? Cover<Head, CoverTuple<Tail>> : {}

/**
 * cover union type to object type
 */
export type CoverUnion<U> = UnionToTuple<U>

/**
 * merge intersection
 */
export type Merge<T extends Record<PropertyKey, any>> = {
  [K in keyof T]: T[K]
}