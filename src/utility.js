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


  return {
    capString,
    setCurrentTime,

  };
};


export default Utility;
// module.exports = Utility;