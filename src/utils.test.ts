import { createElement, Fragment } from "react"
import { uncapitalize, spliceChildrenByType } from "./utils"

describe("uncapitalize", () => {
  it("should uncapitalize the first letter of a string", () => {
    expect(uncapitalize("Hello")).toBe("hello")
    expect(uncapitalize("WORLD")).toBe("wORLD")
    expect(uncapitalize("1Number")).toBe("1Number")
  })
})

describe("spliceChildrenByType", () => {
  const component1 = () => createElement(Fragment, {}, "1")
  const component2 = () => createElement(Fragment, {}, "2")
  const component3 = () => createElement(Fragment, {}, "3")
  const child1 = createElement(component1, { key: "1" })
  const child2 = createElement(component2, { key: "2" })
  const child3 = createElement(component3, { key: "3" })
  const children = [child1, child2, child3]
  const componentMatcher = (component: React.ReactNode, _: PropertyKey, type: string | React.ComponentType) =>
    Boolean(typeof component === "object" && component && "type" in component && component.type === type)
  const traverseChildren = jest.fn(() => null)

  it("should locate and splice matching children", () => {
    expect(spliceChildrenByType(children, "ch2", component2, componentMatcher)).toEqual([child2])
    expect(children).toEqual([child1, child3])
  })

  it("should traverse children if traverseChildren is provided", () => {
    spliceChildrenByType(children, "ch1", component1, componentMatcher, traverseChildren)
    expect(traverseChildren).toHaveBeenCalledWith(child1)
  })
})
