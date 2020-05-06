/* eslint import/no-unresolved: [2, { ignore: ['countries-list'] }] */

import country from 'countries-list';
import Logic from './logic';
import mod from './addLocModule';

const logic = Logic();

const UI = () => {
  const setCurrentTimeAndDate = (data) => {
    const { city } = data;
    const country = data.country_code;
    document.getElementById('get-loc').innerText = `${city}, ${country}`;
  };

  const displayForecastOverview = (array) => {
    let displayForcast = '';
    const filteredData = logic.filterForecastOverviewData(array);
    filteredData.forEach((item, index) => {
      const { icon } = item.weather['0'];
      const conIcon = icon.slice(-1) === 'n' ? `${icon.slice(0, 2)}d` : icon;
      displayForcast += `
      <div class="forcast${index + 1} forcast" id="${item.date}">
        <div class="content main-row">
          <div class="image image-content">
            <img src="images/weather/${conIcon}.png" alt="${item.weather_desc}">
          </div>
          <div class="info">
            <span class="date">${logic.abbrevDate(item.date)[0]}</span>
            <span class="deg">${logic.convertTemp(item.main.temp)[0]}<sup class="sup-tag">o</sup></span>
            <span class="stat">${item.weather_desc}</span>
          </div>
        </div>
      </div>`;
      document.getElementById('week-forecast').innerHTML = displayForcast;
    });
  };

  const displayWindDirection = (deg) => {
    const image = logic.computeWindDirection(deg);
    if (image === 'undefined') {
      return '';
    }
    return `<img src="images/wind/${image}.png" alt="${image}">`;
  };

  const displayForecastDetails = (array, id, temp) => {
    const tempValue = temp === 'imperial' ? 'f' : 'o';
    let forecastDetails = '';
    const arr = array[id];
    let allDayForcast = '';
    arr.forEach((item) => {
      allDayForcast += `
        <li class="forecast-item">
          <div class="f-main-details">
            <div class="f-time">${item.time}</div>
            <div class="f-icon">
              <img src="images/weather/${item.weather['0'].icon}.png" alt="" class="forecast-icon">
              <span>${logic.convertTemp(item.main.temp)[0]}<sup>${tempValue}</sup></span>
            </div>
            <div class="f-desc">
            ${logic.capString(item.weather['0'].description)}
            </div>
          </div>
        </li>`;
    });
    forecastDetails += `
      <div class="tab-pane">
        <div class="forecast-details">
          <ul class="forecast-list">
            ${allDayForcast}
          </ul>
        </div>
      </div>`;

    document.getElementById('nav-tab-content').innerHTML = forecastDetails;
    const data = logic.parseJSON('location-details');
    const city = `${data.name}, ${data.sys.country}`;
    const weekDay = logic.abbrevDate(id)[1];
    document.querySelector('.forecast-day').innerHTML = `${weekDay} in ${city.toUpperCase()}`;
  };

  const filteredChartsData = (array, id) => {
    const data = logic.chartsData(array);
    let forecastCharts = '';
    data.forEach((item, index) => {
      Object.entries(item).forEach((itemV) => {
        const key = itemV[0];
        const value = itemV[1];
        if (key === id) {
          forecastCharts += `
          <div class="tab-pane" id="nav-${index + 1}">
            <div class="forecast-chart">
              <div class="chart-contents" id="chart-container-${index + 1}">
              </div>
            </div>
          </div>`;
          const label = value[1];
          const series = value[0];
          logic.forecastChartsRender(label, series, `chart-container-${index + 1}`);
        }
      });
    });
    document.getElementById('nav-tab-chart').innerHTML = forecastCharts;
  };

  const getDomElement = (data) => {
    const cleanedData = logic.cleanLocDetailsData(data);
    Object.entries(cleanedData).forEach((item) => {
      const key = item[0];
      const value = item[1];
      let valueV;
      if (key === 'desc') {
        valueV = `${logic.capString(value)}`;
      } else if (key === 'time') {
        valueV = `${logic.convertLocTime(value)[0]} LT`;
        document.getElementById('full-time').innerText = `${logic.convertLocTime(value)[1]}`;
      } else if (key === 'country') {
        valueV = `${country.countries[value].name} <span class="flag"><img src="https://www.countryflags.io/${value.toLowerCase()}/shiny/64.png"></span>`;
      } else if (key === 'loc_icon') {
        valueV = `<img src="images/weather/${value}.png" alt="${cleanedData.desc}">`;
      } else if (key === 'temp' || key === 'feels_like') {
        valueV = `${logic.convertTemp(value)[0]}<sup class="sup-tag">o</sup>`;
      } else if (key === 'sunrise' || key === 'sunset') {
        valueV = logic.convertSunTime(value, cleanedData.time);
      } else if (key === 'main') {
        valueV = '';
        const cardImage = logic.getImageURL(value, cleanedData.desc, cleanedData.loc_icon);
        document.getElementById('main-container-overlay').style.backgroundImage = `linear-gradient(rgba(41, 46, 58, 0.6), rgba(41, 46, 58, 0.7)), url("${cardImage}")`;
      } else if (key === 'direction') {
        valueV = displayWindDirection(value);
      } else {
        valueV = value;
      }
      document.getElementById(`${key}`).innerHTML = valueV;

      // eslint-disable-next-line max-len
      const dayTimeDiff = logic.computeDayLightTime(cleanedData.sunrise, cleanedData.sunset, cleanedData.time);
      document.querySelector('.daylight-hours').innerText = `${dayTimeDiff} hours of Daylight`;
    });
  };

  const displayWeatherNews = (data) => {
    const filteredData = data.articles;
    let allNews = '';
    const randomArticles = filteredData.sort(() => Math.random() - Math.random()).slice(0, 12);
    randomArticles.forEach((item) => {
      const source = item.source.name;
      const { title } = item;
      const { url } = item;
      const { urlToImage } = item;

      allNews += `
      <li class="list-group-item inset-border ">
        <a href="${url}" target="_blank">
          <div class="item">
            <div class="image">
              <img
                src="${urlToImage}"
                alt="${title}">
            </div>
            <div class="info">
              <p class="title">
                ${title}
              </p>
              <small class="source">Source: ${source}</small>
            </div>
          </div>
        </a>
      </li>`;
    });
    document.getElementById('news-list').innerHTML = allNews;
  };

  const weatherComments = (data) => {
    const allDay = mod.getDayOrNight(['09', '12', '15', '18'], data[1]);
    const allNight = mod.getDayOrNight(['21', '00', '03', '06'], data[1]);

    const maxTempDay = Math.max(...mod.getMain(allDay)[0]);
    const minTempNight = Math.min(...mod.getMain(allNight)[0]);
    const dayWeather = mod.getMain(allDay)[1];
    const nightWeather = mod.getMain(allNight)[1];

    const dayComment = `${mod.computeComment(mod.getMaxWeather(dayWeather), false)} The high will be ${maxTempDay}${mod.tempComment(maxTempDay)}`;
    const nightComment = `${mod.computeComment(mod.getMaxWeather(nightWeather))} The low will be ${minTempNight}${mod.tempComment(minTempNight)}`;
    return [dayComment, nightComment];
  };

  const displayAddLocToDom = () => {
    const listContent = document.getElementById('add-location-list-item');
    const getLocDataFromStore = logic.parseJSON('add_location');
    const getForCastDataFromStore = logic.parseJSON('add_forecast');

    let addLocation = '';
    if (getLocDataFromStore !== null) {
      Object.entries(getLocDataFromStore).forEach((elem) => {
        const key = elem[0];
        const item = elem[1];
        const forcastKey = `${item.name}-${item.country}`;

        const day = weatherComments(getForCastDataFromStore[forcastKey])[0];
        const night = weatherComments(getForCastDataFromStore[forcastKey])[1];

        addLocation += `
        <li class="list" id="${key}">
          <div class="delete-loc-button">
            <i class="fas fa-times delete-button" id="delete-${key}"></i>
          </div>
          <div class="top-section section flexed-row inset-border">
            <div class="loc-name flexed-column">
              <div class="add-city flex-start">
                ${item.name}, ${item.country}
              </div>
              <div class="add-time flex-start" id="ticker-${key}">
              ${logic.convertLocTime(item.time)[0]}. ${logic.convertLocTime(item.time)[1]}.
              </div>
            </div>
            <div class="image flexed-row">
              <img src="images/weather/${item.icon}.png" class="img" alt="${item.description}">
              <span class="add-deg flex-start">${logic.convertTemp(item.temp)[0]}<sup>o</sup></span>
            </div>            
          </div>
          <div class="bottom-seciton section">
            <div class="content">
              <div class="add-desc list-bottom-item flexed-column inset-border">
                <div class="title">Weather Summary</div>
                <span>${logic.capString(item.description)}</span>
              </div>
              <div class="add-day list-bottom-item inset-border">
                <div class="title">Day Summary</div>
                <div class="day-summary">
                  <div class="add-day">
                    <span>Day: </span>
                    <span>${day}</span>
                  </div>
                  <div class="add-night">
                    <span>Night: </span>
                    <span>${night}</span>
                  </div>
                </div>
              </div>
              <div class="add-daylighttime list-bottom-item">
                <div class="daylighttime flexed-row">
                  <div class="add-sunrise">
                    <div class="title">Sunrise</div>
                    <span>${logic.convertSunTime(item.sunrise, item.time)}</span>
                  </div>
                  <div class="add-sunset">
                    <div class="title">Sunset</div>
                    <span>${logic.convertSunTime(item.sunset, item.time)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>`;
      });

      listContent.innerHTML = addLocation;
    }
  };

  return {
    setCurrentTimeAndDate,
    displayForecastOverview,
    displayWindDirection,
    displayForecastDetails,
    filteredChartsData,
    getDomElement,
    displayWeatherNews,
    displayAddLocToDom,
  };
};

export default UI;
