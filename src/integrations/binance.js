const sampleResponseFromExchangeInfo = {
  "timezone": "UTC",
  "serverTime": 1565246363776,
  "rateLimits": [
    {
      // These are defined in the `ENUM definitions` section under `Rate Limiters (rateLimitType)`.
      // All limits are optional
    }
  ],
  "exchangeFilters": [
    // These are the defined filters in the `Filters` section.
    // All filters are optional.
  ],
  "symbols": [
    {
      "symbol": "ETHBTC",
      "status": "TRADING",
      "baseAsset": "ETH",
      "baseAssetPrecision": 8,
      "quoteAsset": "BTC",
      "quotePrecision": 8, // will be removed in future api versions (v4+)
      "quoteAssetPrecision": 8,
      "baseCommissionPrecision": 8,
      "quoteCommissionPrecision": 8,
      "orderTypes": [
        "LIMIT",
        "LIMIT_MAKER",
        "MARKET",
        "STOP_LOSS",
        "STOP_LOSS_LIMIT",
        "TAKE_PROFIT",
        "TAKE_PROFIT_LIMIT"
      ],
      "icebergAllowed": true,
      "ocoAllowed": true,
      "otoAllowed": true,
      "quoteOrderQtyMarketAllowed": true,
      "allowTrailingStop": false,
      "cancelReplaceAllowed":false,
      "isSpotTradingAllowed": true,
      "isMarginTradingAllowed": true,
      "filters": [
        // These are defined in the Filters section.
        // All filters are optional
      ],
      "permissions": [],
      "permissionSets": [
        [
          "SPOT",
          "MARGIN"
        ]
      ],
      "defaultSelfTradePreventionMode": "NONE",
      "allowedSelfTradePreventionModes": [
        "NONE"
      ]
    }
  ],
  "sors": [
    {
      "baseAsset": "BTC",
      "symbols": [
        "BTCUSDT",
        "BTCUSDC"
      ]
    }
  ]
};

