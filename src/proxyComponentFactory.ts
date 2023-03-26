import { PureComponent } from "react"

// Should be a pure class https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33006
export const proxyComponentFactory = (key: string): React.ComponentClass<React.PropsWithChildren> =>
  class ProxyComponent extends PureComponent<React.PropsWithChildren> {
    static displayName = key

    render() {
      return this.props.children
    }
  }
