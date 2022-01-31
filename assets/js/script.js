import {
  tipsData,
  wellnessFactsData
} from "./model.js";
import {
  TIPS_INTERVAL as tipInterval
} from "./config.js";
const open = document.getElementById('open');
const modal_container = document.getElementById('modal_container');
const tipsEl = document.getElementById("tips-main");
const timerEl = document.getElementById("times");

const reminderContEl = document.querySelector("#reminder-content");
const reminderAudioEl = document.querySelector("#reminder-audio");
const reminderModalEl = document.querySelector("#modal_reminder");
const closeReminder = document.querySelector('.close');
const planForm = document.getElementById("plan-form");
let name;
let daystart;
let lunchbreak;
let morningbreak;
let afternoonbreak;
let dayend;
let toStopReminder = false;
let lastReminder= "";
let time = tipInterval;


/* event listeners for the schedule modal form */

open.addEventListener('click', () => {
  modal_container.classList.add('show');
});

closeReminder.addEventListener('click', () => {
  reminderModalEl.classList.remove('show');
  toStopReminder = true;
});

/* process the form content */

planForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = e.target;
  name = data['Name'].value;
  daystart = data['daystart'].value;
  lunchbreak = data['lunchbreak'].value;
  morningbreak = data['morningbreak'].value;
  afternoonbreak = data['afternoonbreak'].value;
  dayend = data['dayend'].value;
  modal_container.classList.remove('show');
  startReminderTimer();
  saveUser();
});

/* Timer for wellness facts: display a different one every 10 minutes */

