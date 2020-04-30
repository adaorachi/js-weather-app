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


  return {
    capString,
    setCurrentTime,
    toggleNav,
    slideshow,

    closeErrorMsg,
    displayMsgError,
    toggleNavPages,
  };
};


export default Utility;