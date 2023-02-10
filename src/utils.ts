import { Children } from "react"

export const uncapitalize = <S extends string>(text: S): Capitalize<S> =>
  // Currently TS does not allow to properly validate type as Capitalize<S>,
  // we can add
  // const isFirstCapital = <S extends string>(text: string): text is Capitalize<S> =>
  // text.charAt(0).toUpperCase() === text.charAt(0);
  // but this would force us to return unnecessary `undefined` like
  // return isFirstCapital(...) ? ... : undefined;
  `${text.charAt(0).toLowerCase()}${text.slice(1)}` as Capitalize<S>

export const spliceChildByType = (
  children: ReturnType<typeof Children.toArray>,
  type: React.JSXElementConstructor<Record<PropertyKey, never>>,
  unwrapChildren = false,
) => {
  const componentPos = children.findIndex((c) => !!c && typeof c === "object" && "type" in c && c.type === type)
  const locatedComponent = componentPos > -1 ? children.splice(componentPos, 1)[0] : null
  return unwrapChildren && locatedComponent && typeof locatedComponent === "object" && "props" in locatedComponent
    ? locatedComponent.props.children
    : locatedComponent
}
