/* ===========================================================
   EVENTIFY — host.js (host.html only)
=========================================================== */
(function(){
  'use strict';
  const E = window.Eventify;
  let hSelectedGradient = E.GRADIENTS[0];

  /* ---------- Gate: must be signed in to host ---------- */
  function renderGate(){
    document.getElementById('hostArea').innerHTML = `
      <div class="host-gate">
        <div class="host-gate__mark">🔒</div>
        <h3>Sign in to host an event</h3>
        <p>Publishing takes a few seconds once you're signed in — your event goes straight into Discover.</p>
        <a class="btn btn--primary" href="login.html?redirect=host.html">Sign in to continue</a>
      </div>
    `;
  }

  /* ---------- Form ---------- */
  function renderForm(){
    document.getElementById('hostArea').innerHTML = `
      <div class="host__layout">
        <form class="host__form" id="hostForm" novalidate>

          <div class="field">
            <label for="hTitle">Event title</label>
            <input type="text" id="hTitle" placeholder="e.g. Rooftop Jazz Night" maxlength="60">
            <div class="field__error" id="hErrTitle">Give your event a name.</div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="hCategory">Category</label>
              <select id="hCategory">
                <option value="Music">🎵 Music</option>
                <option value="Tech">💻 Tech</option>
                <option value="Comedy">🎤 Comedy</option>
                <option value="Sports">🏟 Sports</option>
                <option value="Arts">🎨 Arts</option>
                <option value="Food">🍜 Food</option>
              </select>
            </div>
            <div class="field">
              <label for="hCapacity">Capacity</label>
              <input type="number" id="hCapacity" placeholder="150" min="1" max="20000">
              <div class="field__error" id="hErrCapacity">Enter a capacity of at least 1.</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="hDate">Date</label>
              <input type="date" id="hDate">
              <div class="field__error" id="hErrDate">Pick a date.</div>
            </div>
            <div class="field">
              <label for="hTime">Time</label>
              <input type="time" id="hTime">
              <div class="field__error" id="hErrTime">Pick a start time.</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="hVenue">Venue</label>
              <input type="text" id="hVenue" placeholder="e.g. Skyline Lounge">
              <div class="field__error" id="hErrVenue">Add a venue name.</div>
            </div>
            <div class="field">
              <label for="hCity">City</label>
              <input type="text" id="hCity" placeholder="e.g. Mumbai">
              <div class="field__error" id="hErrCity">Add a city.</div>
            </div>
          </div>

          <div class="field">
            <label for="hDesc">Description</label>
            <textarea id="hDesc" rows="3" placeholder="What should people expect?" maxlength="280"></textarea>
          </div>

          <div class="field">
            <label class="toggle-row">
              <input type="checkbox" id="hFree">
              <span>This is a free event (RSVP only, no tickets)</span>
            </label>
          </div>

          <div class="field-row" id="hPriceRow">
            <div class="field">
              <label for="hPriceGeneral">General price (₹)</label>
              <input type="number" id="hPriceGeneral" placeholder="499" min="0">
            </div>
            <div class="field">
              <label for="hPriceVip">VIP price (₹)</label>
              <input type="number" id="hPriceVip" placeholder="999" min="0">
            </div>
          </div>

          <div class="field">
            <label>Banner style</label>
            <div class="swatch-row" id="hSwatchRow"></div>
          </div>

          <button type="submit" class="btn btn--primary btn--block" id="hostSubmitBtn">Publish event</button>
          <p class="host__note" id="hostAuthNote"></p>
        </form>

        <div class="host__preview">
          <span class="host__preview-label">Live preview</span>
          <article class="ticket-stub host__stub" id="hostStubPreview"></article>
        </div>
      </div>
    `;

    renderSwatches();
    updatePreview();
    const form = document.getElementById('hostForm');
    form.addEventListener('input', updatePreview);
    form.addEventListener('submit', handleSubmit);
    document.getElementById('hFree').addEventListener('change', (ev)=>{
      document.getElementById('hPriceRow').style.display = ev.target.checked ? 'none' : '';
      updatePreview();
    });
  }

  function renderSwatches(){
    const row = document.getElementById('hSwatchRow');
    row.innerHTML = E.GRADIENTS.map((g,i) => `
      <button type="button" class="swatch ${g===hSelectedGradient ? 'is-selected':''}" style="background:${g};" data-gradient="${i}" aria-label="Banner style ${i+1}"></button>
    `).join('');
    row.querySelectorAll('.swatch').forEach(sw=>{
      sw.addEventListener('click', ()=>{
        hSelectedGradient = E.GRADIENTS[Number(sw.dataset.gradient)];
        renderSwatches();
        updatePreview();
      });
    });
  }

  function readForm(){
    return {
      title: document.getElementById('hTitle').value.trim(),
      category: document.getElementById('hCategory').value,
      capacity: parseInt(document.getElementById('hCapacity').value, 10),
      date: document.getElementById('hDate').value,
      time: document.getElementById('hTime').value,
      venue: document.getElementById('hVenue').value.trim(),
      city: document.getElementById('hCity').value.trim(),
      desc: document.getElementById('hDesc').value.trim(),
      isFree: document.getElementById('hFree').checked,
      general: parseInt(document.getElementById('hPriceGeneral').value, 10) || 0,
      vip: parseInt(document.getElementById('hPriceVip').value, 10) || 0
    };
  }

  function updatePreview(){
    const f = readForm();
    const title = f.title || 'Your event title';
    const dateStr = f.date ? E.formatDateDisplay(f.date) : 'Date';
    const timeStr = f.time ? E.formatTimeDisplay(f.time) : 'Time';
    const venueStr = (f.venue || 'Venue') + (f.city ? ', ' + f.city : '');
    const priceStr = f.isFree ? 'Free · RSVP' : E.fmtMoney(f.general || 0);
    document.getElementById('hostStubPreview').innerHTML = `
      <div style="height:150px;background:${hSelectedGradient};position:relative;">
        <div style="position:absolute;bottom:14px;left:14px;font-family:var(--font-mono);font-size:11px;background:rgba(18,16,28,.55);color:#fff;padding:4px 9px;border-radius:999px;">${E.CATEGORY_ICONS[f.category] || '🎫'} ${f.category || 'Category'}</div>
      </div>
      <div class="perforated" style="padding:20px;">
        <p style="font-family:var(--font-mono);color:var(--gold);font-size:12px;margin-bottom:6px;">${dateStr} · ${timeStr}</p>
        <h3 style="font-family:var(--font-body);text-transform:none;font-size:19px;font-weight:800;margin-bottom:4px;">${title}</h3>
        <p style="color:var(--text-faint);font-size:13px;margin-bottom:16px;">${venueStr}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:var(--font-mono);font-weight:700;">${priceStr}</span>
          <span style="font-size:11px;color:var(--text-faint);">${f.capacity ? f.capacity + ' cap' : 'Capacity'}</span>
        </div>
      </div>
      <div class="barcode" style="margin:0 20px 18px;"></div>
    `;
  }

  function setFieldError(inputId, errId, hasError){
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if(!input) return;
    input.classList.toggle('has-error', hasError);
    if(err) err.classList.toggle('is-visible', hasError);
  }

  function handleSubmit(ev){
    ev.preventDefault();

    if(!E.isLoggedIn()){
      renderGate();
      return;
    }

    const f = readForm();
    let valid = true;
    setFieldError('hTitle','hErrTitle', !f.title); valid = valid && !!f.title;
    setFieldError('hCapacity','hErrCapacity', !(f.capacity > 0)); valid = valid && f.capacity > 0;
    setFieldError('hDate','hErrDate', !f.date); valid = valid && !!f.date;
    setFieldError('hTime','hErrTime', !f.time); valid = valid && !!f.time;
    setFieldError('hVenue','hErrVenue', !f.venue); valid = valid && !!f.venue;
    setFieldError('hCity','hErrCity', !f.city); valid = valid && !!f.city;
    if(!valid) return;

    const user = E.getUser();
    const newEvent = E.addHostedEvent({
      title: f.title,
      category: f.category,
      city: f.city,
      date: E.formatDateDisplay(f.date),
      time: E.formatTimeDisplay(f.time),
      venue: f.venue,
      gradient: hSelectedGradient,
      isFree: f.isFree,
      general: f.general,
      vip: f.vip,
      capacity: f.capacity,
      desc: f.desc,
      hostedBy: user.name
    });

    renderSuccess(newEvent);
    E.showToast(`Published "${newEvent.title}" — it's live now.`);
  }

  function renderSuccess(newEvent){
    document.getElementById('hostArea').innerHTML = `
      <div class="host-gate">
        <div class="host-gate__mark">🎉</div>
        <h3>"${newEvent.title}" is live</h3>
        <p>It's in the Discover feed now, ready for tickets and RSVPs.</p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <a class="btn btn--primary" href="index.html#discover">View on Discover</a>
          <button class="btn btn--ghost" id="hostAnotherBtn">Host another event</button>
        </div>
      </div>
    `;
    document.getElementById('hostAnotherBtn').addEventListener('click', renderForm);
  }

  function init(){
    E.initNavAuth();
    if(E.isLoggedIn()){
      renderForm();
    }else{
      renderGate();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
