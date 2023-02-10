# react-grouped-children
A React library to allow passing multiple children groups to a component using classic React component inheritance hierarchies instead of attributes.

## Table of Contents
- [Installation](#Installation)
- [Usage](#Usage)
- [Configuration](#Configuration)
- [License](#License)

## Installation

```sh
npm install react-grouped-children
```
or

```sh
yarn add react-grouped-children
```

## Usage
### Defining Children Specification

Create a `childrenSpec` object where each key is a grouping component name and its value is the component itself.

If you don't have a component for a particular group, you can set its value to `null`. If value is not set a proxy
component will be generated and its children passed to primary component props, not the proxy component.

```typescript
const childGroups = {
  Header: Header,
  Footer: null,
} as const;
```

### Modifying Component

Wrap your component with `withGroupedChildren` and pass `childrenSpec` as the second argument.
```typescript
import { withGroupedChildren } from 'react-grouped-children';

const MyComponentInternal: React.FC<MyComponentProps & GroupedChildrenProps<typeof childGroups>> = ({
  header,
  footer,
  ...
}) => ...

const MyComponent = withGroupedChildren(MyComponentInternal, childGroups);

```
With `childGroups` defined as in the example above `header` prop will contain an instance of `Header`
component and `footer` prop will be set to children of the generated proxy component.

### Using Children Groups and HOC

Now, you can pass children groups to your component as follows:
```typescript
...
return (
  <MyComponent>
    <MyComponent.Header>
      This is header
    </MyComponent.Header>
    <MyComponent.Footer>
      This is footer
    </MyComponent.Footer>
  </MyComponent>
)
...
```

## Configuration

You can configure the behavior of withGroupedChildren by passing an optional config object.

### childrenToArray
A custom method to convert React component children to array. Use when you want to flatten children. The function must always returned a cloned array of children as it will be mutated. If not defined, React.Children.toArray is used by default.

### getComponentName
A custom HOC name generation factory. Returns custom component name.

### proxyComponentFactory
A factory which accepts current `key` of specification object returns a custom implementation of Proxy component

## License

MIT
Copyright (c) 2023 Alexandr Yeskov
