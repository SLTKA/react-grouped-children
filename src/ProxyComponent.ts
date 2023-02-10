import { PureComponent } from "react"

// Should be a pure class https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33006
export class ProxyComponent extends PureComponent<React.PropsWithChildren> {
  render() {
    return this.props.children
  }
}
