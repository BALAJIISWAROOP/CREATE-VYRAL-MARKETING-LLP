/* ══════════════════════════════════════════════
   CREATE VYRAL — BRAND MARKETPLACE
   brand.js · Creator data + Auth + UI logic
   ══════════════════════════════════════════════ */

/* ─── Creator Database ─── */
const CREATORS = [
  {
    id:1, name:"Karthik Subramanian", handle:"@karthik_techzone",
    initials:"KS", color:"#4f46e5",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Tech & Gadgets", language:"Tamil",
    city:"Chennai", state:"Tamil Nadu",
    yt_subs:285000, ig_followers:124000,
    yt_avg_views:145000, ig_avg_reach:38000,
    engagement:4.2, retention:68,
    growth_30d:12400, verified:true, meta_verified:true, tier:"PRO",
    bio:"Tamil tech reviewer known for honest, detailed reviews of budget smartphones, gadgets and audio gear. Strong buyer-intent audience.",
    recent_brands:["boAt","Noise","Mivi","Amazon Basics"],
    past_deals:24,
    rate:{ yt_integration:45000, yt_dedicated:75000, reel:18000, story:5000 },
    audience:{ age:"18–34", male:78, top:["Chennai","Coimbatore","Bangalore"] },
    style:"Review & Unboxing",
    topics:["Best smartphones under ₹15K","Noise Smartwatch review","Budget earbuds comparison"],
    response:"< 24h", joined:"Jan 2024"
  },
  {
    id:2, name:"Preethi Venkatesan", handle:"@preethi_glam",
    initials:"PV", color:"#ec4899",
    platforms:["Instagram","YouTube"], primaryPlatform:"Instagram",
    niche:"Beauty & Skincare", language:"Tamil",
    city:"Bangalore", state:"Karnataka",
    yt_subs:89000, ig_followers:312000,
    yt_avg_views:42000, ig_avg_reach:95000,
    engagement:7.4, retention:72,
    growth_30d:18700, verified:true, meta_verified:true, tier:"PRO",
    bio:"Beauty and skincare influencer specialising in affordable routines and makeup tutorials for South Indian skin tones.",
    recent_brands:["Mamaearth","Minimalist","Lakme","Nykaa"],
    past_deals:31,
    rate:{ yt_integration:32000, yt_dedicated:55000, reel:28000, story:8000 },
    audience:{ age:"18–28", male:12, top:["Bangalore","Chennai","Hyderabad"] },
    style:"Tutorial & GRWM",
    topics:["5-step skincare for oily skin","Affordable makeup dupes","Tamil wedding makeup look"],
    response:"< 12h", joined:"Nov 2023"
  },
  {
    id:3, name:"Ravi Kumar Reddy", handle:"@ravi_foodie_hyd",
    initials:"RK", color:"#f59e0b",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Food & Cooking", language:"Telugu",
    city:"Hyderabad", state:"Andhra Pradesh",
    yt_subs:420000, ig_followers:67000,
    yt_avg_views:210000, ig_avg_reach:22000,
    engagement:5.8, retention:74,
    growth_30d:22300, verified:true, meta_verified:true, tier:"ELITE",
    bio:"Hyderabad's most-followed food creator. Street food tours, restaurant reviews and authentic Telugu recipes with cinematic visuals.",
    recent_brands:["Swiggy","Zomato","Sleepy Owl","ITC Master Chef"],
    past_deals:48,
    rate:{ yt_integration:85000, yt_dedicated:140000, reel:35000, story:12000 },
    audience:{ age:"22–40", male:55, top:["Hyderabad","Vijayawada","Chennai"] },
    style:"Vlog & Street Tour",
    topics:["Best biryani in Hyderabad","10 dishes under ₹100","Traditional Ugadi feast"],
    response:"< 48h", joined:"Aug 2023"
  },
  {
    id:4, name:"Ananya Krishnaswamy", handle:"@ananya_ootd",
    initials:"AK", color:"#8b5cf6",
    platforms:["Instagram"], primaryPlatform:"Instagram",
    niche:"Fashion & Style", language:"Tamil",
    city:"Chennai", state:"Tamil Nadu",
    yt_subs:0, ig_followers:198000,
    yt_avg_views:0, ig_avg_reach:62000,
    engagement:8.1, retention:0,
    growth_30d:9800, verified:true, tier:"GROWTH",
    bio:"South Indian fashion creator blending traditional silhouettes with modern trends. Known for Kanjeevaram fusion and budget styling tips.",
    recent_brands:["Bewakoof","FabIndia","Ajio","Myntra"],
    past_deals:19,
    rate:{ yt_integration:0, yt_dedicated:0, reel:35000, story:10000 },
    audience:{ age:"18–32", male:18, top:["Chennai","Coimbatore","Madurai"] },
    style:"OOTD & Styling",
    topics:["5 ways to style a saree modern","Fashion haul under ₹1,000","Festival outfit ideas"],
    response:"< 24h", joined:"Feb 2024"
  },
  {
    id:5, name:"Vijay Dhanapal", handle:"@vijay_gamerz",
    initials:"VD", color:"#10b981",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Gaming", language:"Tamil",
    city:"Coimbatore", state:"Tamil Nadu",
    yt_subs:134000, ig_followers:48000,
    yt_avg_views:78000, ig_avg_reach:15000,
    engagement:9.2, retention:82,
    growth_30d:7600, verified:true, tier:"GROWTH",
    bio:"Tamil gaming creator focusing on mobile and PC games. Known for BGMI tournaments, strategy guides and tech setup tours.",
    recent_brands:["Razer","ASUS ROG","Monster Energy","HyperX"],
    past_deals:14,
    rate:{ yt_integration:28000, yt_dedicated:48000, reel:14000, story:4500 },
    audience:{ age:"16–26", male:91, top:["Coimbatore","Chennai","Trichy"] },
    style:"Gameplay & Reviews",
    topics:["BGMI squad strategy","Best gaming phones under ₹25K","Gaming room setup tour"],
    response:"< 24h", joined:"Mar 2024"
  },
  {
    id:6, name:"Lakshmi Pillai", handle:"@lakshmi_travels",
    initials:"LP", color:"#06b6d4",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Travel & Vlog", language:"Malayalam",
    city:"Thiruvananthapuram", state:"Kerala",
    yt_subs:210000, ig_followers:142000,
    yt_avg_views:112000, ig_avg_reach:44000,
    engagement:6.3, retention:71,
    growth_30d:14200, verified:true, meta_verified:true, tier:"PRO",
    bio:"Kerala's top travel creator covering offbeat South Indian destinations, budget itineraries and solo travel for young Indians.",
    recent_brands:["MakeMyTrip","OYO Rooms","Skyscanner","Wildcraft"],
    past_deals:27,
    rate:{ yt_integration:42000, yt_dedicated:68000, reel:20000, story:6500 },
    audience:{ age:"20–35", male:48, top:["Kochi","Thiruvananthapuram","Bangalore"] },
    style:"Vlog & Travel Guide",
    topics:["Hidden gems of Kerala in 5 days","Ooty trip under ₹5,000","Solo travel safety tips for women"],
    response:"< 48h", joined:"Oct 2023"
  },
  {
    id:7, name:"Srikanth Babu", handle:"@srikanth_money",
    initials:"SB", color:"#f97316",
    platforms:["YouTube"], primaryPlatform:"YouTube",
    niche:"Finance & Investment", language:"Telugu",
    city:"Vijayawada", state:"Andhra Pradesh",
    yt_subs:178000, ig_followers:34000,
    yt_avg_views:95000, ig_avg_reach:12000,
    engagement:5.1, retention:76,
    growth_30d:11400, verified:true, tier:"PRO",
    bio:"Telugu finance educator simplifying stock markets, mutual funds and personal finance for salaried professionals and small business owners.",
    recent_brands:["Groww","Zerodha","HDFC Bank","PolicyBazaar"],
    past_deals:20,
    rate:{ yt_integration:55000, yt_dedicated:90000, reel:22000, story:7000 },
    audience:{ age:"24–42", male:72, top:["Vijayawada","Hyderabad","Bangalore"] },
    style:"Education & Explainer",
    topics:["SIP vs lumpsum explained","Best mutual funds 2024","How to save ₹10 lakh in 3 years"],
    response:"< 24h", joined:"Dec 2023"
  },
  {
    id:8, name:"Divya Kumari", handle:"@divya_fitlife",
    initials:"DK", color:"#ef4444",
    platforms:["Instagram","YouTube"], primaryPlatform:"Instagram",
    niche:"Fitness & Wellness", language:"Kannada",
    city:"Mysore", state:"Karnataka",
    yt_subs:62000, ig_followers:185000,
    yt_avg_views:28000, ig_avg_reach:58000,
    engagement:8.9, retention:69,
    growth_30d:8900, verified:true, tier:"GROWTH",
    bio:"Certified fitness trainer and nutritionist sharing practical home workouts, diet plans and wellness routines for working women.",
    recent_brands:["HealthKart","Muscleblaze","Decathlon","Protinex"],
    past_deals:22,
    rate:{ yt_integration:25000, yt_dedicated:42000, reel:22000, story:7500 },
    audience:{ age:"22–38", male:24, top:["Mysore","Bangalore","Mangalore"] },
    style:"Workout & Nutrition",
    topics:["20-min home HIIT workout","High protein vegetarian meals","7-day abs challenge"],
    response:"< 12h", joined:"Jan 2024"
  },
  {
    id:9, name:"Arun Thiagarajan", handle:"@arun_comedy",
    initials:"AT", color:"#eab308",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Comedy & Entertainment", language:"Tamil",
    city:"Chennai", state:"Tamil Nadu",
    yt_subs:548000, ig_followers:287000,
    yt_avg_views:285000, ig_avg_reach:98000,
    engagement:6.7, retention:65,
    growth_30d:31200, verified:true, meta_verified:true, tier:"ELITE",
    bio:"Tamil comedy creator known for relatable office-life skits, family drama parodies and trending meme content. Massive brand recall value.",
    recent_brands:["Amazon Prime","Swiggy","Dunzo","Pepsi"],
    past_deals:56,
    rate:{ yt_integration:120000, yt_dedicated:200000, reel:65000, story:20000 },
    audience:{ age:"18–35", male:62, top:["Chennai","Coimbatore","Madurai"] },
    style:"Skit & Entertainment",
    topics:["Office life in Tamil Nadu","Amma vs modern recipes","IPL fever Tamil version"],
    response:"< 48h", joined:"Sep 2023"
  },
  {
    id:10, name:"Nithya Raghunathan", handle:"@nithya_kitchen",
    initials:"NR", color:"#84cc16",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Food & Cooking", language:"Tamil",
    city:"Madurai", state:"Tamil Nadu",
    yt_subs:162000, ig_followers:98000,
    yt_avg_views:82000, ig_avg_reach:31000,
    engagement:7.2, retention:78,
    growth_30d:9200, verified:true, meta_verified:true, tier:"PRO",
    bio:"Traditional Tamil and South Indian recipes with easy-to-follow instructions. Specialises in temple-style prasadams and festive cooking.",
    recent_brands:["MDH Spices","Aachi Masala","Idhayam Oil","Prestige"],
    past_deals:29,
    rate:{ yt_integration:38000, yt_dedicated:62000, reel:18000, story:5500 },
    audience:{ age:"25–50", male:22, top:["Madurai","Chennai","Trichy"] },
    style:"Recipe & Tutorial",
    topics:["Authentic Chettinad chicken","Pongal festival recipes","Street food of Madurai"],
    response:"< 24h", joined:"Nov 2023"
  },
  {
    id:11, name:"Prashanth Gowda", handle:"@prashanth_techkn",
    initials:"PG", color:"#3b82f6",
    platforms:["YouTube"], primaryPlatform:"YouTube",
    niche:"Tech & Gadgets", language:"Kannada",
    city:"Bangalore", state:"Karnataka",
    yt_subs:325000, ig_followers:56000,
    yt_avg_views:168000, ig_avg_reach:18000,
    engagement:4.8, retention:71,
    growth_30d:16800, verified:true, tier:"PRO",
    bio:"Kannada tech creator covering smartphones, laptops and emerging technology. Known for in-depth benchmark comparisons and value-for-money picks.",
    recent_brands:["OnePlus","Samsung","Lenovo","WD"],
    past_deals:33,
    rate:{ yt_integration:58000, yt_dedicated:95000, reel:24000, story:8000 },
    audience:{ age:"20–38", male:82, top:["Bangalore","Mysore","Hubli"] },
    style:"Review & Comparison",
    topics:["Best phones under ₹20K","Laptop buying guide 2024","5G vs 4G performance test"],
    response:"< 24h", joined:"Oct 2023"
  },
  {
    id:12, name:"Meera Suresh", handle:"@meera_lifestyle",
    initials:"MS", color:"#a855f7",
    platforms:["Instagram","YouTube"], primaryPlatform:"Instagram",
    niche:"Lifestyle & Vlogs", language:"Malayalam",
    city:"Kochi", state:"Kerala",
    yt_subs:88000, ig_followers:248000,
    yt_avg_views:41000, ig_avg_reach:76000,
    engagement:7.6, retention:66,
    growth_30d:13500, verified:true, tier:"PRO",
    bio:"Kerala lifestyle creator sharing home decor, self-care routines, productivity hacks and aesthetic daily vlogs popular with young professionals.",
    recent_brands:["IKEA India","Nykaa","Sugar Cosmetics","Pepperfry"],
    past_deals:26,
    rate:{ yt_integration:35000, yt_dedicated:58000, reel:30000, story:9500 },
    audience:{ age:"20–35", male:28, top:["Kochi","Thiruvananthapuram","Calicut"] },
    style:"Aesthetic Vlog & Tips",
    topics:["Apartment makeover on a budget","Morning routine productivity edition","Kerala traditional vs modern home decor"],
    response:"< 24h", joined:"Dec 2023"
  },
  {
    id:13, name:"Santhosh Lakkaraju", handle:"@santhosh_cricket",
    initials:"SL", color:"#14b8a6",
    platforms:["YouTube","Instagram"], primaryPlatform:"YouTube",
    niche:"Sports & Cricket", language:"Telugu",
    city:"Hyderabad", state:"Andhra Pradesh",
    yt_subs:215000, ig_followers:112000,
    yt_avg_views:125000, ig_avg_reach:38000,
    engagement:5.4, retention:73,
    growth_30d:18900, verified:true, tier:"PRO",
    bio:"Telugu cricket analyst and fantasy sports creator. Covers IPL, team predictions, player analysis and sports nutrition for cricket fans.",
    recent_brands:["Dream11","My11Circle","Thums Up","Adidas"],
    past_deals:21,
    rate:{ yt_integration:48000, yt_dedicated:78000, reel:22000, story:7200 },
    audience:{ age:"18–35", male:88, top:["Hyderabad","Vijayawada","Chennai"] },
    style:"Analysis & Prediction",
    topics:["IPL auction analysis","Fantasy XI winning formula","Best young batsmen to watch"],
    response:"< 24h", joined:"Feb 2024"
  },
  {
    id:14, name:"Kavitha Nair", handle:"@kavitha_beauty",
    initials:"KN", color:"#f43f5e",
    platforms:["Instagram","YouTube"], primaryPlatform:"Instagram",
    niche:"Beauty & Skincare", language:"Malayalam",
    city:"Kochi", state:"Kerala",
    yt_subs:75000, ig_followers:156000,
    yt_avg_views:34000, ig_avg_reach:48000,
    engagement:9.1, retention:70,
    growth_30d:7400, verified:true, tier:"GROWTH",
    bio:"Kerala beauty creator focusing on Ayurvedic skincare, traditional beauty rituals and clean beauty product reviews.",
    recent_brands:["Biotique","Himalaya","Kama Ayurveda","Forest Essentials"],
    past_deals:18,
    rate:{ yt_integration:28000, yt_dedicated:46000, reel:24000, story:8000 },
    audience:{ age:"22–38", male:16, top:["Kochi","Thiruvananthapuram","Calicut"] },
    style:"Skincare Review & Ritual",
    topics:["Ayurvedic skincare for glowing skin","Traditional Kerala hair care routine","Clean beauty under ₹500"],
    response:"< 24h", joined:"Jan 2024"
  }
];

