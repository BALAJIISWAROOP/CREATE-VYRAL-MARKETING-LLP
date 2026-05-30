/* ══════════════════════════════════════════════
   CREATE VYRAL — SHARED APP CORE
   localStorage-based DB + Auth + Seed Data
   ══════════════════════════════════════════════ */

const CV = (() => {

  /* ── Keys ── */
  const KEYS = {
    USERS:    'cv_users',
    CURRENT:  'cv_current',
    DATA:     (id) => `cv_data_${id}`
  };

  /* ── Helpers ── */
  const uid = () => 'cv_' + Math.random().toString(36).slice(2, 10);
  const now = () => new Date().toISOString();
  const dateStr = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const today = () => new Date().toISOString().split('T')[0];
  const addDays = (n) => {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };
  const subDays = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };
  const hashStr = (s) => btoa(s + '_cv_salt_2025');

  /* ── User DB ── */
  const getUsers  = () => JSON.parse(localStorage.getItem(KEYS.USERS)  || '[]');
  const saveUsers = (u) => localStorage.setItem(KEYS.USERS, JSON.stringify(u));

  const getCurrentId = () => localStorage.getItem(KEYS.CURRENT);
  const setCurrentId = (id) => localStorage.setItem(KEYS.CURRENT, id);

  const getUser = (id) => getUsers().find(u => u.id === id) || null;
  const getCurrentUser = () => getUser(getCurrentId());

  /* ── Creator Data ── */
  const getData  = (id) => JSON.parse(localStorage.getItem(KEYS.DATA(id)) || 'null');
  const saveData = (id, data) => localStorage.setItem(KEYS.DATA(id), JSON.stringify(data));

  /* ── Seed Data Generator ── */
  const PLANS = {
    SPARK:  { price: '6,999',  label: 'Spark',  followers: 'Under 50K',     editorType: 'Shared Editor',    videosPerMonth: 4,  dealsPerMonth: 1 },
    GROWTH: { price: '13,999', label: 'Growth', followers: '50K – 150K',    editorType: 'Dedicated Editor', videosPerMonth: 8,  dealsPerMonth: 2 },
    PRO:    { price: '26,999', label: 'Pro',     followers: '150K – 500K',   editorType: 'Senior Editor',    videosPerMonth: 16, dealsPerMonth: 5 },
    ELITE:  { price: '50,000+',label: 'Elite',  followers: '500K+',         editorType: 'Dedicated Team',   videosPerMonth: 30, dealsPerMonth: 10 }
  };

  const VIDEO_TITLES = [
    'Day In My Life Vlog', 'Street Food Tour - Chennai', 'Morning Routine 2025',
    'My Creator Setup Tour', 'Ooty Trip Highlights', 'Budget Travel Guide',
    'Product Review - Noise Buds', 'Q&A With My Subscribers', 'Weekly Vlog #12',
    'Healthy Eating Habits', 'Tech Unboxing Video', 'Fashion Lookbook - Summer',
    'Gaming Session Highlights', 'Behind The Scenes', 'Monthly Favourites'
  ];

  const BRANDS = [
    { name:'AstroTalk', niche:'Astrology / Lifestyle', amount:45000 },
    { name:'Mamaearth', niche:'Beauty / Skincare', amount:28000 },
    { name:'boAt', niche:'Tech / Lifestyle', amount:55000 },
    { name:'Noise', niche:'Tech / Wearables', amount:32000 },
    { name:'Mivi', niche:'Tech / Audio', amount:22000 },
    { name:'Sleepy Owl', niche:'Food / Lifestyle', amount:18000 },
    { name:'Bewakoof', niche:'Fashion / Youth', amount:35000 },
    { name:'FabIndia', niche:'Lifestyle / Culture', amount:42000 }
  ];

  function generateSeedData(plan, name) {
    const p = PLANS[plan] || PLANS.GROWTH;
    const month = new Date().toLocaleString('default', { month: 'long' });

    /* Videos */
    const videoStatuses = ['Delivered', 'Delivered', 'In Editing', 'In Queue', 'In Queue', 'Review Needed', 'Delivered', 'In Queue'];
    const videos = VIDEO_TITLES.slice(0, p.videosPerMonth).map((title, i) => ({
      id: uid(),
      title,
      status: videoStatuses[i % videoStatuses.length],
      platform: i % 2 === 0 ? 'YouTube' : 'Instagram Reels',
      requestedOn: subDays(Math.floor(Math.random() * 12) + 1),
      dueOn: ['Delivered','Delivered','Delivered'].includes(videoStatuses[i % videoStatuses.length])
        ? subDays(Math.floor(Math.random() * 5))
        : addDays(Math.floor(Math.random() * 4) + 1),
      editor: p.editorType,
      notes: i === 2 ? 'Add trending audio background' : ''
    }));

    /* Brand Deals */
    const dealStatuses = ['Active', 'Negotiating', 'Contract Review', 'Completed', 'Completed'];
    const deals = BRANDS.slice(0, p.dealsPerMonth + 3).map((b, i) => ({
      id: uid(),
      brand: b.name,
      niche: b.niche,
      amount: b.amount,
      status: dealStatuses[i % dealStatuses.length],
      startDate: subDays(Math.floor(Math.random() * 20) + 5),
      dueDate: addDays(Math.floor(Math.random() * 15) + 3),
      deliverables: i % 2 === 0 ? '1 YouTube Integration + 2 Stories' : '3 Instagram Reels',
      contractReviewed: i > 2
    }));

    /* Finances */
    const quarterEarnings = deals.reduce((s, d) => s + (d.status === 'Completed' ? d.amount : 0), 0);
    const finances = {
      gst: {
        status: 'Filed',
        period: 'Q4 FY 2024-25',
        filedOn: subDays(8),
        nextDue: addDays(22),
        amount: Math.round(quarterEarnings * 0.18)
      },
      itr: {
        status: 'Filed',
        year: 'AY 2024-25',
        filedOn: subDays(45),
        refund: 12400,
        refundStatus: 'Processing'
      },
      tds: {
        deducted: Math.round(deals.filter(d=>d.status==='Completed').reduce((s,d)=>s+d.amount,0) * 0.10),
        claimable: Math.round(deals.filter(d=>d.status==='Completed').reduce((s,d)=>s+d.amount,0) * 0.05),
        lastUpdated: subDays(3)
      },
      earnings: {
        thisMonth: deals.filter(d=>d.status==='Active').reduce((s,d)=>s+d.amount,0),
        lastMonth: Math.round(deals.filter(d=>d.status==='Completed').reduce((s,d)=>s+d.amount,0) * 0.8),
        thisQuarter: quarterEarnings,
        totalYTD: quarterEarnings + Math.round(quarterEarnings * 1.4),
        breakdown: [
          { source: 'Brand Integrations', amount: Math.round(quarterEarnings * 0.7) },
          { source: 'Sponsored Reels',    amount: Math.round(quarterEarnings * 0.2) },
          { source: 'Affiliate Income',   amount: Math.round(quarterEarnings * 0.1) }
        ]
      },
      investments: {
        sip: 5000,
        sipStarted: subDays(30),
        portfolio: Math.round(quarterEarnings * 0.12),
        recommendation: 'Increase SIP by ₹2,000 next month based on brand deal trend.'
      }
    };

    /* Contracts */
    const contracts = deals.filter(d => d.status === 'Contract Review' || d.status === 'Active').map((d, i) => ({
      id: uid(),
      brand: d.brand,
      type: i % 2 === 0 ? 'Brand Integration Agreement' : 'Sponsored Content Contract',
      status: d.status === 'Contract Review' ? 'Pending Review' : 'Signed',
      receivedOn: subDays(i + 2),
      value: d.amount,
      notes: d.status === 'Contract Review' ? 'Awaiting legal review by Create Vyral team.' : 'Reviewed & signed on ' + dateStr(subDays(1))
    }));

    /* Activity Feed */
    const activity = [
      { id: uid(), type: 'video',    icon: '🎬', msg: `"${videos[0]?.title}" delivered to your drive`, time: subDays(0) + 'T09:30:00Z' },
      { id: uid(), type: 'deal',     icon: '💼', msg: `${deals[0]?.brand} deal contract received for review`, time: subDays(1) + 'T14:00:00Z' },
      { id: uid(), type: 'finance',  icon: '🧾', msg: 'GST Q4 filing completed successfully', time: subDays(2) + 'T11:20:00Z' },
      { id: uid(), type: 'video',    icon: '🎬', msg: `"${videos[2]?.title}" entered editing queue`, time: subDays(3) + 'T10:00:00Z' },
      { id: uid(), type: 'deal',     icon: '💼', msg: `${deals[1]?.brand} collab negotiation started`, time: subDays(4) + 'T16:45:00Z' },
      { id: uid(), type: 'finance',  icon: '📊', msg: 'Monthly P&L report generated', time: subDays(5) + 'T09:00:00Z' }
    ];

    /* Notifications */
    const notifications = [
      { id: uid(), read: false, msg: `"${videos.find(v=>v.status==='Review Needed')?.title || 'Your video'}" needs your approval`, type: 'action', time: now() },
      { id: uid(), read: false, msg: `${deals.find(d=>d.status==='Contract Review')?.brand || 'A brand'} contract ready for review`, type: 'action', time: now() },
      { id: uid(), read: false, msg: `GST deadline in 22 days — all docs ready`, type: 'info', time: now() },
      { id: uid(), read: true,  msg: 'ITR refund of ₹12,400 is being processed', type: 'info', time: subDays(1) + 'T10:00:00Z' }
    ];

    return { videos, deals, finances, contracts, activity, notifications, plan: p, month };
  }

  /* ── Auth ── */
  const auth = {
    signup(name, email, password, platform, followers, language, plan) {
      const users = getUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const id = uid();
      const user = { id, name, email, password: hashStr(password), platform, followers, language, plan, joined: now() };
      users.push(user);
      saveUsers(users);
      setCurrentId(id);
      saveData(id, generateSeedData(plan, name));
      return { ok: true, user };
    },

    login(email, password) {
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashStr(password));
      if (!user) return { ok: false, error: 'Invalid email or password.' };
      setCurrentId(user.id);
      return { ok: true, user };
    },

    logout() {
      localStorage.removeItem(KEYS.CURRENT);
      window.location.href = 'index.html';
    },

    requireAuth() {
      if (!getCurrentId()) {
        window.location.href = 'auth.html';
        return false;
      }
      return true;
    },

    isLoggedIn: () => !!getCurrentId()
  };

  /* ── Data mutations ── */
  const db = {
    getCreatorData: () => {
      const id = getCurrentId();
      return id ? getData(id) : null;
    },

    updateVideo(videoId, updates) {
      const id = getCurrentId();
      const data = getData(id);
      data.videos = data.videos.map(v => v.id === videoId ? { ...v, ...updates } : v);
      saveData(id, data);
    },

    addVideo(title, platform, notes) {
      const id = getCurrentId();
      const data = getData(id);
      data.videos.unshift({
        id: uid(), title, platform, status: 'In Queue',
        requestedOn: today(), dueOn: addDays(3),
        editor: data.plan.editorType, notes: notes || ''
      });
      data.activity.unshift({ id: uid(), type: 'video', icon: '🎬', msg: `"${title}" added to editing queue`, time: now() });
      saveData(id, data);
    },

    markNotificationRead(notifId) {
      const id = getCurrentId();
      const data = getData(id);
      data.notifications = data.notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
      saveData(id, data);
    },

    markAllRead() {
      const id = getCurrentId();
      const data = getData(id);
      data.notifications = data.notifications.map(n => ({ ...n, read: true }));
      saveData(id, data);
    },

    updateDeal(dealId, updates) {
      const id = getCurrentId();
      const d = getData(id);
      d.deals = d.deals.map(x => x.id === dealId ? { ...x, ...updates } : x);
      saveData(id, d);
    },

    addContract(contractData) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.contracts) d.contracts = [];
      d.contracts.unshift({ id: uid(), ...contractData });
      saveData(id, d);
    },

    updateContract(contractId, updates) {
      const id = getCurrentId();
      const d = getData(id);
      d.contracts = d.contracts.map(c => c.id === contractId ? { ...c, ...updates } : c);
      saveData(id, d);
    },

    addActivity(icon, msg) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.activity) d.activity = [];
      d.activity.unshift({ id: uid(), type: 'update', icon, msg, time: new Date().toISOString() });
      saveData(id, d);
    },

    addNotification(msg, type) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.notifications) d.notifications = [];
      d.notifications.unshift({ id: uid(), read: false, msg, type: type || 'info', time: new Date().toISOString() });
      saveData(id, d);
    },

    updateProfile(updates) {
      const users = getUsers();
      const idx = users.findIndex(u => u.id === getCurrentId());
      if (idx > -1) { users[idx] = { ...users[idx], ...updates }; saveUsers(users); }
    },

    /* ── Social / Meta connections ── */
    getSocialAccount(platform) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.socialAccounts) return null;
      return d.socialAccounts.find(a => a.platform === platform) || null;
    },

    connectSocialAccount(platform, accountData) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.socialAccounts) d.socialAccounts = [];
      const existing = d.socialAccounts.findIndex(a => a.platform === platform);
      if (existing > -1) {
        d.socialAccounts[existing] = { platform, connectedAt: now(), ...accountData };
      } else {
        d.socialAccounts.push({ platform, connectedAt: now(), ...accountData });
      }
      saveData(id, d);
    },

    disconnectSocialAccount(platform) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.socialAccounts) return;
      d.socialAccounts = d.socialAccounts.filter(a => a.platform !== platform);
      saveData(id, d);
    },

    updateSocialAnalytics(platform, analytics) {
      const id = getCurrentId();
      const d = getData(id);
      if (!d.socialAccounts) return;
      const idx = d.socialAccounts.findIndex(a => a.platform === platform);
      if (idx > -1) {
        d.socialAccounts[idx].analytics = analytics;
        d.socialAccounts[idx].lastSynced = now();
      }
      saveData(id, d);
    }
  };

  /* ── Formatting utils ── */
  const fmt = {
    currency: (n) => '₹' + Number(n).toLocaleString('en-IN'),
    date: dateStr,
    timeAgo(isoStr) {
      const diff = (Date.now() - new Date(isoStr)) / 1000;
      if (diff < 60)    return 'Just now';
      if (diff < 3600)  return Math.floor(diff/60) + 'm ago';
      if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
      return Math.floor(diff/86400) + 'd ago';
    },
    statusBadge(status) {
      const map = {
        'Delivered':      ['badge-green',  'Delivered'],
        'In Editing':     ['badge-blue',   'In Editing'],
        'In Queue':       ['badge-gray',   'In Queue'],
        'Review Needed':  ['badge-amber',  'Review Needed'],
        'Active':         ['badge-green',  'Active'],
        'Negotiating':    ['badge-blue',   'Negotiating'],
        'Contract Review':['badge-amber',  'Contract Review'],
        'Completed':      ['badge-purple', 'Completed'],
        'Filed':          ['badge-green',  'Filed'],
        'Due Soon':       ['badge-amber',  'Due Soon'],
        'Pending Review': ['badge-amber',  'Pending Review'],
        'Signed':         ['badge-green',  'Signed']
      };
      const [cls, label] = map[status] || ['badge-gray', status];
      return `<span class="badge ${cls}">${label}</span>`;
    },
    planColor(plan) {
      return { SPARK:'#f59e0b', GROWTH:'#C5FF3E', PRO:'#06b6d4', ELITE:'#ec4899' }[plan] || '#C5FF3E';
    }
  };

  return { auth, db, fmt, getCurrentUser, PLANS };
})();
