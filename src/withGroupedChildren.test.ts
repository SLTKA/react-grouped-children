import { Children, createElement, Fragment } from "react"
import { renderToString } from "react-dom/server"
import { TraverseChildren } from "./types"
import { withGroupedChildren } from "./withGroupedChildren"

describe("withGroupedChildren", () => {
  const GroupComponent: React.FC = () => createElement(Fragment, {}, "group")
  const childrenSpec = {
    GroupName: GroupComponent,
    GroupWithProxy: null,
    EmptyGroupWithProxy: null,
  }

  const component = jest.fn<React.ReactElement | null, [React.PropsWithChildren<{ testProp: string }>]>(
    ({ children }) => createElement(Fragment, {}, children),
  )

  it("should set right component name from name", () => {
    const WrappedComponent = withGroupedChildren({ childrenSpec })(component)
    expect(WrappedComponent.displayName).toBe("WithGroupedChildren(mockConstructor)")
  })

  it("should set right component name from displayName", () => {
    ;(component as unknown as { displayName: string }).displayName = "ComponentTest"
    const WrappedComponent = withGroupedChildren({ childrenSpec })(component)

    expect(WrappedComponent.displayName).toBe("WithGroupedChildren(ComponentTest)")
  })

  it("should pass the props and non-matching children to the component", () => {
    const WrappedComponent = withGroupedChildren({ childrenSpec })(component)
    const props = { testProp: "test" }
    const children = [1, 2, 3]

    component.mockClear()
    renderToString(createElement(WrappedComponent, props, ...children))

    expect(component).toHaveBeenCalledWith(
      {
        ...props,
        groupName: [],
        groupWithProxy: [],
        emptyGroupWithProxy: [],
        children,
      },
      {},
    )
  })

  it("should pass the grouped children to the component", () => {
    const WrappedComponent = withGroupedChildren({ childrenSpec })(component)
    const props = { testProp: "test" }
    const child1 = createElement(WrappedComponent.GroupName, { key: 1 }, 1)
    const child2 = createElement(WrappedComponent.GroupName, { key: 2 }, 2)
    const child3 = createElement(WrappedComponent.GroupWithProxy, { key: 3 }, "child of GroupWithProxy 3")
    const child4 = createElement(
      WrappedComponent.GroupWithProxy,
      { key: 4 },
      "child 1 of GroupWithProxy 4",
      "child 2 of GroupWithProxy 4",
    )
    const child5 = createElement(WrappedComponent.EmptyGroupWithProxy, { key: 5 })
    const children = [child5, child1, child3, child2, child4, "random"]

    component.mockClear()
    renderToString(createElement(WrappedComponent, props, children))

    expect(component).toBeCalledWith(
      {
        ...props,
        groupName: Children.toArray([child1, child2]),
        groupWithProxy: ["child of GroupWithProxy 3", ["child 1 of GroupWithProxy 4", "child 2 of GroupWithProxy 4"]],
        emptyGroupWithProxy: [],
        children: ["random"],
      },
      {},
    )
  })

  it("should use the provided childrenToArray function", () => {
    const childrenToArray = jest.fn(() => [1, 2, 3])
    const WrappedComponent = withGroupedChildren({ childrenSpec, childrenToArray })(component)
    const props = { testProp: "test" }
    const children = "test children"

    component.mockClear()

    renderToString(createElement(WrappedComponent, props, children))

    expect(childrenToArray).toHaveBeenCalledWith(children)
    expect(component).toHaveBeenCalledWith(
      {
        ...props,
        groupName: [],
        groupWithProxy: [],
        emptyGroupWithProxy: [],
        children: [1, 2, 3],
      },
      {},
    )
  })

  it("should use the provided proxyComponentFactory function", () => {
    const proxyComponentFactory = jest.fn(() => () => null)
    const WrappedComponent = withGroupedChildren({ childrenSpec, proxyComponentFactory })(component)
    const props = { testProp: "test" }

    createElement(WrappedComponent, props)
    expect(proxyComponentFactory).toHaveBeenCalledTimes(2)
    expect(proxyComponentFactory).toHaveBeenCalledWith("GroupWithProxy")
    expect(proxyComponentFactory).toHaveBeenCalledWith("EmptyGroupWithProxy")
  })

  it("should use the provided traverseChildren function", () => {
    const traverseChildren = jest.fn<number, Parameters<TraverseChildren<number>>>(
      (c) => (c && typeof c === "object" && "props" in c && Children.count(c.props.children)) || -1,
    )
    component.mockClear()
    const WrappedComponent = withGroupedChildren({ childrenSpec, traverseChildren })(component)
    const props = { testProp: "test" }
    const child1 = createElement(WrappedComponent.GroupName, { key: 1 }, 1)
    const child2 = createElement(WrappedComponent.GroupName, { key: 2 }, 2)
    const child3 = createElement(WrappedComponent.GroupWithProxy, { key: 3 }, "child of GroupWithProxy 3")
    const child4 = createElement(
      WrappedComponent.GroupWithProxy,
      { key: 4 },
      "child 1 of GroupWithProxy 4",
      "child 2 of GroupWithProxy 4",
    )
    const child5 = createElement(WrappedComponent.EmptyGroupWithProxy, { key: 5 })
    const children = [child5, child1, child3, child2, child4, "random"]

    component.mockClear()
    renderToString(createElement(WrappedComponent, props, children))

    createElement(WrappedComponent, props)
    expect(traverseChildren).toHaveBeenCalledTimes(3)
    expect(customMatcher(traverseChildren.mock.calls[0][0], child3)).toEqual(true)
    expect(customMatcher(traverseChildren.mock.calls[1][0], child4)).toEqual(true)
    expect(customMatcher(traverseChildren.mock.calls[2][0], child5)).toEqual(true)

    expect(component).toBeCalledWith(
      {
        ...props,
        groupName: Children.toArray([child1, child2]),
        groupWithProxy: [1, 2],
        emptyGroupWithProxy: [-1],
        children: ["random"],
      },
      {},
    )
  })

  it("should use the provided getComponentName function", () => {
    const getComponentName = jest.fn().mockReturnValue("CustomName")
    const config = { getComponentName, childrenSpec }
    const Component = () => null
    const WrappedComponent = withGroupedChildren(config)(Component)

    expect(WrappedComponent.displayName).toBe("CustomName")
  })
})

function customMatcher(nodeA: React.ReactNode, nodeB: React.ReactNode): boolean {
  return typeof nodeA === "string" ||
    typeof nodeA === "number" ||
    typeof nodeA === "boolean" ||
    nodeA === null ||
    nodeA === undefined
    ? nodeA === nodeB
    : Symbol.iterator in nodeA
    ? nodeA === nodeB
    : (nodeB &&
        (typeof nodeB === "object" || typeof nodeB === "function") &&
        "type" in nodeB &&
        nodeA.type === nodeB.type &&
        nodeA.props === nodeB.props) ||
      false
}