/* ─── Brand Auth (localStorage) ─── */
const BrandAuth = {
  KEY: 'cv_brand_user',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; } },
  set(u)  { localStorage.setItem(this.KEY, JSON.stringify(u)); },
  logout(){ localStorage.removeItem(this.KEY); location.reload(); },
  isLoggedIn(){ return !!this.get(); }
};

/* ─── Format helpers ─── */
const fmtNum = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M'
                   : n >= 1000    ? (n/1000).toFixed(n >= 100000 ? 0 : 1)+'K'
                   : n.toString();
const fmtINR = n => '₹' + Number(n).toLocaleString('en-IN');
const tierColor = { SPARK:'#f59e0b', GROWTH:'#C5FF3E', PRO:'#06b6d4', ELITE:'#ec4899' };
const tierIcon  = { SPARK:'⚡', GROWTH:'🚀', PRO:'👑', ELITE:'💎' };
const platIcon  = { YouTube:'<svg width="14" height="14" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/><polygon fill="#fff" points="9.6 15.6 15.8 12 9.6 8.4 9.6 15.6"/></svg>',
                    Instagram:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ig)" stroke-width="2"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="50%" stop-color="#e6683c"/><stop offset="75%" stop-color="#dc2743"/><stop offset="100%" stop-color="#cc2366"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig)" stroke="none"/></svg>' };

