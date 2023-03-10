import { Children, createElement } from "react"
import { proxyComponentFactory } from "./proxyComponentFactory"
import { isNullValueKey, typedKeys } from "./typeGuards"
import type {
  WithGroupedChildrenComponent,
  Config,
  GroupedChildrenProps,
  OmitGroupedChildren,
  TraverseChildren,
  ChildMatcher,
} from "./types"
import { spliceChildrenByType, uncapitalize } from "./utils"

const defaultFactory = (rootName: string) => (key: string) => proxyComponentFactory(`${rootName}.${key}`)
const defaultTraverseChildren: TraverseChildren = (c) =>
  (c && typeof c === "object" && "props" in c && c.props.children) || undefined
const defaultComponentMatcher: ChildMatcher = (c, _, t) => !!c && typeof c === "object" && "type" in c && c.type === t

/**
 * Gives an ability to pass multiple number of children groups to a component using classic
 * React component inheritance hierarchies instead of attributes. The component can consume
 * groups or grouping components from matching properties.
 * @param Component a component to modify.
 * @param childrenSpec specification object to define list of grouping components. Use Pascal case
 * to defines keys. props will be automatically uncapitalized to camelCase. Component `GroupName` can
 * be registered as `{ GroupName }` (or `{ GroupName: GroupName }`) and will be available as `groupName`
 * property. If property value is set to `null` like `{ Group2: null }` a proxy component is generated
 * and `group2` property will contain the children of the proxy component, not the proxy itself.
 * @param config an optional config to overwrite some behavior.
 * @returns Component with set of grouping components defined as static properties to use
 * like `<Component.GroupName ... >grouped children</Component.GroupName>
 */
export const withGroupedChildren = <P extends object, S extends Record<string, React.ComponentType | null>>(
  Component: React.ComponentType<P & GroupedChildrenProps<S>>,
  childrenSpec: S,
  config?: Config,
): WithGroupedChildrenComponent<P, S> => {
  const componentName = Component.displayName || Component.name
  const {
    getComponentName,
    childrenToArray = Children.toArray,
    proxyComponentFactory = defaultFactory(componentName),
    componentMatcher = defaultComponentMatcher,
    traverseChildren = defaultTraverseChildren,
  } = config ?? {}
  const clonedSpec = { ...childrenSpec }
  cloneAndGenerateNulls<keyof S, React.ComponentType>(clonedSpec, proxyComponentFactory)

  const hoc: React.FC<React.PropsWithChildren<OmitGroupedChildren<P, S>>> = ({ children, ...props }) => {
    const restChildren = childrenToArray(children)

    const extractedChildren = Object.assign.apply(undefined, [
      {},
      ...typedKeys(childrenSpec).map((k) => ({
        [uncapitalize(k.toString())]: spliceChildrenByType(
          restChildren,
          k,
          clonedSpec[k],
          componentMatcher,
          childrenSpec[k] === null ? traverseChildren : undefined,
        ),
      })),
    ])

    return createElement(Component, { ...props, ...extractedChildren }, restChildren)
  }

  hoc.displayName = (typeof getComponentName === "function" && getComponentName()) || "GroupedChildren." + componentName

  return Object.assign(hoc, clonedSpec)
}

//Should be a function https://github.com/microsoft/TypeScript/issues/34523
function cloneAndGenerateNulls<K extends PropertyKey, S extends React.ComponentType<React.PropsWithChildren>>(
  childrenSpec: Record<K, S | null>,
  factory: (key: string) => React.ComponentType,
): asserts childrenSpec is { [key in K]: S } {
  Object.assign(
    childrenSpec,
    Object.fromEntries(
      typedKeys(childrenSpec)
        .filter(isNullValueKey(childrenSpec))
        .map((k) => [k, factory(k.toString())]),
    ),
  )
}
