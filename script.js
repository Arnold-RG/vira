const nav=document.getElementById('nav'),bar=document.getElementById('progress');
addEventListener('scroll',()=>{nav.classList.toggle('solid',scrollY>40);const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'});
const burger=document.getElementById('burger'),menu=document.getElementById('menu');
burger.onclick=()=>menu.classList.toggle('open');menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(i%6)*80);io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();

function initLiquidCanvas(canvas, opts){
  opts=opts||{};
  if(!canvas)return;
  if(typeof location!=='undefined' && /(?:^|[?&])nowebgl=1(?:&|$)/.test(location.search)){
    canvas.style.display='none';
    return;
  }
  const hero=canvas.closest('.hero')||canvas.parentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glOpts={alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'};
  const gl=canvas.getContext('webgl',glOpts)||canvas.getContext('experimental-webgl',glOpts);
  if(!gl){canvas.style.display='none';return}

  const vert="attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}";
  const frag=`precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uEnergy;
uniform float uActive;

vec2 hash22(vec2 p){
  p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
  return -1.0+2.0*fract(sin(p)*43758.5453123);
}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(
    mix(dot(hash22(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),
        dot(hash22(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),
    mix(dot(hash22(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),
        dot(hash22(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),
    u.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}
  return v;
}
float height(vec2 uv,float aspect){
  vec2 p=uv*vec2(aspect,1.0)*2.15;
  float t=uTime;
  p+=vec2(t*0.035,t*0.022);
  vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
  vec2 r=vec2(
    fbm(p+1.7*q+vec2(1.7,9.2)+t*0.07),
    fbm(p+1.7*q+vec2(8.3,2.8)-t*0.055)
  );
  float f=fbm(p+2.0*r);
  vec2 mp=(uv-uMouse)*vec2(aspect,1.0);
  float d=length(mp);
  float bulge=0.55*exp(-d*d*10.0)*uActive;
  float rip=sin(d*26.0-t*3.2)*exp(-d*3.6)*uEnergy*uActive;
  return f+bulge+rip*0.22;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float aspect=uRes.x/max(uRes.y,1.0);
  float eps=1.6/uRes.y;
  float h=height(uv,aspect);
  float hx=height(uv+vec2(eps,0.0),aspect)-height(uv-vec2(eps,0.0),aspect);
  float hy=height(uv+vec2(0.0,eps),aspect)-height(uv-vec2(0.0,eps),aspect);
  vec3 N=normalize(vec3(-hx,-hy,0.34));
  vec3 V=vec3(0.0,0.0,1.0);
  vec3 L1=normalize(vec3(-0.45,0.72,0.55));
  vec3 L2=normalize(vec3(0.65,0.25,0.4));
  float ndl=max(dot(N,L1),0.0);
  float spec1=pow(max(dot(N,normalize(L1+V)),0.0),72.0);
  float spec2=pow(max(dot(N,normalize(L2+V)),0.0),28.0);
  float fres=pow(1.0-max(dot(N,V),0.0),2.6);
  vec3 R=reflect(-V,N);
  float sky=smoothstep(-0.2,0.9,R.y);
  vec3 darkR=vec3(0.227,0.239,0.259);
  vec3 midR=vec3(0.541,0.553,0.569);
  vec3 hiR=vec3(0.957,0.961,0.969);
  vec3 env=mix(darkR,hiR,sky);
  env=mix(midR,env,0.62);
  env=mix(env,vec3(0.90,0.90,0.93),pow(max(R.y,0.0),3.0)*0.08);
  env+=vec3(1.0)*pow(max(dot(R,normalize(vec3(-0.3,0.7,0.4))),0.0),28.0)*1.15;
  env+=darkR*pow(max(-R.y,0.0),1.8)*0.18;
  float ridge=smoothstep(-0.15,0.55,h);
  vec3 metal=mix(midR,hiR,ridge);
  metal=mix(metal,vec3(0.88,0.88,0.92),fres*0.06);
  vec3 col=metal*env*(0.88+0.40*ndl);
  col+=spec1*vec3(1.0)*1.55;
  col+=spec2*vec3(0.93,0.94,0.96)*0.22;
  col+=fres*vec3(0.90,0.91,0.94)*0.12;
  col=col*1.12+0.08;
  col=pow(max(col,0.0),vec3(0.96));
  col=clamp(col,0.0,1.0);
  gl_FragColor=vec4(col,1.0);
}`;

  function compile(type,src){
    const s=gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      console.warn('Vira liquid shader',gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vs=compile(gl.VERTEX_SHADER,vert),fs=compile(gl.FRAGMENT_SHADER,frag);
  if(!vs||!fs){canvas.style.display='none';return}
  const prog=gl.createProgram();
  gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){
    console.warn('Vira liquid program',gl.getProgramInfoLog(prog));
    canvas.style.display='none';return;
  }
  gl.useProgram(prog);
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

  const uRes=gl.getUniformLocation(prog,'uRes');
  const uTime=gl.getUniformLocation(prog,'uTime');
  const uMouse=gl.getUniformLocation(prog,'uMouse');
  const uEnergy=gl.getUniformLocation(prog,'uEnergy');
  const uActive=gl.getUniformLocation(prog,'uActive');

  let mx=0.5,my=0.55,tx=0.5,ty=0.55,lx=0.5,ly=0.55;
  let energy=0,active=0,onHero=false;
  let visible=true,raf=0,t0=0;

  function resize(){
    const cap=Math.min(devicePixelRatio||1,1.5);
    const w=Math.max(1,hero.clientWidth),h=Math.max(1,hero.clientHeight);
    const W=Math.round(w*cap),H=Math.round(h*cap);
    if(canvas.width!==W||canvas.height!==H){
      canvas.width=W;canvas.height=H;
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      gl.viewport(0,0,W,H);
    }
  }

  function setPointer(clientX,clientY){
    const r=hero.getBoundingClientRect();
    if(r.width<1||r.height<1)return;
    tx=(clientX-r.left)/r.width;
    ty=1-(clientY-r.top)/r.height;
    onHero=true;
  }
  function onMove(e){
    const p=e.touches?e.touches[0]:e;
    if(!p)return;
    const r=hero.getBoundingClientRect();
    const nx=(p.clientX-r.left)/r.width,ny=1-(p.clientY-r.top)/r.height;
    const dist=Math.hypot(nx-tx,ny-ty);
    energy=Math.min(1.2,energy+dist*2.4);
    setPointer(p.clientX,p.clientY);
  }
  addEventListener('mousemove',onMove,{passive:true});
  addEventListener('touchmove',onMove,{passive:true});
  addEventListener('touchstart',onMove,{passive:true});
  hero.addEventListener('mouseenter',e=>setPointer(e.clientX,e.clientY));
  hero.addEventListener('mouseleave',()=>{onHero=false});

  function draw(time){
    const t=reduce?4.8:(time-t0)*0.001;
    const ease=reduce?1:0.075;
    mx+=(tx-mx)*ease;
    my+=(ty-my)*ease;
    if(!reduce){
      const moved=Math.hypot(mx-lx,my-ly);
      energy=Math.max(0,energy*0.96-0.004)+moved*1.6;
      energy=Math.min(energy,1.2);
      active+=((onHero?1:0)-active)*0.06;
    }else{
      energy=0;active=0;
    }
    lx=mx;ly=my;
    gl.uniform2f(uRes,canvas.width,canvas.height);
    gl.uniform1f(uTime,t);
    gl.uniform2f(uMouse,mx,my);
    gl.uniform1f(uEnergy,energy);
    gl.uniform1f(uActive,active);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  function loop(now){
    raf=requestAnimationFrame(loop);
    if(document.hidden||!visible)return;
    resize();
    draw(now);
  }

  function start(){
    if(raf)return;
    t0=performance.now();
    resize();
    if(reduce){
      draw(t0);
      return;
    }
    raf=requestAnimationFrame(loop);
  }

  addEventListener('resize',()=>{resize();if(reduce||document.hidden||!visible)draw(performance.now())},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)return;
    if(reduce){resize();draw(performance.now())}
  });
  const vis=new IntersectionObserver(es=>{
    visible=es[0].isIntersecting;
    if(reduce&&visible){resize();draw(performance.now())}
  },{threshold:0.01});
  vis.observe(hero);

  start();
}

initLiquidCanvas(document.getElementById('liquid'));


/* ---- site data (empty values are intentional; do not invent content) ---- */
const SOCIAL = {
  linkedin: '',
  instagram: '',
  facebook: '',
  x: '',
  youtube: '',
  tiktok: '',
  github: 'https://github.com/Arnold-RG'
};
const EVENTS = [];
const REVIEWS = [];
const VIDEO_URL = '';
const FOUNDING_YEAR = 2026;

/* More menu */
(function navMore(){
  const wrap = document.getElementById('nav-more');
  const btn = wrap && wrap.querySelector('.nav-more-btn');
  if(!btn || !wrap) return;
  const close = () => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded','false'); };
  const toggle = () => {
    const open = !wrap.classList.contains('open');
    wrap.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', e => { if(!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  wrap.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* Burger aria */
(function burgerAria(){
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if(!burger || !menu) return;
  const sync = () => burger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  burger.addEventListener('click', sync);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    sync();
  }));
})();

/* Pointer spotlight + card glow */
(function lighting(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const layer = document.querySelector('.spot-layer');
  if(reduce) document.documentElement.classList.add('reduce-motion');
  if(coarse || reduce) return;
  const hosts = document.querySelectorAll('.card, .service, .product, .proj, .mini, .glass, .agent, .stat, .flow-step, .contact-form, .event-card, .empty-state');
  hosts.forEach(el => {
    if(getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('glow-host');
    const g = document.createElement('span');
    g.className = 'glow-edge';
    g.setAttribute('aria-hidden','true');
    el.appendChild(g);
  });
  let ticking = false, lx = 0, ly = 0;
  const move = e => {
    if(e.pointerType && e.pointerType !== 'mouse') return;
    lx = e.clientX; ly = e.clientY;
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--spot-x', lx + 'px');
      document.documentElement.style.setProperty('--spot-y', ly + 'px');
      if(layer) layer.classList.add('on');
      hosts.forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (lx - r.left) + 'px');
        el.style.setProperty('--my', (ly - r.top) + 'px');
      });
      ticking = false;
    });
  };
  addEventListener('pointermove', move, {passive:true});
})();