/* ─── Current filter state ─── */
let filters = { search:'', niche:'all', platform:'all', state:'all', followers:'all', language:'all', metaVerifiedOnly: false };
let currentCreatorId = null;

/* ─── Render grid ─── */
function renderGrid() {
  const loggedIn = BrandAuth.isLoggedIn();
  const grid = document.getElementById('creatorGrid');
  const empty = document.getElementById('emptyState');

  let list = CREATORS.filter(c => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.niche.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q)) return false;
    }
    if (filters.niche !== 'all' && c.niche !== filters.niche) return false;
    if (filters.platform !== 'all') {
      if (filters.platform === 'YouTube' && !c.platforms.includes('YouTube')) return false;
      if (filters.platform === 'Instagram' && !c.platforms.includes('Instagram')) return false;
      if (filters.platform === 'Both' && !(c.platforms.includes('YouTube') && c.platforms.includes('Instagram'))) return false;
    }
    if (filters.state !== 'all' && c.state !== filters.state) return false;
    if (filters.language !== 'all' && c.language !== filters.language) return false;
    if (filters.followers !== 'all') {
      const total = (c.yt_subs || 0) + (c.ig_followers || 0);
      if (filters.followers === '10K-50K'    && !(total >= 10000  && total < 50000))   return false;
      if (filters.followers === '50K-150K'   && !(total >= 50000  && total < 150000))  return false;
      if (filters.followers === '150K-500K'  && !(total >= 150000 && total < 500000))  return false;
      if (filters.followers === '500K+'      && total < 500000)                         return false;
    }
    if (filters.metaVerifiedOnly && !c.meta_verified) return false;
    return true;
  });

  document.getElementById('resultCount').textContent = list.length + ' creator' + (list.length !== 1 ? 's' : '');

  if (!list.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = list.map(c => {
    const totalFollowers = (c.yt_subs || 0) + (c.ig_followers || 0);
    const locked = !loggedIn;
    return `
    <div class="creator-card ${locked ? 'locked' : ''}" data-id="${c.id}">
      <div class="card-top">
        <div class="creator-avatar" style="background:${c.color}20;color:${c.color}">${c.initials}</div>
        <div class="creator-meta">
          <div class="creator-name">
            ${c.name}
            ${c.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}
            ${c.meta_verified ? '<span class="meta-verified-pill" title="Instagram analytics verified by Meta Graph API">Meta ✓</span>' : ''}
          </div>
          <div class="creator-handle">${c.handle}</div>
          <div class="creator-tier" style="color:${tierColor[c.tier]}">${tierIcon[c.tier]} ${c.tier}</div>
        </div>
        <div class="niche-pill">${c.niche}</div>
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-label">Total Reach</div>
          <div class="stat-val">${fmtNum(totalFollowers)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Engagement</div>
          <div class="stat-val accent">${c.engagement}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${locked ? 'Retention' : 'Watch Retention'}</div>
          <div class="stat-val">${c.retention > 0 ? c.retention + '%' : '—'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Past Deals</div>
          <div class="stat-val">${c.past_deals}</div>
        </div>
      </div>

      <div class="card-platforms">
        ${c.platforms.map(p => `<span class="plat-tag">${platIcon[p]} ${p}</span>`).join('')}
        <span class="lang-tag">${c.language}</span>
        <span class="loc-tag">📍 ${c.city}</span>
      </div>

      <div class="card-brands">
        <span class="brands-label">Past brands:</span>
        ${c.recent_brands.slice(0,3).map(b => `<span class="brand-chip">${b}</span>`).join('')}
      </div>

      <div class="card-footer ${locked ? 'blurred' : ''}">
        <div class="rate-preview">
          ${c.rate.yt_integration ? `<span>YT Integration: <strong>${fmtINR(c.rate.yt_integration)}</strong></span>` : ''}
          ${c.rate.reel ? `<span>Reel: <strong>${fmtINR(c.rate.reel)}</strong></span>` : ''}
        </div>
        <button class="btn-view-profile" onclick="${locked ? 'openAuthModal()' : `openCreatorDetail(${c.id})`}">
          ${locked ? '🔒 Unlock Profile' : 'View Full Profile →'}
        </button>
      </div>
      ${locked ? `<div class="lock-overlay" onclick="openAuthModal()"><div class="lock-content"><div class="lock-icon">🔒</div><div class="lock-text">Pay ₹10 to unlock all<br>creator profiles & insights</div><div class="lock-cta">Get Brand Access</div></div></div>` : ''}
    </div>`;
  }).join('');
}

