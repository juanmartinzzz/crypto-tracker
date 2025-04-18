const focusedSymbol = {
  id: '',
  symbol: '',
  originalPrice: 1,
  pinnedPrice: 1,
  currentPrice: 1,
  changePercentage: 1,
  changePercentageForAlert: 1,
  alertAtPriceList: [1, 2, 3],
};

const templates = {
  getFocusedSymbol: () => ({
    ...focusedSymbol,
    id: Math.random().toString(36).substring(2, 18),
  }),
}

export default templates;