// ====== Small UI Helpers ======
document.getElementById("year").textContent = new Date().getFullYear();

const drawer = document.getElementById("drawer");
const navMenuBtn = document.getElementById("navMenuBtn");

navMenuBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

document.querySelectorAll(".drawer a").forEach(a => {
  a.addEventListener("click", () => drawer.classList.remove("open"));
});

// Put your real phone number here later (Module 3/launch)
const phoneLink = document.getElementById("phoneLink");
phoneLink.textContent = "Call: +353 (085) 835 7097";
phoneLink.href = "tel:+353858357097";

// Quick Quote form - real submission
const miniForm = document.getElementById("miniForm");
const miniQuoteBtn = document.getElementById("miniQuoteBtn");
const miniQuoteMsg = document.getElementById("miniQuoteMsg");

if (miniForm) {
  miniForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hp = miniForm.elements["websiteMini"]?.value;
    if (hp && hp.trim().length > 0) return;

    const name = miniForm.elements["name"].value.trim();
    const phone = miniForm.elements["phone"].value.trim();
    const service = miniForm.elements["service"].value;
    const consent = miniForm.elements["consent"].checked;

    if (!name || !phone || !service) {
      setMsg(miniQuoteMsg, "Please fill all required fields.", false);
      return;
    }

    if (!consent) {
      setMsg(miniQuoteMsg, "Please tick consent to continue.", false);
      return;
    }

    if (!canPost("tp_miniquote_last_post", 30)) {
      setMsg(miniQuoteMsg, "Please wait a moment before submitting again.", false);
      return;
    }

    miniQuoteBtn.disabled = true;
    setMsg(miniQuoteMsg, "Submitting...");

    const services = [service];
    const offerApplied = false;

    const { error } = await supabaseClient
      .from("bookings")
      .insert([{
        name,
        phone,
        service: services[0],
        services,
        offer_applied: offerApplied,
        message: "Submitted from Quick Quote form",
        consent: true
      }]);

    miniQuoteBtn.disabled = false;

    if (error) {
      console.error("Quick Quote insert error:", error);
      setMsg(miniQuoteMsg, `Submit failed: ${error.message}`, false);
      return;
    }

    miniForm.reset();
    setMsg(miniQuoteMsg, "Thanks! Your quote request was submitted.");

    const waText = `New Total Pristine quick quote:

Name: ${name}
Phone: ${phone}
Services: ${services.join(", ")}
Offer: No
Message: Submitted from Quick Quote form

Time: ${new Date().toLocaleString("en-IE")}`;

    window.open(
      `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(waText)}`,
      "_blank"
    );
  });
}

// ====== Premium Interactive Background (Green Particles) ======
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h, dpr;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.width = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);
resize();

const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX * dpr;
  mouse.y = e.clientY * dpr;
});

function rand(min, max){ return Math.random() * (max - min) + min; }

const particles = Array.from({ length: 70 }, () => ({
  x: rand(0, w),
  y: rand(0, h),
  r: rand(1.2, 3.2) * dpr,
  vx: rand(-0.25, 0.25) * dpr,
  vy: rand(-0.20, 0.20) * dpr,
  a: rand(0.06, 0.14)
}));

let t = 0;

function draw() {
  t += 0.006;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Soft green glow “breathing”
  const glowX = (w * 0.65) + Math.cos(t) * (w * 0.08);
  const glowY = (h * 0.25) + Math.sin(t * 1.2) * (h * 0.06);

  const grd = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(w,h) * 0.55);
  grd.addColorStop(0, "rgba(81,240,138,0.14)");
  grd.addColorStop(0.35, "rgba(38,196,111,0.08)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Particles
  for (const p of particles) {
    // subtle mouse pull
    const dx = (mouse.x - p.x);
    const dy = (mouse.y - p.y);
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const pull = Math.min(1, 140 * dpr / dist);

    p.x += p.vx + (dx / dist) * 0.08 * pull;
    p.y += p.vy + (dy / dist) * 0.08 * pull;

    if (p.x < -50) p.x = w + 50;
    if (p.x > w + 50) p.x = -50;
    if (p.y < -50) p.y = h + 50;
    if (p.y > h + 50) p.y = -50;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(81,240,138,${p.a})`;
    ctx.fill();
  }

  // Connect near particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const max = 140 * dpr;
      if (dist < max) {
        const alpha = (1 - dist / max) * 0.10;
        ctx.strokeStyle = `rgba(183,255,210,${alpha})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();
 
// ===== Module 2: Scroll Reveal + Subtle Parallax =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("in");
  });
}, { threshold: 0.14 });