/* Social icons — only render entries with a URL */
(function socials(){
  const icons = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.4v11.1H2.9V8.4h3.6zM6.7 4.9A2.1 2.1 0 1 1 2.6 4.9a2.1 2.1 0 0 1 4.1 0zM21.1 19.5h-3.6v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5H10V8.4h3.4v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6.1z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3.5h3.1l-6.8 7.8 8 9.2h-6.3l-4.9-6.4-5.6 6.4H2l7.3-8.3L1.6 3.5h6.4l4.5 5.9 5-5.9zm-1.1 15.4h1.7L7.7 5.1H5.9l10.5 13.8z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.2c0-2.3-.3-3.8-.8-4.7-.5-.9-1.3-1.5-2.3-1.8C17.2 5.3 12 5.3 12 5.3s-5.2 0-6.9.4c-1 .3-1.8.9-2.3 1.8-.5.9-.8 2.4-.8 4.7s.3 3.8.8 4.7c.5.9 1.3 1.5 2.3 1.8 1.7.4 6.9.4 6.9.4s5.2 0 6.9-.4c1-.3 1.8-.9 2.3-1.8.5-.9.8-2.4.8-4.7zM10 15.5V8.9l6 3.3-6 3.3z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 4c.4 2.8 1.9 4.6 4.6 5v3c-1.6 0-3-.5-4.6-1.5v6.3A5.8 5.8 0 1 1 11.2 11v3.1a2.8 2.8 0 1 0 2.8 2.7V4h0z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>'
  };
  const labels = {linkedin:'LinkedIn',instagram:'Instagram',facebook:'Facebook',x:'X',youtube:'YouTube',tiktok:'TikTok',github:'GitHub'};
  const html = Object.entries(SOCIAL).filter(([,url]) => url).map(([key,url]) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${labels[key]||key}">${icons[key]||''}</a>`
  ).join('');
  document.querySelectorAll('[data-social]').forEach(el => {
    el.innerHTML = html;
    if(!html) el.hidden = true;
  });
})();

