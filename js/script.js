// GSAP register
gsap.registerPlugin(ScrollTrigger);

// Header scroll
const header = document.querySelector('.header');
const scHeight = 60;
window.addEventListener('scroll', () => {
  if (window.scrollY > scHeight) header.classList.add('header--scrolled');
  else header.classList.remove('header--scrolled');
});

// Hero animations
gsap.to('.hero__bg', { scale: 1.06, duration: 18, ease: "power1.inOut", repeat: -1, yoyo: true });
document.querySelector('.hero').addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - 0.5) * 24;
  const y = (e.clientY / innerHeight - 0.5) * 12;
  gsap.to('.hero__bg', { x, y, duration: 0.8, ease: "power3.out" });
});

// Reveal sections
document.querySelectorAll('.reveal').forEach(section => {
  gsap.from(section, {
    y: 60, opacity: 0, duration: 1.1, ease: "power3.out",
    scrollTrigger: { trigger: section, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
  });
});

// Pin hero CTA
gsap.to('.hero .floating', {
  yPercent: -22, ease: "none", scrollTrigger: { trigger: '.hero', start: "top top", end: "bottom top", scrub: 0.6 }
});

// Cards hover
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.02, duration: 0.45, ease: "power2.out" }));
  card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.45, ease: "power2.out" }));
});

// Cursor
const cursor = document.getElementById('cursor');
if (!('ontouchstart' in window)) { // No cursor on touch
  document.addEventListener('mousemove', e => cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`);
  document.querySelectorAll('a, button, .card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--active'));
  });
}

// Modal (example, add aria)
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('is-open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('is-open'); });
  // Focus trap: implement with trapFocus function if needed
});

// WebGL Hero (Three.js with displacement shader and DoF)
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const heroBg = document.querySelector('.hero__bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  heroBg.appendChild(renderer.domElement); // Replace iframe with canvas if needed

  const geometry = new THREE.PlaneGeometry(16, 9);
  const texture = new THREE.TextureLoader().load('hero-video-placeholder.jpg'); // Use video texture if needed
  const dispMap = new THREE.TextureLoader().load('displacement-map.jpg'); // Add your disp map

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uDisp: { value: dispMap },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D uTexture;
      uniform sampler2D uDisp;
      uniform float uTime;
      varying vec2 vUv;
      void main(){
        vec2 uv = vUv;
        vec2 disp = texture2D(uDisp, vec2(uv.x, uv.y + uTime * 0.02)).rg;
        uv += (disp.rg - 0.5) * 0.03;
        vec4 color = texture2D(uTexture, uv);
        vec3 gold = vec3(197.0/255.0, 164.0/255.0, 109.0/255.0);
        color.rgb = mix(color.rgb, color.rgb * gold * 0.04 + color.rgb, 0.015);
        gl_FragColor = color;
      }
    `
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
  camera.position.z = 5;

  // Post-processing DoF
  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bokehPass = new THREE.ShaderPass(THREE.BokehShader);
  bokehPass.uniforms.focus.value = 1.0;
  bokehPass.uniforms.aperture.value = 0.025;
  bokehPass.uniforms.maxblur.value = 0.01;
  composer.addPass(bokehPass);

  // Particles
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0xCDA46D, size: 0.02, transparent: true, opacity: 0.06 });
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);

  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value += 0.01;
    particleSystem.position.x += 0.001; // Drift
    composer.render();
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
} else {
  // Fallback CSS parallax
  gsap.to('.hero__bg', { y: '-10%', ease: "none", scrollTrigger: { trigger: '.hero', scrub: true } });
}

// Stats count-up animation
gsap.from('.stats div', { textContent: 0, duration: 2, ease: "power1.out", snap: { textContent: 1 }, stagger: 0.2 });

// Slider auto-scroll (example for block 2)
gsap.to('.slider', { x: '-50%', duration: 20, ease: "linear", repeat: -1 });

// Map animations (simple GSAP, replace with real map lib if needed)
gsap.to('.globe', { rotation: 360, duration: 20, ease: "linear", repeat: -1 });
gsap.to('.point', { scale: 1.2, duration: 1, stagger: 0.2, yoyo: true, repeat: -1 });

