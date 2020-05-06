const mod = (() => {
  const getDayOrNight = (timeArr, data) => data.filter((i) => {
    const timeT = timeArr;
    const getTime = i.time.split(':')[0];
    return timeT.includes(getTime);
  });

  const getMain = (arr) => {
    const getTemp = arr.map((i) => i.main.temp);
    const getWeather = arr.map((i) => i.weather['0'].main);
    return [getTemp, getWeather];
  };

  const getMaxWeather = (arr) => {
    const obj = arr.reduce((acc, ele) => {
      // eslint-disable-next-line no-unused-expressions
      (ele in acc) ? acc[ele] += 1 : acc[ele] = 1;
      return acc;
    }, {});
    return Object.keys(obj);
  };

  const computeComment = (weatherTemp) => {
    const weather = weatherTemp[0];
    const mist = ['Mist', 'Smoke', 'Haze', 'Fog'];
    const rain = ['Thunderstorm', 'Drizzle', 'Rain'];
    let rainSomeTime;
    for (let i = 0; i < rain.length; i += 1) {
      let count = 0;
      // eslint-disable-next-line no-unused-expressions
      (weatherTemp.includes(rain[i]) ? count += 1 : count += 0);
      rainSomeTime = (count > 0) ? 'Expect rain later today.' : '';
    }
    let comment;
    if (weather === 'Clouds') {
      comment = `The skies will be mostly Cloudy. ${rainSomeTime}`;
    } else if (weather === 'Snow') {
      comment = `The skies will be mostly Snowy. ${rainSomeTime}`;
    } else if (weather === 'Clear') {
      const rand = Math.floor(Math.random() * 2);
      const commentArr = ['Expect sunny skies', 'The skies will be mostly Clear'];
      comment = `${commentArr[rand]}. ${rainSomeTime}`;
    } else if (mist.includes(weather)) {
      comment = `The skies will be mostly Foggy. ${rainSomeTime}`;
    } else if (rain.includes(weather)) {
      comment = 'The skies will be mostly Rainy.';
    } else {
      comment = `There will be ${weather} for most part of today. ${rainSomeTime}`;
    }
    return comment;
  };

  const tempComment = (temp) => {
    let comment;
    if (temp > 30) {
      comment = ' in the humid weather.';
    } else if (temp > 25) {
      comment = '. It will be fairly warm.';
    } else if (temp > 18) {
      comment = '. The air will be quite cold.';
    } else if (temp > 10) {
      comment = '. It will be extremely cold.';
    } else {
      comment = '. Temperature will freeze up.';
    }
    return comment;
  };

  return {
    getDayOrNight,
    getMain,
    getMaxWeather,
    computeComment,
    tempComment,
  };
})();

module.exports = mod;