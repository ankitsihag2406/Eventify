/* ===========================================================
   EVENTIFY — about.js (about.html only)
=========================================================== */
(function(){
  'use strict';
  const E = window.Eventify;
  const events = E.getEvents();

  function animateNumber(id, target){
    const el = document.getElementById(id);
    if(!el) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target/40));
    const iv = setInterval(()=>{
      cur += step;
      if(cur >= target){ cur = target; clearInterval(iv); }
      el.textContent = cur.toLocaleString('en-IN');
    }, 20);
  }

  function renderStats(){
    const totalGoing = events.reduce((s,e)=> s + e.seatsTaken, 0);
    const cities = new Set(events.map(e=>e.city)).size;
    animateNumber('statEvents', events.length);
    animateNumber('statAttendees', totalGoing);
    animateNumber('statCities', cities);
  }

  function init(){
    E.initNavAuth();
    renderStats();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
