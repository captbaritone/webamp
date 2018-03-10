import LoadQueue from "./loadQueue";

describe("LoadQueue", () => {
  it("executes some promises", () => {
    const results = [];
    const makePushPromise = n => {
      return new Promise(resolve => {
        results.push(n);
        resolve();
      });
    };

    const task1 = makePushPromise(1);
    const task2 = makePushPromise(2);
    const task3 = makePushPromise(3);
    const task4 = makePushPromise(4);

    const loadQueue = new LoadQueue({ threads: 4 });
  });
});