revealEls.forEach(el => io.observe(el));

const parallaxImgs = document.querySelectorAll("img.parallax");

function parallaxTick(){
  const vh = window.innerHeight || 1;
  parallaxImgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const delta = (mid - vh / 2) / (vh / 2); // -1..1
    const y = Math.max(-14, Math.min(14, delta * 10)); // clamp
    img.style.transform = `translateY(${y}px) scale(1.06)`;
  });
  requestAnimationFrame(parallaxTick);
}
parallaxTick();
// ================================
// ===== Module 3: Supabase (Bookings + Reviews) =====
// 1) Paste your Supabase credentials here:
const SUPABASE_URL = "https://nmirkcuwqqahlfdbswds.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taXJrY3V3cXFhaGxmZGJzd2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzA2MTIsImV4cCI6MjA4NTE0NjYxMn0.oxIMzH2aJfS3H5G_BtMUdwFez7Woqk7bCu_36efe590";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BUSINESS_WHATSAPP = "353858357097"; // Ireland format, no +, no spaces

// --- Privacy modal ---
const privacyModal = document.getElementById("privacyModal");
const openPrivacy = document.getElementById("openPrivacy");
const closePrivacy = document.getElementById("closePrivacy");

if (openPrivacy && closePrivacy && privacyModal) {
  openPrivacy.addEventListener("click", () => privacyModal.classList.add("open"));
  closePrivacy.addEventListener("click", () => privacyModal.classList.remove("open"));
  privacyModal.addEventListener("click", (e) => {
    if (e.target === privacyModal) privacyModal.classList.remove("open");
  });
}
//
//

// Live offer indicator
const offerStatus = document.getElementById("offerStatus");

function refreshOfferUI(){
  const selected = Array.from(document.querySelectorAll('input[name="services"]:checked')).length;
  if (!offerStatus) return;

  if (selected >= 3) {
    offerStatus.textContent = "✅ Offer unlocked: 2 bin cleanings FREE will be included.";
    offerStatus.classList.add("unlocked");
  } else {
    offerStatus.textContent = `Select ${3 - selected} more service(s) to unlock the free bin cleaning.`;
    offerStatus.classList.remove("unlocked");
  }
}

document.querySelectorAll('input[name="services"]').forEach(cb => {
  cb.addEventListener("change", refreshOfferUI);
});
refreshOfferUI();

// Helpers
function canPost(key, seconds){
  const now = Date.now();
  const last = Number(localStorage.getItem(key) || "0");
  if (now - last < seconds * 1000) return false;
  localStorage.setItem(key, String(now));
  return true;
}

function setMsg(el, msg, ok=true){
  if (!el) return;
  el.textContent = msg;
  el.style.color = ok ? "rgba(183,255,210,0.92)" : "rgba(255,180,180,0.90)";
}

function stars(n){
  const full = "★★★★★".slice(0, n);
  const empty = "☆☆☆☆☆".slice(0, 5-n);
  return full + empty;
}
function prettyDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString("en-IE", { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return ""; }
}

// --- Booking form ---
const bookingForm = document.getElementById("bookingForm");
const bookingMsg = document.getElementById("bookingMsg");
const bookBtn = document.getElementById("bookBtn");

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot spam check
    const hp = bookingForm.elements["website"]?.value;
    if (hp && hp.trim().length > 0) return;

    const name = bookingForm.elements["name"].value.trim();
    const phone = bookingForm.elements["phone"].value.trim();
    const services = Array.from(bookingForm.querySelectorAll('input[name="services"]:checked'))
  .map(cb => cb.value);

