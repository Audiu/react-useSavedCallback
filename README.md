# react-useSavedCallback

[![npm version](https://badge.fury.io/js/react-usesavedcallback.svg)](https://badge.fury.io/js/react-usesavedcallback)

Invoke a callback that is saved from the latest render

## Usage

Install with `npm` or `yarn`

```
npm i react-usesavedcallback
```

```
yarn add react-usesavedcallback
```


Use this function instead of `useCallback` when you are interfacing with external JavaScript (trivial example is `setInterval`).


```javascript
const [a, setA] = useState(1);

const func = useSavedCallback(() => {
    setA(a + 1);
    console.log(a);
}, [a]);

useEffect(() => {
    const interval = setInterval(func, 1000);

    return () => clearInterval(interval);
}, []);

```


## Background

Working with callbacks from 3rd party dependencies and React Hooks can be a little bit confusing.

The classic example is `setInterval` built in.

Example:

```javascript
const [a, setA] = useState(1);

useEffect(() => {
    const interval = setInterval(() => {
        setA(a + 1);
        console.log(a);
    }, 1000);

    return () => clearInterval(interval);
}, []);
```

The callback passed into `setInterval` will be the rendered function at that point in time. This means `a` will not change as it was collected at the point of render (when `useEffect` fired);

It would be nice if you could use the `useCallback` function to update:


```javascript
const [a, setA] = useState(1);

const func = useCallback(() => {
    setA(a + 1);
    console.log(a);
}, [a]);

useEffect(() => {
    const interval = setInterval(func, 1000);

    return () => clearInterval(interval);
}, []);

```

The problem however is still the same. `func` is pointing towards the function returned by `useCallback` during that initial render. Of course, `useCallback` is great for only re-creating complex functions if a dependency changes, but it will return the function created at that point in time. It doesn't provide us a method to dynamically update the callback.

There are a few solutions to this problem, including this cool library: https://github.com/Aminadav/react-useStateRef

However, even though you can use this to access the state via the ref to get the current value, it doesn't help you when you want to propagate up the chain.

Consider you have a prop passed in, which is a callback function from this child component:

```javascript
const { parentFunc } = props;

const [a, setA] = useState(1);

const func = useCallback(() => {
    setA(a + 1);
    console.log(a);

    parentFunc(a);
}, [a]);

useEffect(() => {
    const interval = setInterval(func, 1000);

    return () => clearInterval(interval);
}, []);

```

This callback will point to `parentFunc` at the point in time of this render, and therefore you will also "see" the state of the parent component at the point in time that the render was done. This means you would have to access all your state via state refs all the way up the chain and life gets messy.

Anyway, wouldn't it be great to just move the ref of the callback? Well, we can! Mix the magic of `useStateRef` and this blog: https://overreacted.io/making-setinterval-declarative-with-react-hooks/ and we end up with a super simple generic hook to move the reference to the callback, instead of the reference to the state. Also, a touch of syntatic suger means we don't have to worry about `.current`.

Enter this hook - this is the entirety of it:

```javascript
import { useCallback, useEffect, useRef } from 'react';

const useSavedCallback = (callbackFunc, deps) => {
    const savedCallback = useRef();

    const callback = useCallback(callbackFunc, deps);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    return (...params) => savedCallback.current(...params);
};

export default useSavedCallback;
```

All we are doing is updating the ref to the callback whenever it changes.

Just use `useSavedCallback` instead of `useCallback`

```javascript
const [a, setA] = useState(1);

const func = useSavedCallback(() => {
    setA(a + 1);
    console.log(a);
}, [a]);

useEffect(() => {
    const interval = setInterval(func, 1000);

    return () => clearInterval(interval);
}, []);

```

This code will now behave as expected.

Thanks to this awesome blog for making this clear to me - and it has helped loads with interfacing with external callback style JavaScript from within React: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