/* Events */
(function events(){
  const root = document.getElementById('events-list');
  if(!root) return;
  if(!EVENTS.length){
    root.innerHTML = '<div class="empty-state"><p>No upcoming events yet, follow us for announcements.</p></div>';
    return;
  }
  root.innerHTML = EVENTS.map(ev =>
    `<article class="event-card"><time datetime="${ev.date||''}">${ev.date||''}</time><h3>${ev.title||''}</h3><p>${ev.blurb||''}</p></article>`
  ).join('');
})();

/* Reviews */
(function reviews(){
  const root = document.getElementById('reviews-wrap');
  if(!root) return;
  if(!REVIEWS.length){
    root.innerHTML = '<div class="empty-state"><p>Be among our first clients, reviews coming soon.</p></div>';
    return;
  }
  root.innerHTML = '<div class="reviews-track" id="reviews-track"></div><div class="review-nav"></div>';
  const track = root.querySelector('.reviews-track');
  track.innerHTML = REVIEWS.map(r =>
    `<figure class="review-card"><blockquote>${r.quote||''}</blockquote><figcaption>${r.name||''}${r.role?(' · '+r.role):''}</figcaption></figure>`
  ).join('');
})();

/* Stats count-up from real DOM counts */
(function stats(){
  const box = document.getElementById('stats');
  if(!box) return;
  const nServices = document.querySelectorAll('#services .service:not(.service-more)').length;
  const nProjects = document.querySelectorAll('#projects .proj').length;
  const values = {services: nServices, projects: nProjects};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = (el) => {
    if(el.dataset.year){
      el.textContent = String(FOUNDING_YEAR);
      return;
    }
    const key = el.dataset.countFrom;
    const to = values[key] || 0;
    if(reduce){ el.textContent = String(to); return; }
    const start = performance.now();
    const dur = 1100;
    const frame = now => {
      const t = Math.min(1, (now-start)/dur);
      const eased = 1 - Math.pow(1-t, 3);
      el.textContent = String(Math.round(to * eased));
      if(t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  let started=false;
  const kick=()=>{ if(started) return; started=true; box.querySelectorAll('.count').forEach(run); };
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if(e.isIntersecting){ kick(); io.disconnect(); } });
  }, {threshold: 0.15, rootMargin: '0px 0px -8% 0px'});
  io.observe(box);
  const r=box.getBoundingClientRect();
  if(r.top < innerHeight && r.bottom > 0) kick();
})();

