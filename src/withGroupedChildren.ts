import React, { Children, createElement } from "react"
import { proxyComponentFactory } from "./proxyComponentFactory"
import { isNullValueKey, typedKeys } from "./typeGuards"
import type {
  ExtractionConfig,
  ChildMatcher,
  ChildrenSpec,
  ComponentFactory,
  Config,
  DefaultTraverseChildren,
  GroupedChildrenProps,
  SwapNullWithComponent,
  WithGroupedChildrenComponent,
} from "./types"
import { isGenerated, spliceChildrenByType, uncapitalize } from "./utils"

export const getDefaultFactory =
  (rootName: string): ComponentFactory =>
  (key: string) =>
    proxyComponentFactory(`${rootName}.${key}`)
export const defaultTraverseChildren: DefaultTraverseChildren = (c) =>
  (c && typeof c === "object" && "props" in c && c.props.children) || undefined
export const defaultComponentMatcher: ChildMatcher = (c, _, t) =>
  !!c && typeof c === "object" && "type" in c && c.type === t

export const parseGroupingSpec = <S extends ChildrenSpec>(
  childrenSpec: S,
  proxyComponentFactory: ComponentFactory,
): SwapNullWithComponent<S> => {
  const clonedSpec = { ...childrenSpec }
  generateNulls<S>(clonedSpec, proxyComponentFactory)
  return clonedSpec
}

export const extractChildren = <S extends ChildrenSpec, T>(
  children: React.ReactNode | undefined,
  parsedSpec: SwapNullWithComponent<S>,
  config: ExtractionConfig<T>,
) => {
  const {
    childrenToArray = Children.toArray,
    componentMatcher = defaultComponentMatcher,
    traverseChildren = defaultTraverseChildren,
  } = config
  const restChildren = childrenToArray(children)

  const extractedChildren: GroupedChildrenProps<S, T> = Object.assign.apply(undefined, [
    {},
    ...typedKeys(parsedSpec).map((k) => ({
      [uncapitalize(k.toString())]: spliceChildrenByType<T | ReturnType<typeof defaultTraverseChildren>>(
        restChildren,
        k,
        parsedSpec[k],
        componentMatcher,
        isGenerated(parsedSpec[k]) ? traverseChildren : undefined,
      ),
    })),
  ])
  return { specChildren: extractedChildren, restChildren }
}

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
const withGroupedChildren =
  <S extends ChildrenSpec, T = React.ReactNode>(config: Config<S, T>) =>
  <PROPS extends object>(
    Component: React.ComponentType<PROPS & GroupedChildrenProps<S, T>>,
  ): WithGroupedChildrenComponent<S, PROPS> => {
    const componentName = Component.displayName || Component.name
    const { getComponentName, childrenSpec } = config

    const parsedSpec = parseGroupingSpec(childrenSpec, config.proxyComponentFactory || getDefaultFactory(componentName))

    const hoc: React.FC<React.PropsWithChildren<PROPS>> = (props) => {
      const { specChildren, restChildren } = extractChildren(props.children, parsedSpec, config)

      return createElement(
        Component,
        {
          ...props,
          ...specChildren,
        },
        restChildren,
      )
    }

    hoc.displayName =
      (typeof getComponentName === "function" && getComponentName()) || `WithGroupedChildren(${componentName})`

    return Object.assign(hoc, parsedSpec)
  }

export { withGroupedChildren }

//Assertions:
//All should be functions, more info here: https://github.com/microsoft/TypeScript/issues/34523
function markAsGenerated<C extends React.ComponentType>(
  componentType: C,
): asserts componentType is C & { _groupGenerated: true } {
  Object.assign(componentType, { _groupGenerated: true })
}

function generateNulls<S extends ChildrenSpec>(
  childrenSpec: S,
  factory: ComponentFactory,
): asserts childrenSpec is S & SwapNullWithComponent<S> {
  Object.assign(
    childrenSpec,
    Object.fromEntries(
      typedKeys(childrenSpec)
        .filter(isNullValueKey(childrenSpec))
        .map((k) => {
          const producedComponent = factory(k.toString())
          markAsGenerated(producedComponent)
          return [k, producedComponent]
        }),
    ),
  )
}
