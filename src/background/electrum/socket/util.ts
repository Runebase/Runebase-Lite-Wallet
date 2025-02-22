function createRecursiveParser(maxDepth: number, delimiter: string) {
  const MAX_DEPTH = maxDepth;
  const DELIMITER = delimiter;

  const recursiveParser = (
    n: number, 
    buffer: string, callback: (chunk: string, depth: number) => void
  ): { 
    code: number; 
    buffer: string 
  } => {
    if (buffer.length === 0) {
      return { code: 0, buffer };
    }
    if (n > MAX_DEPTH) {
      return { code: 1, buffer };
    }
    const xs = buffer.split(DELIMITER);
    if (xs.length === 1) {
      return { code: 0, buffer };
    }
    callback(xs.shift() as string, n);
    return recursiveParser(n + 1, xs.join(DELIMITER), callback);
  };
  return recursiveParser;
}

class MessageParser {
  private buffer: string;
  private callback: (chunk: string, depth: number) => void;
  private recursiveParser: (
    n: number, 
    buffer: string, callback: (chunk: string, depth: number) => void
  ) => { 
    code: number; buffer: string 
  };

  constructor(callback: (chunk: string, depth: number) => void) {
    this.buffer = '';
    this.callback = callback;
    this.recursiveParser = createRecursiveParser(20, '\n');
  }

  run(chunk: string): void {
    this.buffer += chunk;
    let res;
    do {
      res = this.recursiveParser(0, this.buffer, this.callback);
      this.buffer = res.buffer;
    } while (res.code !== 0);
  }
}

export { MessageParser };
