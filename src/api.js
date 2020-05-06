import Utility from './utility';
import Logic from './logic';
import UI from './ui';

const utility = Utility();
const logic = Logic();
const ui = UI();

const API = () => {
  let INPUTVALUE;
  let TEMPMEASURE;

  const getAllData = (data) => {
    const cleanedData = logic.cleanLocForecast(data);
    ui.displayForecastOverview(cleanedData);
    utility.toggleTab(cleanedData, TEMPMEASURE);
  };

  const locationAPIResponse = (promise) => {
    promise.then((data) => {
      ui.getDomElement(data);
      logic.setTicker();
      localStorage.setItem('location-details', JSON.stringify(data));
      setInterval(() => {
        let time = window.localStorage.getItem('location-details');
        time = JSON.parse(time);
        time = time.timezone;
        document.getElementById('time').innerHTML = `${logic.convertLocTime(time)[0]} LT`;
        document.getElementById('full-time').innerHTML = `${logic.convertLocTime(time)[1]}`;
      }, 1000);
      setInterval(logic.setTicker, 1000);
    });
  };

  const forecastAPIResponse = (promise) => {
    promise.then((data) => {
      const dataList = data.list;
      getAllData(dataList);
      utility.loadingPage('none', 'block');
      utility.changeTempOnToggle(TEMPMEASURE);
    });
  };

  const fetchURL = (value, format) => {
    const currentLocDetails = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${value}&units=${format}&appid=5839353095e9bdcc9ae4f18268574044`, { mode: 'cors' });
    const forecastDetails = fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${value}&units=${format}&appid=5839353095e9bdcc9ae4f18268574044`, { mode: 'cors' });
    return [currentLocDetails, forecastDetails];
  };

  const APIResponse = (responses) => {
    let responseSuccess = false;
    let responseStatus;
    responses.forEach((response) => {
      responseSuccess = !(response.ok);
      responseStatus = response.status;
    });
    return [responseSuccess, responseStatus];
  };

  const APIErrorMessage = (responseStatus, value, container) => {
    let msg;
    if (responseStatus === 404) {
      msg = `Opps! Sorry, we could not find the weather details for the location <strong>${value}</strong>. Try another location!`;
    } else if (responseStatus === 429) {
      msg = 'Opps! Sorry, you have exceeded your search limit. Try again in the next 60 seconds!';
    }
    utility.displayMsgError(msg, container);
  };

  const processAPICallForMainLoc = (value, format) => {
    utility.loadingPage('flex', 'none');
    const URL = fetchURL(value, format);
    const currentLocDetails = URL[0];
    const forecastDetails = URL[1];
    Promise.all([currentLocDetails, forecastDetails])
      .then((responses) => {
        const responseSuccess = APIResponse(responses)[0];
        const responseStatus = APIResponse(responses)[1];
        if (!responseSuccess) {
          INPUTVALUE = value;
          TEMPMEASURE = format;
          const curLocDetails = responses[0].json();
          const forecastDetails = responses[1].json();
          locationAPIResponse(curLocDetails);
          forecastAPIResponse(forecastDetails);
        } else {
          APIErrorMessage(responseStatus, value, 'error-home-page');
        }
      }).catch((err) => {
        utility.displayMsgError(err, 'error-home-page');
      });
  };

  const storeAddLocInLocalStorage = (dataKey, key, value) => {
    if (localStorage.getItem(dataKey) === null) {
      const setData = {};
      setData[key] = value;
      localStorage.setItem(dataKey, JSON.stringify(setData));
    } else {
      const getData = JSON.parse(localStorage.getItem(dataKey));
      getData[key] = value;
      const trimGetData = {};
      Object.entries(getData).slice(-3).forEach((item) => {
        const key = item[0];
        const value = item[1];
        trimGetData[key] = value;
      });
      localStorage.setItem(dataKey, JSON.stringify(trimGetData));
    }
  };

  const addLocationAPIResponse = (promise) => {
    promise.then((data) => {
      const storeData = logic.cleanAddLocData(data);
      const key = new Date().getTime();
      storeAddLocInLocalStorage('add_location', key, storeData);
    });
  };

  const addLocationAPIResponse22 = (promise) => {
    promise.then((data) => {
      const storeData = data.list;
      const cleanedData = logic.cleanLocForecast(storeData);
      const filteredData = Object.entries(cleanedData).filter((item) => item[1].length >= 2);

      const key = `${data.city.name}-${data.city.country}`;
      storeAddLocInLocalStorage('add_forecast', key, filteredData[0]);
      ui.displayAddLocToDom();
    });
  };

  const processAPICallForAddLoc = (value, format) => {
    // utility.loadingPage('flex', 'none');
    const URL = fetchURL(value, format);
    const currentLocDetails = URL[0];
    const forecastDetails = URL[1];
    Promise.all([currentLocDetails, forecastDetails])
      .then((responses) => {
        const responseSuccess = APIResponse(responses)[0];
        const responseStatus = APIResponse(responses)[1];
        if (!responseSuccess) {
          const curLocDetails = responses[0].json();
          const forecastDetails = responses[1].json();

          addLocationAPIResponse(curLocDetails);
          addLocationAPIResponse22(forecastDetails);
        } else {
          APIErrorMessage(responseStatus, value, 'error-settings-page');
        }
      }).catch((err) => {
        utility.displayMsgError(err, 'error-settings-page');
      });
  };

  const callAPIOnTempToggle = () => {
    const tempBtn = document.getElementById('temp-btn');
    const tempMetric = document.getElementById('slider-round');
    tempBtn.addEventListener('change', () => {
      if (tempBtn.checked) {
        processAPICallForMainLoc(INPUTVALUE, 'imperial');
        tempMetric.setAttribute('data-metric', 'F');
      } else {
        processAPICallForMainLoc(INPUTVALUE, 'metric');
        tempMetric.setAttribute('data-metric', 'C');
      }
    });
  };

  const makeAPICall = () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('location-search');
    searchBtn.addEventListener('click', () => {
      const { value } = searchInput;
      if (value.trim() !== '') {
        processAPICallForMainLoc(value, 'metric');
        utility.toggleFirstPageContent('weather-card', 'details-card');
        utility.uncheckTempToggle();
      }
      searchInput.value = '';
    });
  };

  const addFavLocAPICall = () => {
    const addLocation = document.getElementById('add-search-btn');
    const addLocationInput = document.getElementById('add-location-search');
    addLocation.addEventListener('click', () => {
      const { value } = addLocationInput;
      if (value.trim() !== '') {
        processAPICallForAddLoc(value, 'metric');
      }
      addLocationInput.value = '';
    });
  };

  const fetCurrentLocData = async () => {
    try {
      const currentLocation = await fetch('https://ipfind.co/?ip=197.210.52.91&auth=e1301a4b-c4e3-4e99-95d5-e5750e1a1fed', { mode: 'cors' });
      const location = await currentLocation.json();
      logic.strigifyJSON('location', location);
      const { city } = location;
      INPUTVALUE = city;
      processAPICallForMainLoc(`${city}`, 'metric');
      ui.setCurrentTimeAndDate(location);
    } catch (err) {
      utility.displayMsgError(err);
    }
  };

  const fetchNewsData = async () => {
    const currentDate = new Date();
    try {
      const currentNews = await fetch(`https://newsapi.org/v2/everything?q=weather&to=${currentDate}&apiKey=c4d03151880c4a5483bfdd5c83508124`, { mode: 'cors' });
      const curNews = await currentNews.json();
      ui.displayWeatherNews(curNews);
    } catch (err) {
      utility.displayMsgError(err);
    }
  };

  const getCurrentLocationOnLoad = () => {
    window.addEventListener('load', () => {
      const getLocalData = localStorage.getItem('location-details');
      if (getLocalData === null) {
        fetCurrentLocData();
      } else {
        const curLoc = JSON.parse(getLocalData);
        const city = curLoc.name;
        INPUTVALUE = city;
        processAPICallForMainLoc(`${city}`, 'metric');

        const data = logic.parseJSON('location');
        ui.setCurrentTimeAndDate(data);

        utility.updateAllDataAtInterval(INPUTVALUE);
      }

      fetchNewsData();
      ui.displayAddLocToDom();
    });
  };

  return {
    makeAPICall,
    getCurrentLocationOnLoad,
    callAPIOnTempToggle,
    addFavLocAPICall,
  };
};

export default API;