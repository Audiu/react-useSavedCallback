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
