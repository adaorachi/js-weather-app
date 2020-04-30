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