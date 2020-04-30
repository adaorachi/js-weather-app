import country from 'countries-list';
import FusionCharts from 'fusioncharts';
import fusionTheme from 'fusioncharts/themes/es/fusioncharts.theme.fusion';
import Utility from './utility';

FusionCharts.addDep(fusionTheme);

const utility = Utility();

const API = () => {

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