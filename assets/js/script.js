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

let time = tipInterval;

open.addEventListener('click', () => {
  modal_container.classList.add('show');
});

// close.addEventListener('click', () => {
//     modal_container.classList.remove('show');
// });

closeReminder.addEventListener('click', () => {
  reminderModalEl.classList.remove('show');
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
  console.log(name, daystart, lunchbreak, dayend);
  console.log(typeof dayend);
  getTime();
});

function processForm() {
  console.log("processed form")
  modal_container.classList.remove('show');

}
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
    if (getTime() == lunchbreak) {
      displayReminder();
    }
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


const init = function () {
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
  console.log("at display tip");
  const explainDiv = document.createElement("div");
  const divExists = tipsEl.firstChild;
  if (divExists) {
    tipsEl.firstChild.remove();
  }
  explainDiv.innerHTML = tipsData[getTipToDisplay()].detail;
  explainDiv.textAlign = "center";
  tipsEl.insertAdjacentElement("afterbegin", explainDiv);
};

const displayReminder = function () {
  reminderContEl.style.display = "block";
  console.log("at reminder tip");
  const contentDiv = document.createElement("div");
  const divExists = reminderContEl.firstChild;
  if (divExists) {
    reminderContEl.firstChild.remove();
  }
  contentDiv.innerHTML = "Please have your lunch";
  contentDiv.textAlign = "center";
  reminderContEl.insertAdjacentElement("afterbegin", contentDiv);
  reminderAudioEl.play();
  reminderModalEl.classList.add('show');
};

function getTime() {
  const today = new Date();
  let hour = today.getHours() + '';
  let min = today.getMinutes() + '';
  hour = hour.length == 1 ? '0' + hour : hour;
  min = min.length == 1 ? '0' + min : min;
  return hour + ":" + min;
}