// Tabs (for gallery, vacancies)
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    const tabId = `#tab-${btn.dataset.tab}`;
    document.querySelector(tabId).classList.add('active');
    btn.classList.add('active');
  });
});

// Multi-step form
const steps = document.querySelectorAll('.multi-step .step');
let currentStep = 0;
steps[currentStep].classList.add('active');
document.querySelectorAll('.next').forEach(next => {
  next.addEventListener('click', () => {
    steps[currentStep].classList.remove('active');
    currentStep++;
    steps[currentStep].classList.add('active');
  });
});
document.querySelectorAll('.prev').forEach(prev => {
  prev.addEventListener('click', () => {
    steps[currentStep].classList.remove('active');
    currentStep--;
    steps[currentStep].classList.add('active');
  });
});

// Forms to Telegram
const botToken = '8436171257:AAFCGdRLWzAtCY3dndzGU8BZmCaqt84G_Yc';
const chatId = '-5082745831';
document.getElementById('model-form').addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  const message = `Новая заявка на модель: ${JSON.stringify(data)}`;
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(() => alert('Заявка отправлена!'));
});
document.getElementById('staff-form').addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  const message = `Новая заявка на персонал: Вакансия ${data.vacancy}, ${JSON.stringify(data)}`;
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(() => alert('Заявка отправлена!'));
});

// Calculator
const levelSelect = document.getElementById('level');
const hoursSelect = document.getElementById('hours');
const shiftsSlider = document.getElementById('shifts');
const incomeDiv = document.getElementById('income');
const diamondText = document.getElementById('diamond-text');

function updateCalculator() {
  const level = levelSelect.value;
  const hours = hoursSelect.value;
  const shifts = shiftsSlider.value;
  let shiftIncome = 0;

  if (level === 'Diamond') {
    diamondText.style.display = 'block';
    incomeDiv.textContent = '$15000+';
    hoursSelect.disabled = true;
    shiftsSlider.disabled = true;
    return;
  } else {
    diamondText.style.display = 'none';
    hoursSelect.disabled = false;
    shiftsSlider.disabled = false;
  }

  if (level === 'Silver') {
    hoursSelect.innerHTML = '<option value="4">от 4 часов</option><option value="6">от 6 часов</option>';
    shiftIncome = hours === '4' ? 66 : 100;
  } else if (level === 'Gold') {
    hoursSelect.innerHTML = '<option value="6">от 6 часов</option><option value="8">от 8 часов</option>';
    shiftIncome = hours === '6' ? 100 : 200;
  } else if (level === 'Platinum') {
    hoursSelect.innerHTML = '<option value="6">от 6 часов</option><option value="8">от 8 часов</option>';
    shiftIncome = hours === '6' ? 200 : 300;
  }

  const total = shiftIncome * shifts;
  incomeDiv.textContent = `$${total}`;
  gsap.to(incomeDiv, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }); // Animation
}

levelSelect.addEventListener('change', updateCalculator);
hoursSelect.addEventListener('change', updateCalculator);
shiftsSlider.addEventListener('input', updateCalculator);
updateCalculator();

// Blog Telegram integration (fetch example, for add/delete need backend)
const blogBotToken = '8406542321:AAFxHa4fAVGQVsNyPcSyozUX7FdDl_6ey0c';
const blogChatId = '-1003341373678';
// To add: send message like "Добавить: заголовок, текст, photo url"
// Fetch posts: parse messages from chat (requires bot to get updates)

// Lang switch (simple, for subdomains use server redirect)
document.querySelector('.lang-switch').addEventListener('change', e => {
  const lang = e.target.value.toLowerCase();
  window.location.href = `https://${lang}.domain.com`;
});

// Geo redirect (JS fallback, use IP API)
fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
  const country = data.country_name;
  if (country === 'Russia' || /* CIS countries */) window.location.href = 'https://ru.domain.com';
  else if (/* Spain, LatAm */) window.location.href = 'https://es.domain.com';
  else if (/* Brazil, Portugal */) window.location.href = 'https://pt.domain.com';
  else window.location.href = 'https://en.domain.com';
});