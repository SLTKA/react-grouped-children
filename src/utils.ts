import type { ChildMatcher, OptimizedReactChild, TraverseChildren } from "./types"

export const uncapitalize = <S extends string>(text: S): Capitalize<S> =>
  // Currently TS does not allow to properly validate type as Capitalize<S>,
  // we can add
  // const isFirstCapital = <S extends string>(text: string): text is Capitalize<S> =>
  // text.charAt(0).toUpperCase() === text.charAt(0);
  // but this would force us to return unnecessary `undefined` like
  // return isFirstCapital(...) ? ... : undefined;
  `${text.charAt(0).toLowerCase()}${text.slice(1)}` as Capitalize<S>

/**
 * Finds matching children using @param componentMatcher and traverse them
 * using @param traverseChildren if provided.
 * NOTE: This method mutates the source array and removes all matched elements.
 * @param children array of children to extract matching components.
 * @param componentMatcher a matcher function which. SHould return `true` to confirm match.
 * @param traverseChildren a function to traverse children of matched components. Use for Proxy
 * components to skip them and use their children only
 * @returns array of matched elements. For traversed elements each element of returned array will
 * contain children of a single Proxy Component.
 */
export const spliceChildrenByType = (
  children: OptimizedReactChild,
  key: PropertyKey,
  type: string | React.ComponentType,
  componentMatcher: ChildMatcher,
  traverseChildren?: TraverseChildren,
) => {
  const located: React.ReactNode[] = []
  let componentPos = -1
  while ((componentPos = children.findIndex((c) => componentMatcher(c, key, type))) > -1) {
    const locatedComponent = children.splice(componentPos, 1)[0]
    const traversed = typeof traverseChildren === "function" ? traverseChildren(locatedComponent) : locatedComponent
    if (traversed) {
      located.push(traversed)
    }
  }
  return located
}
