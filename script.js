const nav=document.getElementById('nav'),bar=document.getElementById('progress');
addEventListener('scroll',()=>{nav.classList.toggle('solid',scrollY>40);const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'});
const burger=document.getElementById('burger'),menu=document.getElementById('menu');
burger.onclick=()=>menu.classList.toggle('open');menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(i%6)*80);io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();

(function liquidHero(){
  const canvas=document.getElementById('liquid');
  if(!canvas)return;
  const hero=canvas.closest('.hero')||canvas.parentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'low-power'})
        ||canvas.getContext('experimental-webgl',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false});
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
  vec3 env=mix(vec3(0.36,0.30,0.26),vec3(0.93,0.92,0.94),sky);
  env=mix(env,vec3(0.78,0.74,0.86),pow(max(R.y,0.0),2.4)*0.4);
  env+=vec3(1.0,0.99,0.97)*pow(max(dot(R,normalize(vec3(-0.3,0.7,0.4))),0.0),24.0)*0.85;
  env+=vec3(0.62,0.44,0.30)*pow(max(-R.y,0.0),1.8)*0.28;
  float ridge=smoothstep(-0.2,0.5,h);
  vec3 metal=mix(vec3(0.48,0.45,0.44),vec3(0.95,0.94,0.95),ridge);
  metal=mix(metal,vec3(0.82,0.78,0.88),fres*0.22);
  metal=mix(metal,vec3(0.52,0.38,0.28),(1.0-ridge)*0.16);
  vec3 col=metal*env*(0.58+0.55*ndl);
  col+=spec1*vec3(1.0,0.99,0.97)*1.15;
  col+=spec2*vec3(0.86,0.80,0.94)*0.38;
  col+=fres*vec3(0.90,0.88,0.94)*0.32;
  col=pow(max(col,0.0),vec3(0.88));
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
})();
