import { Children, createElement, Fragment } from "react"
import { renderToString } from "react-dom/server"
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
    const WrappedComponent = withGroupedChildren(component, childrenSpec)

    expect(WrappedComponent.displayName).toBe("GroupedChildren.mockConstructor")
  })

  it("should set right component name from displayName", () => {
    ;(component as unknown as { displayName: string }).displayName = "ComponentTest"
    const WrappedComponent = withGroupedChildren(component, childrenSpec)

    expect(WrappedComponent.displayName).toBe("GroupedChildren.ComponentTest")
  })

  it("should pass the props and non-matching children to the component", () => {
    const WrappedComponent = withGroupedChildren(component, childrenSpec)
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
    const WrappedComponent = withGroupedChildren(component, childrenSpec)
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
    const WrappedComponent = withGroupedChildren(component, childrenSpec, { childrenToArray })
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
    const WrappedComponent = withGroupedChildren(component, childrenSpec, { proxyComponentFactory })
    const props = { testProp: "test" }

    createElement(WrappedComponent, props)
    expect(proxyComponentFactory).toHaveBeenCalledTimes(2)
    expect(proxyComponentFactory).toHaveBeenCalledWith("GroupWithProxy")
    expect(proxyComponentFactory).toHaveBeenCalledWith("EmptyGroupWithProxy")
  })

  it("should use the provided getComponentName function", () => {
    const getComponentName = jest.fn().mockReturnValue("CustomName")
    const config = { getComponentName }
    const Component = () => null
    const WrappedComponent = withGroupedChildren(Component, childrenSpec, config)

    expect(WrappedComponent.displayName).toBe("CustomName")
  })
})
