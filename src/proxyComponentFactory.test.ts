import { PureComponent } from "react"
import { proxyComponentFactory } from "./proxyComponentFactory"

describe("proxyComponentFactory", () => {
  it("should return a PureComponent class", () => {
    const key = "TestKey"
    const ProxyComponent = proxyComponentFactory(key)
    expect(ProxyComponent.prototype).toBeInstanceOf(PureComponent)
  })

  it("should have a static displayName property equal to the passed key", () => {
    const key = "TestKey"
    const ProxyComponent = proxyComponentFactory(key)
    expect(ProxyComponent.displayName).toBe(key)
  })

  it("should render its children", () => {
    const key = "TestKey"
    const ProxyComponent = proxyComponentFactory(key)
    const component = new ProxyComponent({ children: "Test children" })
    const result = component.render()
    expect(result).toBe("Test children")
  })
})
