export const hasProperty = <T extends Record<PropertyKey, unknown>, K extends keyof T>(
  obj: T | unknown,
  propName: K,
): obj is { [P in K]: T[P] } =>
  Boolean((typeof obj === "object" || typeof obj === "function") && Object.prototype.hasOwnProperty.call(obj, propName))

type NullValueKeys<T extends object> = {
  [K in keyof T]: T[K] extends null ? K : never
}[keyof T]

export const isNullValueKey =
  <O extends Record<PropertyKey, null | unknown>>(obj: O) =>
  (k: keyof O): k is NullValueKeys<O> =>
    obj[k] === null

export const isKeyOf =
  <O extends Record<PropertyKey, unknown>>(obj: O) =>
  (key: PropertyKey): key is keyof O =>
    hasProperty(obj, key)

export const typedKeys = <O extends Record<PropertyKey, unknown>>(childrenSpec: O): (keyof O)[] =>
  Object.keys(childrenSpec).filter(isKeyOf(childrenSpec))
