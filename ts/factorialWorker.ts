onmessage = e => {
  const [start, end]: [number, number] = e.data;
  console.log(`Processing factorial between ${start} and ${end}.`);
  let acc = BigInt(1);
  for (let i = start; i <= end; i++) {
    acc = acc * BigInt(i);
  }
  postMessage(acc);
};
