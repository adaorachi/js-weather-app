/* eslint import/no-unresolved: [2, { ignore: ['fusioncharts', '\.fusion$'] }] */

import FusionCharts from 'fusioncharts';
import fusionTheme from 'fusioncharts/themes/es/fusioncharts.theme.fusion';

FusionCharts.addDep(fusionTheme);

const Logic = () => {
  const parseJSON = (locData) => {
    const getCurLocLocalData = localStorage.getItem(locData);
    const data = JSON.parse(getCurLocLocalData);
    return data;
  };

  const strigifyJSON = (locKey, locVal) => {
    localStorage.setItem(locKey, JSON.stringify(locVal));
  };

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

  const capString = (string) => string.replace(/^\w/, c => c.toUpperCase());

  const convertTemp = (temp) => {
    const celsuis = temp.toFixed(1);
    const celTofah = ((celsuis * (9 / 5)) + 32).toFixed(1);
    return [celsuis, celTofah];
  };

  const computeWindDirection = (deg) => {
    let image;
    if (deg === undefined) {
      image = 'undefined';
      return image;
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
    return image;
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
      loc_icon: data.weather[0].icon,
      main: data.weather[0].main,
    };
    return cleanedData;
  };

  const cleanAddLocData = (data) => {
    const storeData = {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      name: data.name,
      country: data.sys.country,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      time: data.timezone,
      description: data.weather['0'].description,
      icon: data.weather['0'].icon,
    };
    return storeData;
  };

  const groupDataBy = (array, key) => array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue,
    );
    return result;
  }, {});

  const filterForecastOverviewData = (array) => {
    const filteredData = [];
    Object.entries(array).forEach((item) => {
      const value = item[1];
      if (value.length >= 2) {
        const data = groupDataBy(value, 'weather_desc');
        const keyMap = Object.entries(data).map((item) => [item[0], item[1].length]);
        const keySory = keyMap.sort((a, b) => b[1] - a[1]);
        const firstKey = keySory[0][0];
        const filtered = data[firstKey]['0'];
        filteredData.push(filtered);
      }
    });
    return filteredData.slice(0, 5);
  };

  const forecastChartsRender = (label, series, chartContainer) => {
    FusionCharts.ready(() => {
      const chartObj = new FusionCharts({
        type: 'mssplinearea',
        renderAt: `${chartContainer}`,
        width: '100%',
        height: '55%',
        dataFormat: 'json',
        dataSource: {
          chart: {
            theme: 'fusion',
            yAxisName: 'Weather Conditions',
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

  const chartsData = (array) => {
    const filteredArray = [];
    Object.entries(array).forEach((day) => {
      const key = day[0];
      const valueV = day[1];

      const valueArray2 = [];
      const valueArray = [];
      const allMain = [[], []];

      valueV.forEach((item) => {
        allMain[0].push({ value: item.main.feels_like });
        allMain[1].push({ value: item.main.temp });

        const timeV = {};
        timeV.label = item.time.split(':').slice(0, 2).join(':');
        valueArray.push(timeV);
      });

      valueArray2.push({ seriesname: 'Feels-like', data: allMain[0] });
      valueArray2.push({ seriesname: 'Temperature', data: allMain[1] });

      const keyA = {};
      keyA[key] = [valueArray2, valueArray];
      filteredArray.push(keyA);
    });
    return filteredArray;
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
    let degree;
    if (convTimeToMin(locTime) <= convTimeToMin(sunrise)) {
      degree = -90;
    } else if (convTimeToMin(locTime) >= convTimeToMin(sunset)) {
      degree = 90;
    } else {
      let val = (convTimeToMin(locTime) - convTimeToMin(sunrise)) / 60;
      const fromRtoS = (convTimeToMin(sunset) - convTimeToMin(sunrise)) / 60;
      const aggr = 180 / fromRtoS;
      val = (val * aggr) - 90;
      degree = val;
    }
    document.querySelector('.pointer').style.webkitTransform = `rotateZ(${degree}deg)`;
    document.querySelector('.pointer').style.transform = `rotateZ(${degree}deg)`;
  };

  const computeDayLightTime = (sunrise, sunset, time) => {
    function timeConvert(parseTime) {
      const a = parseTime.replace(/\w{2}$/, '');
      const b = a.split(':');
      let c;
      if (parseTime.slice(-2) === 'pm') {
        c = ((parseInt(b[0], 10) + 12) * 60) + parseInt(b[1], 10);
      } else {
        c = ((parseInt(b[0], 10)) * 60) + parseInt(b[1], 10);
      }
      c /= 60;
      return c;
    }
    const sunsetTime = timeConvert(convertSunTime(sunset, time));
    const sunriseTime = timeConvert(convertSunTime(sunrise, time));
    const timeDiff = (sunsetTime - sunriseTime).toFixed(1);
    return timeDiff;
  };

  const getImageURL = (main, desc, icon) => {
    let image;
    const wind1 = ['Mist', 'Smoke', 'Haze', 'Fog'];
    const wind2 = ['Sand', 'Ash', 'Squall', 'Dust', 'Tornado'];
    const rain = ['Rain', 'Drizzle'];
    if (main === 'Clear') {
      image = `images/weatherBG/${main}-${icon}.jpg`;
    } else if (main === 'Clouds') {
      if (desc === 'few clouds' || desc === 'broken clouds') {
        image = `images/weatherBG/few-clouds-${icon.split('')[2]}.jpg`;
      }
      if (desc === 'scattered clouds' || desc === 'overcast clouds') {
        image = `images/weatherBG/scattered-clouds-${icon.split('')[2]}.jpg`;
      }
    } else if (wind1.includes(main)) {
      image = 'images/weatherBG/Mist.jpg';
    } else if (wind2.includes(main)) {
      image = 'images/weatherBG/Tornado.jpg';
    } else if (rain.includes(main)) {
      image = 'images/weatherBG/Rain.jpg';
    } else {
      image = `images/weatherBG/${main}.jpg`;
    }

    return image;
  };

  const cleanLocForecast = (data) => {
    const setData = [];
    data.forEach((item) => {
      const value = item;
      const fullDate = item.dt_txt.split(' ');
      const date = fullDate[0];
      const time = fullDate[1];
      value.date = date;
      value.time = time;
      value.weather_desc = item.weather['0'].main;
      setData.push(value);
    });

    const dataGroupedByDate = groupDataBy(setData, 'date');
    return dataGroupedByDate;
  };

  return {
    parseJSON,
    strigifyJSON,
    abbrevDate,
    capString,
    convertTemp,
    computeWindDirection,
    cleanLocDetailsData,
    filterForecastOverviewData,
    forecastChartsRender,
    chartsData,
    convertLocTime,
    convertSunTime,
    setTicker,
    computeDayLightTime,
    getImageURL,
    cleanLocForecast,
    cleanAddLocData,
  };
};

export default Logic;