const startTimer = function () {
  const tick = function () {
    const hour = String(Math.trunc(time / 3600)).padStart(2, 0);
    const min = String(Math.trunc((time % 3600) / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI, include hour if it is greater than 0
    hour > 0 ?
      (timerEl.textContent = `${hour}:${min}:${sec}`) :
      (timerEl.textContent = `${min}:${sec}`);

    // When 0 seconds, restart timer and display another wellness fact
    if (time === 0) {
      time = tipInterval;
      displayWellnessFact();
    }
    // Decrease 1s
    time--;
  };
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/* Timer for reminders: every second checks if it's daystart, dayend, lunch, morning break, afternoon break, water break or 20-20-20 */

const startReminderTimer = function () {
  const tick = function () {
    const time = getTime();
    let now = new Date();
    let today = new Date();
    let day = today.getDate().toString();
    let month = (today.getMonth() + 1).toString();
    let year = today.getFullYear();
    let todayAsStr = today.toString();
    day = day.length == 1 ? '0' + day : day;
    month = month.length == 1 ? '0' + month : month;
    // convert startTime to datetime object
    let startTime = Date.parse(year + '-' + month + '-' + day + 'T' + daystart + ':00.000' + todayAsStr[28] + todayAsStr[29] + todayAsStr[30] + ':00');
    now.setSeconds(0);
    now.setMilliseconds(0);
    if (time === lunchbreak) {
      displayReminder("lunch");
    } else if (time === dayend) {
      displayReminder("dayend");
    } else if (time === daystart) {
      displayReminder("daystart");
    } else if (time === morningbreak) {
      displayReminder("morningbreak");
    } else if (time === afternoonbreak) {
      displayReminder("afternoonbreak");
    } else if ((now - startTime) % 3600000 === 0) {
      // every hour
      displayReminder("water");
    } else if ((now - startTime) % 1200000 === 0) {
      // every 20 minutes
      displayReminder("twenty");
    }
  };
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/* When the document is loaded, get user and start displaying wellness facts */

const init = function () {
  getUser();
  if (!name) {
    modal_container.classList.add('show');
  }
  displayWellnessFact();
  startTimer();
}

document.addEventListener("DOMContentLoaded", init);

/* if all tips have been used, refresh and set all of them to false to be used again */

const refreshTips = () =>{
  tipsData.forEach((el) => el.used = false);
}

const refreshWellenssFact = () =>{
  wellnessFactsData.forEach((el) => el.used = false);
}

/* functions to get a random tip or wellness fact */

const getTipToDisplay = function () {
  let unusedTips = tipsData.filter((data) => !data.used);
  if(unusedTips.length === 0){
    refreshTips();
    unusedTips = tipsData.filter((data) => !data.used);
  }
  const tipId = Math.floor(Math.random() * unusedTips.length);
  return unusedTips[tipId].id;
};

const getWellnessFactToDisplay = function () {
  let unusedWellnessFacts = wellnessFactsData.filter((data) => !data.used);
  if(unusedWellnessFacts.length === 0){
    refreshWellenssFact();
    unusedWellnessFacts = wellnessFactsData.filter((data) => !data.used);
  }
  const wellnessFactId = Math.floor(Math.random() * unusedWellnessFacts.length);
  return unusedWellnessFacts[wellnessFactId].id;
};

/* display the wellness fact randomly chosen by getWellnessFactToDisplay */

const displayWellnessFact = function () {
  tipsEl.style.display = "block";
  const explainDiv = document.createElement("div");
  const divExists = tipsEl.firstChild;
  if (divExists) {
    tipsEl.firstChild.remove();
  }
  const wellnessFactIndex = getWellnessFactToDisplay();
  explainDiv.innerHTML = wellnessFactsData[wellnessFactIndex].detail;
  wellnessFactsData[wellnessFactIndex].used = true;
  explainDiv.textAlign = "center";
  tipsEl.insertAdjacentElement("afterbegin", explainDiv);
};

/* display the reminder if it's the relevant time of the day */

const displayReminder = function (period) {
  if (period !== lastReminder){
    toStopReminder = false;
    lastReminder = period;
  }
  if (!toStopReminder) {
    reminderContEl.style.display = "block";
    const contentDiv = document.createElement("div");
    const divExists = reminderContEl.firstChild;
    if (divExists) {
      reminderContEl.firstChild.remove();
    }
    if (period === "daystart") {
      contentDiv.innerHTML = `${getGreeting()} Welcome to work! Please remember to do your exercises`;
    } else if (period === "lunch") {
      contentDiv.innerHTML = `${getGreeting()}It is time for lunch! Please have something to eat! and do some exercises`;
    } else if (period === "dayend") {
      contentDiv.innerHTML = `${getGreeting()} Lovely time of them all. Please proceed home!!!`;
    } else if (period === "morningbreak" || period === "afternoonbreak") {
      const tipIndex = getTipToDisplay();
      contentDiv.innerHTML = `${tipsData[tipIndex].detail}`;
      tipsData[tipIndex].used = true;
    } else if (period === "water") {
      contentDiv.innerHTML = `It's time to drink some water: staying hydrated is important!`;
    } else if (period === "twenty") {
      contentDiv.innerHTML = `You've been staring at the screen for 20 minutes, look 20 feet away for 20 seconds!`;
    }
    contentDiv.textAlign = "center";
    reminderContEl.insertAdjacentElement("afterbegin", contentDiv);
    reminderAudioEl.play();
    lastReminder = period;
    reminderModalEl.classList.add('show');

  }

};

/* get time of the day. used for reminders, to check if one of the times set by user (e.g. start day at 08:00) matches the current time.
  returns hh:mm if seconds are 00 (e.g. if it's 08:00:00 returns 08:00)
  if seconds are not 00, returns hh:mm:ss
  so that only when seconds are 00, the time returned by this function matches the one set by the user */

function getTime() {
  const today = new Date();
  let hour = today.getHours() + '';
  let min = today.getMinutes() + '';
  let sec = today.getSeconds() + '';
  let result = '';
  hour = hour.length == 1 ? '0' + hour : hour;
  min = min.length == 1 ? '0' + min : min;
  if (sec === '0') {
    result = hour + ":" + min; 
  } else {
    hour + ":" + min + ":" + sec;
  }
  return result;
}

/* gets greeting based on the time of the day */

function getGreeting(){
  const today = new Date();
  const hour = parseInt(today.getHours());
  if(hour > 0 && hour < 12) {
    return `Good morning ${name}, `;
  }else if (hour >= 12 && hour < 16){
    return `Good afternoon ${name}, `;
  }else{
    return `Good evening ${name}, `;
  }
}

/* saves user settings to local storage */

function saveUser(){
  window.localStorage.clear();
  window.localStorage.setItem('name',name );
  window.localStorage.setItem('daystart', daystart);
  window.localStorage.setItem('lunchbreak', lunchbreak);
  window.localStorage.setItem('morningbreak', morningbreak);
  window.localStorage.setItem('afternoonbreak', afternoonbreak);
  window.localStorage.setItem('dayend', dayend);
}

// retrieve user reminder settings from Local Storage
function getUser(){
 name =  window.localStorage.getItem('name');
 daystart = window.localStorage.getItem('daystart');
 lunchbreak = window.localStorage.getItem('lunchbreak');
 morningbreak = window.localStorage.getItem('morningbreak');
 afternoonbreak = window.localStorage.getItem('afternoonbreak');
 dayend = window.localStorage.getItem('dayend');
// if there is existing data in name, then render data to DOM
if(name){
  planForm['Name'].value = name;
  planForm['daystart'].value = daystart;
  planForm['lunchbreak'].value = lunchbreak;
  planForm['morningbreak'].value = morningbreak;
  planForm['afternoonbreak'].value = afternoonbreak;
  planForm['dayend'].value = dayend;
}

}