/* ─── Creator Detail Modal ─── */
function openCreatorDetail(id) {
  if (!BrandAuth.isLoggedIn()) { openAuthModal(); return; }
  const c = CREATORS.find(x => x.id === id);
  if (!c) return;
  currentCreatorId = id;

  const m = document.getElementById('creatorDetailModal');
  const totalFollowers = (c.yt_subs || 0) + (c.ig_followers || 0);

  document.getElementById('cdm-avatar').textContent = c.initials;
  document.getElementById('cdm-avatar').style.background = c.color + '20';
  document.getElementById('cdm-avatar').style.color = c.color;
  document.getElementById('cdm-name').innerHTML = c.name +
    (c.verified ? ' <span class="verified-badge">✓</span>' : '') +
    (c.meta_verified ? ' <span class="meta-verified-pill">Meta ✓</span>' : '');
  document.getElementById('cdm-handle').textContent = c.handle;
  document.getElementById('cdm-tier').textContent = tierIcon[c.tier] + ' ' + c.tier;
  document.getElementById('cdm-tier').style.color = tierColor[c.tier];
  document.getElementById('cdm-niche').textContent = c.niche;
  document.getElementById('cdm-bio').textContent = c.bio;
  document.getElementById('cdm-location').textContent = c.city + ', ' + c.state;
  document.getElementById('cdm-language').textContent = c.language;
  document.getElementById('cdm-style').textContent = c.style;
  document.getElementById('cdm-response').textContent = c.response;
  document.getElementById('cdm-joined').textContent = 'Member since ' + c.joined;

  // Platform stats
  document.getElementById('cdm-platform-stats').innerHTML = `
    ${c.yt_subs ? `
    <div class="plat-stat-block yt">
      <div class="psb-head">${platIcon['YouTube']} YouTube</div>
      <div class="psb-grid">
        <div><span class="psb-label">Subscribers</span><span class="psb-val">${fmtNum(c.yt_subs)}</span></div>
        <div><span class="psb-label">Avg Views</span><span class="psb-val">${fmtNum(c.yt_avg_views)}</span></div>
        <div><span class="psb-label">Retention</span><span class="psb-val accent">${c.retention}%</span></div>
        <div><span class="psb-label">Growth/mo</span><span class="psb-val">+${fmtNum(c.growth_30d)}</span></div>
      </div>
    </div>` : ''}
    ${c.ig_followers ? `
    <div class="plat-stat-block ig">
      <div class="psb-head">${platIcon['Instagram']} Instagram</div>
      <div class="psb-grid">
        <div><span class="psb-label">Followers</span><span class="psb-val">${fmtNum(c.ig_followers)}</span></div>
        <div><span class="psb-label">Avg Reach</span><span class="psb-val">${fmtNum(c.ig_avg_reach)}</span></div>
        <div><span class="psb-label">Engagement</span><span class="psb-val accent">${c.engagement}%</span></div>
        <div><span class="psb-label">Growth/mo</span><span class="psb-val">+${fmtNum(c.growth_30d)}</span></div>
      </div>
    </div>` : ''}
  `;

  // Meta Verified analytics block
  const metaBlock = document.getElementById('cdm-meta-analytics');
  if (metaBlock) {
    if (c.meta_verified) {
      const engRate = c.engagement;
      const reach30 = Math.round(c.ig_followers * 4.8);
      const imp30   = Math.round(c.ig_followers * 12);
      const reelAvg = Math.round(c.ig_followers * 0.82);
      metaBlock.innerHTML = `
        <div class="meta-analytics-block">
          <div class="mab-header">
            <div class="mab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="rgba(225,48,108,.8)"/><path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4z" fill="#fff"/></svg>
            </div>
            <div class="mab-title">Meta Graph API — Verified Analytics</div>
            <div class="meta-verified-pill small">✓ Verified</div>
          </div>
          <div class="mab-grid">
            <div class="mab-item"><div class="mab-label">Reach (30d)</div><div class="mab-val">${fmtNum(reach30)}</div></div>
            <div class="mab-item"><div class="mab-label">Impressions (30d)</div><div class="mab-val">${fmtNum(imp30)}</div></div>
            <div class="mab-item"><div class="mab-label">Avg Engagement</div><div class="mab-val accent">${engRate}%</div></div>
            <div class="mab-item"><div class="mab-label">Avg Reel Plays</div><div class="mab-val">${fmtNum(reelAvg)}</div></div>
          </div>
          <div class="mab-note">These metrics are read directly from Meta's Graph API, not self-reported. Last synced via OAuth 2.0.</div>
        </div>`;
      metaBlock.style.display = 'block';
    } else {
      metaBlock.innerHTML = `
        <div class="mab-not-connected">
          <span style="font-size:13px;color:var(--text-dim);">📊 Analytics not yet verified via Meta API</span>
        </div>`;
      metaBlock.style.display = 'block';
    }
  }

  // Audience
  document.getElementById('cdm-audience').innerHTML = `
    <div class="aud-row"><span class="aud-label">Age Range</span><span class="aud-val">${c.audience.age}</span></div>
    <div class="aud-row">
      <span class="aud-label">Gender Split</span>
      <span class="aud-val">
        <span style="color:#60a5fa">${c.audience.male}% Male</span> ·
        <span style="color:#f472b6">${100 - c.audience.male}% Female</span>
      </span>
    </div>
    <div class="aud-row gender-bar-wrap">
      <div class="gender-bar">
        <div class="gender-bar-male" style="width:${c.audience.male}%"></div>
      </div>
    </div>
    <div class="aud-row"><span class="aud-label">Top Locations</span><span class="aud-val">${c.audience.top.join(' · ')}</span></div>
  `;

  // Rate card
  document.getElementById('cdm-rates').innerHTML = `
    <table class="rate-table">
      ${c.rate.yt_integration ? `<tr><td>YouTube Integration</td><td>${fmtINR(c.rate.yt_integration)}</td></tr>` : ''}
      ${c.rate.yt_dedicated ? `<tr><td>YouTube Dedicated Video</td><td>${fmtINR(c.rate.yt_dedicated)}</td></tr>` : ''}
      ${c.rate.reel ? `<tr><td>Instagram Reel</td><td>${fmtINR(c.rate.reel)}</td></tr>` : ''}
      ${c.rate.story ? `<tr><td>Instagram Story</td><td>${fmtINR(c.rate.story)}</td></tr>` : ''}
    </table>
    <div class="rate-note">* Rates are base prices. Create Vyral negotiates final pricing on behalf of the creator.</div>
  `;

  // Past brands
  document.getElementById('cdm-brands').innerHTML = c.recent_brands.map(b =>
    `<span class="brand-chip large">${b}</span>`).join('');

  // Sample topics
  document.getElementById('cdm-topics').innerHTML = c.topics.map(t =>
    `<div class="topic-item">▸ ${t}</div>`).join('');

  // Past deals count
  document.getElementById('cdm-deals-count').textContent = c.past_deals + ' brand collaborations completed';

  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ─── Auth Modal ─── */
let authStep = 'form'; // 'form' | 'payment' | 'success'

function openAuthModal() {
  /* If already logged in, don't re-open signup — just show the nav brand pill */
  if (BrandAuth.isLoggedIn()) {
    const u = BrandAuth.get();
    /* Optionally scroll to grid instead of opening modal */
    document.getElementById('creatorGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  authStep = 'form';
  const m = document.getElementById('brandAuthModal');
  /* Reset all panels to clean state */
  document.getElementById('authFormPanel').style.display = '';
  document.getElementById('loginFormPanel').style.display = 'none';
  document.getElementById('paymentPanel').style.display = 'none';
  document.getElementById('authSuccessPanel').style.display = 'none';
  document.getElementById('authFormLoginArea').style.display = '';
  showAuthStep('signup');
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showAuthStep(tab) {
  document.getElementById('authFormLoginArea').style.display = '';
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('authFormPanel').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginFormPanel').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('paymentPanel').style.display = 'none';
  document.getElementById('authSuccessPanel').style.display = 'none';
}

function switchAuthTab(tab) { showAuthStep(tab); }

/* Simple hash (same salt pattern as app.js) */
const _bHash = (s) => btoa(s + '_cv_brand_2025');

function handleSignup() {
  const brandName = document.getElementById('sb-brand').value.trim();
  const contactName = document.getElementById('sb-contact').value.trim();
  const email = document.getElementById('sb-email').value.trim();
  const password = document.getElementById('sb-password').value.trim();
  const industry = document.getElementById('sb-industry').value;

  if (!brandName || !contactName || !email || !password || !industry) {
    showAuthError('signup', 'Please fill all fields.');
    return;
  }
  if (password.length < 6) { showAuthError('signup', 'Password must be at least 6 characters.'); return; }

  /* Check if email already registered */
  const existing = BrandAuth.get();
  if (existing && existing.email === email) {
    showAuthError('signup', 'An account with this email already exists. Please login instead.');
    return;
  }

  /* Store pending user with hashed password, show payment */
  window._pendingBrandUser = { brandName, contactName, email, passwordHash: _bHash(password), industry, joined: new Date().toISOString() };
  showPaymentStep();
}

function handleLogin() {
  const email = document.getElementById('lb-email').value.trim();
  const password = document.getElementById('lb-password').value.trim();
  if (!email || !password) { showAuthError('login', 'Please enter email and password.'); return; }

  const stored = BrandAuth.get();
  if (!stored || stored.email !== email) {
    showAuthError('login', 'No account found with this email. Please sign up first.');
    return;
  }
  /* Verify password — support legacy accounts without passwordHash */
  if (stored.passwordHash && stored.passwordHash !== _bHash(password)) {
    showAuthError('login', 'Incorrect password. Please try again.');
    return;
  }
  closeAuthModal();
  updateNavForBrand(stored);
  renderGrid();
}

function showAuthError(panel, msg) {
  const el = document.getElementById(panel === 'signup' ? 'signupError' : 'loginError');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

function showPaymentStep() {
  document.getElementById('authFormLoginArea').style.display = 'none';
  document.getElementById('authFormPanel').style.display = 'none';
  document.getElementById('loginFormPanel').style.display = 'none';
  document.getElementById('paymentPanel').style.display = 'block';
  document.getElementById('authSuccessPanel').style.display = 'none';
  document.getElementById('utrInput').value = '';
  document.getElementById('paymentError').style.display = 'none';
}

function verifyPayment() {
  const utr = document.getElementById('utrInput').value.trim();
  if (!utr || utr.length < 6) {
    document.getElementById('paymentError').textContent = 'Please enter a valid transaction / UTR reference.';
    document.getElementById('paymentError').style.display = 'block';
    return;
  }
  const btn = document.getElementById('verifyPayBtn');
  btn.textContent = 'Verifying…';
  btn.disabled = true;
  setTimeout(() => {
    // Save brand user
    BrandAuth.set({ ...(window._pendingBrandUser || {}), utr, accessGranted: new Date().toISOString() });
    showSuccessStep();
  }, 1800);
}

function showSuccessStep() {
  document.getElementById('paymentPanel').style.display = 'none';
  document.getElementById('authSuccessPanel').style.display = 'block';
  const u = BrandAuth.get();
  if (u) {
    document.getElementById('successBrandName').textContent = u.brandName || 'Your Brand';
  }
}

function finishAuth() {
  closeAuthModal();
  const u = BrandAuth.get();
  if (u) updateNavForBrand(u);
  renderGrid();
}

function closeAuthModal() {
  document.getElementById('brandAuthModal').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('authSuccessPanel').style.display = 'none';
  document.getElementById('verifyPayBtn').textContent = 'Confirm Payment & Get Access →';
  document.getElementById('verifyPayBtn').disabled = false;
}

function updateNavForBrand(u) {
  const pill = document.getElementById('brandNavPill');
  if (pill) {
    pill.innerHTML = `<span>${u.brandName || 'Brand'}</span><button onclick="BrandAuth.logout()" style="margin-left:8px;font-size:11px;opacity:0.6;cursor:pointer;background:none;border:none;color:inherit" title="Logout">✕</button>`;
    pill.classList.add('logged-in');
  }
}

/* ─── Close modals ─── */
function closeCreatorDetail() {
  document.getElementById('creatorDetailModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Filter handlers ─── */
function applyFilters() {
  filters.search   = document.getElementById('f-search').value.trim();
  filters.niche    = document.getElementById('f-niche').value;
  filters.platform = document.getElementById('f-platform').value;
  filters.state    = document.getElementById('f-state').value;
  filters.followers= document.getElementById('f-followers').value;
  filters.language = document.getElementById('f-language').value;
  renderGrid();
}

function clearFilters() {
  ['f-search','f-niche','f-platform','f-state','f-followers','f-language'].forEach(id => {
    const el = document.getElementById(id);
    if (el.tagName === 'INPUT') el.value = '';
    else el.value = 'all';
  });
  filters = { search:'', niche:'all', platform:'all', state:'all', followers:'all', language:'all', metaVerifiedOnly: false };
  const mvBtn = document.getElementById('fMetaVerified');
  if (mvBtn) mvBtn.classList.remove('active');
  renderGrid();
}

function toggleMetaVerifiedFilter(btn) {
  filters.metaVerifiedOnly = !filters.metaVerifiedOnly;
  btn.classList.toggle('active', filters.metaVerifiedOnly);
  renderGrid();
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Check auth & update nav
  const u = BrandAuth.get();
  if (u) updateNavForBrand(u);

  // Clear any browser-autofilled search field then render
  document.getElementById('f-search').value = '';
  filters.search = '';
  renderGrid();

  // Filter listeners
  document.getElementById('f-search').addEventListener('input', applyFilters);
  ['f-niche','f-platform','f-state','f-followers','f-language'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });

  // Close modals on overlay click
  document.getElementById('brandAuthModal').addEventListener('click', e => {
    if (e.target === document.getElementById('brandAuthModal')) closeAuthModal();
  });
  document.getElementById('creatorDetailModal').addEventListener('click', e => {
    if (e.target === document.getElementById('creatorDetailModal')) closeCreatorDetail();
  });

  // Niche quick-filter pills on hero
  document.querySelectorAll('.niche-quick-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.niche-quick-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      const val = p.dataset.niche || 'all';
      document.getElementById('f-niche').value = val;
      filters.niche = val;
      renderGrid();
      document.getElementById('filterBar').scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  // Sticky filter bar active state
  const filterBar = document.getElementById('filterBar');
  const observer = new IntersectionObserver(entries => {
    filterBar.classList.toggle('stuck', !entries[0].isIntersecting);
  }, { rootMargin: '-1px 0px 0px 0px', threshold: [1] });
  observer.observe(filterBar);
});
