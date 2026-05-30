/* ══════════════════════════════════════════════
   CREATE VYRAL — MAIN SCRIPT
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav: show Dashboard button if already logged in ── */
  (function updateNavForSession() {
    const sessionId = localStorage.getItem('cv_current');
    const loginBtn  = document.querySelector('.nav-login');
    const signupBtn = document.querySelector('.nav-cta');
    if (sessionId && loginBtn && signupBtn) {
      /* Already logged in — replace both buttons with a single Dashboard link */
      loginBtn.style.display = 'none';
      signupBtn.textContent  = 'My Dashboard →';
      signupBtn.href         = 'dashboard.html';
    }
  })();

  /* ── Nav: cream / dark toggle based on section under nav ── */
  const nav = document.getElementById('mainNav');
  function checkNavBg() {
    const mid = nav.getBoundingClientRect().top + nav.getBoundingClientRect().height / 2;
    let onCream = false;
    document.querySelectorAll('.section-cream').forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) onCream = true;
    });
    nav.classList.toggle('on-cream', onCream);
  }
  window.addEventListener('scroll', checkNavBg, { passive: true });
  checkNavBg();

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });

  /* ── Scroll reveal ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Hero reveals on load with stagger
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 100 + i * 160);
    });
  });

  /* ── Blueprint calendar ── */
  const bpGrid = document.getElementById('bpGrid');
  if (bpGrid) {
    const delivered = [2, 7, 12, 18, 23];
    const today = 15;
    for (let d = 1; d <= 31; d++) {
      const cell = document.createElement('div');
      cell.className = 'bp-cell';
      if (delivered.includes(d)) cell.classList.add('filled');
      if (d === today) cell.classList.add('today');
      cell.textContent = d;
      bpGrid.appendChild(cell);
    }
  }

  /* ── Billing toggle ── */
  const toggleBtn   = document.getElementById('billingToggle');
  const lblMonthly  = document.getElementById('lblMonthly');
  const lblAnnual   = document.getElementById('lblAnnual');
  let isAnnual = false;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      toggleBtn.classList.toggle('on', isAnnual);
      lblMonthly.classList.toggle('active', !isAnnual);
      lblAnnual.classList.toggle('active', isAnnual);

      document.querySelectorAll('.tier-price .amount[data-monthly]').forEach(el => {
        const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          el.textContent = '₹' + val;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 200);
      });

      document.querySelectorAll('.annual-price-note').forEach(note => {
        note.textContent = isAnnual ? 'Annual billing · 15% off applied' : '';
      });
    });
  }

  /* ── Plan modal ── */
  const tierData = {
    SPARK: {
      badge: 'Spark Member',
      title: 'Spark',
      sub: "You're in. Your editor is being assigned and your CA onboarding starts now.",
      perks: [
        'Shared editor assigned within 24h',
        'GST + ITR filing activated',
        '1 brand deal per month pipeline opened',
        '1 contract review per month ready'
      ]
    },
    GROWTH: {
      badge: 'Growth Member',
      title: 'Growth',
      sub: "Level up complete. A dedicated editor and full financial coverage — all yours.",
      perks: [
        'Dedicated editor being matched to your style',
        'GST + ITR + TDS filing fully activated',
        'Financial planning call being scheduled',
        '2 brand deals per month pipeline opened'
      ]
    },
    PRO: {
      badge: 'Pro Member',
      title: 'Pro',
      sub: "You're on Pro. Senior editor, full CA suite, unlimited brand scouting. Let's go.",
      perks: [
        'Senior editor assigned — 24h rush turnaround',
        'Full CA + investment planning activated',
        'Unlimited brand scouting started',
        'Monthly strategy call being scheduled'
      ]
    }
  };

  const overlay    = document.getElementById('planModal');
  const modalBadge = document.getElementById('modalBadge');
  const modalTier  = document.getElementById('modalTier');
  const modalSub   = document.getElementById('modalSub');
  const modalPerks = document.getElementById('modalPerks');
  const modalClose = document.getElementById('modalClose');

  function openModal(tier) {
    const d = tierData[tier];
    if (!d) return;
    modalBadge.textContent = d.badge;
    modalTier.textContent  = d.title;
    modalSub.textContent   = d.sub;
    modalPerks.innerHTML   = d.perks.map(p => `<li>${p}</li>`).join('');
    // Wire CTA to auth page with plan
    const cta = document.getElementById('modalCta');
    if (cta) cta.href = `auth.html?plan=${tier.toUpperCase()}`;
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    launchConfetti();
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.tier-cta[data-tier]').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); openModal(btn.dataset.tier); });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay)    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) closeModal();
  });

  /* ── Confetti ── */
  function launchConfetti() {
    const colors = ['#C5FF3E', '#D4FF57', '#F4F1E8', '#8FCB1F', '#C5FF3E'];
    for (let i = 0; i < 48; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.cssText = `
        left:${Math.random() * 100}%;
        top:-20px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay:${Math.random() * 0.4}s;
        animation-duration:${2 + Math.random() * 2}s;
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  /* ── Add annual-price-note placeholders ── */
  document.querySelectorAll('.tier').forEach(tier => {
    const priceBlock = tier.querySelector('.tier-price');
    if (priceBlock && !tier.querySelector('.annual-price-note')) {
      const note = document.createElement('div');
      note.className = 'annual-price-note';
      priceBlock.after(note);
    }
  });

});
