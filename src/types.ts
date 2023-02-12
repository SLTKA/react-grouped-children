/**
 * Converts specified groups into camelCase props. Use in combination with your component
 * props like:
 * ```
 * const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
 *   return <div>{children}</div>;
 * };
 *
 * const childGroups = {
 *   Header,
 *   Footer: null,
 * } as const;
 *
 * const MyComponentInternal: React.FC<MyComponentProps & GroupedChildrenProps<typeof childGroups>> = ({
 *   header,
 *   footer,
 *   ...
 * }) => ...
 * ```
 */
export type GroupedChildrenProps<T extends Record<string, React.ComponentType | null>> = {
  [key in Uncapitalize<keyof T & string>]: T[key] extends null ? React.ReactNode | undefined : React.ReactNode
}

export type SwapNullWithComponent<S extends Record<string, React.ComponentType | null>> = {
  [k in keyof S]: S[k] extends null ? React.ComponentType<React.PropsWithChildren> : S[k]
}

export type WithGroupedChildrenComponent<
  P extends object,
  S extends Record<string, React.ComponentType | null>,
> = React.FC<React.PropsWithChildren<OmitGroupedChildren<P, S>>> & SwapNullWithComponent<S>

export type OmitGroupedChildren<P extends object, S extends Record<string, React.ComponentType | null>> = Omit<
  P,
  Uncapitalize<keyof S & string>
>

export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer ElementType)[] ? ElementType : never

export type TrueReactChild = ArrayElement<ReturnType<typeof import("react").Children.toArray>>

type ReactChildOrNull = TrueReactChild | null

export type OptimizedReactChild = ReturnType<typeof import("react").Children.toArray>

export type TraverseChildren = (component: ReactChildOrNull) => React.ReactNode
export type ChildMatcher = (component: TrueReactChild, key: PropertyKey, type: string | React.ComponentType) => boolean

export interface Config {
  /**
   * A custom method to convert React component children to array. Use when you want to flatten children.
   * The function must always return a cloned array of children as it will be mutated.
   * If not defined standard React.Children.toArray is used.
   */
  childrenToArray?: typeof import("react").Children.toArray

  /**
   * A custom HOC name generation factory.
   * @returns Custom component name which will be displayed in React Dev Tools.
   */
  getComponentName?: () => string

  /**
   * A factory which returns a custom implementation of Proxy component
   * @param key Current key of specification object
   * @returns A React component
   */
  proxyComponentFactory?: (key: string) => React.ComponentType

  /**
   * A custom function to traverse children of Proxy Component (when you define it as `null` in spec).
   * Default will return `component.props.children || null`
   * @param component Proxy Component or null
   */
  traverseChildren?: TraverseChildren

  /**
   * A custom component matcher
   * @param component Child Component
   */
  componentMatcher?: ChildMatcher
}
