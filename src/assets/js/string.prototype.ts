declare global {
  interface String {
    capitalize(kind: any): any;
    toLocalStr(fixedValue: any): any;
    parseNumber(): any;
    isBool(): boolean;
    format(keyList: any): string;
  }

  interface Boolean {
    isBool(): boolean;
  }
}

// String.prototype.capitalize = function(kind: any = '') {
//   const invoke = {
//     lower: () => this.charAt(0).toLowerCase() + this.slice(1),
//     default: () => this.charAt(0).toUpperCase() + this.slice(1),
//   };
//   return (invoke[kind] || invoke.default)();
// };

String.prototype.toLocalStr = function(fixedValue: any = 0) {
  // 기존에 toLocaleString 이 있긴 하지만 브라우저 버전 특성상 새로만듬
  return (
    Number(this)
      .toFixed(fixedValue)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0'
  );
};

String.prototype.parseNumber = function() {
  return Number(this);
};

String.prototype.isBool = function() {
  return this.toString() === 'true';
};

// Boolean.prototype.isBool = function() {
//   return this;
// };

String.prototype.format = function(keyList: string[]) {
  return this.replace(/{(\d+)}/g, (match, num) => {
    return typeof keyList[num] !== 'undefined' ? keyList[num] : match;
  });
};

export {};
