export type Cover<O1, O2> = {
  [K in keyof O1 | keyof O2]: K extends keyof O2 ? O2[K] : K extends keyof O1 ? O1[K] : never
}
