import { tipsData } from "./model.js";
import { TIPS_INTERVAL as tipInterval } from "./config.js";
const open = document.getElementById('open');
const modal_container = document.getElementById('modal_container');
const close = document.getElementById('close');
const tipsEl = document.getElementById("tips-main");
const timerEl = document.getElementById("times");
let time = tipInterval;

open.addEventListener('click', () => {
    modal_container.classList.add('show');
});

close.addEventListener('click', () => {
    modal_container.classList.remove('show');
});
 
const startTimer = function () {
  const tick = function () {
    const hour = String(Math.trunc(time / 3600)).padStart(2, 0);
    const min = String(Math.trunc((time % 3600) / 60)).padStart(2, 0);
    // const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI, include hour if it is greater than 0
    hour > 0
      ? (timerEl.textContent = `${hour}:${min}:${sec}`)
      : (timerEl.textContent = `${min}:${sec}`);

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


const init = function(){
  modal_container.classList.add('show');
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
