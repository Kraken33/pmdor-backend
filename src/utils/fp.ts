export const asyncPipe = (...fns: any) => {
    return async function (arg?: any) {
      let res = arg;
      for (let fn of fns) {
        res = await fn(res);
      }
      return res;
    }
  }