/* ===========================================================
   EVENTIFY — home.js (index.html only)
=========================================================== */
(function(){
  'use strict';
  const E = window.Eventify;
  const events = E.getEvents();

  let activeCategory = 'All';
  let searchTerm = '';
  let cityTerm = '';
  let sortMode = 'soon';
  let selectedTier = 'general';
  let ticketQty = 1;
  let currentEvent = null;
  let myTickets = E.loadTickets();
  let alertedScarceIds = new Set();

  /* ---------- Hero stats ---------- */
  function renderStats(){
    const totalGoing = events.reduce((s,e)=> s + e.seatsTaken, 0);
    const cities = new Set(events.map(e=>e.city)).size;
    animateNumber('statEvents', events.length);
    animateNumber('statAttendees', totalGoing);
    animateNumber('statCities', cities);
  }
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

  /* ---------- Featured hero stub ---------- */
  function renderFeaturedStub(){
    const e = events.slice().sort((a,b)=> b.viewers - a.viewers)[0];
    const el = document.getElementById('featuredStub');
    el.innerHTML = `
      <div style="height:150px;background:${e.gradient};position:relative;">
        <div style="position:absolute;top:14px;left:14px;font-family:var(--font-mono);font-size:11px;background:rgba(255,77,109,.9);color:#fff;padding:4px 9px;border-radius:999px;display:flex;align-items:center;gap:5px;">
          <span style="width:5px;height:5px;border-radius:50%;background:#fff;"></span> LIVE · ${e.viewers} viewing
        </div>
        <div style="position:absolute;bottom:14px;left:14px;font-family:var(--font-mono);font-size:11px;background:rgba(18,16,28,.55);color:#fff;padding:4px 9px;border-radius:999px;">${E.CATEGORY_ICONS[e.category]} ${e.category}</div>
      </div>
      <div class="perforated" style="padding:20px;">
        <p style="font-family:var(--font-mono);color:var(--gold);font-size:12px;margin-bottom:6px;">${e.date} · ${e.time}</p>
        <h3 style="font-family:var(--font-body);text-transform:none;font-size:19px;font-weight:800;margin-bottom:4px;">${e.title}</h3>
        <p style="color:var(--text-faint);font-size:13px;margin-bottom:16px;">${e.venue}, ${e.city}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:var(--font-mono);font-weight:700;">${E.fmtMoney(e.general)}</span>
          <button class="btn btn--primary btn--sm" data-open="${e.id}">Get ticket</button>
        </div>
      </div>
      <div class="barcode" style="margin:0 20px 18px;"></div>
    `;
    el.querySelector('[data-open]').addEventListener('click', ()=> openModal(e.id));
  }

  /* ---------- Ticker ---------- */
  const TICKER_VERBS = ['just booked a seat for','RSVP\'d to','grabbed a VIP pass for','joined the waitlist for'];
  function renderTicker(){
    const names = ['Aarav','Diya','Kabir','Meera','Rohan','Isha','Vivaan','Anaya','Kunal','Sara','Yash','Tara'];
    const items = [];
    for(let i=0;i<14;i++){
      const e = events[Math.floor(Math.random()*events.length)];
      const n = names[Math.floor(Math.random()*names.length)];
      const v = TICKER_VERBS[Math.floor(Math.random()*TICKER_VERBS.length)];
      items.push(`<span class="ticker__item"><span class="dot"></span>${n} ${v} <strong>${e.title}</strong></span>`);
    }
    document.getElementById('tickerTrack').innerHTML = items.join('');
  }

  /* ---------- Categories ---------- */
  function renderCategories(){
    const cats = ['All', ...new Set(events.map(e=>e.category))];
    const row = document.getElementById('categoryRow');
    row.innerHTML = cats.map(c => `
      <button class="pill ${c===activeCategory ? 'is-active':''}" data-cat="${c}">
        ${c==='All' ? '✨' : E.CATEGORY_ICONS[c] || ''} ${c}
      </button>
    `).join('');
    row.querySelectorAll('[data-cat]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeCategory = btn.dataset.cat;
        renderCategories();
        renderGrid();
      });
    });
  }

  /* ---------- Event grid ---------- */
  function getFilteredEvents(){
    let list = events.filter(e=>{
      const matchesCat = activeCategory === 'All' || e.category === activeCategory;
      const matchesSearch = !searchTerm || e.title.toLowerCase().includes(searchTerm) || e.category.toLowerCase().includes(searchTerm);
      const matchesCity = !cityTerm || e.city.toLowerCase().includes(cityTerm);
      return matchesCat && matchesSearch && matchesCity;
    });
    switch(sortMode){
      case 'popular': list.sort((a,b)=> b.seatsTaken - a.seatsTaken); break;
      case 'price-low': list.sort((a,b)=> a.general - b.general); break;
      case 'price-high': list.sort((a,b)=> b.general - a.general); break;
      default: list.sort((a,b)=> a.date.localeCompare(b.date));
    }
    return list;
  }

  function renderGrid(){
    const grid = document.getElementById('eventGrid');
    const list = getFilteredEvents();
    if(!list.length){
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state__mark">🔍</div>
        <p>No events match that search. Try a different keyword or category.</p>
      </div>`;
      return;
    }
    grid.innerHTML = list.map(e => `
      <article class="event-card" data-id="${e.id}">
        <div class="event-card__banner" style="background:${e.gradient};">
          <span class="event-card__tag">${E.CATEGORY_ICONS[e.category]} ${e.category}</span>
          ${e.viewers > 400 ? `<span class="event-card__live"><span class="dot"></span>HOT</span>` : ''}
        </div>
        <div class="event-card__body perforated">
          <span class="event-card__date">${e.date} · ${e.time}</span>
          <h3 class="event-card__title">${e.title}</h3>
          <span class="event-card__venue">${e.venue}, ${e.city}</span>
          <div class="seats-bar"><div class="seats-bar__fill" style="width:${E.seatsPct(e)}%;"></div></div>
          <div class="seats-label"><span>${E.seatsLeft(e)} left</span><span>${e.seatsTaken} going</span></div>
        </div>
        <div class="event-card__footer">
          <span class="event-card__price">${E.fmtMoney(e.general)} <span>${e.isFree ? '· RSVP' : 'onwards'}</span></span>
          <button class="btn btn--ghost btn--sm" data-open="${e.id}">${e.isFree ? 'RSVP' : 'View'}</button>
        </div>
      </article>
    `).join('');
    grid.querySelectorAll('.event-card').forEach(card=>{
      card.addEventListener('click', ()=> openModal(card.dataset.id));
    });
  }

  /* ---------- My tickets ---------- */
  function renderMyTickets(){
    const grid = document.getElementById('myTicketsGrid');
    const empty = document.getElementById('myTicketsEmpty');
    if(!myTickets.length){
      grid.innerHTML = '';
      grid.appendChild(empty);
      return;
    }
    grid.innerHTML = myTickets.slice().reverse().map(t => `
      <div class="mini-ticket perforated">
        <div class="mini-ticket__top">
          <div>
            <div class="mini-ticket__title">${t.title}</div>
            <div class="mini-ticket__meta">${t.date} · ${t.venue}, ${t.city}</div>
          </div>
          <span class="mini-ticket__tier">${t.tier} ×${t.qty}</span>
        </div>
        <div class="mini-ticket__id">${t.ticketId}</div>
        <div class="barcode"></div>
      </div>
    `).join('');
  }

  /* ---------- Modal / booking flow ---------- */
  function openModal(id){
    currentEvent = events.find(e => e.id === id);
    if(!currentEvent) return;
    selectedTier = 'general';
    ticketQty = 1;
    renderModalBooking();
    document.getElementById('modalOverlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    document.getElementById('modalOverlay').classList.remove('is-open');
    document.body.style.overflow = '';
    currentEvent = null;
  }

  function renderModalBooking(){
    const e = currentEvent;
    const tierPrice = selectedTier === 'general' ? e.general : e.vip;
    const total = tierPrice * ticketQty;
    document.getElementById('modalBody').innerHTML = `
      <div class="modal__banner" style="background:${e.gradient};"></div>
      <div class="modal__content">
        <h3 class="modal__title">${e.title}</h3>
        <div class="modal__meta-row">
          <span>📅 ${e.date} · ${e.time}</span>
          <span>📍 ${e.venue}, ${e.city}</span>
          <span>${E.CATEGORY_ICONS[e.category]} ${e.category}</span>
        </div>
        <p class="modal__desc">${e.desc}</p>

        <div class="modal__live-count">
          <span>Watching live right now</span>
          <strong id="liveViewers">${e.viewers}</strong>
        </div>

        ${e.isFree ? `
          <div class="tier-list">
            <div class="tier is-selected">
              <div>
                <div class="tier__label">Free RSVP</div>
                <div class="tier__price">${E.seatsLeft(e)} spots left</div>
              </div>
              <div class="tier__radio"></div>
            </div>
          </div>
        ` : `
          <div class="tier-list" id="tierList">
            <div class="tier ${selectedTier==='general'?'is-selected':''}" data-tier="general">
              <div><div class="tier__label">General</div><div class="tier__price">Standing / open seating</div></div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span class="tier__price">${E.fmtMoney(e.general)}</span>
                <div class="tier__radio"></div>
              </div>
            </div>
            <div class="tier ${selectedTier==='vip'?'is-selected':''}" data-tier="vip">
              <div><div class="tier__label">VIP</div><div class="tier__price">Front section + fast entry</div></div>
              <div style="display:flex;align-items:center;gap:12px;">
                <span class="tier__price">${E.fmtMoney(e.vip)}</span>
                <div class="tier__radio"></div>
              </div>
            </div>
          </div>
        `}

        <div class="stepper">
          <span style="font-size:13px;color:var(--text-dim);">Quantity</span>
          <button class="stepper__btn" id="qtyMinus">–</button>
          <span class="stepper__count" id="qtyCount">${ticketQty}</span>
          <button class="stepper__btn" id="qtyPlus">+</button>
        </div>

        <div class="modal__total">
          <span>Total</span>
          <strong>${e.isFree ? 'Free' : E.fmtMoney(total)}</strong>
        </div>

        <button class="btn btn--primary btn--block" id="confirmBtn">
          ${e.isFree ? 'Confirm RSVP' : 'Book tickets'}
        </button>
      </div>
    `;

    document.querySelectorAll('#tierList .tier').forEach(t=>{
      t.addEventListener('click', ()=>{ selectedTier = t.dataset.tier; renderModalBooking(); });
    });
    const qm = document.getElementById('qtyMinus');
    const qp = document.getElementById('qtyPlus');
    if(qm) qm.addEventListener('click', ()=>{ if(ticketQty>1){ ticketQty--; renderModalBooking(); } });
    if(qp) qp.addEventListener('click', ()=>{ if(ticketQty<8){ ticketQty++; renderModalBooking(); } });
    document.getElementById('confirmBtn').addEventListener('click', confirmBooking);
  }

  function confirmBooking(){
    const e = currentEvent;
    if(E.seatsLeft(e) <= 0){ E.showToast('Sorry — that event just sold out.'); return; }

    e.seatsTaken = Math.min(e.seatsTotal, e.seatsTaken + ticketQty);
    const ticket = {
      ticketId: E.genTicketId(),
      eventId: e.id,
      title: e.title,
      date: e.date + ' · ' + e.time,
      venue: e.venue,
      city: e.city,
      tier: e.isFree ? 'RSVP' : (selectedTier === 'general' ? 'General' : 'VIP'),
      qty: ticketQty
    };
    myTickets.push(ticket);
    E.saveTickets(myTickets);
    renderMyTickets();
    renderGrid();

    document.getElementById('modalBody').innerHTML = `
      <div class="modal__content modal__success">
        <div class="mark">🎉</div>
        <h3>${e.isFree ? "You're on the list" : 'Tickets confirmed'}</h3>
        <p>${ticket.ticketId} · ${e.title} · ${ticket.qty} ${ticket.qty>1?'passes':'pass'}</p>
        <div class="mini-ticket perforated" style="text-align:left;margin-bottom:22px;">
          <div class="mini-ticket__top">
            <div>
              <div class="mini-ticket__title">${e.title}</div>
              <div class="mini-ticket__meta">${e.date} · ${e.venue}, ${e.city}</div>
            </div>
            <span class="mini-ticket__tier">${ticket.tier} ×${ticket.qty}</span>
          </div>
          <div class="mini-ticket__id">${ticket.ticketId}</div>
          <div class="barcode"></div>
        </div>
        <button class="btn btn--primary btn--block" id="doneBtn">Done</button>
      </div>
    `;
    document.getElementById('doneBtn').addEventListener('click', closeModal);
    E.showToast(`${e.isFree ? 'RSVP confirmed for' : 'Booked'} ${e.title}`);
  }

  /* ---------- Simulated live updates ---------- */
  function simulateLiveTick(){
    const bumpedIds = [];
    const bumpCount = Math.min(4, events.length);
    for(let i=0;i<bumpCount;i++){
      const e = events[Math.floor(Math.random()*events.length)];
      if(E.seatsLeft(e) > 0){
        const inc = Math.floor(Math.random()*8) + 3;
        e.seatsTaken = Math.min(e.seatsTotal, e.seatsTaken + inc);
        bumpedIds.push(e.id);
      }
      e.viewers = Math.max(10, e.viewers + Math.floor(Math.random()*15) - 6);
    }

    renderGrid();
    renderStats();
    flashUpdatedCards(bumpedIds);

    if(currentEvent){
      const el = document.getElementById('liveViewers');
      if(el) el.textContent = currentEvent.viewers;
    }

    events.forEach(e=>{
      const left = E.seatsLeft(e);
      if(left > 0 && left <= 20 && !alertedScarceIds.has(e.id)){
        alertedScarceIds.add(e.id);
        E.showToast(`Only ${left} seats left for ${e.title}`);
      }
      if(left === 0 && !alertedScarceIds.has(e.id + '-soldout')){
        alertedScarceIds.add(e.id + '-soldout');
        E.showToast(`${e.title} just sold out`);
      }
    });
  }

  function flashUpdatedCards(ids){
    ids.forEach(id=>{
      const card = document.querySelector(`.event-card[data-id="${id}"]`);
      if(card){
        card.classList.remove('is-live-updated');
        void card.offsetWidth;
        card.classList.add('is-live-updated');
      }
    });
  }

  /* ---------- Wiring ---------- */
  function wireControls(){
    
    document.getElementById('sortSelect').addEventListener('change', (ev)=>{
      sortMode = ev.target.value;
      renderGrid();
    });
    document.getElementById('newsletterForm').addEventListener('submit', (ev)=>{
      ev.preventDefault();
      ev.target.reset();
      E.showToast('You\'re subscribed — first drop lands next Monday.');
    });
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (ev)=>{
      if(ev.target.id === 'modalOverlay') closeModal();
    });
    document.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Escape') closeModal();
    });
  }

  function init(){
    E.initNavAuth();
    renderStats();
    renderFeaturedStub();
    renderTicker();
    renderCategories();
    renderGrid();
    renderMyTickets();
    wireControls();
    setInterval(simulateLiveTick, 4000);
    setInterval(renderTicker, 20000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
