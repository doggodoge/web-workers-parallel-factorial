import { chunk } from 'lodash';

const input = document.getElementById('input') as HTMLInputElement;
const button = document.getElementById('calculate-button') as HTMLButtonElement;
const output = document.getElementById('result-display');

const num_threads = navigator.hardwareConcurrency;

interface Range {
  start: number;
  end: number;
}

if (button) {
  button.onclick = buttonOnClick;
}

function buttonOnClick() {
  const n = Number(input?.value ?? 0);
  if (n < 1000) {
    handleLowerFactorialNumbers(n);
    return;
  }
  const ranges = getRanges(n, num_threads);
  const workers = createWorkers(ranges.length);
  const promises = workers.map(convertWorkerToPromise);
  ranges.forEach((range: Range, index: number) => {
    workers[index].postMessage([range.start, range.end]);
  });
  Promise.all(promises)
    .then((results) => {
      workers.forEach((worker) => worker.terminate());
      const sumWorker = new Worker(new URL('sumWorker.ts', import.meta.url));
      sumWorker.postMessage([...results]);
      sumWorker.onmessage = (e) => {
        if (output) {
          const data: number = e.data;
          output.innerText = data.toString(10);
        }
        sumWorker.terminate();
      };
    })
    .catch((error) => console.error(error));
}

function handleLowerFactorialNumbers(n: number) {
  const worker = new Worker(new URL('factorialWorker.ts', import.meta.url));
  worker.postMessage([1, n]);
  worker.onmessage = (e) => {
    if (output) {
      const data: number = e.data;
      output.innerText = data.toString(10).toUpperCase();
    }
  };
}

function convertWorkerToPromise(worker: Worker): Promise<number> {
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
}

function createWorkers(quantity: number): Worker[] {
  const workers = [];
  for (let i = 0; i < quantity; i++) {
    workers.push(new Worker(new URL('factorialWorker.ts', import.meta.url)));
  }
  return workers;
}

// TODO: potential for a significant speed improvement here, up to 8%.
function getRanges(limit: number, processorCount: number): Range[] {
  const chunkSize = Math.abs(limit / processorCount + 1);
  const arr = [...Array(limit).keys()];
  return chunk(arr, chunkSize).map((chunk: number[]) => ({
    start: chunk[0] + 1,
    end: chunk[chunk.length - 1] + 1,
  }));
}
