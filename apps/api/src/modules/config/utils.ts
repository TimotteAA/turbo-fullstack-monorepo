export const isAsyncFn = <R, A extends Array<any>>(
    callback: (...args: A) => R | Promise<R>,
): callback is (...args: A) => Promise<R> => {
    const asyncFnConstructor = (async () => {}).constructor;
    return callback instanceof asyncFnConstructor === true;
};
