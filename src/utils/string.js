const string = {
  /// Get a number in K, M, G, T, P, E, Z, Y format
  getHumanReadableNumber: ({number, precision = 2}) => {
    let index = 0;
    const parsedNumber = Number(number);
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    let result = parsedNumber;
    while (result >= 1000) {
      result /= 1000;
      index++;
    }

    return result.toFixed(precision) + units[index];
  },
  formatNumber: ({number}) => {
    return number.toFixed(2);
  },
  formatPercent: ({number}) => {
    return (number * 100).toFixed(2) + '%';
  }
};

export default string;