// import cities from 'cities.json';

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

  const capString = (string) => string.replace(/^\w/, c => c.toUpperCase());

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

  const displayMsgError = (msg) => {
    document.getElementById('error-container').innerHTML = `
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

  const toggleNav = (nav) => {
    const navTab = document.getElementById(nav);
    const parentId = navTab.parentElement.parentElement.id;
    navTab.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        const { id } = e.target;
        const eleTab = id.split('-').slice(0, 2).join('-');
        hideAndDisplayNav(eleTab, `#${parentId} .tab-content .tab-pane`);
        hideAndDisplayNav(id, `#${parentId} .nav-tabs .nav-item`);
      }
    });
  };

  const toggleNavPages = () => {
    const allPageLinks = document.querySelectorAll('.navbar-link .list-group-item');
    allPageLinks.forEach((page) => {
      page.addEventListener('click', () => {
        const { id } = page;
        const elePage = `${id}-page`;
        hideAndDisplayNav(id, '.navbar-link .list-group-item');
        hideAndDisplayNav(elePage, '.main-content .container');
      });
    });
  };

  const slideshow = () => {
    const slideshowContent = '.search-loc-advanced .section-container';
    let list = [0, 1, 2];
    const slideshow = document.querySelectorAll('.slideshow-button .slidebtn');
    Array.from(slideshow).forEach((ele) => {
      ele.addEventListener('click', () => {
        let dataSlide = ele.getAttribute('data-slide');
        dataSlide = parseInt(dataSlide, 10);
        const getItemIndex = list.map((item) => {
          let numToAdd;
          if ((item + dataSlide) >= list.length) {
            numToAdd = 0 - item;
          } else if ((item + dataSlide) < 0) {
            numToAdd = list.length + (item + dataSlide);
          } else {
            numToAdd = dataSlide;
          }
          return item + numToAdd;
        });

        const displayItem = getItemIndex[0];
        const elemID = `section-${displayItem}`;
        if (displayItem === 0 || displayItem === 1) {
          const navId = document.querySelector(`#${elemID} .first-nav`).id;
          const tabId = document.querySelector(`#${elemID} .first-tab`).id;
          hideAndDisplayNav(tabId, `#${elemID} .tab-content .tab-pane`);
          hideAndDisplayNav(navId, `#${elemID} .nav-tabs .nav-item`);
        }
        hideAndDisplayNav(elemID, slideshowContent);
        list = getItemIndex;
      });
    });
  };

  const autoCompleteLocationDetails = (currentFocus, eventVal) => {
    const focusedElement = document.getElementById(`city-${currentFocus}`).innerText;
    const re = new RegExp(`^${capString(eventVal)}`);
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
    } else if (e.keyCode === 9 || e.keyCode === 13) {
      const listText = document.getElementById(`city-${arguments[0]}`).innerText;
      locationSearch.value = listText;
      locList.classList.add('slide-effect');
    } else {
      arguments[0] = 0;
    }
    document.getElementById(`city-${arguments[0]}`).style.backgroundColor = '#fff';
    currentFocus = arguments[0];
    return currentFocus;
  };

  const getCityOnInput = () => {
    const locationSearch = document.getElementById('location-search');
    let currentFocus = 0;
    locationSearch.addEventListener('keyup', (e) => {
      const eventVal = e.target.value;
      const locList = document.getElementById('loc-list');
      locationSearch.value = capString(eventVal);

      if (eventVal.trim() !== '') {
        const re = new RegExp(`^${eventVal}`, 'i');
        const citiesFiltered = cities.filter((item) => re.test(`${item.name}, ${item.country}`))
          .filter((elem, index, self) => self.findIndex(
            (t) => {
              return (t.name === elem.name && t.country === elem.country);
            }) === index)
          .sort((a, b) => {
            const x = a.name;
            const y = b.name;
            return x < y ? -1 : x > y ? 1 : 0;
          })
          .slice(0, 5);

        let cityDisplay = '';
        if (citiesFiltered.length > 0) {
          citiesFiltered.forEach((city, index) => {
            const locConcat = `${capString(city.name)}, ${city.country}`;
            cityDisplay += `
            <li class="loc-list-item" id="city-${index}">${highlightSearchList(eventVal, locConcat)}</li>`;
          });

          locList.innerHTML = cityDisplay;
          locList.classList.remove('slide-effect');

          currentFocus = fillInputOnKeyCode(currentFocus, e, locationSearch, locList);
          autoCompleteLocationDetails(currentFocus, eventVal);
        } else {
          document.querySelector('.auto-complete-text').innerText = '';
          locList.classList.add('slide-effect');
        }
      } else {
        locList.classList.add('slide-effect');
        document.querySelector('.auto-complete-text').innerText = '';
      }
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
      }
    });
  };

  return {
    capString,
    setCurrentTime,
    toggleNav,
    slideshow,
    getCityOnInput,
    populateSearchValue,
    closeErrorMsg,
    displayMsgError,
    toggleNavPages,
  };
};


export default Utility;