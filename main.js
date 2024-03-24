// Datafeed implementation, will be added later
import Datafeed from './datafeed.js';


const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
  });
let value = params.symbol;
let showSymbol = params.fullScreen === 'true' ? '' : 'header_symbol_search';

window.tvWidget = new TradingView.widget({
	symbol: value, // default symbol
	interval: '60', // default interval
	fullscreen: true, // displays the chart in the fullscreen mode
	allow_symbol_change: false,
	container: 'tv_chart_container',
	datafeed: Datafeed,
	theme: 'Dark',
	disabled_features: ['header_compare', showSymbol, 'left_toolbar', 'header_undo_redo',  'pane_context_menu', 'main_series_scale_menu', 'items_favoriting','header_screenshot','header_fullscreen_button'],
	library_path: '../charting_library/charting_library/',
	overrides: {
		'paneProperties.legendProperties.showSeriesTitle': false,
	}
});

let htmlDetail = params.fullScreen === 'true' ? '<img src="/res/drawable/ic_smallscreen.png" width="24px" height="auto"/>' : '<img src="/res/drawable/ic_fullscreen.png" width="24px" height="auto"/>';

window.tvWidget.headerReady().then(function() {
    var button = window.tvWidget.createButton({ align: 'right' });
    button.setAttribute('title', 'My custom button tooltip');
    button.textContent = '';
    button.addEventListener('click', function() {
        AppBridge.openTradingViewFullScreen();
    });
    button.innerHTML = htmlDetail;
});
