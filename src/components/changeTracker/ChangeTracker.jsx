import { Eye } from "lucide-react";
import string from "../../utils/string";
import TradeButton from "./TradeButton";
import { useEffect, useState } from "react";
import ActionsSection from "./ActionsSection";
import FocusOnSection from "./FocusOnSection";
import binance from "../../integrations/binance";
import SectionWrapper from "../Global/SectionWrapper";

const refreshIntervalSeconds = 3 * 60;

const intervals = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '1d': '1d'
};

const ChangeTracker = () => {
  const [isOn, setIsOn] = useState(true);
  const [changePercents, setChangePercents] = useState([]);
  const [interval, setInterval] = useState(intervals['15m']);
  const [sortDirection, setSortDirection] = useState('asc');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(refreshIntervalSeconds);

  useEffect(() => {
    binance.getChangePercents({interval}).then((data) => {setChangePercents(data)});

    setTimeout(() => {
      setTimeRemainingSeconds(timeRemainingSeconds - 10);
    }, 10 * 1000);
  }, []);

  useEffect(() => {
    if(isOn) {
      if (timeRemainingSeconds <= 0) {
        window.location.reload();
      }
      setTimeout(() => {
        setTimeRemainingSeconds(timeRemainingSeconds - 10);
      }, 10 * 1000);
    }
  }, [timeRemainingSeconds]);

  useEffect(() => {
    binance.getChangePercents({interval}).then((data) => {setChangePercents(data)});
    setSortDirection('asc');
  }, [interval]);

  useEffect(() => {
    setChangePercents(changePercents.sort((a, b) => sortDirection === 'desc' ? a.changePercent - b.changePercent : b.changePercent - a.changePercent));
  }, [sortDirection]);

  useEffect(() => {
    setTimeRemainingSeconds(refreshIntervalSeconds);
  }, [isOn]);

  return (
    <div className="p-8">
      <h1 className="rounded-md bg-gradient-to-r from-purple-700 to-palette4 text-4xl font-bold uppercase text-center py-8 px-16 overflow-hidden">
        <span className="text-white" style={{filter: 'blur(0.3px)'}}>
          La perseguidora criptográfica - cuentos de la cripta
        </span>

        <div style={{filter: 'blur(0.5px)', transform: 'rotate(-2deg)'}}>🚀💰📈📉🔥✨⭐🏆👏🎉💸💎⏳🌍💻🤖👽🤩🤑💲🏦</div>
      </h1>

      <ActionsSection timeRemainingSeconds={timeRemainingSeconds} isOn={isOn} setIsOn={setIsOn} sortDirection={sortDirection} setSortDirection={setSortDirection} interval={interval} setInterval={setInterval} intervals={intervals} changePercents={changePercents} />

      <FocusOnSection symbols={[]} />

      <SectionWrapper title="All" description="List of currencies active on monitored exchanges." Icon={Eye} shouldHaveMarginTop={true}>
        <div className="grid grid-cols-5 gap-6">
          {changePercents.map((changePercent, index) => (
            <div className="bg-palette4 rounded-xs shadow-sm overflow-hidden" key={index}>
              <div className="px-3 font-bold bg-white flex items-center justify-between">
                <div>{changePercent.symbol}</div>
                <div>{string.getHumanReadableNumber({number: changePercent.quoteAssetVolume, precision: 0})}💰</div>
              </div>

              <div className="px-3 py-1 text-palette3 flex items-center justify-between">
                <div>{string.formatPercent({number: changePercent.changePercent})}</div>
                <TradeButton symbol={changePercent.symbol} />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
};

export default ChangeTracker;
