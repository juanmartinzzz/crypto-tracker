const intervals = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '1d': '1d'
};

const intervalToPercentageToTriggerAlert = {
  [intervals['5m']]: 1.5,
  [intervals['15m']]: 2.5,
  [intervals['30m']]: 3.5,
  [intervals['1h']]: 4,
  [intervals['1d']]: 4.5,
};

const constants = {
  intervals,
  intervalToPercentageToTriggerAlert
};

export default constants;