const binance = {
  urls: {
    klines: 'klines',
    tickerPrice: 'ticker/price',
    exchangeInfo: 'exchangeInfo',
    base: 'https://api.binance.com/api/v3',
  },
  quoteCurrencies: {
    BTC: 'BTC',
    ETH: 'ETH',
    BNB: 'BNB',
    USDT: 'USDT',
  },
  getFromLocalStorageIfFresh: ({key}) => {
    const data = localStorage.getItem(key);

    if(data) {
      const dataObject = JSON.parse(data);

      if(dataObject.timestamp > new Date().getTime() - dataObject.freshForMilliseconds) {
        return dataObject.value;
      }
    }

    return null;
  },
  setToLocalStorage: async ({key, value, freshForMilliseconds = 60 * 1000}) => {
    localStorage.setItem(key, JSON.stringify({
      value,
      freshForMilliseconds,
      timestamp: new Date().getTime(),
    }));
  },
  getTickerPrice: async ({freshForSeconds = 30}) => {
    const localTickerPrice = binance.getFromLocalStorageIfFresh({key: 'localTickerPrice'});

    if(localTickerPrice) {
      console.log('Ticker price data still fresh in LocalStorage');
      return localTickerPrice;
    }

    const response = await fetch(`${binance.urls.base}/${binance.urls.tickerPrice}`);
    const data = await response.json();

    binance.setToLocalStorage({key: 'localTickerPrice', value: data, freshForMilliseconds: freshForSeconds * 1000});

    return data;
  },
  getSymbols: async ({quoteCurrencyFilter = null}) => {
    const localSymbols = binance.getFromLocalStorageIfFresh({key: 'localSymbols'});

    if(localSymbols) {
      console.log('Symbols data still fresh in LocalStorage');
      if(quoteCurrencyFilter) {
        return localSymbols.filter((symbol) => symbol.endsWith(quoteCurrencyFilter));
      }

      return localSymbols;
    }

    const response = await fetch(`${binance.urls.base}/${binance.urls.tickerPrice}`);
    const data = await response.json();

    const symbols = data.map((item) => item.symbol);

    // Save symbols data to LocalStorage so it won't be requested again for 12 hours
    binance.setToLocalStorage({key: 'localSymbols', value: symbols, freshForMilliseconds: (12*60*60*1000)});

    if(quoteCurrencyFilter) {
      return symbols.filter((symbol) => symbol.endsWith(quoteCurrencyFilter));
    }

    return symbols;
  },
  getSymbolsV2: async ({quoteAssetFilter = [], permissions = 'SPOT', symbolStatus = 'TRADING'}) => {
    const localSymbols = binance.getFromLocalStorageIfFresh({key: 'localSymbols'});

    if(localSymbols) {
      console.log('Symbols data still fresh in LocalStorage');
      return localSymbols;
    }

    const response = await fetch(`${binance.urls.base}/${binance.urls.exchangeInfo}?symbolStatus=${symbolStatus}&permissions=${permissions}`);
    const data = await response.json();

    const symbols = data.symbols.filter((symbol) => {
      if(quoteAssetFilter.length > 0) {
        return quoteAssetFilter.includes(symbol.quoteAsset);
      }

      return true;
    }).map((symbol) => symbol.symbol);

    // Save symbols data to LocalStorage so it won't be requested again for 12 hours
    binance.setToLocalStorage({key: 'localSymbols', value: symbols, freshForMilliseconds: (12*60*60*1000)});

    return symbols;
  },
  getKlines: async ({symbol, interval, limit = 500}) => {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await response.json();

    // If first kline is older than 48 hours, symbol is delisted
    if(data[0][6] < new Date(Date.now() - (48*60*60*1000)).getTime()) {
      return [];
    }

    const klines = data.map((kline) => {
      return {
        closeTime: new Date(kline[6]),
        averagePrice: (parseFloat(kline[2]) + parseFloat(kline[3])) / 2,
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        // takerBuyBaseAssetVolume: kline[9],
      };
    });

    return klines;
  },
  // Returns: Array<{ closeTime: Date, averagePrice: number, quoteAssetVolume: string, numberOfTrades: string, takerBuyBaseAssetVolume: string }>
  getChangePercents: async ({interval = '5m'}) => {
    let klines = null;
    let networkRequestCount = parseInt(localStorage.getItem('networkRequestCount')) || 0;
    const symbols = await binance.getSymbolsV2({quoteAssetFilter: ['USDT']});
    console.log({symbolsLength: symbols.length});

    const symbolsAndChangePercents = await Promise.all(symbols.map(async (symbol) => {
      const localKlines = binance.getFromLocalStorageIfFresh({key: `localKlines-${symbol}-${interval}`});

      if(localKlines) {
        console.log('Klines data still fresh in LocalStorage');
        klines = localKlines;
      } else {
        // Request only 2 most recent klines
        networkRequestCount++;
        klines = await binance.getKlines({symbol, interval, limit: 2});
        binance.setToLocalStorage({key: `localKlines-${symbol}-${interval}`, value: klines});
      }

      // Empty array returned means symbol delisted
      if(klines.length === 0) {
        return null;
      }

      // Calculate change between first and second kline
      const changePercent = (((klines[0].averagePrice*(-1)) + klines[1].averagePrice) / klines[0].averagePrice);

      const returnObject = {
        symbol,
        closeTime: klines[0].closeTime,
        interval,
        calculation: `(((${klines[0].averagePrice}*(-1)) + ${klines[1].averagePrice}) / ${klines[0].averagePrice})`,
        changePercent,
        quoteAssetVolume: klines[0].quoteAssetVolume,
      }

      return returnObject;
    }));

    localStorage.setItem('networkRequestCount', networkRequestCount);

    // Return only currently listed symbols
    return symbolsAndChangePercents.filter((item) => item !== null).sort((a, b) => a.changePercent - b.changePercent);
  }
};

export default binance;
