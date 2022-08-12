// 将数组转换为
export type ArrayToValuesUnion<T extends string[]> = T extends (infer E)[] ? E : never;
