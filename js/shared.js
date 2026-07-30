/* ===========================================================
   EVENTIFY — shared.js
   Data, storage, auth and helpers shared across every page.
   Exposes a single window.Eventify namespace.
=========================================================== */
(function(){
  'use strict';

  const CATEGORY_ICONS = {
    Music:'🎵', Tech:'💻', Comedy:'🎤', Sports:'🏟', Arts:'🎨', Food:'🍜'
  };

  const GRADIENTS = [
    'linear-gradient(135deg,#3A2E7A,#8C6CFF)',
    'linear-gradient(135deg,#7A2E4D,#FF4D6D)',
    'linear-gradient(135deg,#2E5C7A,#3DDC84)',
    'linear-gradient(135deg,#7A5A2E,#FFB238)',
    'linear-gradient(135deg,#4A2E7A,#B9A6FF)',
    'linear-gradient(135deg,#2E7A6C,#3DDC84)'
  ];

  function mk(title,cat,city,date,time,venue,gPrice,vPrice,seats,taken,viewers){
    return {
      id: 'EVT-' + Math.random().toString(36).slice(2,8).toUpperCase(),
      title, category:cat, city, date, time, venue,
      gradient: GRADIENTS[Math.floor(Math.random()*GRADIENTS.length)],
      general: gPrice, vip: vPrice,
      seatsTotal: seats, seatsTaken: taken,
      viewers,
      isFree: gPrice === 0 && vPrice === 0,
      desc: `Doors open 45 minutes before showtime. ${title} brings the ${cat.toLowerCase()} community together for an evening built around one thing: showing up. Expect a live, unfiltered crowd and moments worth telling people about after.`
    };
  }

  function mkHosted(data){
    return {
      id: 'EVT-' + Math.random().toString(36).slice(2,8).toUpperCase(),
      title: data.title,
      category: data.category,
      city: data.city,
      date: data.date,
      time: data.time,
      venue: data.venue,
      gradient: data.gradient,
      general: data.isFree ? 0 : data.general,
      vip: data.isFree ? 0 : data.vip,
      seatsTotal: data.capacity,
      seatsTaken: 0,
      viewers: Math.floor(Math.random()*40) + 8,
      isFree: data.isFree,
      desc: data.desc || `Doors open shortly before showtime. Hosted on Eventify — capacity ${data.capacity}.`,
      hostedBy: data.hostedBy || 'Guest host',
      isHosted: true
    };
  }

  /* ---------- Storage ---------- */
  function loadHostedEvents(){
    try{ return JSON.parse(localStorage.getItem('eventify_hosted_events') || '[]'); }
    catch(e){ return []; }
  }
  function saveHostedEvents(list){
    localStorage.setItem('eventify_hosted_events', JSON.stringify(list));
  }
  function loadTickets(){
    try{ return JSON.parse(localStorage.getItem('eventify_tickets') || '[]'); }
    catch(e){ return []; }
  }
  function saveTickets(list){
    localStorage.setItem('eventify_tickets', JSON.stringify(list));
  }
  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem('eventify_users') || '[]'); }
    catch(e){ return []; }
  }
  function saveUsers(list){
    localStorage.setItem('eventify_users', JSON.stringify(list));
  }
  function loadSession(){
    try{ return JSON.parse(localStorage.getItem('eventify_session') || 'null'); }
    catch(e){ return null; }
  }
  function saveSession(user){
    if(user){ localStorage.setItem('eventify_session', JSON.stringify(user)); }
    else{ localStorage.removeItem('eventify_session'); }
  }
  // NOTE: this is a client-side demo — passwords are obfuscated, not securely
  // hashed. Swap in real auth (bcrypt + a backend) before this touches production.
  function obfuscate(str){
    let out = '';
    for(let i=0;i<str.length;i++){ out += str.charCodeAt(i).toString(16).padStart(2,'0'); }
    return out;
  }

  /* ---------- Live event data (seed + anything hosted previously) ---------- */
  let events = [
    mk('Nightwave: Neon Sessions','Music','Mumbai','Aug 02','8:00 PM','Marine Drive Amphitheatre',899,2299,420,68,1204),
    mk('DevConf: Systems at Scale','Tech','Bengaluru','Aug 09','9:30 AM','Bengaluru Convention Centre',0,1499,300,142,890),
    mk('Open Mic Riot','Comedy','Delhi','Jul 27','7:30 PM','Laugh Loft, CP',349,699,150,23,301),
    mk('Street Ball Championship','Sports','Pune','Aug 14','5:00 PM','FC Road Grounds',199,499,500,310,670),
    mk('Canvas & Chai: Art Walk','Arts','Jaipur','Jul 31','4:00 PM','Old City Art District',0,299,120,44,210),
    mk('Midnight Ramen Festival','Food','Delhi','Aug 05','6:00 PM','Hauz Khas Village',249,599,250,180,540),
    mk('Indie Coders Meetup','Tech','Mumbai','Jul 29','6:30 PM','WeWork BKC',0,0,80,61,145),
    mk('Bassline Bhangra Night','Music','Chandigarh','Aug 16','9:00 PM','Sector 17 Grounds',599,1299,600,95,980),
    mk('Standup Showdown Finals','Comedy','Bengaluru','Aug 21','8:00 PM','Good Shepherd Auditorium',449,999,200,150,410),
    mk('Weekend Football League','Sports','Delhi','Aug 03','7:00 AM','Yamuna Sports Complex',0,349,100,20,95),
    mk('Miniature Art Expo','Arts','Jaipur','Aug 11','11:00 AM','Jawahar Kala Kendra',149,399,180,30,120),
    mk('Rooftop Grill & Chill','Food','Mumbai','Aug 08','6:00 PM','Bandra Rooftop Lounge',699,1199,90,72,260)
  ];
  events = events.concat(loadHostedEvents());

  function addHostedEvent(data){
    const newEvent = mkHosted(data);
    events.unshift(newEvent);
    const hosted = loadHostedEvents();
    hosted.unshift(newEvent);
    saveHostedEvents(hosted);
    return newEvent;
  }

  /* ---------- Helpers ---------- */
  function fmtMoney(n){ return n === 0 ? 'Free' : '₹' + n.toLocaleString('en-IN'); }
  function seatsLeft(e){ return Math.max(e.seatsTotal - e.seatsTaken, 0); }
  function seatsPct(e){ return Math.min(100, Math.round((e.seatsTaken / e.seatsTotal) * 100)); }
  function genTicketId(){ return 'TKT-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' + Math.random().toString(36).slice(2,5).toUpperCase(); }
  function initials(name){ return name.trim().split(/\s+/).slice(0,2).map(p=>p[0].toUpperCase()).join(''); }
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function formatDateDisplay(isoDate){
    if(!isoDate) return 'TBA';
    const d = new Date(isoDate + 'T00:00:00');
    if(isNaN(d)) return isoDate;
    return d.toLocaleDateString('en-US', { month:'short', day:'2-digit' });
  }
  function formatTimeDisplay(t24){
    if(!t24) return 'TBA';
    const [h,m] = t24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h % 12) || 12);
    return `${h12}:${String(m).padStart(2,'0')} ${period}`;
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    if(!t) return;
    t.innerHTML = '<span class="dot"></span>' + msg;
    t.classList.add('is-visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(()=> t.classList.remove('is-visible'), 3200);
  }

  /* ---------- Auth ---------- */
  let currentUser = loadSession();

  function getUser(){ return currentUser; }
  function isLoggedIn(){ return !!currentUser; }

  function login(email, password){
    email = (email || '').trim().toLowerCase();
    if(!isValidEmail(email)) return { success:false, field:'email', message:'Enter a valid email address.' };
    if(!password || password.length < 6) return { success:false, field:'password', message:'Password must be at least 6 characters.' };
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if(!user || user.password !== obfuscate(password)){
      return { success:false, field:'email', message:'No match for that email and password.' };
    }
    currentUser = { name:user.name, email:user.email };
    saveSession(currentUser);
    return { success:true, user:currentUser };
  }

  function signup(name, email, password){
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    if(name.length < 2) return { success:false, field:'name', message:'Enter your name to continue.' };
    if(!isValidEmail(email)) return { success:false, field:'email', message:'Enter a valid email address.' };
    if(!password || password.length < 6) return { success:false, field:'password', message:'Password must be at least 6 characters.' };
    const users = loadUsers();
    if(users.some(u => u.email === email)){
      return { success:false, field:'email', message:'An account with this email already exists.' };
    }
    const newUser = { name, email, password: obfuscate(password), joined: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    currentUser = { name:newUser.name, email:newUser.email };
    saveSession(currentUser);
    return { success:true, user:currentUser };
  }

  function logout(){
    currentUser = null;
    saveSession(null);
  }

  /* ---------- Nav auth UI (shared markup across every page) ---------- */
  function initNavAuth(){
    const chip = document.getElementById('userChip');
    const signInBtn = document.getElementById('signInBtn');
    if(currentUser){
      if(chip){ chip.hidden = false; chip.style.display = ''; }
      if(signInBtn){ signInBtn.hidden = true; signInBtn.style.display = 'none'; }
      const avatar = document.getElementById('userAvatar');
      const name = document.getElementById('userName');
      if(avatar) avatar.textContent = initials(currentUser.name);
      if(name) name.textContent = currentUser.name.split(' ')[0];
    }else{
      if(chip){ chip.hidden = true; chip.style.display = 'none'; }
      if(signInBtn){ signInBtn.hidden = false; signInBtn.style.display = ''; }
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        logout();
        showToast('Signed out. Your booked tickets are still saved on this device.');
        initNavAuth();
      });
    }
    const burger = document.getElementById('navBurger');
    if(burger){
      burger.addEventListener('click', ()=>{
        const links = document.querySelector('.nav__links');
        if(links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      });
    }
  }

  window.Eventify = {
    CATEGORY_ICONS, GRADIENTS,
    getEvents: () => events,
    addHostedEvent,
    fmtMoney, seatsLeft, seatsPct, genTicketId, initials, isValidEmail,
    formatDateDisplay, formatTimeDisplay,
    showToast,
    loadTickets, saveTickets,
    getUser, isLoggedIn, login, signup, logout,
    initNavAuth
  };
})();
