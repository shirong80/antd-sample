declare global {
  interface Array<T> {
    first(): any;
    last(): any;
  }
}

Array.prototype.first = function() {
  return this.slice(0, 1).pop();
};

Array.prototype.last = function() {
  return this.slice().pop();
};

export {};
