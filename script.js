const nav=document.getElementById('nav'),bar=document.getElementById('progress');
addEventListener('scroll',()=>{nav.classList.toggle('solid',scrollY>40);const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'});
const burger=document.getElementById('burger'),menu=document.getElementById('menu');
burger.onclick=()=>menu.classList.toggle('open');menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(i%6)*80);io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();
const c=document.getElementById('stars'),x=c.getContext('2d');let W,H,S=[];
function size(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;S=Array.from({length:Math.min(140,W/8)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.3,v:Math.random()*.25+.05,t:Math.random()*6}))}
function draw(){x.clearRect(0,0,W,H);for(const s of S){s.y-=s.v;s.t+=.02;if(s.y<0){s.y=H;s.x=Math.random()*W}x.globalAlpha=.4+Math.sin(s.t)*.35;x.fillStyle='#E6E0F0';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}
for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const a=S[i],b=S[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<90){x.globalAlpha=(1-d/90)*.12;x.strokeStyle='#E5E4E2';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}requestAnimationFrame(draw)}
size();addEventListener('resize',size);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)draw();
