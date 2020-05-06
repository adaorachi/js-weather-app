/* eslint-disable no-undef */
/* eslint import/no-unresolved: [2, { ignore: ['cities'] }] */

import cities from 'cities.json';
import UI from './ui';
import Logic from './logic';

const ui = UI();
const logic = Logic();

const Utility = () => {
  const setCurrentTime = () => {
    function getTime() {
      const today = new Date();
      const getLocTime = today.toLocaleTimeString({}, {
        hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric',
      });
      document.getElementById('get-time').innerText = getLocTime;
    }
    setInterval(getTime, 1000);
  };

  const hideAndDisplayNav = (ele, arrayList) => {
    const array = document.querySelectorAll(arrayList);
    Array.from(array).forEach((item) => {
      if (item.id === ele) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  const displayMsgError = (msg, container) => {
    document.getElementById(container).innerHTML = `
    <div class="error-message" id="error-message">
      <p>${msg}</p>
      <span class="fas fa-times" id="close"></span>
    </div>`;
  };

  const closeErrorMsg = () => {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'close') {
        e.target.parentElement.remove();
      }
    });
  };

  const deleteAddLocTab = () => {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-loc-button')) {
        const { id } = e.target;
        const parent = id.split('-')[1];
        document.getElementById(parent).remove();
        const obj1 = logic.parseJSON('add_location');
        const obj2 = logic.parseJSON('add_forecast');
        const deleteLocId = obj1[parent];
        const deleteForecastId = `${deleteLocId.name}-${deleteLocId.country}`;
        delete obj1[parent];
        delete obj2[deleteForecastId];

        logic.strigifyJSON('add_location', obj1);
        logic.strigifyJSON('add_forecast', obj2);
      }
    });
  };

  const toggleFirstPageContent = (tab1, tab2) => {
    document.getElementById(tab1).classList.add('active');
    document.getElementById(tab2).classList.remove('active');
  };

  const backButton = () => {
    const button = document.getElementById('back-button');
    button.addEventListener('click', () => {
      document.getElementById('click-on-day').style.display = 'flex';
      toggleFirstPageContent('weather-card', 'details-card');
      const overviewTabs = document.querySelectorAll('.section-footer .forcast');
      overviewTabs.forEach((item) => item.classList.remove('active'));
    });
  };

  const toggleTab = (array, temp) => {
    const overviewTabs = document.querySelectorAll('.section-footer .forcast');
    overviewTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const { id } = tab;
        ui.displayForecastDetails(array, id, temp);
        ui.filteredChartsData(array, id);
        hideAndDisplayNav(id, '.section-footer .forcast');
        toggleFirstPageContent('details-card', 'weather-card');
        document.getElementById('click-on-day').style.display = 'none';
      });
    });
  };

  const toggleNavPages = () => {
    const allPageLinks = document.querySelectorAll('.navbar-link .list-group-item');
    allPageLinks.forEach((page) => {
      page.addEventListener('click', () => {
        const { id } = page;
        if (id === 'home') {
          toggleFirstPageContent('weather-card', 'details-card');
          document.getElementById('click-on-day').style.display = 'flex';
          const overviewTabs = document.querySelectorAll('.section-footer .forcast');
          overviewTabs.forEach((item) => item.classList.remove('active'));
        }
        const elePage = `${id}-page`;
        hideAndDisplayNav(id, '.navbar-link .list-group-item');
        hideAndDisplayNav(elePage, '.main-content .container');
      });
    });
  };

  const loadingPage = (display1, display2) => {
    const loader = document.querySelectorAll('.loader');
    loader.forEach((item) => { item.style.display = display1; });
    const mainContent = document.querySelectorAll('.main-section-content');
    mainContent.forEach((item) => { item.style.display = display2; });
  };

  const changeTempOnToggle = (tempMeasure) => {
    const sup = document.querySelectorAll('.sup-tag');
    Array.from(sup).forEach((item) => {
      if (tempMeasure === 'imperial') {
        item.innerText = 'f';
      } else {
        item.innerText = 'o';
      }
    });
  };

  const uncheckTempToggle = () => {
    const tempBtn = document.getElementById('temp-btn');
    if (tempBtn.checked) {
      tempBtn.checked = false;
      const tempMetric = document.getElementById('slider-round');
      tempMetric.setAttribute('data-metric', 'C');
    }
    document.getElementById('error-home-page').innerHTML = '';
  };

  const autoCompleteLocationDetails = (currentFocus, eventVal) => {
    const focusedElement = document.getElementById(`city-${currentFocus}`).innerText;
    const re = new RegExp(`^${logic.capString(eventVal)}`);
    if (focusedElement.match(re)) {
      document.querySelector('.auto-complete-text').innerText = focusedElement.slice(0, 28);
    } else {
      document.querySelector('.auto-complete-text').innerText = '';
    }
  };

  const highlightSearchList = (searchVal, string) => {
    const searchValL = searchVal.length;
    const stringBold = string.slice(0, searchValL).bold();
    const stringUnbold = string.slice(searchValL);
    const stringFormat = `${stringBold}${stringUnbold}`;
    return stringFormat;
  };

  const fillInputOnKeyCode = (currentFocus, ...theArgs) => {
    const locListItems = document.querySelectorAll('.loc-list .loc-list-item');
    const e = theArgs[0];
    const locationSearch = theArgs[1];
    const locList = theArgs[2];
    if (e.keyCode === 40) {
      arguments[0] += 1;
      if (arguments[0] >= locListItems.length) {
        arguments[0] = 0;
      }
    } else if (e.keyCode === 38) {
      arguments[0] -= 1;
      if (arguments[0] <= 0) {
        arguments[0] = 0;
      }
    } else if (e.keyCode === 13) {
      const listText = document.getElementById(`city-${arguments[0]}`).innerText;
      locationSearch.value = listText;
      locList.classList.add('slide-effect');
      document.getElementById('auto-complete-text').style.display = 'none';
      document.getElementById('search-btn').click();
    } else {
      arguments[0] = 0;
    }
    document.getElementById(`city-${arguments[0]}`).style.backgroundColor = '#fff';
    // eslint-disable-next-line prefer-destructuring
    currentFocus = arguments[0];
    return currentFocus;
  };

  const getCityOnInput = () => {
    const locationSearch = document.getElementById('location-search');
    let currentFocus = 0;

    locationSearch.addEventListener('keyup', (e) => {
      const eventVal = e.target.value;
      const locList = document.getElementById('loc-list');
      locationSearch.value = logic.capString(eventVal);
      document.getElementById('auto-complete-text').style.display = 'block';

      function slideInList() {
        locList.classList.add('slide-effect');
        document.querySelector('.auto-complete-text').innerText = '';
      }

      if (eventVal.trim() !== '') {
        const re = new RegExp(`^${eventVal}`, 'i');
        const citiesFiltered = cities.filter((item) => re.test(`${item.name}, ${item.country}`))
          .filter((elem, index, self) => self.findIndex(
            (t) => (t.name === elem.name && t.country === elem.country),
          ) === index)
          .sort((a, b) => {
            const x = a.name;
            const y = b.name;
            // eslint-disable-next-line no-nested-ternary
            return x < y ? -1 : x > y ? 1 : 0;
          })
          .slice(0, 5);

        let cityDisplay = '';
        if (citiesFiltered.length > 0) {
          citiesFiltered.forEach((city, index) => {
            const locConcat = `${logic.capString(city.name)}, ${city.country}`;
            cityDisplay += `
            <li class="loc-list-item" id="city-${index}">${highlightSearchList(eventVal, locConcat)}</li>`;
          });

          locList.innerHTML = cityDisplay;
          locList.classList.remove('slide-effect');

          currentFocus = fillInputOnKeyCode(currentFocus, e, locationSearch, locList);
          autoCompleteLocationDetails(currentFocus, eventVal);
        } else {
          slideInList();
        }
      } else {
        slideInList();
      }

      document.getElementById('search-btn').addEventListener('click', () => {
        slideInList();
      });
      document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('search-list-loc')) {
          slideInList();
        }
      });
    });
  };

  const populateSearchValue = () => {
    const locList = document.getElementById('loc-list');
    locList.addEventListener('click', (e) => {
      const event = e.target;
      if (event.classList.contains('loc-list-item')) {
        const locationSearch = document.getElementById('location-search');
        locationSearch.value = event.innerText;
        locList.classList.add('slide-effect');
        document.querySelector('.auto-complete-text').innerText = '';
        document.getElementById('search-btn').click();
      }
    });
  };

  const getAddLocation = () => {
    const addLocation = document.getElementById('add-search-btn');
    const addLocationInput = document.getElementById('add-location-search');

    addLocation.addEventListener('click', () => {
      const { value } = addLocationInput;
      if (value.trim() !== '') {
        const list = document.createElement('li');
        list.className = 'list inset-border';
        list.innerHTML = `
          ${value}
          <span>45<sup>o</sup></span>`;
        document.getElementById('add-location-list-item').append(list);
        addLocationInput.value = '';
      }
    });
  };

  const updateDateAtInterval = () => {
    setInterval(() => {
      const dataLoc = logic.parseJSON('add_location');
      if (dataLoc !== null) {
        const countryCityTime = [];
        Object.entries(dataLoc).forEach((item) => {
          const value = item[1];
          const time = `${item[0]}_${value.time}`;
          countryCityTime.push(time);
        });
        countryCityTime.forEach((item) => {
          const time = item.split('_')[1];
          const key = item.split('_')[0];
          document.getElementById(`ticker-${key}`).innerHTML = `${logic.convertLocTime(time)[0]}. ${logic.convertLocTime(time)[1]}.`;
        });
      }
    }, 60000);
  };

  return {
    setCurrentTime,
    getCityOnInput,
    populateSearchValue,
    closeErrorMsg,
    displayMsgError,
    toggleNavPages,
    getAddLocation,
    toggleTab,
    toggleFirstPageContent,
    backButton,
    loadingPage,
    changeTempOnToggle,
    uncheckTempToggle,
    deleteAddLocTab,
    updateDateAtInterval,
  };
};


export default Utility;