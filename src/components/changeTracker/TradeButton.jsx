const TradeButton = ({symbol, quoteCurrency = 'USDT'}) => {
  return (
    <a
      className="bg-palette1 text-white px-2 py-0.5 rounded text-xs leading-none hover:bg-palette3 hover:text-palette4 transition duration-300"
      href={`https://www.binance.com/en/trade/${symbol.split(quoteCurrency)[0]}_${quoteCurrency}`} target="_blank" rel="noopener noreferrer">
      🚀 Trade
    </a>
  );
};

export default TradeButton;