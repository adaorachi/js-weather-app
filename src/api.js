import country from 'countries-list';
import FusionCharts from 'fusioncharts';
import fusionTheme from 'fusioncharts/themes/es/fusioncharts.theme.fusion';
import Utility from './utility';

FusionCharts.addDep(fusionTheme);

const utility = Utility();

const API = () => {
  const abbrevDate = (date) => {
    function isToday(time, ele) {
      const timeToday = new Date().getDay() === time.getDay() ? 'Today' : ele;
      return timeToday;
    }
    const time = new Date(date);
    let fullTime = time.toLocaleTimeString('en-us', { weekday: 'short', month: 'numeric', day: 'numeric' });
    fullTime = `${isToday(time, fullTime.split(',')[0])} ${fullTime.split(',')[1]}`;
    let shortTime = time.toLocaleTimeString('en-us', { weekday: 'long' });
    shortTime = `${isToday(time, shortTime.split(' ')[0])}`;
    return [fullTime, shortTime];
  };

  const convertTemp = (temp) => {
    const celsuis = temp.toFixed(1);
    const celTofah = ((celsuis * (9 / 5)) + 32).toFixed(1);
    return [celsuis, celTofah];
  };

  const windDirection = (deg) => {
    let image;
    if (deg === undefined) {
      return '';
    }
    if (deg === 0 || deg === 360) {
      image = 'N';
    } else if (deg === 90) {
      image = 'E';
    } else if (deg === 180) {
      image = 'S';
    } else if (deg === 270) {
      image = 'W';
    } else if (deg > 0 && deg < 90) {
      image = 'NE';
    } else if (deg > 90 && deg < 180) {
      image = 'SE';
    } else if (deg > 180 && deg < 270) {
      image = 'SW';
    } else if (deg > 270 && deg < 360) {
      image = 'NE';
    }
    return `<img src="images/wind/${image}.png" alt="${image}">`;
  };

  const cleanLocDetailsData = (data) => {
    const cleanedData = {
      desc: data.weather[0].description,
      temp: data.main.temp,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      feels_like: data.main.feels_like,
      wind: data.wind.speed,
      direction: data.wind.deg,
      country: data.sys.country,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      time: data.timezone,
      city: data.name,
      lat: data.coord.lat,
      lon: data.coord.lon,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
    };

    return cleanedData;
  };

  const forecastChartsRender = (label, series, chartContainer, day) => {
    FusionCharts.ready(() => {
      const chartObj = new FusionCharts({
        type: 'mssplinearea',
        renderAt: `${chartContainer}`,
        width: '100%',
        height: '80%',
        dataFormat: 'json',
        dataSource: {
          chart: {
            theme: 'fusion',
            caption: `Weather Forecast for ${day}`,
            xAxisName: 'Hour',
            yAxisName: 'Weather Conditions',
            showXAxisLine: '1',
            toolTipBorderColor: "#666666",
            toolTipBgColor: "#efefef",
            toolTipBgAlpha: "80",
            showToolTipShadow: "1",
            toolTipBorderRadius: '2',
            toolTipPadding: '5',
          },

          categories: [{
            category: label,
          }],
          dataset: series,
        },
      });
      chartObj.render();
    });
  };

  const filteredForecastOverview = (array, groupBy) => {
    const finalData = [];
    let displayForcast = '';
    Object.entries(array).forEach((item) => {
      const value = item[1];
      let filtered;
      if (value.length >= 4) {
        const groupedFilteredData = groupBy(value, 'weather_desc');
        const firstKey = Object.entries(groupedFilteredData).map((item) => [item[0], item[1].length]).sort((a, b) => b[1] - a[1])[0][0];
        filtered = groupedFilteredData[firstKey]['0'];
        finalData.push(filtered);
      }
    });

    finalData.slice(0, 5).forEach((item, index) => {
      displayForcast += `
      <div class="forcast${index + 1} forcast">
        <div class="content main-row">
          <div class="image image-content">
            <img src="images/weather/${item.weather['0'].icon}.png" alt="${item.weather_desc}">
          </div>
          <div class="info width-50">
            <span class="date">${abbrevDate(item.date)[0]}</span>
            <span class="deg">${convertTemp(item.main.temp)[0]}<sup>o</sup></span>
            <span class="stat">${item.weather_desc}</span>
          </div>
        </div>
      </div>`;
      document.getElementById('week-forecast').innerHTML = displayForcast;
    });
  };

  const filteredForecastDetails = (array) => {
    let forecastDays = '';
    let forecastDetails = '';
    Object.entries(array).forEach((day, index) => {
      const key = day[0];
      const value = day[1];
      const activeNav = index === 0 ? 'first-nav active' : '';
      const activeTab = index === 0 ? 'first-tab active' : '';
      forecastDays += `
      <span class="nav-item nav-link ${activeNav}" id="nav-${index + 1}-tab">${abbrevDate(key)[1]}</span>`;

      let allDayForcast = '';
      value.forEach((item) => {
        const rainSpeed = item.rain === undefined ? '-' : `${item.rain['3h']}mm`;
        allDayForcast += `
        <li class="forecast-item">
            <div class="f-main-details">
              <div class="f-time">${item.time}</div>
              <div class="f-icon">
                <img src="images/weather/${item.weather['0'].icon}.png" alt="" class="forecast-icon">
                <span>${convertTemp(item.main.temp)[0]}<sup>o</sup></span>
              </div>
              <div class="f-desc">
              ${utility.capString(item.weather['0'].description)}
              </div>
            </div>
            <div class="f-other-details">
              <div class="f-humidity f-details">
                <span>Feels like</span>
                <span>${convertTemp(item.main.feels_like)[0]}<sup>o</sup></span>
              </div>
              <div class="f-humidity f-details">
                <span>Humidity</span>
                <span>${item.main.humidity}%</span>
              </div>
              <div class="f-humidity f-details">
                <span>Pressure</span>
                <span>${item.main.pressure}hPa</span>
              </div>
              <div class="f-humidity f-details">
                <span>Wind Speed</span>
                <div class="flexed-row">
                  <span>${item.wind.speed}m/s</span>
                  <span class="direction">
                    ${windDirection(item.wind.deg)}
                  </span>
                </div>
              </div>
              <div class="f-humidity f-details">
                <span>Rain Vol</span>
                <span>${rainSpeed}</span>
              </div>
            </div>
          </li>`;
      });

      forecastDetails += `
      <div class="tab-pane ${activeTab}" id="nav-${index + 1}">
        <div class="forecast-details">
          <ul class="forecast-list">
            ${allDayForcast}
          </ul>
        </div>
      </div>`;
    });
    document.getElementById('nav-table-tabs').innerHTML = forecastDays;
    document.getElementById('nav-tab-content').innerHTML = forecastDetails;
  };

  const chartsData = (array) => {
    const filteredArray = [];
    Object.entries(array).forEach((day) => {
      const key = day[0];
      const valueV = day[1];

      const valueArray2 = [];
      const valueArray = [];
      const allMain = [[], [], []];

      valueV.forEach((item) => {
        allMain[0].push({ value: item.main.humidity });
        allMain[1].push({ value: item.main.feels_like });
        allMain[2].push({ value: item.main.temp });

        const timeV = {};
        timeV.label = item.time.split(':').slice(0, 2).join(':');
        valueArray.push(timeV);
      });

      valueArray2.push({ seriesname: 'Humidity(%)', data: allMain[0] });
      valueArray2.push({ seriesname: 'Feels-like(c)', data: allMain[1] });
      valueArray2.push({ seriesname: 'Temperature(c)', data: allMain[2] });

      const keyA = {};
      keyA[key] = [valueArray2, valueArray];
      filteredArray.push(keyA);
    });
    return filteredArray;
  };

  const filteredChartsData = (array) => {
    const data = chartsData(array);
    let forecastDays = '';
    let forecastCharts = '';
    data.forEach((item, index) => {
      Object.entries(item).forEach((itemV) => {
        const key = itemV[0];
        const value = itemV[1];
        const activeNav = index === 0 ? 'first-nav active' : '';
        const activeTab = index === 0 ? 'first-tab active' : '';
        forecastDays += `
         <span class="nav-item nav-link ${activeNav}" id="nav-${index + 1}-tab">${abbrevDate(key)[1]}</span>`;

        forecastCharts += `
        <div class="tab-pane ${activeTab}" id="nav-${index + 1}">
          <div class="forecast-chart">
            <div class="chart-contents" id="chart-container-${index + 1}">
            </div>
          </div>
        </div>`;
        const label = value[1];
        const series = value[0];
        forecastChartsRender(label, series, `chart-container-${index + 1}`, abbrevDate(key)[1]);
      });
    });
    document.getElementById('nav-chart-tabs').innerHTML = forecastDays;
    document.getElementById('nav-tab-chart').innerHTML = forecastCharts;
  };

  const cleanLocForecast = (data) => {
    const setData = [];
    data.forEach((item) => {
      const value = item;
      value.date = item.dt_txt.split(' ')[0];
      value.time = item.dt_txt.split(' ')[1];
      value.weather_desc = item.weather['0'].main;
      setData.push(value);
    });

    const groupBy = (array, key) => array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue,
      );
      return result;
    }, {});

    const dataGroupedByDate = groupBy(setData, 'date');
    filteredForecastOverview(dataGroupedByDate, groupBy);
    filteredForecastDetails(dataGroupedByDate);
    filteredChartsData(dataGroupedByDate);
    // forecastCharts();
  };

  const toggleTemp = (ele, value) => {
    const tempBtn = document.getElementById('temp-btn');
    const tempMetric = document.getElementById('slider-round');
    let temp;
    tempBtn.addEventListener('change', () => {
      if (tempBtn.checked) {
        // eslint-disable-next-line prefer-destructuring
        temp = convertTemp(value)[1];
        document.getElementById(`${ele}`).innerHTML = `${temp}<sup>f</sup>`;
        tempMetric.setAttribute('data-metric', 'F');
      } else {
        // eslint-disable-next-line prefer-destructuring
        temp = convertTemp(value)[0];
        document.getElementById(`${ele}`).innerHTML = `${temp}<sup>o</sup>`;
        tempMetric.setAttribute('data-metric', 'C');
      }
    });
  };

  const readableTime = (time) => {
    const getLocDate = new Date(time);
    let getLocTime = getLocDate.toLocaleTimeString({}, {
      hour12: true, hour: 'numeric', minute: 'numeric',
    });
    getLocTime = getLocTime.replace(/\w{2}$/, c => c.toLowerCase()).replace(/\s/, '');
    let getLocFullDate = getLocDate.toLocaleTimeString('en-us', { weekday: 'short', month: 'short', day: 'numeric' });
    getLocFullDate = `${getLocFullDate.split(',')[0]}, ${getLocFullDate.split(',')[1]}`;
    return [getLocTime, getLocFullDate];
  };

  const convertLocTime = (secDiff) => {
    const date = new Date();
    const convertDate = date.getTime() + (date.getTimezoneOffset() * 60000);
    const time = convertDate + (secDiff * 1000);
    return readableTime(time);
  };

  const convertSunTime = (unixTime, secDiff) => {
    const date = new Date();
    const convertDate = (unixTime * 1000) + (date.getTimezoneOffset() * 60000);
    const time = convertDate + (secDiff * 1000);
    return readableTime(time)[0];
  };

  const convTimeToMin = (time) => {
    const timeT = time.split(' ')[0];
    const ext = timeT.slice(-2);
    const removeExt = timeT.replace(/\w{2}$/, '');
    let first = removeExt.split(':')[0];
    const second = removeExt.split(':')[1];
    let converted;
    function parseInteger(str) {
      return parseInt(str, 10);
    }
    if (ext === 'am' && parseInteger(first) === 12) {
      converted = parseInteger(second);
    } else if (ext === 'am' || (ext === 'pm' && parseInteger(first) === 12)) {
      first = parseInteger(first) * 60;
      converted = first + parseInteger(second);
    } else if (ext === 'pm') {
      first = (parseInteger(first) + 12) * 60;
      converted = first + parseInteger(second);
    }
    return converted;
  };

  const setTicker = () => {
    const locTime = document.getElementById('time').innerHTML;
    const sunrise = document.getElementById('sunrise').innerHTML;
    const sunset = document.getElementById('sunset').innerHTML;
    // const animationTime = (convTimeToMin(locTime) - convTimeToMin(sunset)) * 1000;
    if (convTimeToMin(locTime) <= convTimeToMin(sunrise)) {
      document.querySelector('.pointer').style.webkitTransform = `rotateZ(${-90}deg)`;
      document.querySelector('.pointer').style.transform = `rotateZ(${-90}deg)`;
    } else if (convTimeToMin(locTime) >= convTimeToMin(sunset)) {
      document.querySelector('.pointer').style.webkitTransform = `rotateZ(${90}deg)`;
      document.querySelector('.pointer').style.transform = `rotateZ(${90}deg)`;
    } else {
      let val = (convTimeToMin(locTime) - convTimeToMin(sunrise)) / 60;
      const fromRtoS = (convTimeToMin(sunset) - convTimeToMin(sunrise)) / 60;
      const aggr = 180 / fromRtoS;
      val = (val * aggr) - 90;
      document.querySelector('.pointer').style.webkitTransform = `rotateZ(${val}deg)`;
      document.querySelector('.pointer').style.transform = `rotateZ(${val}deg)`;
      // document.querySelector('.pointer').style.animation = `rotate ${animationTime}ms infinite linear`;
    }
  };

  const setIntervalTicker = setInterval(setTicker, 120000);

  const cardImage = (main, icon) => {
    let image;
    const wind1 = ['Mist', 'Smoke', 'Haze', 'Fog'];
    const wind2 = ['Sand', 'Ash', 'Squall', 'Dust', 'Tornado'];
    if (main === 'Clear') {
      image = `${main}-${icon}.gif`;
    } else if (wind1.includes(main)) {
      image = 'Mist.gif';
    } else if (wind2.includes(main)) {
      image = 'Tornado.gif';
    } else {
      image = `${main}.gif`;
    }

    document.getElementById('search-loc-details-con').style.backgroundImage = `linear-gradient(#292e3ad5, rgba(83, 91, 109, 0.699)), url(../images/weatherGif/${image})`;
  };

  const getDomElement = (data) => {
    const cleanedData = cleanLocDetailsData(data);
    Object.entries(cleanedData).forEach((item) => {
      const key = item[0];
      const value = item[1];
      if (key === 'desc') {
        document.getElementById(`${key}`).innerText = `${utility.capString(value)}`;
      } else if (key === 'time') {
        document.getElementById(`${key}`).innerText = `${convertLocTime(value)[0]} LT`;
        document.getElementById('full-time').innerText = `${convertLocTime(value)[1]}`;
      } else if (key === 'country') {
        document.getElementById('country').innerText = `${country.countries[value].name}`;
        document.getElementById('flag').innerHTML = `<img src="https://www.countryflags.io/${value.toLowerCase()}/shiny/64.png"></img>`;
      } else if (key === 'icon') {
        document.getElementById('loc-image').innerHTML = `<img src="images/weather/${value}.png" alt="${cleanedData.desc}">`
      } else if (key === 'temp' || key === 'feels_like') {
        document.getElementById(`${key}`).innerHTML = `${convertTemp(value)[0]}<sup>o</sup>`;
        toggleTemp(key, value);
      } else if (key === 'sunrise' || key === 'sunset') {
        document.getElementById(`${key}`).innerText = convertSunTime(value, cleanedData.time);
      } else if (key === 'lat' || key === 'lon') {
        const { lat } = cleanedData;
        const { lon } = cleanedData;
        document.getElementById('iframe-container').innerHTML = `
        <iframe src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=${lat}&lon=${lon}&zoom=5" id="map-iframe" class="map-iframe"></iframe>`;
      } else if (key === 'main') {
        cardImage(value, cleanedData.icon);
      } else if (key === 'direction') {
        document.getElementById(`${key}`).innerHTML = windDirection(value);
      } else {
        document.getElementById(`${key}`).innerText = value;
      }
    });
  };

  const processLocDetails = (promise) => {
    promise.then((data) => {
      getDomElement(data);
      setTicker();
      localStorage.setItem('location-details', JSON.stringify(data));
      const updateLocTime = setInterval(() => {
        let time = window.localStorage.getItem('location-details');
        time = JSON.parse(time);
        time = time.timezone;
        document.getElementById('time').innerHTML = `${convertLocTime(time)[0]} LT`;
        document.getElementById('full-time').innerHTML = `${convertLocTime(time)[1]}`;
      }, 1000);
    });
  };

  const processForecastDetails = (promise) => {
    promise.then((data) => {
      const dataList = data.list;
      cleanLocForecast(dataList);
      const loader = document.querySelectorAll('.loader');
      loader.forEach((item) => { item.style.display = 'none'; });
      const mainContent = document.querySelectorAll('.main-section-content');
      mainContent.forEach((item) => { item.style.display = 'block'; });
    });
  };

  const processAPICall = (value) => {
    const loader = document.querySelectorAll('.loader');
    loader.forEach((item) => { item.style.display = 'flex'; });
    const mainContent = document.querySelectorAll('.main-section-content');
    mainContent.forEach((item) => { item.style.display = 'none'; });

    const currentLocDetails = fetch(`http://api.openweathermap.org/data/2.5/weather?q=${value}&units=metric&appid=5839353095e9bdcc9ae4f18268574044`, { mode: 'cors' });
    const forecastDetails = fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${value}&units=metric&appid=5839353095e9bdcc9ae4f18268574044`, { mode: 'cors' });
    Promise.all([currentLocDetails, forecastDetails])
      .then((responses) => {
        let aa = false;
        responses.forEach((response) => {
          aa = !(response.ok);
        });

        if (!aa) {
          const curLocDetails = responses[0];
          const forDetails = responses[1];
          processLocDetails(curLocDetails.json());
          processForecastDetails(forDetails.json());
        } else {
          const msg = `Opps! Sorry, we could not find the weather details for the location <strong>${value}</strong>. Try another location!`;
          utility.displayMsgError(msg);
        }
      }).catch((err) => {
        utility.displayMsgError(err);
        // alert(err);
      });
  };

  const makeCall = () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('location-search');
    searchBtn.addEventListener('click', () => {
      if (searchInput.value !== '') {
        const { value } = searchInput;
        processAPICall(`${value}`);
      }
      searchInput.value = '';
    });
  };

  const filteredNewsData = (data) => {
    const filteredData = data.articles;
    let allNews = '';
    filteredData.slice(0, 10).forEach((item) => {
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

  const loadCurrentLoc = () => {
    window.addEventListener('load', () => {
      let city;
      let country;
      const currentDate = new Date();
      const currentLocation = fetch('./src/data4.json');
      const currentNews = fetch(`https://newsapi.org/v2/everything?q=weather&to=${currentDate}&apiKey=c4d03151880c4a5483bfdd5c83508124`, { mode: 'cors' });
      Promise.all([currentLocation, currentNews])
        .then((files) => {
          const curLoc = files[0].json();
          const curNews = files[1].json();
          curLoc.then((data) => {
            city = data.city;
            country = data.country_code;
            // 6.4474 3.3903
            processAPICall(`${city}`);
            document.getElementById('get-loc').innerText = `${city}, ${country}`;
          });
          curNews.then((data) => {
            filteredNewsData(data);
          });
        }).catch((err) => {
          console.log(err);
        });

      // const city = 'Lagos';
      // processAPICall(`${city}`);
    });
  };

  return { makeCall, loadCurrentLoc };
};

export default API;