if (services.length === 0) {
  setMsg(bookingMsg, "Please select at least 1 service.", false);
  bookBtn.disabled = false;
  return;
}

const offerApplied = services.length >= 3;

    const message = bookingForm.elements["message"].value.trim();
    const consent = bookingForm.elements["consent"].checked;

    if (!consent) {
      setMsg(bookingMsg, "Please tick consent to submit.", false);
      return;
    }

    bookBtn.disabled = true;
    setMsg(bookingMsg, "Submitting…");

    const { error } = await supabaseClient
      .from("bookings")
      .insert([{
  name,
  phone,
  service: services[0],     // keep legacy column filled
  services,
  offer_applied: offerApplied,
  message,
  consent: true
}]);


    bookBtn.disabled = false;

    /*if (error) {
      console.error(error);
      setMsg(bookingMsg, "Could not submit right now. Please try again.", false);
      return;
    } */

    if (error) {
  console.error("Supabase insert error:", error);
  setMsg(bookingMsg, `Submit failed: ${error.message}`, false);
  return;
}


    bookingForm.reset();
    setMsg(bookingMsg, "Thanks! Your request is received. We’ll contact you soon.");
    const waText = `New Total Pristine booking:

Name: ${name}
Phone: ${phone}
Services: ${services.join(", ")}
Offer: ${offerApplied ? "YES (2 bins FREE)" : "No"}
Message: ${message || "-"}

Time: ${new Date().toLocaleString("en-IE")}`;

window.open(
  `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(waText)}`,
  "_blank"
);

  });
}

// --- Reviews form ---
const reviewForm = document.getElementById("reviewForm");
const reviewMsg = document.getElementById("reviewMsg");
const reviewBtn = document.getElementById("reviewBtn");
const reviewsList = document.getElementById("reviewsList");

async function loadApprovedReviews(){
  if (!reviewsList) return;
  const loading = document.getElementById("reviewsLoading");
  if (loading) loading.classList.add("on");

  const { data, error } = await supabaseClient
    .from("reviews")
    .select("display_name,rating,comment,created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (loading) loading.classList.remove("on");

  if (error) {
    console.error(error);
    reviewsList.innerHTML = `<div class="reviewItem">Unable to load reviews.</div>`;
    return;
  }

  if (!data || data.length === 0) {
    reviewsList.innerHTML = `<div class="reviewItem">No reviews yet — be the first to share feedback.</div>`;
    return;
  }

  reviewsList.innerHTML = data.map(r => {
    const name = (r.display_name && r.display_name.trim()) ? r.display_name.trim() : "Anonymous";
    const safeText = (r.comment || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return `
      <div class="reviewItem">
        <div class="reviewTop">
          <div class="reviewName">${name}</div>
          <div class="reviewStars">${stars(r.rating)}</div>
        </div>
        <div class="reviewText">${safeText}</div>
        <div class="reviewMeta">${prettyDate(r.created_at)}</div>
      </div>
    `;
  }).join("");
}


if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot
    const hp = reviewForm.elements["website2"]?.value;
    if (hp && hp.trim().length > 0) return;

    const display_name = reviewForm.elements["display_name"].value.trim().slice(0,40);
    const rating = Number(reviewForm.elements["rating"].value);
    const comment = reviewForm.elements["comment"].value.trim().slice(0,500);

    if (!rating || rating < 1 || rating > 5) {
      setMsg(reviewMsg, "Please select a rating.", false);
      return;
    }
    if (comment.length < 4) {
      setMsg(reviewMsg, "Please write a slightly longer comment.", false);
      return;
    }
    
    
    reviewBtn.disabled = true;
    setMsg(reviewMsg, "Posting… (will appear after approval)");

    const { error } = await supabaseClient
      .from("reviews")
      .insert([{ display_name, rating, comment }]);

    reviewBtn.disabled = false;

    if (error) {
      console.error(error);
      setMsg(reviewMsg, "Could not post right now. Please try again.", false);
      return;
    }

    reviewForm.reset();
    setMsg(reviewMsg, "Thanks! Your comment was submitted and will appear after approval.");
  });
}

// Load reviews on page load
loadApprovedReviews();

