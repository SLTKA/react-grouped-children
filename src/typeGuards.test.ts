import { hasProperty, isNullValueKey, isKeyOf, typedKeys } from "./typeGuards"

describe("hasProperty", () => {
  it("returns true if the object has the given property", () => {
    const obj = { foo: "bar" }
    expect(hasProperty(obj, "foo")).toBe(true)
  })

  it("returns false if the object does not have the given property", () => {
    const obj = { foo: "bar" }
    expect(hasProperty(obj, "baz")).toBe(false)
  })

  it("returns false if the object is not an object or function", () => {
    expect(hasProperty("foo", "length")).toBe(false)
    expect(hasProperty(123, "toString")).toBe(false)
  })
})

describe("isNullValueKey", () => {
  it("returns true if the given key is a null value", () => {
    const obj = { foo: null }
    expect(isNullValueKey(obj)("foo")).toBe(true)
  })

  it("returns false if the given key is not a null value", () => {
    const obj = { foo: "bar" }
    expect(isNullValueKey(obj)("foo")).toBe(false)
  })
})

describe("isKeyOf", () => {
  it("returns true if the given key is a key of the object", () => {
    const obj = { foo: "bar" }
    expect(isKeyOf(obj)("foo")).toBe(true)
  })

  it("returns false if the given key is not a key of the object", () => {
    const obj = { foo: "bar" }
    expect(isKeyOf(obj)("baz")).toBe(false)
  })
})

describe("typedKeys", () => {
  it("returns an array of keys of the object", () => {
    const obj = { foo: "bar", baz: 123 }
    expect(typedKeys(obj)).toEqual(["foo", "baz"])
  })
})