/* Contact form → mailto */
(function contactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  const fields = {
    name: form.querySelector('#c-name'),
    email: form.querySelector('#c-email'),
    service: form.querySelector('#c-service'),
    message: form.querySelector('#c-message')
  };
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const show = (name, msg) => {
    const field = fields[name].closest('.field');
    const err = form.querySelector('[data-error-for="'+name+'"]');
    field.classList.toggle('invalid', !!msg);
    if(err){ err.hidden = !msg; err.textContent = msg || ''; }
  };
  const validate = () => {
    let ok = true;
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const service = fields.service.value;
    const message = fields.message.value.trim();
    if(name.length < 2){ show('name','Please enter your name.'); ok = false; } else show('name','');
    if(!email){ show('email','Please enter your email.'); ok = false; }
    else if(!emailOk(email)){ show('email','Please enter a valid email address.'); ok = false; }
    else show('email','');
    if(!service){ show('service','Please choose a service.'); ok = false; } else show('service','');
    if(message.length < 20){ show('message','Please tell us a little more (at least 20 characters).'); ok = false; } else show('message','');
    return ok ? {name,email,service,message} : null;
  };
  Object.values(fields).forEach(el => el.addEventListener('blur', validate));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = validate();
    if(!data) return;
    const subject = `Vira enquiry: ${data.service} — ${data.name}`;
    const body = `Name: ${data.name}\nEmail: ${data.email}\nService: ${data.service}\n\n${data.message}`;
    const url = 'mailto:rurangwaarnold32@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = url;
  });
})();

/* Showreel: real video when VIDEO_URL is set, otherwise the silver liquid study */
(function showreel(){
  const frame = document.querySelector('[data-showreel]');
  if(!frame) return;
  const url = (VIDEO_URL || '').trim();
  if(url){
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{6,})/);
    if(yt){
      frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${yt[1]}" title="Vira showreel" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      frame.innerHTML = `<video src="${url}" controls playsinline></video>`;
    }
    return;
  }
  const canvas = document.getElementById('showreel-liquid');
  if(canvas) initLiquidCanvas(canvas, {ambient:true});
})();
