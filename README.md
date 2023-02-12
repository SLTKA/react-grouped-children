# react-grouped-children
A React library to allow passing multiple children groups to a component using classic React component inheritance
hierarchies instead of attributes.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Why?](#why)

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

Create a `childrenSpec` object where each key is a *grouping component* name and its value is the component itself.

If you don't have a component for a particular group, you can set its value to `null`. If value is not set a proxy
component will be generated and its children passed to primary component props, not the proxy component.

```typescript
const childGroups = {
  Header: Header,
  Footer: null,
} as const;
```

### Modifying Component

Wrap your component (*main component*) with `withGroupedChildren` and pass `childrenSpec` as the second argument
to define *grouping components*.
```typescript
import { withGroupedChildren } from 'react-grouped-children';

const MyComponentInternal: React.FC<MyComponentProps & GroupedChildrenProps<typeof childGroups>> = ({
  header,
  footer,
  ...
}) => ...

const MyComponent = withGroupedChildren(MyComponentInternal, childGroups);

```
With `childGroups` defined as in the example above `header` prop will contain an array with all instances of `Header`
component and `footer` prop will be set to an array of children of the generated proxy component.

> ⚠ **NOTE:** be mindful that react may pass children as single child or as an array, so `footer` may contain array of arrays.
To properly control this you can define [traverseChildren](./src/types.ts#L76) function in config or do proper parsing in
the component. This project does not address it as it will be fully compatible with `React.ReactNode` type and React can
handle it properly if you pass it as is when you rendering the main component.

> ⚠ **NOTE:** You may have some challenges with `key`
property if you pass elements to render return "as-is". Most like this will happen only if your custom `childrenToArray`
function does not assign keys properly.

### Using Children Groups and HOC

Now, you can pass children *group components* to your component as follows:
```jsx
...
return (
  <MyComponent>
    <MyComponent.Header>
      This is header
    </MyComponent.Header>
    <MyComponent.Footer>
      This is footer 1
    </MyComponent.Footer>
    <MyComponent.Footer>
      This is footer 2
    </MyComponent.Footer>
  </MyComponent>
)
...
```

## Configuration

You can configure the behavior of withGroupedChildren by passing an optional config object.
Mode details are in JSDoc comments of [`Config`](./src/types.ts#L50) type (`./src/types.ts`)

### childrenToArray
A custom method to convert React component children to array. Use when you want to flatten children. The function must
always returned a cloned array of children as it will be mutated. If not defined, `React.Children.toArray` is used by default.

### getComponentName
A custom HOC name generation factory. Returns custom component name.

### proxyComponentFactory
A factory which accepts current `key` of specification object returns a custom implementation of Proxy component.

> ⚠ Be mindful that this factory should return a new component every for every separate key. This is because the
[default](./src/withGroupedChildren.ts#L17) `componentMatcher` is matching types by reference, not by display name or
anything else. To change this define your own `componentMatcher`

### traverseChildren
A custom method to traverse children from Proxy Component

### componentMatcher
A custom component matcher

## Why?
in classic React when you want to divide children into groups to use them separately in different
sections of your app you need to pass them as `React.ReactNode` attributes which often make code reading
challenging, especially when you need to have many attributes like this:
```jsx
<MyComponent
  group1={
    <div>
      <Head>Some content</Head>
      <Body>
        Some bigger content
        <ul>
          {elements.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </Body>
    <div>
  }
  group2={
    <div>
      <Footer>
        <FooterItem>Item 1</FooterItem>
        <FooterItem>Item 2</FooterItem>
        <FooterItem>Item 3</FooterItem>
      </Footer>
    <div>
  }
>
  {restChildren}
</MyComponent>
```

With this package it becomes more transparent and look more HTML-ish:
```jsx
<MyComponent>
  <MyComponent.Group1>
    <div>
      <Head>Some content</Head>
      <Body>
        Some bigger content
        <ul>
          {elements.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </Body>
    <div>
  </MyComponent.Group1>
  <MyComponent.Group2>
    <div>
      <Footer>
        <FooterItem>Item 1</FooterItem>
        <FooterItem>Item 2</FooterItem>
        <FooterItem>Item 3</FooterItem>
      </Footer>
    <div>
  <MyComponent.Group2>
  {restChildren}
</MyComponent>
```
or in scenarios like this
```jsx
<MyList>
  <MyList.Item>Item 1<MyList.Item>
  <MyList.Item>Item 2<MyList.Item>
  <MyList.Item>Item 3<MyList.Item>
  <MyList.Item>Item 4<MyList.Item>
  <MyList.Item>Item 5<MyList.Item>
  <MyList.Heading>Heading Line</MyList.Heading>
  <MyList.Footer>Heading Line</MyList.Footer>
</MyList>
```
and access children as classic attributes:
```jsx
const MyList: React.FC = ({ item, heading, footer }) => {
  ...
  return (<div>
    {heading}<br />
    <ul>
      {item.map((i) => <li>{i}</li>)}
    </ul>
    {footer}
  </div>)
}
```

## License

[MIT](./LICENSE)

Copyright (c) 2023 Alexandr Yeskov
