onmessage = (e: MessageEvent) => {
  const data: number[] = [...e.data];
  postMessage(data.reduce((a, b) => a * b));
};
