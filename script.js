const dayjs = require("dayjs");

const searchHistory = [];
const weatherApiRootUrl = 'https://api.openweathermap.org';
const weartherApiKey = '87b4d240f3b252b2a5cab333c81d7740';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const todayContainer = document.querySelector('#today');
const forecastContainer = document.querySelector('#forecast');
const searchHistoryContainer = document.querySelector('#history');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function renderSearchHistory() {
  searchHistoryContainer.innerHTML = '';
  
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-controls', 'today forecast');
    btn.classList.add('history-btn', 'btn-history');

    btn.setAttribute('data-date', searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistoryContainer.appendChild(btn);
  }
}

function appendToHistory(search) {
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);
  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderSearchHistory();
}

function initSearchHistory() {
  var storedSearchHistory = JSON.parse(localStorage.getItem('search-history'));
  if (storedSearchHistory !== null) {
    searchHistory = storedSearchHistory;
  }
  renderSearchHistory();
}

function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  var tempF = (weather.main.temp - 273.15) * 1.80 + 32;
  var windMph = weather.wind.speed * 2.237;
  var humidity = weather.main.humidity;

  var iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');
  card.append(cardBody);

  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.innerHTML = '';
  todayContainer.append(card);
}

function renderForecastCard(forecast) {
  var iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

  var iconDescription = forecast.weather[0].description || forecast[0].main;
  var tempF = (forecast.main.temp - 273.15) * 1.80 + 32;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed * 2.237;

  var col = document.createElement('div');
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var cardTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // Add content to elements
  cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
}

function renderForecast(dailyForecast) {
  var startDt = dayjs().add(1, 'day').startOf('day').unix;
  var endDt = dayjs().add(6, 'day').startOf('day').unix;

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.list.length; i++) {
    if (dailyForecast.list[i].dt >= startDt && dailyForecast.list[i].dt < endDt) {
      if (dailyForecast[i].dt_txt.slice(11, 13) == '12') {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems (city, data) {
  renderCurrentWeather(city, data);
  renderForecast(data);
}

function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${weartherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function fetchCoordinates(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${city}&limit=5&appid=${weartherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.length === 0) {
        alert('No results found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function handleSearchFormSubmit(event) {
  if (!searchInput.value) {
    return;
  }
  event.preventDefault();

  var search = searchInput.value;
  fetchCoordinates(search);
  searchInput.value = '';
}

function handleSearchHistoryClick(event) {
  if (!event.target.matches('btn-history')) {
    return;
  }
  var btn = event.target;
  var search = btn.getAttribute('data-search');
  fetchCoordinates(search);
}

initSearchHistory();

searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistory.addEventListener('click', handleSearchHistoryClick);