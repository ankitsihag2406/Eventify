/* ===========================================================
   EVENTIFY — auth.js (login.html only)
=========================================================== */
(function(){
  'use strict';
  const E = window.Eventify;
  let mode = 'login';

  function redirectTarget(){
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || 'index.html';
  }

  function render(){
    const isLogin = mode === 'login';
    document.getElementById('authBody').innerHTML = `
      <div class="auth__content">
        <div class="auth__head">
          <div class="mark">🎟</div>
          <h3>${isLogin ? 'Welcome back' : 'Create your account'}</h3>
          <p>${isLogin ? 'Sign in to book faster and track your tickets.' : 'Takes about 20 seconds. No card needed.'}</p>
        </div>

        <div class="auth__tabs">
          <button class="auth__tab ${isLogin ? 'is-active':''}" data-mode="login">Log in</button>
          <button class="auth__tab ${!isLogin ? 'is-active':''}" data-mode="signup">Sign up</button>
        </div>

        <form id="authForm" novalidate>
          ${!isLogin ? `
            <div class="field">
              <label for="authName">Full name</label>
              <input type="text" id="authName" placeholder="Priya Sharma" autocomplete="name">
              <div class="field__error" id="errName">Enter your name to continue.</div>
            </div>
          ` : ''}
          <div class="field">
            <label for="authEmail">Email</label>
            <input type="email" id="authEmail" placeholder="you@email.com" autocomplete="email">
            <div class="field__error" id="errEmail">Enter a valid email address.</div>
          </div>
          <div class="field">
            <label for="authPassword">Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" autocomplete="${isLogin ? 'current-password' : 'new-password'}">
            <div class="field__error" id="errPassword">Password must be at least 6 characters.</div>
            ${!isLogin ? '<div class="field__hint">Use 6+ characters. This stays on your device only.</div>' : ''}
          </div>

          ${isLogin ? `
            <div class="auth__row">
              <label><input type="checkbox" id="rememberMe" checked> Keep me signed in</label>
              <a href="#" id="forgotLink">Forgot password?</a>
            </div>
          ` : '<div style="height:6px;"></div>'}

          <button type="submit" class="btn btn--primary btn--block">${isLogin ? 'Log in' : 'Create account'}</button>
        </form>

        <div class="auth__switch">
          ${isLogin ? "New to Eventify?" : 'Already have an account?'}
          <button id="switchAuthMode">${isLogin ? 'Sign up' : 'Log in'}</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.auth__tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{ mode = tab.dataset.mode; render(); });
    });
    document.getElementById('switchAuthMode').addEventListener('click', ()=>{
      mode = isLogin ? 'signup' : 'login';
      render();
    });
    const forgot = document.getElementById('forgotLink');
    if(forgot){
      forgot.addEventListener('click', (ev)=>{
        ev.preventDefault();
        E.showToast('Password reset links aren\'t wired up in this demo yet.');
      });
    }
    document.getElementById('authForm').addEventListener('submit', handleSubmit);
  }

  function setFieldError(inputId, errId, hasError, message){
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if(!input) return;
    input.classList.toggle('has-error', hasError);
    if(err){
      err.classList.toggle('is-visible', hasError);
      if(hasError && message) err.textContent = message;
    }
  }

  function handleSubmit(ev){
    ev.preventDefault();
    const isLogin = mode === 'login';
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const nameInput = document.getElementById('authName');
    const name = nameInput ? nameInput.value : '';

    // clear previous errors
    setFieldError('authName','errName', false);
    setFieldError('authEmail','errEmail', false);
    setFieldError('authPassword','errPassword', false);

    const result = isLogin ? E.login(email, password) : E.signup(name, email, password);

    if(!result.success){
      if(result.field === 'name') setFieldError('authName','errName', true, result.message);
      else if(result.field === 'password') setFieldError('authPassword','errPassword', true, result.message);
      else setFieldError('authEmail','errEmail', true, result.message);
      return;
    }

    finishSuccess(isLogin
      ? `Welcome back, ${result.user.name.split(' ')[0]}.`
      : `You're in, ${result.user.name.split(' ')[0]}. Account created.`);
  }

  function finishSuccess(message){
    E.initNavAuth();
    const target = redirectTarget();
    document.getElementById('authBody').innerHTML = `
      <div class="auth__content auth__success">
        <div class="mark">✅</div>
        <h3>${message}</h3>
        <p>Taking you back to Eventify…</p>
        <a class="btn btn--primary btn--block" href="${target}">Continue</a>
      </div>
    `;
    E.showToast(message);
    setTimeout(()=>{ window.location.href = target; }, 1400);
  }

  function init(){
    E.initNavAuth();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
