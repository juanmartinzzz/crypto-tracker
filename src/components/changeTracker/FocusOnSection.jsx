import { ArrowDown, ArrowUp, Bell, Cross, Crosshair, CrossIcon, Plus, Triangle, X } from "lucide-react";
import SectionWrapper from "../Global/SectionWrapper";
import { useEffect, useState } from "react";
import templates from "../../data/templates";
import binance from "../../integrations/binance";
import telegram from "../../integrations/telegram";
import string from "../../utils/string";

const PercentageChange = ({valueA, valueB}) => {
  const changePercentage = ((parseFloat(valueA) - parseFloat(valueB)) / parseFloat(valueB)) * 100;
  const textColourClass = changePercentage > 0 ? 'text-green-500' : 'text-palette4';

  return (
    <>
      <span className={`${textColourClass}`}>{changePercentage > 0 ? <Triangle className="size-3" /> : <Triangle className="size-3 rotate-180 " />}</span>
      <span className={`font-mono ${textColourClass}`}>{changePercentage.toFixed(2)}%</span>
    </>
  );
};

const AddFocusedSymbolElement = ({newFocusedSymbol, setNewFocusedSymbol, addFocusedSymbol}) => {
  return (
    <div className="bg-white rounded-sm shadow-md p-4 w-[32%]">
      <div className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="Symbol" className="bg-gray-200 pl-2" value={newFocusedSymbol.symbol} onChange={({target}) => {console.log(target.value); setNewFocusedSymbol({...newFocusedSymbol, symbol: target.value })}} />
        <input type="number" placeholder="Original Price" className="bg-gray-200 pl-2" value={newFocusedSymbol.originalPrice} onChange={({target}) => setNewFocusedSymbol({...newFocusedSymbol, originalPrice: target.value })} />
        <input type="number" placeholder="Pinned Price" className="bg-gray-200 pl-2" value={newFocusedSymbol.pinnedPrice} onChange={({target}) => setNewFocusedSymbol({...newFocusedSymbol, pinnedPrice: target.value })} />
        <input type="number" placeholder="Current Price" className="bg-gray-200 pl-2" value={newFocusedSymbol.currentPrice} onChange={({target}) => setNewFocusedSymbol({...newFocusedSymbol, currentPrice: target.value })} />
        <input type="number" placeholder="Change Percentage For Alert" className="bg-gray-200 pl-2" value={newFocusedSymbol.changePercentageForAlert} onChange={({target}) => setNewFocusedSymbol({...newFocusedSymbol, changePercentageForAlert: target.value })} />
        {/* <input type="number" placeholder="Alert At Price List" className="bg-gray-200 pl-2" value={newFocusedSymbol.alertAtPriceList} onChange={({target}) => setNewFocusedSymbol({...newFocusedSymbol, alertAtPriceList: target.value })} /> */}

        <button className="bg-palette4 text-white col-span-2" onClick={() => addFocusedSymbol({newFocusedSymbol})}>Add</button>
      </div>
    </div>
  );
};

