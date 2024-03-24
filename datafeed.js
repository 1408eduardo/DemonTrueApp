import {
    makeApiRequest,
    generateSymbol,
    parseFullSymbol,
} from './helpers.js';
// import {
//  subscribeOnStream,
//  unsubscribeFromStream,
// } from './streaming.js';
const lastBarsCache = new Map();
const configurationData = {
    supported_resolutions: ['1','5','10','30','60','240','1D', '1W'],
};

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
  });
let symbol = params.symbol;
let chain = params.chain;
let baseAddress = params.baseAddress;
let quoteAddress = params.quoteAddress;


export default {
    onReady: (callback) => {
       // console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },
    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback,
    ) => {
    },
    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
    ) => {
     //   console.log('[resolveSymbol]: Method call', symbolName);
       
        const symbolInfo = {
            ticker: symbolName,
            name: symbolName,
            description: '',
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            minmov: 1,
            pricescale: 1000000,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 8,
            data_status: 'streaming',
        };
      //  console.log('[resolveSymbol]: Symbol resolved', symbol);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        let { from, to, firstDataRequest } = periodParams;
      //  console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        
        from *= 1000;
        to *= 1000;
        
        let timeInterval = '5'
        switch(resolution){
            case '1D': 
                timeInterval = '1440';
                break;

            case '1W': 
                timeInterval = '10080';
                break;

            default:
                timeInterval = resolution
                break;
        }

        var intervalMs = Number(timeInterval) * 1000 * 60;
        let startPeriod = Math.floor(from / intervalMs) * intervalMs
        let endPeriod = Math.ceil(to / intervalMs) * intervalMs
        let totalBars = (endPeriod - startPeriod) / intervalMs + 1
        var bars = []

        for(let index = 0; index < totalBars; index++) {
            bars = [...bars, {
                time: startPeriod + index * intervalMs
            }]
        }

        try {
            const data = await makeApiRequest(`all/v1/tradingview/history?network=${chain}&baseAddress=${baseAddress}&quoteAddress=${quoteAddress}&fromTime=${from}&toTime=${to}&interval=${timeInterval}`);
           // console.log('[getBars]: data', data.data)

           if (data.data === undefined || data.data === null) {
                if(data.error !== undefined){
                    AppBridge.onDataLoadFailed(data.error);
                }
           } else {
                data.data.forEach(bar => {
                var barIndex = Math.floor((bar.openTime - startPeriod) / intervalMs)
                if (0 <= barIndex && barIndex < bars.length) {
                    bars[barIndex] = {
                        time: startPeriod + barIndex * intervalMs,
                        low: bar.low,
                        high: bar.high,
                        open: bar.open,
                        close: bar.close,
                        volume: bar.volume
                    }
                }
             });
           }

            if (firstDataRequest) {
                lastBarsCache.set(symbolInfo.full_name, {
                    ...bars[bars.length - 1],
                });
            }
            console.log(`[getBars]: returned ${bars.length} bar(s)`);
            onHistoryCallback(bars, {
                noData: false,
            });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
            AppBridge.onDataLoadFailed(error);
        }
    },
    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback,
    ) => {
       // console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
        // subscribeOnStream(
        //  symbolInfo,
        //  resolution,
        //  onRealtimeCallback,
        //  subscribeUID,
        //  onResetCacheNeededCallback,
        //  lastBarsCache.get(symbolInfo.full_name),
        // );
    },
    unsubscribeBars: (subscriberUID) => {
        //console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        //  unsubscribeFromStream(subscriberUID);
    },
};
                  
