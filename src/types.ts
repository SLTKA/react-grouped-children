export type DefaultTraverseChildren = TraverseChildren<React.ReactNode | undefined>

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
export type GroupedChildrenProps<S extends ChildrenSpec, T = ReturnType<DefaultTraverseChildren>> = {
  [key in Uncapitalize<keyof S & string>]: Array<null extends S[key] ? T | undefined : React.ReactNode>
}

export type ToArray = (children: React.ReactNode | React.ReactNode[]) => Array<Exclude<React.ReactNode, boolean | null | undefined>>

export type ChildrenSpec = Record<string, React.ComponentType<object> | null>

export type SwapNullWithComponent<S extends ChildrenSpec> = {
  [K in keyof S]: S[K] extends NonNullable<S[K]>
    ? S[K]
    : React.ComponentType<React.PropsWithChildren> & GeneratedGroupingComponent
}

export type WithGroupedChildrenComponent<S extends ChildrenSpec, PROPS extends object> = React.FC<
  React.PropsWithChildren<PROPS>
> &
  SwapNullWithComponent<S>

export type OmitGroupedChildren<P extends object, S extends ChildrenSpec> = Omit<P, Uncapitalize<keyof S & string>>

export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer ElementType)[] ? ElementType : never

export type TrueReactChild = ArrayElement<ReturnType<ToArray>>

type ReactChildOrNull = TrueReactChild | null

export type OptimizedReactChild = ReturnType<ToArray>

export type TraverseChildren<R> = (component: ReactChildOrNull) => R
export type ChildMatcher = (component: TrueReactChild, key: PropertyKey, type: string | React.ComponentType) => boolean

export type ComponentFactory = (key: string) => React.ComponentType<React.PropsWithChildren>

export interface ExtractionConfig<T> {
  /**
   * A custom method to convert React component initial children to array on preprocessing stage.
   * Use when you want to flatten children.
   * The function must always return a cloned array of children as it will be mutated.
   * If not defined standard React.Children.toArray is used.
   */
  childrenToArray?: ToArray

  /**
   * A custom component matcher
   * @param component Child Component
   */
  componentMatcher?: ChildMatcher

  /**
   * Function to transform children of generated groups (those defined by `null` in the provided spec)
   */
  traverseChildren?: TraverseChildren<T>
}

export interface Config<S extends ChildrenSpec, T = ReturnType<DefaultTraverseChildren>> extends ExtractionConfig<T> {
  childrenSpec: S

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
  proxyComponentFactory?: ComponentFactory
}

export type GeneratedGroupingComponent = {
  _groupGenerated?: true
}
