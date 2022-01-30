import {
  tipsData
} from "./model.js";
import {
  TIPS_INTERVAL as tipInterval
} from "./config.js";
const open = document.getElementById('open');
const modal_container = document.getElementById('modal_container');
// const close = document.getElementById('close');
const tipsEl = document.getElementById("tips-main");
const timerEl = document.getElementById("times");

const reminderContEl = document.querySelector("#reminder-content");
const reminderHeadEl = document.querySelector("#reminder-header");
const reminderAudioEl = document.querySelector("#reminder-audio");
const reminderModalEl = document.querySelector("#modal_reminder");
const closeReminder = document.querySelector('.close');
const planForm = document.getElementById("plan-form");
let name;
let daystart;
let lunchbreak;
let dayend;
let toStopReminder = false;
let lastReminder= "";
let time = tipInterval;

open.addEventListener('click', () => {
  modal_container.classList.add('show');
});

closeReminder.addEventListener('click', () => {
  reminderModalEl.classList.remove('show');
  toStopReminder = true;
});

planForm.addEventListener('submit', (e) => {
  // process the form content
  e.preventDefault();
  const data = e.target;
  name = data['Name'].value;
  daystart = data['daystart'].value;
  lunchbreak = data['lunchbreak'].value;
  dayend = data['dayend'].value;
  modal_container.classList.remove('show');
  startReminderTimer();
  getTime();
  saveUser();
});

const startTimer = function () {
  const tick = function () {
    const hour = String(Math.trunc(time / 3600)).padStart(2, 0);
    const min = String(Math.trunc((time % 3600) / 60)).padStart(2, 0);
    // const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI, include hour if it is greater than 0
    hour > 0 ?
      (timerEl.textContent = `${hour}:${min}:${sec}`) :
      (timerEl.textContent = `${min}:${sec}`);

    // When 0 seconds, restart timer and display another tip
    if (time === 0) {
      time = tipInterval;
      displayTip();
    }
    // Decrease 1s
    time--;
  };
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};


const startReminderTimer = function () {
  const tick = function () {
    const time = getTime();
    if (time === lunchbreak) {
      displayReminder("lunch");
    } else if (time === dayend) {
      displayReminder("dayend");
    } else if (time === daystart) {
      displayReminder("daystart");
    }
  };
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const init = function () {
  getUser();
  modal_container.classList.add('show');
  displayTip();
  startTimer();
}

document.addEventListener("DOMContentLoaded", init);

const getTipToDisplay = function () {
  const unusedTips = tipsData.filter((data) => !data.used);
  const tipId = Math.floor(Math.random() * unusedTips.length);
  return unusedTips[tipId].id;
};

const displayTip = function () {
  tipsEl.style.display = "block";
  const explainDiv = document.createElement("div");
  const divExists = tipsEl.firstChild;
  if (divExists) {
    tipsEl.firstChild.remove();
  }
  explainDiv.innerHTML = tipsData[getTipToDisplay()].detail;
  explainDiv.textAlign = "center";
  tipsEl.insertAdjacentElement("afterbegin", explainDiv);
};

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
      // const greet = `{getGreeting()} Welcome to work! Please remember to do your exercises`;
      // console.log(greet)
      contentDiv.innerHTML = `${getGreeting()} Welcome to work! Please remember to do your exercises`;
    } else if (period === "lunch") {
      contentDiv.innerHTML = `${getGreeting()}It is time for lunch! Please have something to eat! and do some exercises`;
    } else if (period === "dayend") {
      contentDiv.innerHTML = `${getGreeting()} Lovely time of them all. Please proceed home!!!`;
    }
    contentDiv.textAlign = "center";
    reminderContEl.insertAdjacentElement("afterbegin", contentDiv);
    reminderAudioEl.play();
    lastReminder = period;
    reminderModalEl.classList.add('show');

  }

};

function getTime() {
  const today = new Date();
  let hour = today.getHours() + '';
  let min = today.getMinutes() + '';
  hour = hour.length == 1 ? '0' + hour : hour;
  min = min.length == 1 ? '0' + min : min;
  return hour + ":" + min;
}

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

function saveUser(){
  window.localStorage.clear();
  window.localStorage.setItem('name',name );
  window.localStorage.setItem('daystart', daystart);
  window.localStorage.setItem('lunchbreak', lunchbreak);
  window.localStorage.setItem('dayend', dayend);
}

// retrieve user reminder settings from Local Storage
function getUser(){
 name =  window.localStorage.getItem('name');
 daystart = window.localStorage.getItem('daystart');
 lunchbreak = window.localStorage.getItem('lunchbreak');
 dayend = window.localStorage.getItem('dayend');
// if there is existing data in name, then render data to DOM
if(name){
  planForm['Name'].value = name;
  planForm['daystart'].value=daystart;
  planForm['lunchbreak'].value =lunchbreak;
  planForm['dayend'].value =dayend;
}

}