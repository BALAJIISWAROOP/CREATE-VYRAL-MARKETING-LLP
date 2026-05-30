/* ══════════════════════════════════════════════
   CREATE VYRAL — DASHBOARD LOGIC  (v2 — fully interactive)
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Auth guard ── */
  if (!CV.auth.requireAuth()) return;

  let user = CV.getCurrentUser();
  const fmt = CV.fmt;

  if (!user || !CV.db.getCreatorData()) { CV.auth.logout(); return; }

  /* Always get the freshest snapshot from localStorage */
  const D = () => CV.db.getCreatorData();

  /* ─────────────────────────────────────────
     POPULATE SIDEBAR & TOPBAR
  ───────────────────────────────────────── */
  function populateUserUI() {
    user = CV.getCurrentUser();
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('sbName').textContent    = user.name;
    document.getElementById('sbEmail').textContent   = user.email;
    document.getElementById('sbAvatar').textContent  = initials;
    document.getElementById('tbAvatar').textContent  = initials;
    document.getElementById('sbPlanName').textContent = user.plan;
    document.getElementById('sbPlanIcon').textContent =
      ({ SPARK: '⚡', GROWTH: '🚀', PRO: '👑', ELITE: '💎' })[user.plan] || '🚀';
  }
  populateUserUI();

  function updateBadges() {
    const d = D();
    const inQueue     = d.videos.filter(v => v.status !== 'Delivered').length;
    const dealsLive   = d.deals.filter(x => ['Active','Negotiating','Contract Review'].includes(x.status)).length;
    const pending     = d.contracts.filter(c => c.status === 'Pending Review').length;
    const unread      = d.notifications.filter(n => !n.read).length;

    const sb = (id, n) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = n; el.style.display = n > 0 ? 'flex' : 'none'; }
    };
    sb('videoBadge',    inQueue);
    sb('dealBadge',     dealsLive);
    sb('contractBadge', pending);
    document.getElementById('notifDot').style.display = unread > 0 ? 'block' : 'none';
  }
  updateBadges();

  /* ─────────────────────────────────────────
     MODAL HELPERS
  ───────────────────────────────────────── */
  const openModal  = id => document.getElementById(id)?.classList.remove('hidden');
  const closeModal = id => document.getElementById(id)?.classList.add('hidden');

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
  });

  /* ─────────────────────────────────────────
     SECTION NAVIGATION
  ───────────────────────────────────────── */
  const sectionTitles = {
    overview: 'Overview', videos: 'Videos', finances: 'Finances',
    deals: 'Brand Deals', contracts: 'Contracts',
    analytics: 'Analytics', settings: 'Settings'
  };

  const renderMap = {
    overview:  () => renderOverview(),
    videos:    () => renderVideos(),
    finances:  () => renderFinances(),
    deals:     () => renderDeals(),
    contracts: () => renderContracts(),
    analytics: () => renderAnalytics(),
    settings:  () => renderSettings()
  };

  function goTo(section) {
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    const sec = document.getElementById(`sec-${section}`);
    const lnk = document.querySelector(`.sb-link[data-section="${section}"]`);
    if (sec) sec.classList.add('active');
    if (lnk) lnk.classList.add('active');
    document.getElementById('topbarTitle').textContent = sectionTitles[section] || section;
    closeSidebar();
    if (renderMap[section]) renderMap[section]();
  }

  document.querySelectorAll('.sb-link[data-section]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); goTo(link.dataset.section); });
  });

  /* ─────────────────────────────────────────
     MOBILE SIDEBAR — must be declared before
     handleHashRouting calls goTo/closeSidebar
  ───────────────────────────────────────── */
  const sidebar    = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  function closeSidebar() { sidebar.classList.remove('open'); }

  /* Hash-based deep linking — e.g. dashboard.html#videos from voice-forge.html */
  (function handleHashRouting() {
    const hash = window.location.hash.replace('#', '');
    if (hash && renderMap[hash]) {
      goTo(hash);
    } else {
      goTo('overview');
    }
    // Also check URL param ?section=xxx
    const urlSection = new URLSearchParams(window.location.search).get('section');
    if (urlSection && renderMap[urlSection]) goTo(urlSection);
  })();

  /* ─────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────── */
  document.getElementById('logoutBtn')?.addEventListener('click', CV.auth.logout);
  document.getElementById('settingsLogout')?.addEventListener('click', CV.auth.logout);

  /* ─────────────────────────────────────────
     NOTIFICATIONS PANEL
  ───────────────────────────────────────── */
  const notifPanel = document.getElementById('notifPanel');
  const notifList  = document.getElementById('notifList');

  function renderNotifications() {
    const notes = D().notifications;
    notifList.innerHTML = notes.map(n => `
      <div class="np-item ${n.read ? '' : 'unread'}" data-id="${n.id}" style="cursor:pointer;" title="${n.read ? '' : 'Click to mark as read'}">
        <div class="np-dot ${n.read ? 'read' : ''}"></div>
        <div>
          <div class="np-msg">${n.msg}</div>
          <div class="np-time">${fmt.timeAgo(n.time)}</div>
        </div>
      </div>
    `).join('') || '<div style="padding:20px;text-align:center;color:var(--text-dim);font-size:13px;">All caught up!</div>';

    /* Mark individual notification as read on click */
    notifList.querySelectorAll('.np-item.unread').forEach(item => {
      item.addEventListener('click', () => {
        CV.db.markNotificationRead(item.dataset.id);
        updateBadges();
        renderNotifications();
      });
    });
  }

  document.getElementById('notifBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    notifPanel.classList.toggle('hidden');
    if (!notifPanel.classList.contains('hidden')) renderNotifications();
  });

  document.getElementById('markAllRead')?.addEventListener('click', () => {
    CV.db.markAllRead();
    document.getElementById('notifDot').style.display = 'none';
    renderNotifications();
  });

  document.addEventListener('click', e => {
    if (!notifPanel.contains(e.target) && e.target.id !== 'notifBtn') {
      notifPanel.classList.add('hidden');
    }
  });

  /* ══════════════════════════════════════════════
     SECTION: OVERVIEW
  ══════════════════════════════════════════════ */
  function renderOverview() {
    user = CV.getCurrentUser();
    const d = D();
    const { videos, deals, finances, contracts, activity } = d;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = user.name.split(' ')[0];
    const wbHiEl = document.getElementById('wbHi');
    if (wbHiEl) {
      const nameEl = document.getElementById('wbName');
      if (nameEl) {
        wbHiEl.childNodes[0].textContent = `${greeting}, `;
        nameEl.textContent = firstName;
        // restore emoji after em
        if (!wbHiEl.lastChild || wbHiEl.lastChild.nodeType !== 3) {
          wbHiEl.appendChild(document.createTextNode(' 👋'));
        } else {
          wbHiEl.lastChild.textContent = ' 👋';
        }
      } else {
        wbHiEl.textContent = `${greeting}, ${firstName} 👋`;
      }
    }
    const planInfo = d.plan;
    document.getElementById('wbSub').textContent = `${user.plan} Plan · ${planInfo.videosPerMonth} videos/month · ${planInfo.editorType}`;
    document.getElementById('wbPlan').textContent = user.plan;

    const delivered  = videos.filter(v => v.status === 'Delivered').length;
    const remaining  = Math.max(0, planInfo.videosPerMonth - videos.length);
    const activeD    = deals.filter(x => x.status === 'Active').length;
    const negD       = deals.filter(x => x.status === 'Negotiating').length;

    document.getElementById('statVideos').textContent    = `${videos.length}/${planInfo.videosPerMonth}`;
    document.getElementById('statVideosSub').textContent = `${delivered} delivered · ${remaining} remaining`;
    document.getElementById('statDeals').textContent     = activeD;
    document.getElementById('statDealsSub').textContent  = (activeD === 0 && negD === 0) ? 'Your CA is scouting deals' : `${negD} in negotiation`;
    document.getElementById('statEarnings').textContent  = fmt.currency(finances.earnings.thisMonth);
    document.getElementById('statTax').textContent       = 'Filed ✓';
    document.getElementById('statTaxSub').textContent    = 'GST & ITR up to date';

    /* Activity feed */
    document.getElementById('activityList').innerHTML = activity.slice(0, 5).map(a => `
      <div class="activity-item">
        <div class="ai-icon">${a.icon}</div>
        <div style="flex:1;">
          <div class="ai-msg">${a.msg}</div>
          <div class="ai-time">${fmt.timeAgo(a.time)}</div>
        </div>
      </div>
    `).join('');

    /* Action items */
    const actions = [];
    const reviewVid = videos.find(v => v.status === 'Review Needed');
    if (reviewVid) actions.push({ msg: `"${reviewVid.title}" needs your approval`, section: 'videos', btn: 'Review Now' });
    const pendingC = contracts.find(c => c.status === 'Pending Review');
    if (pendingC) actions.push({ msg: `${pendingC.brand} contract pending legal review`, section: 'contracts', btn: 'View Contract' });
    const negDeal = deals.find(x => x.status === 'Negotiating');
    if (negDeal) actions.push({ msg: `${negDeal.brand} deal in negotiation — review terms`, section: 'deals', btn: 'View Deal' });
    if (actions.length === 0) actions.push({ msg: 'All clear — no actions needed today 🎉', section: null, btn: null });

    document.getElementById('actionList').innerHTML = actions.map(a => `
      <div class="action-item${a.section === null ? ' all-clear' : ''}">
        <span style="font-size:1.1rem">${a.section === null ? '✅' : '⚠️'}</span>
        <span class="ai-msg" style="flex:1;">${a.msg}</span>
        ${a.btn ? `<button class="action-btn" data-section="${a.section}">${a.btn}</button>` : ''}
      </div>
    `).join('');

    document.querySelectorAll('.action-btn[data-section]').forEach(btn => {
      btn.addEventListener('click', () => goTo(btn.dataset.section));
    });

    /* Voice Forge overview banner stats */
    try {
      const vfStats = JSON.parse(localStorage.getItem('vf_stats') || '{"totalGenerations":0,"voiceProjects":0}');
      const el = (id) => document.getElementById(id);
      if (el('vfObGens'))    el('vfObGens').textContent    = vfStats.totalGenerations || 0;
      if (el('vfObVoices'))  el('vfObVoices').textContent  = vfStats.voiceProjects   || 0;
      // Hide banner for SPARK plan (paywall handles it in voice-forge.html)
      const banner = document.getElementById('vfOverviewBanner');
      if (banner && user.plan === 'SPARK') {
        banner.style.borderColor = 'rgba(255,255,255,.08)';
        banner.querySelector('.vf-ob-title').textContent = 'Upgrade to unlock CV Voice Forge AI';
        const cta = banner.querySelector('.vf-ob-cta');
        if (cta) { cta.textContent = 'Upgrade Plan →'; cta.href = '#settings'; cta.addEventListener('click', (e) => { e.preventDefault(); goTo('settings'); }); }
      }
    } catch(e) {}

    /* Team list */
    const PLAN_TEAMS = {
      SPARK:  [{ name:'Rahul S.',       role:'Shared Video Editor',      status:'online' }],
      GROWTH: [{ name:'Divya M.',       role:'Dedicated Video Editor',   status:'online' },
               { name:'CA Suresh K.',  role:'Chartered Accountant',     status:'online' }],
      PRO:    [{ name:'Arjun T.',       role:'Senior Video Editor',      status:'online' },
               { name:'CA Priya L.',   role:'CA + Investment Advisor',  status:'online' },
               { name:'Adv. Rajesh',   role:'Legal Reviewer',           status:'away'   }],
      ELITE:  [{ name:'Team Lead',      role:'Dedicated Team Head',      status:'online' }]
    };
    const team = PLAN_TEAMS[user.plan] || PLAN_TEAMS.GROWTH;
    document.getElementById('teamList').innerHTML = team.map(t => `
      <div class="team-item">
        <div class="team-avatar">${t.name[0]}</div>
        <div class="team-info">
          <div class="team-name">${t.name}</div>
          <div class="team-role">${t.role}</div>
        </div>
        <div class="team-status" style="background:${t.status === 'online' ? 'var(--green)' : 'var(--amber)'}"></div>
      </div>
    `).join('');
  }

  /* ══════════════════════════════════════════════
     SECTION: VIDEOS
  ══════════════════════════════════════════════ */
  let videoFilter = 'all';

  function renderVideos() {
    const d     = D();
    const videos = d.videos;
    const p      = d.plan;

    document.getElementById('videoSectionDesc').textContent =
      `${p.editorType} · ${p.videosPerMonth} videos/month · 48–72h turnaround`;

    const del  = videos.filter(v => v.status === 'Delivered').length;
    const edit = videos.filter(v => v.status === 'In Editing').length;
    const rev  = videos.filter(v => v.status === 'Review Needed').length;
    const que  = videos.filter(v => v.status === 'In Queue').length;
    const pct  = Math.round((del / (videos.length || 1)) * 100);

    document.getElementById('videosProgress').innerHTML = `
      <div class="vp-item"><div class="vp-dot green"></div><span class="vp-count">${del}</span><span class="vp-label">Delivered</span></div>
      <div class="vp-item"><div class="vp-dot blue"></div><span class="vp-count">${edit}</span><span class="vp-label">In Editing</span></div>
      <div class="vp-item"><div class="vp-dot amber"></div><span class="vp-count">${rev}</span><span class="vp-label">Review Needed</span></div>
      <div class="vp-item"><div class="vp-dot gray"></div><span class="vp-count">${que}</span><span class="vp-label">In Queue</span></div>
      <div class="vp-bar-wrap" style="margin-left:auto;">
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:6px;text-align:right;">${pct}% delivered</div>
        <div class="vp-bar"><div class="vp-fill" style="width:${pct}%"></div></div>
      </div>
    `;

    const filtered = videoFilter === 'all'
      ? videos
      : videos.filter(v => v.status === videoFilter);

    const tbody = document.getElementById('videosTbody');
    tbody.innerHTML = filtered.map(v => `
      <tr class="clickable-row" data-vid="${v.id}" title="Click to view details">
        <td class="td-title td-link">${v.title}</td>
        <td><span style="font-size:12px;color:var(--text-dim);">${v.platform}</span></td>
        <td>${fmt.statusBadge(v.status)}</td>
        <td><span style="font-size:12px;color:${v.status === 'Delivered' ? 'var(--text-dim)' : 'var(--text)'};">${fmt.date(v.dueOn)}</span></td>
        <td><span style="font-size:12px;color:var(--text-dim);">${v.editor}</span></td>
        <td class="td-action">
          ${v.status === 'Review Needed'
            ? `<button class="btn-approve" data-vid="${v.id}" data-action="approve">Approve ✓</button>`
            : v.status === 'Delivered'
              ? '<span class="td-done">✓ Delivered</span>'
              : '<span class="td-pending">In Progress</span>'}
        </td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-dim);padding:32px;">No videos match this filter.</td></tr>`;

    /* Click row → open video detail modal */
    tbody.querySelectorAll('tr.clickable-row').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const vid = D().videos.find(v => v.id === row.dataset.vid);
        if (vid) openVideoDetail(vid);
      });
    });

    /* Quick approve button (without opening modal) */
    tbody.querySelectorAll('button[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        approveVideo(btn.dataset.vid);
      });
    });
  }

  /* Approve a video and refresh everything */
  function approveVideo(videoId) {
    const vid = D().videos.find(v => v.id === videoId);
    if (!vid) return;
    CV.db.updateVideo(videoId, { status: 'Delivered' });
    CV.db.addActivity('✅', `"${vid.title}" approved — marked as Delivered`);
    CV.db.addNotification(`"${vid.title}" has been marked as Delivered`, 'info');
    renderVideos();
    renderOverview();
    updateBadges();
  }

  /* ── VIDEO DETAIL MODAL ── */
  function openVideoDetail(v) {
    document.getElementById('vdm-title').textContent = v.title;
    document.getElementById('vdm-content').innerHTML = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="dr-label">Platform</span><span>${v.platform}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Status</span><span>${fmt.statusBadge(v.status)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Due Date</span>
          <span style="color:${v.status === 'Delivered' ? 'var(--text-dim)' : 'var(--text)'}">${fmt.date(v.dueOn)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Requested On</span><span>${fmt.date(v.requestedOn)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Editor</span><span>${v.editor}</span>
        </div>
      </div>
      <div class="field" style="margin-top:18px;">
        <label>Notes for Editor</label>
        <textarea id="vdm-notes" rows="3" placeholder="e.g. Add trending audio, cut at 0:30, subtitle in Tamil...">${v.notes || ''}</textarea>
      </div>
    `;

    const actions = document.getElementById('vdm-actions');
    actions.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-ghost';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => closeModal('videoDetailModal');
    actions.appendChild(closeBtn);

    if (v.status === 'Review Needed') {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn-accent';
      approveBtn.textContent = 'Approve & Mark Delivered ✓';
      approveBtn.onclick = () => {
        const notes = document.getElementById('vdm-notes').value.trim();
        CV.db.updateVideo(v.id, { status: 'Delivered', notes });
        CV.db.addActivity('✅', `"${v.title}" approved — marked as Delivered`);
        CV.db.addNotification(`"${v.title}" has been marked as Delivered`, 'info');
        closeModal('videoDetailModal');
        renderVideos();
        renderOverview();
        updateBadges();
      };
      actions.appendChild(approveBtn);
    } else {
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn-accent';
      saveBtn.textContent = 'Save Note';
      saveBtn.onclick = () => {
        const notes = document.getElementById('vdm-notes').value.trim();
        CV.db.updateVideo(v.id, { notes });
        CV.db.addActivity('📝', `Editor notes updated for "${v.title}"`);
        closeModal('videoDetailModal');
        renderVideos();
      };
      actions.appendChild(saveBtn);
    }

    openModal('videoDetailModal');
  }

  document.getElementById('videoDetailClose')?.addEventListener('click', () => closeModal('videoDetailModal'));

  /* Video filters */
  document.getElementById('videoFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    videoFilter = btn.dataset.filter;
    document.querySelectorAll('#videoFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderVideos();
  });

  /* Request Video Modal */
  document.getElementById('requestVideoBtn')?.addEventListener('click',  () => openModal('videoModal'));
  document.getElementById('videoModalClose')?.addEventListener('click',  () => closeModal('videoModal'));
  document.getElementById('videoModalCancel')?.addEventListener('click', () => closeModal('videoModal'));

  document.getElementById('videoRequestForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title    = document.getElementById('vm-title').value.trim();
    const platform = document.getElementById('vm-platform').value;
    const notes    = document.getElementById('vm-notes').value.trim();
    if (!title || !platform) return;
    CV.db.addVideo(title, platform, notes);
    CV.db.addNotification(`"${title}" added to editing queue`, 'info');
    document.getElementById('videoRequestForm').reset();
    closeModal('videoModal');
    renderVideos();
    renderOverview();
    updateBadges();
  });

  /* ══════════════════════════════════════════════
     SECTION: FINANCES
  ══════════════════════════════════════════════ */
  function renderFinances() {
    const f          = D().finances;
    const barColors  = ['#C5FF3E', '#a3e635', '#84cc16'];

    document.getElementById('financeCards').innerHTML = `
      <div class="fin-card">
        <span class="fin-card-label">🧾 GST Filing</span>
        <div class="fin-card-title">${f.gst.period}</div>
        <div style="margin-bottom:12px;">${fmt.statusBadge(f.gst.status)}</div>
        <div class="fin-card-row"><span>Filed on</span><span>${fmt.date(f.gst.filedOn)}</span></div>
        <div class="fin-card-row"><span>GST Paid</span><span>${fmt.currency(f.gst.amount)}</span></div>
        <div class="fin-card-row"><span>Next Due</span><span style="color:var(--amber)">${fmt.date(f.gst.nextDue)}</span></div>
      </div>
      <div class="fin-card">
        <span class="fin-card-label">📄 ITR Filing</span>
        <div class="fin-card-title">AY ${f.itr.year}</div>
        <div style="margin-bottom:12px;">${fmt.statusBadge(f.itr.status)}</div>
        <div class="fin-card-row"><span>Filed on</span><span>${fmt.date(f.itr.filedOn)}</span></div>
        <div class="fin-card-row"><span>Refund</span><span style="color:var(--green)">${fmt.currency(f.itr.refund)}</span></div>
        <div class="fin-card-row"><span>Status</span><span>${f.itr.refundStatus}</span></div>
      </div>
      <div class="fin-card" style="background:rgba(197,255,62,.05);border-color:rgba(197,255,62,.15);">
        <span class="fin-card-label">💰 Earnings</span>
        <div class="fin-card-value">${fmt.currency(f.earnings.thisMonth)}</div>
        <div class="fin-card-sub" style="margin-bottom:16px;">This month from active deals</div>
        <div class="fin-card-row"><span>Last Month</span><span>${fmt.currency(f.earnings.lastMonth)}</span></div>
        <div class="fin-card-row"><span>This Quarter</span><span>${fmt.currency(f.earnings.thisQuarter)}</span></div>
        <div class="fin-card-row"><span>Year to Date</span><span style="color:var(--accent)">${fmt.currency(f.earnings.totalYTD)}</span></div>
      </div>
    `;

    const maxAmt = Math.max(...f.earnings.breakdown.map(b => b.amount), 1);
    document.getElementById('earningsChart').innerHTML = `
      <div class="chart-bars">
        ${f.earnings.breakdown.map((b, i) => `
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${Math.round((b.amount / maxAmt) * 100)}px;background:${barColors[i]}22;border-top:2px solid ${barColors[i]};"></div>
            <div class="chart-bar-label">${b.source.split(' ')[0]}</div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('earningsTable').innerHTML = f.earnings.breakdown.map((b, i) => `
      <div class="et-row">
        <div class="et-source"><div class="et-dot" style="background:${barColors[i]}"></div>${b.source}</div>
        <div class="et-amount">${fmt.currency(b.amount)}</div>
      </div>
    `).join('');

    document.getElementById('tdsBlock').innerHTML = `
      <div class="tds-row"><div class="tds-label">Total TDS Deducted</div><div class="tds-val amber">${fmt.currency(f.tds.deducted)}</div></div>
      <div class="tds-row"><div class="tds-label">Claimable TDS Refund</div><div class="tds-val green">${fmt.currency(f.tds.claimable)}</div></div>
      <div class="tds-row"><div class="tds-label">Last Updated</div><div style="font-size:13px;color:var(--text-dim);">${fmt.date(f.tds.lastUpdated)}</div></div>
    `;

    document.getElementById('investBlock').innerHTML = `
      <div class="invest-row"><span>Monthly SIP Amount</span><strong>${fmt.currency(f.investments.sip)}</strong></div>
      <div class="invest-row"><span>SIP Started</span><span>${fmt.date(f.investments.sipStarted)}</span></div>
      <div class="invest-row"><span>Portfolio Value</span><strong>${fmt.currency(f.investments.portfolio)}</strong></div>
      <div class="invest-tip">💡 <strong>CA Recommendation:</strong> ${f.investments.recommendation}</div>
    `;
  }

  /* ══════════════════════════════════════════════
     SECTION: BRAND DEALS
  ══════════════════════════════════════════════ */
  let dealFilter = 'all';

  /* Status progression map */
  const DEAL_NEXT = {
    'Negotiating':    { status: 'Contract Review', label: 'Move to Contract Review →', icon: '📋' },
    'Contract Review':{ status: 'Active',           label: 'Activate Deal ✓',           icon: '✅' },
    'Active':         { status: 'Completed',        label: 'Mark as Completed ✓',       icon: '🏆' }
  };

  function renderDeals() {
    const deals = D().deals;
    const active = deals.filter(d => d.status === 'Active' || d.status === 'Negotiating');

    document.getElementById('dealsCards').innerHTML = active.map(d => `
      <div class="deal-card clickable-card" data-deal="${d.id}" title="Click to view details">
        <div class="dc-brand">${d.brand}</div>
        <div class="dc-niche">${d.niche}</div>
        <div class="dc-amount">${fmt.currency(d.amount)}</div>
        <div class="dc-meta">
          ${fmt.statusBadge(d.status)}
          <span class="dc-due">Due ${fmt.date(d.dueDate)}</span>
        </div>
      </div>
    `).join('') || `<div style="color:var(--text-dim);font-size:14px;padding:8px 0;">No active deals — your Create Vyral team is scouting brands for you.</div>`;

    const filtered = dealFilter === 'all' ? deals : deals.filter(d => d.status === dealFilter);
    document.getElementById('dealsTbody').innerHTML = filtered.map(d => `
      <tr class="clickable-row" data-deal="${d.id}" title="Click to view & update">
        <td><strong class="td-link">${d.brand}</strong></td>
        <td><span style="font-size:12px;color:var(--text-dim);">${d.niche}</span></td>
        <td class="td-amount">${fmt.currency(d.amount)}</td>
        <td><span style="font-size:12px;color:var(--text-dim);">${d.deliverables}</span></td>
        <td>${fmt.statusBadge(d.status)}</td>
        <td><span style="font-size:12px;color:var(--text-dim);">${fmt.date(d.dueDate)}</span></td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-dim);padding:32px;">No deals in this category.</td></tr>`;

    /* Deal card clicks */
    document.querySelectorAll('.deal-card.clickable-card').forEach(card => {
      card.addEventListener('click', () => {
        const deal = D().deals.find(d => d.id === card.dataset.deal);
        if (deal) openDealDetail(deal);
      });
    });

    /* Deal table row clicks */
    document.querySelectorAll('#dealsTbody tr.clickable-row').forEach(row => {
      row.addEventListener('click', () => {
        const deal = D().deals.find(d => d.id === row.dataset.deal);
        if (deal) openDealDetail(deal);
      });
    });
  }

  /* ── DEAL DETAIL MODAL ── */
  function openDealDetail(deal) {
    document.getElementById('ddm-brand').textContent = deal.brand;
    document.getElementById('ddm-content').innerHTML = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="dr-label">Brand</span>
          <strong style="font-size:15px;">${deal.brand}</strong>
        </div>
        <div class="detail-row">
          <span class="dr-label">Niche</span><span>${deal.niche}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Deal Value</span>
          <span class="detail-value">${fmt.currency(deal.amount)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Status</span><span>${fmt.statusBadge(deal.status)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Deliverables</span><span>${deal.deliverables}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Start Date</span><span>${fmt.date(deal.startDate)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Due Date</span><span>${fmt.date(deal.dueDate)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Contract Reviewed</span>
          <span>${deal.contractReviewed ? '✅ Yes — by Create Vyral legal team' : '⏳ Pending review'}</span>
        </div>
      </div>
    `;

    const actions = document.getElementById('ddm-actions');
    actions.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-ghost';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => closeModal('dealDetailModal');
    actions.appendChild(closeBtn);

    const prog = DEAL_NEXT[deal.status];
    if (prog) {
      const progressBtn = document.createElement('button');
      progressBtn.className = 'btn-accent';
      progressBtn.textContent = prog.label;
      progressBtn.onclick = () => {
        CV.db.updateDeal(deal.id, { status: prog.status });
        CV.db.addActivity(prog.icon, `${deal.brand} deal status → "${prog.status}"`);
        CV.db.addNotification(`${deal.brand} deal moved to "${prog.status}"`, 'info');
        /* If moving to Contract Review — auto-create a contract entry */
        if (prog.status === 'Contract Review') {
          const existing = D().contracts.find(c => c.brand === deal.brand && c.status === 'Pending Review');
          if (!existing) {
            CV.db.addContract({
              brand:      deal.brand,
              type:       'Sponsored Content Contract',
              status:     'Pending Review',
              receivedOn: new Date().toISOString().split('T')[0],
              value:      deal.amount,
              notes:      'Awaiting legal review by Create Vyral team.'
            });
          }
        }
        /* If activating deal (from Contract Review) — mark contract as signed */
        if (prog.status === 'Active') {
          const contract = D().contracts.find(c => c.brand === deal.brand && c.status === 'Pending Review');
          if (contract) {
            const signedDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
            CV.db.updateContract(contract.id, { status: 'Signed', notes: `Reviewed & signed on ${signedDate}` });
            CV.db.updateDeal(deal.id, { contractReviewed: true });
          }
        }
        closeModal('dealDetailModal');
        renderDeals();
        renderContracts();
        renderOverview();
        updateBadges();
      };
      actions.appendChild(progressBtn);
    }

    openModal('dealDetailModal');
  }

  document.getElementById('dealDetailClose')?.addEventListener('click', () => closeModal('dealDetailModal'));

  document.getElementById('dealFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    dealFilter = btn.dataset.filter;
    document.querySelectorAll('#dealFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDeals();
  });

  /* ══════════════════════════════════════════════
     SECTION: CONTRACTS
  ══════════════════════════════════════════════ */
  function renderContracts() {
    const contracts = D().contracts;
    document.getElementById('contractsList').innerHTML = contracts.length
      ? contracts.map(c => `
        <div class="contract-card ${c.status === 'Pending Review' ? 'pending' : 'signed'} clickable-card" data-contract="${c.id}" title="Click to view details">
          <div class="cc-left">
            <div class="cc-brand">${c.brand}</div>
            <div class="cc-type">${c.type}</div>
            <div class="cc-notes">${c.notes}</div>
          </div>
          <div class="cc-right">
            <div class="cc-value">${fmt.currency(c.value)}</div>
            ${fmt.statusBadge(c.status)}
            <div class="cc-date">Received ${fmt.date(c.receivedOn)}</div>
            ${c.status === 'Pending Review'
              ? `<button class="btn-accent-sm sign-btn" data-contract="${c.id}">Review & Sign ✓</button>`
              : ''}
          </div>
        </div>
      `).join('')
      : `<div style="color:var(--text-dim);font-size:14px;padding:20px 0;">No contracts yet — as deals are confirmed, Create Vyral legal team will review them here.</div>`;

    /* Contract card clicks → open detail modal */
    document.querySelectorAll('.contract-card.clickable-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.sign-btn')) return;
        const contract = D().contracts.find(c => c.id === card.dataset.contract);
        if (contract) openContractDetail(contract);
      });
    });

    /* Quick sign button on card → open full signing modal */
    document.querySelectorAll('.sign-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openSigningModal(btn.dataset.contract);
      });
    });
  }

  function signContract(contractId) {
    const contract = D().contracts.find(c => c.id === contractId);
    if (!contract) return;
    const signedDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    CV.db.updateContract(contractId, { status: 'Signed', notes: `Reviewed & signed on ${signedDate}` });
    /* Auto-activate the linked deal */
    const linkedDeal = D().deals.find(d => d.brand === contract.brand && d.status === 'Contract Review');
    if (linkedDeal) {
      CV.db.updateDeal(linkedDeal.id, { status: 'Active', contractReviewed: true });
    }
    CV.db.addActivity('📝', `${contract.brand} contract reviewed & signed by Create Vyral legal team`);
    CV.db.addNotification(`${contract.brand} contract is signed — deal is now Active`, 'info');
    renderContracts();
    renderDeals();
    renderOverview();
    updateBadges();
  }

  /* ── CONTRACT DETAIL MODAL ── */
  function openContractDetail(c) {
    document.getElementById('cdm-brand').textContent = c.brand + ' — ' + c.type;

    /* Render stored signature block if contract is already signed */
    let sigSection = '';
    if (c.status === 'Signed' && c.signatureData) {
      if (c.signatureType === 'draw') {
        sigSection = `
          <div class="detail-row full">
            <span class="dr-label">Digital Signature</span>
            <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:6px;">
              <img src="${c.signatureData}" alt="Signature" style="max-height:55px;max-width:100%;display:block;"/>
            </div>
          </div>`;
      } else {
        sigSection = `
          <div class="detail-row full">
            <span class="dr-label">Digital Signature</span>
            <div style="font-family:'Dancing Script',cursive,Georgia,serif;font-size:26px;color:var(--accent);padding:8px 0;">${c.signatureData}</div>
          </div>`;
      }
    }

    document.getElementById('cdm-content').innerHTML = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="dr-label">Brand</span>
          <strong style="font-size:15px;">${c.brand}</strong>
        </div>
        <div class="detail-row">
          <span class="dr-label">Contract Type</span><span>${c.type}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Contract Value</span>
          <span class="detail-value">${fmt.currency(c.value)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Status</span><span>${fmt.statusBadge(c.status)}</span>
        </div>
        <div class="detail-row">
          <span class="dr-label">Received On</span><span>${fmt.date(c.receivedOn)}</span>
        </div>
        ${c.signedAt ? `<div class="detail-row"><span class="dr-label">Signed On</span><span style="color:var(--green)">${fmt.date(c.signedAt)}</span></div>` : ''}
        ${c.signedBy ? `<div class="detail-row"><span class="dr-label">Signed By</span><span>${c.signedBy}</span></div>` : ''}
        <div class="detail-row full">
          <span class="dr-label">Legal Notes</span>
          <span class="detail-notes">${c.notes}</span>
        </div>
        ${sigSection}
      </div>
    `;

    const actions = document.getElementById('cdm-actions');
    actions.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-ghost';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => closeModal('contractDetailModal');
    actions.appendChild(closeBtn);

    if (c.status === 'Pending Review') {
      const signBtn = document.createElement('button');
      signBtn.className = 'btn-accent';
      signBtn.textContent = '✍️ Read & Sign Agreement';
      signBtn.onclick = () => openSigningModal(c.id);
      actions.appendChild(signBtn);
    }

    openModal('contractDetailModal');
  }

  document.getElementById('contractDetailClose')?.addEventListener('click', () => closeModal('contractDetailModal'));

  /* ══════════════════════════════════════════════
     DIGITAL CONTRACT SIGNING
  ══════════════════════════════════════════════ */

  /* ── Generate auto-filled contract HTML ── */
  function generateContractDoc(contract, linkedDeal) {
    user = CV.getCurrentUser();
    const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
    const refNo  = 'CV-' + contract.id.toUpperCase().slice(-8);
    const deliverables = linkedDeal ? linkedDeal.deliverables : 'As mutually agreed';
    const dueDate      = linkedDeal ? fmt.date(linkedDeal.dueDate) : 'As agreed';
    const amountNum    = contract.value.toLocaleString('en-IN');
    const amountWords  = numberToWords(contract.value);

    return `
      <div class="contract-doc">
        <div class="cd-letterhead">
          <div class="cd-logo">● CREATE VYRAL MARKETING LLP</div>
          <div class="cd-logo-sub">Registered Company · Create Vyral Marketing LLP · Est. 2025<br>
          Email: createvyral@gmail.com · www.createvyral.buzz</div>
        </div>

        <div class="cd-doc-title">${contract.type.toUpperCase()}</div>
        <div class="cd-doc-meta">
          <span>Agreement No: ${refNo}</span>
          <span>Date: ${today}</span>
          <span>Governed by Laws of India</span>
        </div>

        <div class="cd-section">
          <h3>1. Parties to this Agreement</h3>
          <div class="cd-parties">
            <div class="cd-party">
              <div class="cd-party-label">Content Creator</div>
              <div class="cd-party-name">${user.name}</div>
              <div class="cd-party-detail">${user.platform} · ${user.email}</div>
            </div>
            <hr class="cd-divider"/>
            <div class="cd-party">
              <div class="cd-party-label">Brand Partner</div>
              <div class="cd-party-name">${contract.brand}</div>
              <div class="cd-party-detail">As registered with Create Vyral Marketing LLP</div>
            </div>
            <hr class="cd-divider"/>
            <div class="cd-party">
              <div class="cd-party-label">Intermediary & Legal Agent</div>
              <div class="cd-party-name">Create Vyral Marketing LLP</div>
              <div class="cd-party-detail">Registered LLP · Acting as agent for the Creator</div>
            </div>
          </div>
        </div>

        <div class="cd-section">
          <h3>2. Scope of Work</h3>
          <p>The Creator agrees to create, edit, and publish the following content for the Brand:</p>
          <div class="cd-highlight">${deliverables}</div>
          <p>All content must comply with the Brand's brief, ASCI guidelines, and be reviewed by Create Vyral before publishing. The Creator shall not publish without written approval from Create Vyral.</p>
        </div>

        <div class="cd-section">
          <h3>3. Compensation & Payment Terms</h3>
          <p>The Brand agrees to pay the Creator a total contract fee of:</p>
          <div class="cd-amount-box">
            <div class="cd-amount-num">₹${amountNum}</div>
            <div class="cd-amount-words">(${amountWords})</div>
          </div>
          <p>Payment shall be made within <strong>15 working days</strong> of approved content delivery. All payments will be processed through Create Vyral's secured escrow account to protect both parties. TDS at applicable rates under Section 194C of the Income Tax Act shall be deducted at source.</p>
        </div>

        <div class="cd-section">
          <h3>4. Content Delivery Timeline</h3>
          <p>Content must be delivered by: <strong>${dueDate}</strong></p>
          <p>Failure to deliver within 7 days of the agreed deadline may result in a deduction of up to 10% of the agreed fee. The Creator may request a single extension of up to 5 days with prior written notice to Create Vyral.</p>
        </div>

        <div class="cd-section">
          <h3>5. Intellectual Property & Content Rights</h3>
          <p>The Creator retains all intellectual property rights over the content. The Brand is granted a <strong>non-exclusive, royalty-free license</strong> to use the content for promotional purposes for a period of <strong>12 months</strong> from the date of delivery across all digital platforms. Any usage beyond 12 months requires a separate written agreement.</p>
        </div>

        <div class="cd-section">
          <h3>6. Exclusivity & Restrictions</h3>
          <p>The Creator agrees not to publish content for any direct competitor of the Brand during the campaign period (start date to delivery date). The Creator shall disclose this paid partnership in accordance with ASCI and platform guidelines using #Ad or #Sponsored tags.</p>
        </div>

        <div class="cd-section">
          <h3>7. Confidentiality</h3>
          <p>Both parties agree to keep the financial terms of this agreement strictly confidential. Disclosure of the deal value to third parties without prior written consent shall constitute a material breach of this agreement.</p>
        </div>

        <div class="cd-section">
          <h3>8. Cancellation & Kill Fee</h3>
          <p>Either party may cancel this agreement with <strong>7 days' written notice</strong> through Create Vyral. If the Brand cancels after content creation has commenced, a kill fee of <strong>50%</strong> of the agreed amount is immediately payable to the Creator. If the Creator cancels without valid reason, the Creator shall forfeit any advance paid.</p>
        </div>

        <div class="cd-section">
          <h3>9. Dispute Resolution</h3>
          <p>Any disputes arising out of or in connection with this agreement shall be resolved through arbitration in <strong>Chennai, Tamil Nadu</strong>, in accordance with the Arbitration and Conciliation Act, 1996. Create Vyral shall act as the first point of mediation between the parties.</p>
        </div>

        <div class="cd-section">
          <h3>10. Governing Law</h3>
          <p>This agreement shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. This electronic agreement is legally valid under the Information Technology Act, 2000 (India).</p>
        </div>

        <div class="cd-section">
          <h3>11. Legal Review by Create Vyral</h3>
          <p>This agreement has been independently reviewed by Create Vyral's legal team on behalf of the Creator to ensure fair terms, compliance with applicable laws, and protection of the Creator's interests.</p>
          <div class="cd-legal-badge">✅ Reviewed & Approved by Create Vyral Legal Team</div>
        </div>

        <hr class="cd-divider"/>
        <p style="font-size:12px;color:var(--text-dim);text-align:center;">
          By signing below, both parties confirm they have read, understood, and agreed to all terms of this agreement.
        </p>
      </div>
    `;
  }

  /* ── Number to words (for Indian amounts) ── */
  function numberToWords(n) {
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                  'Seventeen','Eighteen','Nineteen'];
    const tensW = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    if (n === 0) return 'Zero Rupees Only';

    /* Convert any number 1–99 to words */
    function belowHundred(x) {
      if (x < 20) return ones[x];
      const rem = x % 10;
      return (tensW[Math.floor(x / 10)] + (rem ? ' ' + ones[rem] : '')).trim();
    }

    let str = '';
    if (n >= 100000) { str += belowHundred(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
    if (n >= 1000)   { str += belowHundred(Math.floor(n / 1000))   + ' Thousand '; n %= 1000; }
    if (n >= 100)    { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n > 0)       { str += belowHundred(n) + ' '; }
    return str.trim() + ' Rupees Only';
  }

  /* ── Open the signing modal ── */
  let _signingContractId = null;
  let _hasDrawnSignature = false;
  let _sigMode           = 'draw'; // 'draw' | 'type'

  function openSigningModal(contractId) {
    const contract    = D().contracts.find(c => c.id === contractId);
    if (!contract) return;
    const linkedDeal  = D().deals.find(d => d.brand === contract.brand);

    _signingContractId = contractId;
    _hasDrawnSignature = false;
    _sigMode           = 'draw';

    /* Set title */
    document.getElementById('csm-title').textContent = contract.brand + ' — ' + contract.type;

    /* Generate and inject contract */
    document.getElementById('contractDocContent').innerHTML = generateContractDoc(contract, linkedDeal);

    /* Reset scroll + show notice */
    const scroll = document.getElementById('contractDocScroll');
    scroll.scrollTop = 0;
    const notice = document.getElementById('cdsNotice');
    if (notice) notice.style.display = '';

    /* Hide notice once user has scrolled most of the way */
    const hideNoticeOnScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scroll;
      if (scrollTop + clientHeight >= scrollHeight - 60) {
        if (notice) notice.style.display = 'none';
        scroll.removeEventListener('scroll', hideNoticeOnScroll);
      }
    };
    scroll.removeEventListener('scroll', hideNoticeOnScroll);
    scroll.addEventListener('scroll', hideNoticeOnScroll, { passive: true });

    /* Reset signature pad */
    clearCanvas();
    document.getElementById('signAgree').checked   = false;
    document.getElementById('signTypeName').value  = '';
    document.getElementById('signTypedPreview').textContent = '';
    document.getElementById('signAndConfirm').disabled = true;

    /* Show draw tab by default */
    switchSigTab('draw');

    /* Close detail modal, open signing modal */
    closeModal('contractDetailModal');
    openModal('contractSignModal');

    /* Re-init canvas after modal renders */
    setTimeout(initCanvas, 80);
  }

  /* ── Canvas signature pad ── */
  let _canvas, _ctx, _isDrawing = false, _lastX = 0, _lastY = 0;

  function initCanvas() {
    _canvas = document.getElementById('signatureCanvas');
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');
    _ctx.strokeStyle = '#C5FF3E';
    _ctx.lineWidth   = 2.5;
    _ctx.lineCap     = 'round';
    _ctx.lineJoin    = 'round';

    /* Resize canvas to actual rendered width */
    const rect = _canvas.getBoundingClientRect();
    _canvas.width  = rect.width  * window.devicePixelRatio;
    _canvas.height = rect.height * window.devicePixelRatio;
    _ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    _ctx.strokeStyle = '#C5FF3E';
    _ctx.lineWidth   = 2.5;
    _ctx.lineCap     = 'round';
    _ctx.lineJoin    = 'round';
  }

  function getPos(e) {
    const rect = _canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDrawStart(e) {
    e.preventDefault();
    _isDrawing = true;
    const pos  = getPos(e);
    _lastX = pos.x; _lastY = pos.y;
  }
  function onDrawMove(e) {
    e.preventDefault();
    if (!_isDrawing) return;
    const pos = getPos(e);
    _ctx.beginPath();
    _ctx.moveTo(_lastX, _lastY);
    _ctx.lineTo(pos.x, pos.y);
    _ctx.stroke();
    _lastX = pos.x; _lastY = pos.y;
    _hasDrawnSignature = true;
    checkSignReady();
  }
  function onDrawEnd(e) { e.preventDefault(); _isDrawing = false; }

  /* Wire canvas events after DOM is ready */
  document.getElementById('contractSignModal').addEventListener('click', e => {
    /* Prevent canvas events from closing the modal */
    e.stopPropagation();
  }, { once: false });

  setTimeout(() => {
    const cvs = document.getElementById('signatureCanvas');
    if (!cvs) return;
    cvs.addEventListener('mousedown', onDrawStart);
    cvs.addEventListener('mousemove', onDrawMove);
    cvs.addEventListener('mouseup',   onDrawEnd);
    cvs.addEventListener('mouseleave',onDrawEnd);
    cvs.addEventListener('touchstart',onDrawStart, { passive: false });
    cvs.addEventListener('touchmove', onDrawMove,  { passive: false });
    cvs.addEventListener('touchend',  onDrawEnd,   { passive: false });
  }, 200);

  function clearCanvas() {
    if (!_canvas) return;
    _ctx?.clearRect(0, 0, _canvas.width / (window.devicePixelRatio || 1), _canvas.height / (window.devicePixelRatio || 1));
    _hasDrawnSignature = false;
    checkSignReady();
  }
  document.getElementById('clearSignature')?.addEventListener('click', clearCanvas);

  /* ── Tab switcher Draw / Type ── */
  function switchSigTab(mode) {
    _sigMode = mode;
    document.getElementById('stDraw').classList.toggle('active', mode === 'draw');
    document.getElementById('stType').classList.toggle('active', mode === 'type');
    document.getElementById('signDrawWrap').classList.toggle('hidden', mode !== 'draw');
    document.getElementById('signTypeWrap').classList.toggle('hidden', mode !== 'type');
    checkSignReady();
  }
  document.getElementById('stDraw')?.addEventListener('click', () => switchSigTab('draw'));
  document.getElementById('stType')?.addEventListener('click', () => switchSigTab('type'));

  /* Type preview */
  document.getElementById('signTypeName')?.addEventListener('input', e => {
    document.getElementById('signTypedPreview').textContent = e.target.value;
    checkSignReady();
  });

  /* Checkbox */
  document.getElementById('signAgree')?.addEventListener('change', checkSignReady);

  function checkSignReady() {
    const agreed = document.getElementById('signAgree')?.checked;
    let hasSig   = false;
    if (_sigMode === 'draw') hasSig = _hasDrawnSignature;
    if (_sigMode === 'type') hasSig = document.getElementById('signTypeName')?.value.trim().length > 0;
    const btn = document.getElementById('signAndConfirm');
    if (btn) btn.disabled = !(agreed && hasSig);
  }

  /* ── Sign & Confirm ── */
  document.getElementById('signAndConfirm')?.addEventListener('click', () => {
    const btn    = document.getElementById('signAndConfirm');
    const btnTxt = document.getElementById('signBtnText');
    btn.disabled = true;
    btnTxt.textContent = 'Signing…';

    setTimeout(() => {
      const contract   = D().contracts.find(c => c.id === _signingContractId);
      if (!contract) return;

      const signedAt   = new Date().toISOString();
      const signedDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

      /* Get signature data */
      let signatureData = null;
      let signatureType = _sigMode;
      if (_sigMode === 'draw' && _canvas) {
        signatureData = _canvas.toDataURL('image/png');
      } else {
        signatureData = document.getElementById('signTypeName').value.trim();
      }

      /* Save to localStorage */
      CV.db.updateContract(_signingContractId, {
        status:        'Signed',
        notes:         `Reviewed & signed on ${signedDate}`,
        signedAt,
        signedBy:      CV.getCurrentUser().name,
        signatureData,
        signatureType
      });

      /* Auto-activate linked deal */
      const linkedDeal = D().deals.find(d => d.brand === contract.brand && d.status === 'Contract Review');
      if (linkedDeal) {
        CV.db.updateDeal(linkedDeal.id, { status: 'Active', contractReviewed: true });
      }
      CV.db.addActivity('✍️', `${contract.brand} contract digitally signed by ${CV.getCurrentUser().name}`);
      CV.db.addNotification(`${contract.brand} contract signed — deal is now Active`, 'info');

      closeModal('contractSignModal');
      renderContracts();
      renderDeals();
      renderOverview();
      updateBadges();
      btnTxt.textContent = 'Sign & Confirm Agreement';
      btn.disabled = false;

      /* Show success modal */
      showSignedConfirmation(contract, signatureData, signatureType, signedDate);
    }, 600);
  });

  function showSignedConfirmation(contract, sigData, sigType, signedDate) {
    document.getElementById('ssSubText').textContent =
      `${contract.brand} agreement has been digitally signed and stored securely.`;

    document.getElementById('ssMeta').innerHTML = `
      <div class="ss-meta-row"><span>Contract</span><span>${contract.type}</span></div>
      <div class="ss-meta-row"><span>Brand</span><span>${contract.brand}</span></div>
      <div class="ss-meta-row"><span>Value</span><span>${fmt.currency(contract.value)}</span></div>
      <div class="ss-meta-row"><span>Signed By</span><span>${CV.getCurrentUser().name}</span></div>
      <div class="ss-meta-row"><span>Signed On</span><span>${signedDate}</span></div>
    `;

    const sigDisplay = document.getElementById('ssSignatureDisplay');
    if (sigType === 'draw') {
      sigDisplay.innerHTML = `<img src="${sigData}" alt="Signature"/>`;
      sigDisplay.classList.remove('typed');
    } else {
      sigDisplay.textContent = sigData;
      sigDisplay.classList.add('typed');
    }

    openModal('signedConfirmModal');
  }

  document.getElementById('contractSignClose')?.addEventListener('click',   () => closeModal('contractSignModal'));
  document.getElementById('contractSignCancel')?.addEventListener('click',  () => closeModal('contractSignModal'));
  document.getElementById('signedConfirmClose')?.addEventListener('click',  () => closeModal('signedConfirmModal'));

  /* ══════════════════════════════════════════════
     SECTION: ANALYTICS — META GRAPH API
  ══════════════════════════════════════════════ */

  /* Generate realistic demo analytics scaled to the user's plan/followers */
  function generateMetaAnalytics() {
    user = CV.getCurrentUser();
    const plan = user.plan || 'GROWTH';

    // Base follower count from plan tier
    const followerBase = { SPARK: 32000, GROWTH: 98000, PRO: 285000, ELITE: 620000 }[plan] || 98000;
    const variance = (v) => Math.round(v * (0.85 + Math.random() * 0.3));

    const followers     = variance(followerBase);
    const engRate       = parseFloat((4.2 + Math.random() * 4.2).toFixed(1));
    const reach30d      = variance(followers * 4.8);
    const impressions30d = variance(followers * 12);
    const profileVisits = variance(followers * 0.38);
    const websiteClicks = variance(followers * 0.07);
    const avgReelPlays  = variance(followers * 0.82);
    const avgReelReach  = variance(followers * 0.62);

    // Audience age groups (total = 100)
    const ageGroups = [
      { label: '13–17', pct: 5  },
      { label: '18–24', pct: 29 },
      { label: '25–34', pct: 37 },
      { label: '35–44', pct: 18 },
      { label: '45–54', pct: 8  },
      { label: '55+',   pct: 3  }
    ];

    const genderF = Math.round(30 + Math.random() * 40);
    const genderM = 100 - genderF;

    const cities = [
      { city: 'Chennai',          pct: 24 },
      { city: 'Bangalore',        pct: 18 },
      { city: 'Hyderabad',        pct: 14 },
      { city: 'Coimbatore',       pct: 10 },
      { city: 'Mumbai',           pct: 8  },
      { city: 'Vijayawada',       pct: 6  }
    ];

    // Recent posts
    const postTypes = ['REEL', 'REEL', 'POST', 'REEL', 'POST', 'REEL'];
    const captions  = [
      'Day in my life as a creator ✨',
      'New video is live — link in bio!',
      'Behind the scenes of my setup 🎙',
      'This brand deal changed everything',
      'Chennai street food tour 🍛',
      'My morning routine for productivity'
    ];
    const icons = ['🎬','📱','🎙','💼','🍛','⏰'];
    const recentPosts = postTypes.map((type, i) => ({
      type,
      caption: captions[i],
      icon: icons[i],
      likes:    variance(type === 'REEL' ? followers * 0.072 : followers * 0.038),
      comments: variance(type === 'REEL' ? followers * 0.009 : followers * 0.004),
      saves:    variance(type === 'REEL' ? followers * 0.018 : followers * 0.008),
      reach:    variance(type === 'REEL' ? followers * 0.72  : followers * 0.32),
      plays:    type === 'REEL' ? variance(followers * 0.95) : null
    }));

    return {
      username: '@' + user.name.toLowerCase().replace(/\s+/g, '_'),
      accountType: 'Creator Account',
      followers,
      following: variance(620),
      reach30d,
      impressions30d,
      profileVisits30d: profileVisits,
      websiteClicks30d: websiteClicks,
      avgEngagementRate: engRate,
      avgReelPlays,
      avgReelReach,
      audience: { ageGroups, gender: { female: genderF, male: genderM }, topCities: cities },
      recentPosts
    };
  }

  function fmtShort(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    const account   = CV.db.getSocialAccount('instagram');

    if (!account) {
      // ── Not connected ──
      document.getElementById('analyticsSyncBtn').style.display = 'none';
      document.getElementById('metaBadge').style.display = 'none';
      container.innerHTML = `
        <div class="analytics-connect-wrap">
          <div class="analytics-connect-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" fill="#fff"/></svg>
          </div>
          <div class="analytics-connect-title">Connect your Instagram account</div>
          <div class="analytics-connect-sub">Give brands access to real, Meta-verified analytics — followers, reach, impressions, engagement rate and audience demographics. Verified data builds trust 3× faster than screenshots.</div>
          <div class="analytics-connect-features">
            <div class="analytics-cf-pill"><span>✓</span> Verified follower count</div>
            <div class="analytics-cf-pill"><span>✓</span> Reach &amp; impressions (30 days)</div>
            <div class="analytics-cf-pill"><span>✓</span> Audience demographics</div>
            <div class="analytics-cf-pill"><span>✓</span> Engagement rate</div>
            <div class="analytics-cf-pill"><span>✓</span> Reels performance</div>
            <div class="analytics-cf-pill"><span>✓</span> Top content posts</div>
            <div class="analytics-cf-pill"><span>🔒</span> Read-only access</div>
          </div>
          <button class="btn-connect-instagram" id="openMetaConnect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="rgba(255,255,255,.25)"/><path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" fill="#fff"/></svg>
            Connect Instagram Account
          </button>
        </div>
      `;
      document.getElementById('openMetaConnect')?.addEventListener('click', () => openMetaConnectModal());
      return;
    }

    // ── Connected ──
    const a = account.analytics;
    document.getElementById('analyticsSyncBtn').style.display = 'flex';
    document.getElementById('metaBadge').style.display = 'inline-flex';
    const lastSync = account.lastSynced ? fmt.timeAgo(account.lastSynced) : 'Just now';

    container.innerHTML = `
      <!-- Account Header -->
      <div class="analytics-header">
        <div class="analytics-ig-avatar">${user.name[0]}</div>
        <div class="analytics-ig-info">
          <div class="analytics-ig-name">
            ${user.name}
            <span class="meta-verified-badge">Meta Verified ✓</span>
          </div>
          <div class="analytics-ig-handle">${a.username} · ${a.accountType}</div>
          <div class="analytics-ig-meta">
            <div class="analytics-ig-meta-item">Followers <strong>${fmtShort(a.followers)}</strong></div>
            <div class="analytics-ig-meta-item">Following <strong>${a.following.toLocaleString('en-IN')}</strong></div>
            <div class="analytics-ig-meta-item">Connected <strong>${fmt.timeAgo(account.connectedAt)}</strong></div>
          </div>
        </div>
        <div class="analytics-header-actions">
          <div class="analytics-sync-time">Last synced ${lastSync}</div>
          <button class="btn-disconnect" id="disconnectMetaBtn">Disconnect account</button>
        </div>
      </div>

      <!-- KPI grid -->
      <div class="analytics-kpi-grid">
        <div class="analytics-kpi-card">
          <div class="akpi-label">Followers</div>
          <div class="akpi-value">${fmtShort(a.followers)}</div>
          <div class="akpi-sub"><span class="akpi-delta">▲ 2.1%</span> this month</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Reach · 30 days</div>
          <div class="akpi-value">${fmtShort(a.reach30d)}</div>
          <div class="akpi-sub"><span class="akpi-delta">▲ 8.4%</span> vs prev period</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Impressions · 30 days</div>
          <div class="akpi-value">${fmtShort(a.impressions30d)}</div>
          <div class="akpi-sub"><span class="akpi-delta">▲ 5.7%</span> vs prev period</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Engagement Rate</div>
          <div class="akpi-value" style="color:var(--accent)">${a.avgEngagementRate}%</div>
          <div class="akpi-sub">Industry avg: <strong>3.2%</strong></div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Profile Visits · 30d</div>
          <div class="akpi-value">${fmtShort(a.profileVisits30d)}</div>
          <div class="akpi-sub"><span class="akpi-delta">▲ 3.9%</span> this month</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Avg Reel Plays</div>
          <div class="akpi-value">${fmtShort(a.avgReelPlays)}</div>
          <div class="akpi-sub">per Reel posted</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Avg Reel Reach</div>
          <div class="akpi-value">${fmtShort(a.avgReelReach)}</div>
          <div class="akpi-sub">unique accounts reached</div>
        </div>
        <div class="analytics-kpi-card">
          <div class="akpi-label">Website Clicks · 30d</div>
          <div class="akpi-value">${fmtShort(a.websiteClicks30d)}</div>
          <div class="akpi-sub"><span class="akpi-delta">▲ 1.4%</span> this month</div>
        </div>
      </div>

      <!-- Mid row: Demographics + Engagement -->
      <div class="analytics-mid">

        <!-- Audience Demographics -->
        <div class="analytics-card">
          <div class="analytics-card-title">Audience Demographics</div>

          <div class="demo-section">
            <div class="demo-section-label">Age Groups</div>
            ${a.audience.ageGroups.map(g => `
              <div class="demo-bar-row">
                <div class="demo-bar-label">${g.label}</div>
                <div class="demo-bar-track"><div class="demo-bar-fill" style="width:${g.pct * 3}px;max-width:100%"></div></div>
                <div class="demo-bar-pct">${g.pct}%</div>
              </div>
            `).join('')}
          </div>

          <div class="demo-section">
            <div class="demo-section-label">Gender</div>
            <div class="demo-gender-row">
              <div class="demo-gender-item">
                <div class="demo-gender-icon">♀</div>
                <div class="demo-gender-pct" style="color:#ec4899">${a.audience.gender.female}%</div>
                <div class="demo-gender-label">Female</div>
              </div>
              <div class="demo-gender-item">
                <div class="demo-gender-icon">♂</div>
                <div class="demo-gender-pct" style="color:#3b82f6">${a.audience.gender.male}%</div>
                <div class="demo-gender-label">Male</div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <div class="demo-section-label">Top Cities</div>
            <div class="demo-city-list">
              ${a.audience.topCities.map((c, i) => `
                <div class="demo-city-row">
                  <div class="demo-city-rank">${i + 1}</div>
                  <div class="demo-city-name">${c.city}</div>
                  <div class="demo-city-bar-wrap">
                    <div class="demo-city-bar" style="width:${c.pct * 2.4}px;max-width:100%"></div>
                  </div>
                  <div class="demo-city-pct">${c.pct}%</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Engagement Breakdown -->
        <div class="analytics-card">
          <div class="analytics-card-title">Engagement Breakdown</div>

          <div class="engage-rate-wrap" style="margin-bottom:18px;">
            <div class="engage-rate-num">${a.avgEngagementRate}%</div>
            <div class="engage-rate-label">Average Engagement Rate<br><span style="font-size:11px;color:var(--text-xs);">Based on likes, comments, saves &amp; shares</span></div>
          </div>

          <div class="engage-grid">
            <div class="engage-item">
              <div class="engage-item-label">Avg Likes / Post</div>
              <div class="engage-item-val">${fmtShort(Math.round(a.followers * 0.056))}</div>
            </div>
            <div class="engage-item">
              <div class="engage-item-label">Avg Comments</div>
              <div class="engage-item-val">${fmtShort(Math.round(a.followers * 0.007))}</div>
            </div>
            <div class="engage-item">
              <div class="engage-item-label">Avg Saves / Post</div>
              <div class="engage-item-val">${fmtShort(Math.round(a.followers * 0.014))}</div>
            </div>
            <div class="engage-item">
              <div class="engage-item-label">Shares / Reel</div>
              <div class="engage-item-val">${fmtShort(Math.round(a.followers * 0.009))}</div>
            </div>
          </div>

          <div style="margin-top:18px;">
            <div class="demo-section-label" style="margin-bottom:12px;">Reach Source</div>
            ${[
              { label: 'Non-Followers', pct: 68 },
              { label: 'Home Feed',     pct: 18 },
              { label: 'Explore',       pct: 10 },
              { label: 'Hashtags',      pct: 4  }
            ].map(r => `
              <div class="demo-bar-row">
                <div class="demo-bar-label" style="width:88px;text-align:left;font-size:12px;">${r.label}</div>
                <div class="demo-bar-track"><div class="demo-bar-fill ig" style="width:${r.pct * 2.4}px;max-width:100%"></div></div>
                <div class="demo-bar-pct">${r.pct}%</div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:20px;padding:14px;background:rgba(197,255,62,.04);border:1px solid rgba(197,255,62,.1);border-radius:12px;">
            <div class="demo-section-label" style="margin-bottom:8px;">Brand Visibility Score</div>
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:28px;color:var(--accent);">
              ${Math.min(99, Math.round(a.avgEngagementRate * 11 + 20))}<span style="font-size:14px;color:var(--text-dim)">/100</span>
            </div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">
              ${a.avgEngagementRate >= 6 ? 'Excellent' : a.avgEngagementRate >= 4 ? 'Good' : 'Average'} — top ${a.avgEngagementRate >= 6 ? '10%' : a.avgEngagementRate >= 4 ? '25%' : '40%'} of creators in your niche
            </div>
          </div>
        </div>
      </div>

      <!-- Top Content -->
      <div class="analytics-bottom">
        <div class="analytics-bottom-title">Recent Content Performance</div>
        <div class="content-posts-grid">
          ${a.recentPosts.map(p => `
            <div class="content-post-card">
              <div class="content-post-thumb">
                <span>${p.icon}</span>
                <span class="content-post-type">${p.type}</span>
              </div>
              <div class="content-post-info">
                <div class="content-post-caption">${p.caption}</div>
                <div class="content-post-stats">
                  <div class="cps-item">♥ ${fmtShort(p.likes)}</div>
                  <div class="cps-item">💬 ${fmtShort(p.comments)}</div>
                  ${p.type === 'REEL' ? `<div class="cps-item">▶ ${fmtShort(p.plays)}</div>` : ''}
                  <div class="cps-item">↗ ${fmtShort(p.reach)}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Brands section: what brands see -->
      <div class="analytics-bottom" style="margin-bottom:0;">
        <div class="analytics-bottom-title">What Brands See on Your Profile</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
          ${[
            { label: 'Followers',       value: fmtShort(a.followers),             icon: '👥' },
            { label: 'Avg Reel Reach',  value: fmtShort(a.avgReelReach),          icon: '📡' },
            { label: 'Engagement',      value: a.avgEngagementRate + '%',          icon: '💥' },
            { label: 'Impressions/mo',  value: fmtShort(a.impressions30d),        icon: '👁' },
            { label: 'Top Audience',    value: a.audience.topCities[0].city,       icon: '📍' },
            { label: 'Top Age Group',   value: a.audience.ageGroups[2].label,      icon: '👤' }
          ].map(m => `
            <div style="background:rgba(244,241,232,.03);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:20px;margin-bottom:8px;">${m.icon}</div>
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;margin-bottom:3px;">${m.value}</div>
              <div style="font-size:11px;color:var(--text-dim);">${m.label}</div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:14px;padding:12px 14px;background:rgba(197,255,62,.04);border:1px solid rgba(197,255,62,.12);border-radius:10px;font-size:13px;color:var(--text-dim);">
          ✓ <strong style="color:var(--text);">Meta Verified</strong> — Brands in the marketplace see these metrics verified directly from Meta's API, not self-reported.
        </div>
      </div>
    `;

    // Wire up disconnect button
    document.getElementById('disconnectMetaBtn')?.addEventListener('click', () => {
      document.getElementById('metaDisconnectModal')?.classList.remove('hidden');
    });
  }

  /* ── Meta Connect Modal Logic ── */
  function openMetaConnectModal() {
    document.getElementById('metaStep1').classList.remove('hidden');
    document.getElementById('metaStep2').classList.add('hidden');
    document.getElementById('metaConnectModal')?.classList.remove('hidden');
  }

  document.getElementById('metaConnectClose')?.addEventListener('click',  () => document.getElementById('metaConnectModal')?.classList.add('hidden'));
  document.getElementById('metaConnectCancel')?.addEventListener('click', () => document.getElementById('metaConnectModal')?.classList.add('hidden'));

  document.getElementById('metaSimulateConnect')?.addEventListener('click', () => {
    // Show loading animation
    document.getElementById('metaStep1').classList.add('hidden');
    document.getElementById('metaStep2').classList.remove('hidden');

    const steps = ['mcs1','mcs2','mcs3','mcs4','mcs5'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        document.getElementById(steps[i])?.classList.add('done');
        i++;
      } else {
        clearInterval(interval);
        // Save connection + analytics
        const analytics = generateMetaAnalytics();
        CV.db.connectSocialAccount('instagram', { analytics });
        CV.db.updateSocialAnalytics('instagram', analytics);
        CV.db.addActivity('📊', 'Instagram account connected via Meta Graph API');
        CV.db.addNotification('Instagram connected — verified analytics are now live', 'info');

        // Close modal, refresh UI
        setTimeout(() => {
          document.getElementById('metaConnectModal')?.classList.add('hidden');
          // Show Meta badge in sidebar
          document.getElementById('metaBadge').style.display = 'inline-flex';
          updateBadges();
          renderAnalytics();
        }, 400);
      }
    }, 480);
  });

  /* Disconnect confirm */
  document.getElementById('metaDisconnectClose')?.addEventListener('click',   () => document.getElementById('metaDisconnectModal')?.classList.add('hidden'));
  document.getElementById('metaDisconnectCancel')?.addEventListener('click',  () => document.getElementById('metaDisconnectModal')?.classList.add('hidden'));
  document.getElementById('metaDisconnectConfirm')?.addEventListener('click', () => {
    CV.db.disconnectSocialAccount('instagram');
    CV.db.addActivity('🔌', 'Instagram account disconnected');
    document.getElementById('metaDisconnectModal')?.classList.add('hidden');
    document.getElementById('metaBadge').style.display = 'none';
    renderAnalytics();
    updateBadges();
  });

  /* Sync button */
  document.getElementById('syncMetaBtn')?.addEventListener('click', () => {
    const btn = document.getElementById('syncMetaBtn');
    btn.textContent = '↻ Syncing…';
    btn.disabled = true;
    setTimeout(() => {
      const analytics = generateMetaAnalytics();
      CV.db.updateSocialAnalytics('instagram', analytics);
      CV.db.addActivity('📊', 'Instagram analytics refreshed from Meta Graph API');
      btn.textContent = '↻ Sync Now';
      btn.disabled = false;
      renderAnalytics();
    }, 1800);
  });

  /* Show Meta badge in sidebar on page load if already connected */
  (function initMetaBadge() {
    const acc = CV.db.getSocialAccount('instagram');
    if (acc) {
      const badge = document.getElementById('metaBadge');
      if (badge) badge.style.display = 'inline-flex';
    }
  })();

  /* ══════════════════════════════════════════════
     SECTION: SETTINGS
  ══════════════════════════════════════════════ */
  function renderSettings() {
    user = CV.getCurrentUser();
    document.getElementById('st-name').value     = user.name;
    document.getElementById('st-email').value    = user.email;

    /* Set select values with fallback */
    const setPlatform = document.getElementById('st-platform');
    const setLanguage = document.getElementById('st-language');
    [...setPlatform.options].forEach(o => { if (o.value === user.platform || o.text === user.platform) setPlatform.value = o.value; });
    [...setLanguage.options].forEach(o => { if (o.value === user.language || o.text === user.language) setLanguage.value = o.value; });

    const PLAN_FEATURES = {
      SPARK:  ['Shared video editor','48–72h turnaround','GST + ITR filing','1 brand deal/month','1 contract review/month'],
      GROWTH: ['Dedicated video editor','Priority 48h turnaround','GST + ITR + TDS filing','Financial planning','2 brand deals/month','2 contract reviews/month'],
      PRO:    ['Senior dedicated editor','Rush 24h turnaround','Full CA + investment planning','Unlimited brand scouting','Priority contract review','Monthly strategy call'],
      ELITE:  ['Dedicated team','Same-day turnaround','Premium brand partnerships','Personal finance manager','Weekly strategy sessions','Everything in PRO']
    };
    const p = CV.PLANS[user.plan] || CV.PLANS.GROWTH;
    document.getElementById('planDisplay').innerHTML = `
      <div class="pd-plan">${user.plan}</div>
      <div class="pd-price">₹${p.price}/month · ${p.followers} followers</div>
    `;
    document.getElementById('planFeaturesList').innerHTML = (PLAN_FEATURES[user.plan] || []).map(f => `
      <div class="pfl-item">${f}</div>
    `).join('');

    /* Profile save */
    document.getElementById('profileForm').onsubmit = e => {
      e.preventDefault();
      const newName = document.getElementById('st-name').value.trim();
      const newPlatform = document.getElementById('st-platform').value;
      const newLanguage = document.getElementById('st-language').value;
      CV.db.updateProfile({ name: newName, platform: newPlatform, language: newLanguage });
      user = CV.getCurrentUser();
      /* Update UI everywhere */
      document.getElementById('sbName').textContent = newName;
      const newInitials = newName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      document.getElementById('sbAvatar').textContent = newInitials;
      document.getElementById('tbAvatar').textContent = newInitials;
      /* Update welcome banner if visible */
      const wbHi = document.getElementById('wbHi');
      if (wbHi) {
        const hour = new Date().getHours();
        const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        wbHi.textContent = `${g}, ${newName.split(' ')[0]} 👋`;
      }
      const msg = document.getElementById('profileSaveMsg');
      msg.style.color = 'var(--green)';
      msg.textContent = '✓ Profile updated successfully.';
      setTimeout(() => { msg.textContent = ''; }, 3000);
    };

    /* Add-on toggles — use onclick to avoid stacking listeners on re-render */
    document.querySelectorAll('.addon-toggle').forEach(btn => {
      btn.onclick = () => {
        const added = btn.classList.toggle('added');
        btn.textContent = added ? '✓ Added' : 'Add';
        if (added) {
          CV.db.addActivity('➕', `Add-on "${btn.dataset.addon}" requested`);
          CV.db.addNotification(`Your "${btn.dataset.addon}" add-on request has been received`, 'info');
        }
      };
    });
  }

  /* ══════════════════════════════════════════════
     INITIAL RENDER — all sections loaded fresh
  ══════════════════════════════════════════════ */
  renderOverview();
  renderVideos();
  renderFinances();
  renderDeals();
  renderContracts();
  renderSettings();

  /* Initial section is handled by hash routing above */
  // goTo('overview') — now driven by handleHashRouting()

});