const FocusOnSection = () => {
  const checkFrequencySeconds = 30;
  const focusedSymbolsInitial = localStorage.getItem('focusedSymbols') ? JSON.parse(localStorage.getItem('focusedSymbols')) : [];
  const [focusedSymbols, setFocusedSymbols] = useState(focusedSymbolsInitial);
  const [newFocusedSymbol, setNewFocusedSymbol] = useState(templates.getFocusedSymbol());
  const [shouldShowAddFocusedSymbolElement, setShouldShowAddFocusedSymbolElement] = useState(false);

  const checkForAlerts = () => {
    const focusedSymbols = JSON.parse(localStorage.getItem('focusedSymbols'));

    if(focusedSymbols.length === 0) {
      return;
    }

    binance.getTickerPrice({freshForSeconds: checkFrequencySeconds}).then(tickerPriceData => {
      // Read focused symbols from local vs component state - get latest value and not value at time of setTimeout

      const newFocusedSymbols = [];
      focusedSymbols.map(focusedSymbol => {
        const tickerPrice = tickerPriceData.find((tickerPrice) => tickerPrice.symbol === focusedSymbol.symbol);

        if(tickerPrice) {
          // Calculate the change percentage
          const changePercentage = ((parseFloat(tickerPrice.price) - parseFloat(focusedSymbol.pinnedPrice)) / parseFloat(focusedSymbol.pinnedPrice)) * 100;
          const changePercentageForAlert = parseFloat(focusedSymbol.changePercentageForAlert);

          if(Math.abs(changePercentage) > changePercentageForAlert) {
            const emoji = changePercentage > 0 ? '🟢' : '🚨';
            telegram.sendMessage({
              message: `${emoji} ${changePercentage.toFixed(2)}% ${focusedSymbol.symbol} OG: ${string.getHumanReadableNumberV2({number: parseFloat(focusedSymbol.originalPrice)})}. Pin: ${string.getHumanReadableNumberV2({number: parseFloat(focusedSymbol.pinnedPrice)})}. Now: ${string.getHumanReadableNumberV2({number: parseFloat(tickerPrice.price)})}`,
            });

            // Update the focusedSymbol currentPrice and changePercentage and pinnedPrice
            newFocusedSymbols.push({...focusedSymbol, pinnedPrice: tickerPrice.price, currentPrice: tickerPrice.price, changePercentage: changePercentage});
          } else {
            // Update the focusedSymbol currentPrice and changePercentage
            newFocusedSymbols.push({...focusedSymbol, currentPrice: tickerPrice.price, changePercentage: changePercentage});
          }
        }
      });

      setFocusedSymbols(newFocusedSymbols);
    });

    setTimeout(() => {
      checkForAlerts();
    }, checkFrequencySeconds * 1000);
  }

  useEffect(() => {
    checkForAlerts();
  }, []);

  useEffect(() => {
    localStorage.setItem('focusedSymbols', JSON.stringify(focusedSymbols));
  }, [focusedSymbols]);

  const addFocusedSymbol = ({newFocusedSymbol}) => {
    setFocusedSymbols([...focusedSymbols, newFocusedSymbol]);
    setNewFocusedSymbol(templates.getFocusedSymbol());
    setShouldShowAddFocusedSymbolElement(false);
  };

  const removeFocusedSymbol = ({id}) => {
    setFocusedSymbols(focusedSymbols.filter(focusedSymbol => focusedSymbol.id !== id));
  };

  return (
    <SectionWrapper
      title="Focus On"
      description="Symbols actively traded - should trigger alerts when price deviates 1% vs original buy price."
      Icon={Crosshair}
      cornerComponent={
        <div className="p-2">
          <button
            onClick={() => setShouldShowAddFocusedSymbolElement(true)}
            className="flex items-center justify-center p-1 rounded-sm bg-palette4 hover:bg-palette1 cursor-pointer"
          >
            <Plus className="size-6 text-white" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 pb-8">
        <div className="flex flex-col gap-2">
          {shouldShowAddFocusedSymbolElement && <AddFocusedSymbolElement newFocusedSymbol={newFocusedSymbol} setNewFocusedSymbol={setNewFocusedSymbol} addFocusedSymbol={addFocusedSymbol} />}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {focusedSymbols.map(focusedSymbol => (
              <div key={focusedSymbol.id} className="bg-white shadow-md rounded-xs text-sm leading-none overflow-hidden">
                <div className="font-bold text-center bg-palette4 text-white p-1">
                  <div className="relative">
                    <div className="absolute top-0 right-0 cursor-pointer" onClick={() => removeFocusedSymbol({id: focusedSymbol.id})}>
                      <X className="size-3" />
                    </div>
                  </div>

                  <span>{focusedSymbol.symbol}</span>
                </div>

                <div className="grid grid-cols-5 gap-1 p-3">
                  <div className="font-semibold">OG</div>
                  <div className="flex items-center justify-end gap-1 text-palette4 font-mono col-span-2">
                    <PercentageChange valueA={focusedSymbol.currentPrice} valueB={focusedSymbol.originalPrice} />
                  </div>
                  <div className="text-right font-mono col-span-2">${string.getHumanReadableNumberV2({number: parseFloat(focusedSymbol.originalPrice)})}</div>

                  <div className="font-semibold">Pin</div>
                  <div className="flex items-center justify-end gap-1 text-palette4 font-mono col-span-2">
                    <PercentageChange valueA={focusedSymbol.currentPrice} valueB={focusedSymbol.pinnedPrice} />
                  </div>
                  <div className="text-right font-mono col-span-2">${string.getHumanReadableNumberV2({number: parseFloat(focusedSymbol.pinnedPrice)})}</div>

                  <div className="font-semibold">Now</div>
                  <div className="col-span-2"></div>
                  <div className="text-right font-mono col-span-2">${string.getHumanReadableNumberV2({number: parseFloat(focusedSymbol.currentPrice)})}</div>

                  <div className="font-semibold flex items-center gap-1">Alert <Bell className="size-3" /></div>
                  <div className="text-right text-palette4 font-mono">{focusedSymbol.changePercentageForAlert}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FocusOnSection;
