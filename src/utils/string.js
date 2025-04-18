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
  },
  /// Get a number in u, n, m, -, K, M, G, T, P format
  getHumanReadableNumberV2: ({number, precision = 4}) => {
    const units = ['u', 'n', 'm', '', 'K', 'M', 'G', 'T', 'P'];
    const parsedNumber = Number(number);
    let index = 3; // Start at the unit for 'nothing'
    let result = parsedNumber;

    while (result >= 1000 && index < units.length - 1) {
      result /= 1000;
      index++;
    }

    while (result < 1 && index > 0) {
      result *= 1000;
      index--;
    }

    return result.toFixed(precision) + units[index];
  }
};

export default string;