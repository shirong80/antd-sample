declare global {
  interface Number {
    commaFormat(): string | 0;
  }
}

Number.prototype.commaFormat = function () {
  if (this === 0) return 0;
  const reg = /(^[+-]?\d+)(\d{3})/;
  let n = this + '';

  while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

  return n;
};

export {};
