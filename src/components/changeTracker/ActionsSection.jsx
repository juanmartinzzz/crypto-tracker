import string from '../../utils/string';
import alerts from '../../services/alerts';
import { useEffect, useState } from 'react';
import constants from '../../data/constants';
import { ArrowDownUp, Bell, ChartCandlestick, Network, Power, RefreshCw } from 'lucide-react';

const IconRenderer = ({ Icon }) => {
  return <Icon className="w-4 text-palette4" />;
};

const ActionsSection = ({changePercents, timeRemainingSeconds, sortDirection, setSortDirection, interval, setInterval, intervals, isOn, setIsOn}) => {
  const [percentToTriggerAlert, setPercentToTriggerAlert] = useState(constants.intervalToPercentageToTriggerAlert[interval]);
  const networkRequestCount = parseInt(localStorage.getItem('networkRequestCount')) || 0;

  useEffect(() => {
    const symbolsToAlert = [];

    changePercents.forEach((changePercent) => {
      if (changePercent.changePercent < ((percentToTriggerAlert/100) * -1)) {
        symbolsToAlert.push(changePercent.symbol);
      }
    });

    if(symbolsToAlert.length > 0) {
      alerts.triggerAlert();
    }
  }, [changePercents]);

  return (
    <div className="py-4 flex justify-end text-gray-400 text-sm gap-6">
      {/* Count of network requests made */}
      <div className="flex items-center gap-2">
        <IconRenderer Icon={Network} />
        {string.getHumanReadableNumber({number: networkRequestCount})}
      </div>

      {/* Time remaining until refresh */}
      <div className="flex items-center gap-2 ">
        <IconRenderer Icon={RefreshCw} />
        {timeRemainingSeconds}
      </div>

      {/* Percentage that should trigger an audible alert */}
      <div className="flex items-center gap-2">
        <IconRenderer Icon={Bell} />
        <div className="flex gap-2">
          {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((percent) => (
            <div
              key={percent}
              onClick={() => setPercentToTriggerAlert(percent)}
              className={`cursor-pointer py-0.5 rounded-xs ${percentToTriggerAlert === percent ? 'b text-palette4' : ''}`}
            >
              {percent}
            </div>
          ))}
        </div>
      </div>

      {/* Play/pause controls */}
      <div className="flex items-center gap-2">
        <IconRenderer Icon={Power} />
        <div className="flex gap-2">
          <div className={`cursor-pointer py-0.5 rounded-xs ${isOn ? 'text-palette4' : ''}`} onClick={() => setIsOn(true)}>On</div>
          <div className={`cursor-pointer py-0.5 rounded-xs ${!isOn ? 'text-palette4' : ''}`} onClick={() => setIsOn(false)}>Off</div>
        </div>
      </div>

      {/* Interval selector */}
      <div className="flex items-center gap-2">
        <IconRenderer Icon={ChartCandlestick} />
        <div className="flex gap-2">
          {Object.keys(intervals).map((key) => (
            <div
              key={key}
              onClick={() => setInterval(key)}
              className={`cursor-pointer py-0.5 rounded-xs ${interval === key ? 'text-palette4' : ''}`}
            >
              {intervals[key]}
            </div>
          ))}
        </div>
      </div>

      {/* Sort direction selector */}
      <div className="flex items-center gap-2">
        <IconRenderer Icon={ArrowDownUp} />
        <div className="flex gap-2">
          <div
            className={`cursor-pointer py-0.5 rounded-xs ${sortDirection === 'desc' ? 'text-palette4' : ''}`}
            onClick={() => setSortDirection('desc')}
          >
            High to Low
          </div>
          <div
            className={`cursor-pointer py-0.5 rounded-xs ${sortDirection === 'asc' ? 'text-palette4' : ''}`}
            onClick={() => setSortDirection('asc')}
          >
            Low to High
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsSection;