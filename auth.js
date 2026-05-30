/* ══════════════════════════════════════════════
   CREATE VYRAL — AUTH PAGE LOGIC
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* Redirect if already logged in */
  if (CV.auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  /* ── Read plan + tab from URL ── */
  const params = new URLSearchParams(window.location.search);
  const urlPlan = (params.get('plan') || 'GROWTH').toUpperCase();
  const urlTab  = params.get('tab') || 'signup';

  const PLAN_PRICES = { SPARK:'₹6,999', GROWTH:'₹13,999', PRO:'₹26,999', ELITE:'Custom' };
  const PLAN_LABELS = { SPARK:'SPARK', GROWTH:'GROWTH', PRO:'PRO', ELITE:'ELITE' };

  /* Update left panel */
  const apName  = document.getElementById('apName');
  const apPrice = document.getElementById('apPrice');
  if (apName)  apName.textContent  = PLAN_LABELS[urlPlan] || 'GROWTH';
  if (apPrice) apPrice.innerHTML   = (PLAN_PRICES[urlPlan] || '₹13,999') + '<span>/month</span>';

  /* Pre-select plan radio */
  const planRadio = document.querySelector(`.plan-opt input[value="${urlPlan}"]`);
  if (planRadio) planRadio.checked = true;

  /* ── Tab switching ── */
  const tabSignup  = document.getElementById('tabSignup');
  const tabLogin   = document.getElementById('tabLogin');
  const signupForm = document.getElementById('signupForm');
  const loginForm  = document.getElementById('loginForm');

  function showTab(tab) {
    if (tab === 'signup') {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    } else {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    }
  }

  tabSignup.addEventListener('click', () => showTab('signup'));
  tabLogin.addEventListener('click',  () => showTab('login'));
  document.getElementById('switchToSignup')?.addEventListener('click', e => { e.preventDefault(); showTab('signup'); });

  /* Auto-switch to login tab if ?tab=login in URL */
  if (urlTab === 'login') showTab('login');

  /* ── Password visibility toggles ── */
  document.getElementById('eyeBtn')?.addEventListener('click', () => {
    const inp = document.getElementById('su-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('eyeBtn2')?.addEventListener('click', () => {
    const inp = document.getElementById('li-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  /* ── Signup submit ── */
  document.getElementById('signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const errEl = document.getElementById('signupError');
    const btn   = document.getElementById('signupBtn');
    const btnTxt= document.getElementById('signupBtnText');

    const name      = document.getElementById('su-name').value.trim();
    const email     = document.getElementById('su-email').value.trim();
    const password  = document.getElementById('su-password').value;
    const platform  = document.getElementById('su-platform').value;
    const followers = document.getElementById('su-followers').value;
    const language  = document.getElementById('su-language').value;
    const planRadioChecked = document.querySelector('input[name="plan"]:checked');
    const plan      = planRadioChecked ? planRadioChecked.value : urlPlan;

    /* Basic validation */
    if (!name || !email || !password || !platform || !followers || !language || !plan) {
      errEl.textContent = 'Please fill in all fields.';
      errEl.classList.add('visible'); return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.classList.add('visible'); return;
    }

    errEl.classList.remove('visible');
    btn.disabled = true;
    btnTxt.textContent = 'Creating your account...';

    setTimeout(() => {
      const result = CV.auth.signup(name, email, password, platform, followers, language, plan);
      if (!result.ok) {
        errEl.textContent = result.error;
        errEl.classList.add('visible');
        btn.disabled = false;
        btnTxt.textContent = 'Create My Account';
      } else {
        btnTxt.textContent = '✓ Account created! Loading dashboard...';
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      }
    }, 600);
  });

  /* ── Login submit ── */
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const errEl = document.getElementById('loginError');
    const btn   = document.getElementById('loginBtn');
    const btnTxt= document.getElementById('loginBtnText');

    const email    = document.getElementById('li-email').value.trim();
    const password = document.getElementById('li-password').value;

    /* Immediate empty-field validation */
    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      errEl.classList.add('visible');
      return;
    }

    errEl.classList.remove('visible');
    btn.disabled = true;
    btnTxt.textContent = 'Signing in...';

    setTimeout(() => {
      const result = CV.auth.login(email, password);
      if (!result.ok) {
        errEl.textContent = result.error;
        errEl.classList.add('visible');
        btn.disabled = false;
        btnTxt.textContent = 'Sign In to Dashboard';
      } else {
        btnTxt.textContent = '✓ Welcome back! Loading dashboard...';
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      }
    }, 500);
  });

  /* ── Demo login ── */
  document.getElementById('demoLogin')?.addEventListener('click', e => {
    e.preventDefault();
    /* Create demo account if not exists, then login */
    const demoEmail = 'demo@createvyral.in';
    const demoPass  = 'demo123';

    let result = CV.auth.login(demoEmail, demoPass);
    if (!result.ok) {
      result = CV.auth.signup('Priya Krishnan', demoEmail, demoPass, 'YouTube + Instagram', '50K – 150K', 'Tamil', 'GROWTH');
    }
    if (result.ok) {
      window.location.href = 'dashboard.html';
    }
  });
});
