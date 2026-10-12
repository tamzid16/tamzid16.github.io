(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dataDomains = ["AI", "LLM", "RAG", "NLP", "VISION", "SENSORS", "EMBEDDED", "PYTHON", "ROBOTICS", "IOT"];

  /* ---------- safe DOM helpers (no innerHTML, zero injection surface) ---------- */
  function el(tag, className, children) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else node.appendChild(child);
    });
    return node;
  }
  function text(tag, className, str) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = str;
    return node;
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgIcon(paths, viewBox) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", viewBox || "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    paths.forEach(function (d) {
      var p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);
    });
    return svg;
  }

  /* ---------- Icon library (simple, hand-authored line icons) ---------- */
  var ICONS = {
    terminal: ["M4 5h16v14H4z", "M7 9l3 3-3 3", "M12 15h5"],
    brain: ["M8 4a3 3 0 00-3 3 3 3 0 00-1 5.5A3 3 0 006 18a3 3 0 003 2 3 3 0 003-3V6a2 2 0 00-4-1", "M16 4a3 3 0 013 3 3 3 0 011 5.5A3 3 0 0118 18a3 3 0 01-3 2 3 3 0 01-3-3V6a2 2 0 014-1"],
    chip: ["M7 7h10v10H7z", "M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"],
    layers: ["M12 3l9 5-9 5-9-5 9-5z", "M3 13l9 5 9-5", "M3 17l9 5 9-5"],
    wrench: ["M14.5 6.5a4 4 0 00-5.6 5.1L4 16.5 7.5 20l4.9-4.9a4 4 0 005.1-5.6l-3 3-2.5-2.5 3-3z"],
    mic: ["M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z", "M6 11a6 6 0 0012 0", "M12 17v4", "M9 21h6"],
    flag: ["M5 3v18", "M5 4h11l-2.5 4L16 12H5"],
    bulb: ["M9 18h6", "M10 21h4", "M7 9a5 5 0 1110 0c0 2-1.5 3-2 4.5a3 3 0 01-6 0C8.5 12 7 11 7 9z"],
    leaf: ["M5 20C5 11 11 5 20 4c1 9-5 15-14 16z", "M5 20c3-3 6-6 10-10"],
    rocket: ["M12 2c3 2 5 6 5 10l-5 5-5-5c0-4 2-8 5-10z", "M9 15l-3 5 5-3", "M15 15l3 5-5-3", "M10.5 9.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"],
    envelope: ["M4 6h16v12H4z", "M4 7l8 6 8-6"],
    team: ["M9 11a3 3 0 100-6 3 3 0 000 6z", "M16 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z", "M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5", "M14.5 14.8c2.6.4 4.5 2.4 4.5 5.2"],
    shield: ["M12 3l7 3v5c0 5-3.3 8.2-7 9-3.7-.8-7-4-7-9V6l7-3z"],
    trophy: ["M8 4h8v5a4 4 0 01-8 0V4z", "M8 6H5a3 3 0 003 4", "M16 6h3a3 3 0 01-3 4", "M12 13v4", "M8 20h8", "M10 17h4"],
    database: ["M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z", "M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6", "M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"],
    phone: ["M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z", "M11 18h2"],
    radar: ["M12 11a1 1 0 100 2 1 1 0 000-2z", "M7.5 7.5a6 6 0 000 9", "M16.5 7.5a6 6 0 010 9", "M4.9 4.9a10 10 0 000 14.2", "M19.1 4.9a10 10 0 010 14.2"],
    code: ["M8 8l-5 4 5 4", "M16 8l5 4-5 4", "M14 5l-4 14"],
    server: ["M4 5h16v6H4z", "M4 13h16v6H4z", "M8 8h.01M8 16h.01"]
  };
  function catIcon(name) { return svgIcon(ICONS[name], "0 0 24 24"); }

  /* ---------- Loader with live percentage ---------- */
  var loaderPct = document.getElementById("loaderPct");
  var pct = 0;
  var pctTimer = window.setInterval(function () {
    pct = Math.min(100, pct + Math.round(8 + Math.random() * 14));
    if (loaderPct) loaderPct.textContent = pct + "%";
    if (pct >= 100) window.clearInterval(pctTimer);
  }, 130);
  window.setTimeout(function () {
    pct = 100;
    if (loaderPct) loaderPct.textContent = "100%";
    var loader = document.getElementById("loader");
    if (loader) loader.classList.add("hide");
  }, 1650);

  /* ---------- Data transfer falling streaks ---------- */
  var dtLayer = document.getElementById("dataTransfer");
  dataDomains.forEach(function (label, i) {
    var i_el = document.createElement("i");
    i_el.style.setProperty("--lane", i);
    i_el.appendChild(text("span", null, label));
    dtLayer.appendChild(i_el);
  });

  /* ---------- Nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var topNav = document.getElementById("topNav");
  navToggle.addEventListener("click", function () {
    var open = topNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  topNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { topNav.classList.remove("open"); });
  });

  /* ---------- Typewriter hero interest line ---------- */
  var interests = ["AI Enthusiast", "IoT Learner", "Robotics Explorer", "Research Enthusiast"];
  var typeTarget = document.getElementById("interestType");
  if (typeTarget) {
    if (reducedMotion) {
      typeTarget.textContent = interests.join("  \u00b7  ");
    } else {
      (function typeLoop() {
        var wordIndex = 0;
        function typeWord() {
          var word = interests[wordIndex % interests.length];
          var charIndex = 0;
          (function typeChar() {
            charIndex++;
            typeTarget.textContent = word.slice(0, charIndex);
            if (charIndex < word.length) {
              window.setTimeout(typeChar, 55);
            } else {
              window.setTimeout(eraseWord, 1400);
            }
          })();
        }
        function eraseWord() {
          var word = interests[wordIndex % interests.length];
          var charIndex = word.length;
          (function eraseChar() {
            charIndex--;
            typeTarget.textContent = word.slice(0, Math.max(0, charIndex));
            if (charIndex > 0) {
              window.setTimeout(eraseChar, 30);
            } else {
              wordIndex++;
              window.setTimeout(typeWord, 250);
            }
          })();
        }
        typeWord();
      })();
    }
  }

  /* ---------- Particle canvas background ---------- */
  var canvas = document.getElementById("particleCanvas");
  var ctx = canvas.getContext("2d");
  var width = 0, height = 0;
  var pointer = { x: -1000, y: -1000 };
  var colors = ["47,125,255", "19,72,201", "227,76,170", "255,255,255"];
  var particles = [], packets = [];

  function resizeCanvas() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * ratio; canvas.height = height * ratio;
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var count = Math.max(70, Math.min(145, Math.floor((width * height) / 9000)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: reducedMotion ? 0 : (Math.random() - 0.5) * 0.34,
        vy: reducedMotion ? 0 : (Math.random() - 0.5) * 0.34,
        r: i % 11 === 0 ? 2.1 : Math.random() * 1.25 + 0.35,
        a: Math.random() * 0.55 + 0.2,
        color: colors[i % colors.length]
      });
    }
    var pCount = Math.max(16, Math.min(30, Math.floor(width / 48)));
    packets = [];
    for (var j = 0; j < pCount; j++) {
      packets.push({
        x: ((j + 0.5) / pCount) * width + (Math.random() - 0.5) * 28,
        y: Math.random() * height,
        speed: reducedMotion ? 0 : 0.55 + Math.random() * 1.15,
        length: 28 + Math.random() * 65,
        alpha: 0.16 + Math.random() * 0.25,
        label: dataDomains[j % dataDomains.length]
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);
    var glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 260);
    glow.addColorStop(0, "rgba(47,125,255,.10)");
    glow.addColorStop(1, "rgba(47,125,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.font = "600 7px monospace";
    for (var lane = 0; lane < Math.ceil(width / 96); lane++) {
      var laneX = lane * 96 + 34;
      ctx.beginPath(); ctx.moveTo(laneX, 0); ctx.lineTo(laneX, height);
      ctx.strokeStyle = "rgba(47,125,255,.025)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
    packets.forEach(function (p) {
      p.y += p.speed;
      if (p.y > height + p.length) p.y = -p.length - Math.random() * height * 0.25;
      var g = ctx.createLinearGradient(p.x, p.y - p.length, p.x, p.y);
      g.addColorStop(0, "rgba(47,125,255,0)");
      g.addColorStop(0.72, "rgba(47,125,255," + p.alpha + ")");
      g.addColorStop(1, "rgba(227,76,170," + (p.alpha + 0.22) + ")");
      ctx.beginPath(); ctx.moveTo(p.x, p.y - p.length); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "rgba(190,210,255," + Math.min(p.alpha + 0.32, 0.75) + ")";
      ctx.fillText(p.label, p.x + 4, p.y + 2);
    });
    ctx.restore();

    for (var i = 0; i < particles.length; i++) {
      var particle = particles[i];
      particle.x += particle.vx; particle.y += particle.vy;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
      var px = particle.x + (pointer.x - width / 2) * (particle.r * 0.006);
      var py = particle.y + (pointer.y - height / 2) * (particle.r * 0.006);
      ctx.beginPath(); ctx.arc(px, py, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + particle.color + "," + particle.a + ")";
      ctx.shadowBlur = particle.r > 1.6 ? 13 : 4;
      ctx.shadowColor = "rgba(" + particle.color + ",.65)";
      ctx.fill(); ctx.shadowBlur = 0;
      for (var k = i + 1; k < Math.min(i + 8, particles.length); k++) {
        var other = particles[k];
        var dx = particle.x - other.x, dy = particle.y - other.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 105) {
          ctx.beginPath(); ctx.moveTo(particle.x, particle.y); ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = "rgba(47,125,255," + ((1 - dist / 105) * 0.11) + ")";
          ctx.lineWidth = 0.55; ctx.stroke();
        }
      }
    }
    if (!reducedMotion) window.requestAnimationFrame(drawFrame);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  document.addEventListener("mouseleave", function () { pointer.x = -1000; pointer.y = -1000; });
  drawFrame();

  /* ---------- Pointer effects (fine pointer only) ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    var dot = document.getElementById("pointerDot");
    var ring = document.getElementById("pointerRing");
    var beam = document.getElementById("pointerBeam");
    var trail = document.getElementById("pointerTrail");
    var targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    var ringX = targetX, ringY = targetY, lastX = targetX, lastY = targetY, lastSpark = 0;

    function spark(x, y, burst) {
      var p = document.createElement("i");
      p.className = burst ? "pointer-spark burst" : "pointer-spark";
      p.style.left = x + "px"; p.style.top = y + "px";
      p.style.setProperty("--spark-x", ((Math.random() - 0.5) * (burst ? 70 : 24)) + "px");
      p.style.setProperty("--spark-y", ((Math.random() - 0.5) * (burst ? 70 : 24)) + "px");
      trail.appendChild(p);
      window.setTimeout(function () { p.remove(); }, burst ? 720 : 480);
    }
    function render() {
      ringX += (targetX - ringX) * 0.18; ringY += (targetY - ringY) * 0.18;
      dot.style.transform = "translate3d(" + targetX + "px," + targetY + "px,0)";
      ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
      var dx = targetX - lastX, dy = targetY - lastY;
      var distance = Math.min(74, Math.hypot(dx, dy) * 2.4);
      var angle = Math.atan2(dy, dx) * 180 / Math.PI;
      beam.style.width = distance + "px";
      beam.style.opacity = distance > 3 ? ".82" : ".12";
      beam.style.transform = "translate3d(" + targetX + "px," + targetY + "px,0) rotate(" + (angle + 180) + "deg)";
      lastX += (targetX - lastX) * 0.55; lastY += (targetY - lastY) * 0.55;
      window.requestAnimationFrame(render);
    }
    window.addEventListener("pointermove", function (e) {
      targetX = e.clientX; targetY = e.clientY;
      document.documentElement.style.setProperty("--pointer-x", ((e.clientX - window.innerWidth / 2) * 0.012) + "px");
      document.documentElement.style.setProperty("--pointer-y", ((e.clientY - window.innerHeight / 2) * 0.012) + "px");
      dot.classList.add("visible"); ring.classList.add("visible");
      var now = performance.now();
      if (now - lastSpark > 34) { spark(e.clientX, e.clientY); lastSpark = now; }
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var interactive = e.target.closest && e.target.closest("a,button,input,textarea,select,.timeline-card,.project-grid article,.skill-tile");
      ring.classList.toggle("active", Boolean(interactive));
    }, { passive: true });
    window.addEventListener("pointerdown", function () {
      ring.classList.add("pressed");
      for (var i = 0; i < 8; i++) spark(targetX, targetY, true);
    }, { passive: true });
    window.addEventListener("pointerup", function () { ring.classList.remove("pressed"); }, { passive: true });
    document.addEventListener("mouseleave", function () { dot.classList.remove("visible"); ring.classList.remove("visible"); });
    render();
  }

  /* ---------- Shared: colored icon tile ---------- */
  var TONE = { ai: "#c084fc", iot: "#34d399", web: "#38bdf8", lang: "#fbbf24", tools: "#fb923c", research: "#f472b6", gold: "#fbbf24", blue: "#60a5fa", teal: "#2dd4bf", rose: "#fb7185" };
  function iconTile(name, color, cls) {
    var tile = el("span", "icon-tile" + (cls ? " " + cls : ""), [catIcon(name)]);
    tile.style.setProperty("--c", color);
    return tile;
  }
  var IMG = "assets/images/";
  function img(src, alt, w, h) {
    var i = document.createElement("img");
    i.src = IMG + src; i.alt = alt || ""; i.loading = "lazy"; i.decoding = "async";
    if (w) i.width = w; if (h) i.height = h;
    return i;
  }
  function extLink(label, href, cls) {
    var a = text("a", cls || null, label);
    a.href = href;
    if (href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return a;
  }

  /* ---------- Tech logos (self-hosted SVG, shown on a light tile for contrast) ---------- */
  var TECH = { "Python": "python", "C/C++": "cpp", "C": "c", "JavaScript": "javascript", "TypeScript": "typescript", "Dart": "dart", "Kotlin": "kotlin", "Java": "java", "Flutter": "flutter", "Next.js": "nextjs", "React": "react", "FastAPI": "fastapi", "Node.js": "nodejs", "PostgreSQL": "postgresql", "pgvector": "postgresql", "MySQL": "mysql", "SQLite": "sqlite", "Firebase": "firebase", "MongoDB": "mongodb", "Arduino": "arduino", "Raspberry Pi": "raspberrypi", "Git": "git", "GitHub": "github", "Linux": "linux", "Docker": "docker", "VS Code": "vscode", "Visual Studio": "visualstudio", "OpenCV": "opencv", "Pandas": "pandas", "NumPy": "numpy", "Tailwind CSS": "tailwind", "Prisma": "prisma", "Photoshop": "photoshop", "Spring Boot": "spring", "Chart.js": "chartjs", "Meta Ads": "meta", "Android Studio": "androidstudio", "Scikit-learn": "scikitlearn", "LaTeX": "latex", "Canva": "canva", "Jetpack Compose": "jetpackcompose", "ESP32": "espressif", "ESP8266": "espressif", "MQTT": "mqtt", "Ollama": "ollama" };
  function techLogo(name, size) {
    var slug = TECH[name];
    if (!slug) return null;
    var i = img("tech/" + slug + ".svg", "", size || 20, size || 20);
    i.className = "tech-logo";
    return i;
  }

  /* ---------- Projects: flagship showcase, 2 columns ---------- */
  var GH = "https://github.com/tamzid16";
  /* ---------- Other notable projects: every public repository, filterable ---------- */
  var PROJ = [
    { t: "DocIntel", k: "Document Intelligence", y: "2026", c: "sw", f: 1, i: "database", col: TONE.web, d: "Full-stack workspace that turns PDFs, DOCX and text files into structured, reviewable data: upload, extract, validate, review and export.", s: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL"], r: "DocIntel" },
    { t: "DeviceMonitor", k: "Android + IoT", y: "2026", c: "sw iot", f: 1, i: "chip", col: TONE.iot, d: "Native Android app for organising IoT devices, recording sensor readings, reviewing trends and managing threshold alerts. Reads JSON from compatible ESP32 devices.", s: ["Kotlin", "Jetpack Compose", "ESP32"], r: "DeviceMonitor" },
    { t: "WatchRover", k: "IEEE Research \u00b7 Robotics", y: "2026", c: "iot", f: 1, i: "radar", col: TONE.blue, d: "IoT autonomous disaster-response robot. ESP32 firmware fuses ultrasonic, IMU and IR data in an adaptive navigation state machine, with RF telemetry and manual override.", s: ["ESP32", "C/C++", "MQTT"], live: "https://doi.org/10.1109/QPAIN69676.2026.11546312", liveLabel: "Read paper" },
    { t: "GHURAGHURI", k: "Travel Booking App", y: "2026", c: "sw", f: 1, i: "phone", col: TONE.rose, d: "Flutter travel booking platform with role-based access for travellers, hotels and guides, live GPS tracking and integrated payments, built on Clean Architecture.", s: ["Flutter", "Dart", "SQLite"], r: "GhuraGhuri-VSC-2nd" },
    { t: "ExpenseIQ", k: "Android App", y: "2026", c: "sw", f: 1, i: "shield", col: TONE.teal, d: "Offline-first personal expense tracker with Keystore-backed security, budgets with threshold alerts, CSV import, analytics, and an English and Bangla interface.", s: ["Kotlin", "Jetpack Compose"], r: "ExpenseIQ" },
    { t: "CampusConnect", k: "Android App", y: "2026", c: "sw", f: 1, i: "team", col: TONE.web, d: "Native Android student service app bringing announcements, campus events, an academic library, petitions and service requests into one interface.", s: ["Kotlin", "Jetpack Compose"], r: "CampusConnect" },
    { t: "Personal Knowledge AI", k: "AI / RAG Workspace", y: "2026", c: "sw", f: 1, i: "database", col: TONE.ai, d: "Private research workspace that turns folders of PDFs and notes into a searchable, cited knowledge base with passage-level search and cross-document questions.", s: ["Next.js", "FastAPI", "SQLite"], r: "Personal-Knowledge-AI" },
    { t: "CareerMatch AI", k: "AI Utility", y: "2026", c: "sw", f: 1, i: "bulb", col: TONE.gold, d: "Pre-application check that scores a resume against a job description, with skill gaps, keyword coverage, experience signals and focused recommendations.", s: ["TypeScript", "React", "Python"], r: "CareerMatch" },
    { t: "LearnFlow AI", k: "AI Study Tool", y: "2026", c: "sw", i: "bulb", col: TONE.teal, d: "Turns lecture notes and PDFs into summaries, flashcards, quizzes, short questions and study plans using a local generation engine with no API key.", s: ["Next.js", "TypeScript", "Tailwind CSS"], r: "learnflowai" },
    { t: "Smart Quiz Generator", k: "AI Study Tool", y: "2026", c: "sw", i: "flag", col: TONE.rose, d: "Converts a lecture PDF or pasted notes into a timed practice exam with MCQ, true/false or short questions, explanations and result analytics.", s: ["Next.js", "TypeScript"], r: "Quiz-Generator" },
    { t: "DataLens AI", k: "Data Analysis", y: "2026", c: "sw", i: "radar", col: TONE.blue, d: "Local-first CSV workspace that profiles datasets, builds charts and correlations and writes plain-language insights, all in the browser.", s: ["Next.js", "TypeScript", "React"], r: "Datalens-ai" },
    { t: "ScholarIQ", k: "Analytics Dashboard", y: "2026", c: "sw", i: "layers", col: TONE.ai, d: "Student performance dashboard combining cohort outcomes, attendance relationships and explainable risk bands for academic teams.", s: ["TypeScript", "React"], r: "ScholarIQ" },
    { t: "GitHub Profile Analyzer", k: "Developer Tool", y: "2026", c: "sw", i: "code", col: TONE.tools, d: "Turns a public GitHub profile into a compact engineering report with a profile score, portfolio direction and signals beyond repository counts.", s: ["TypeScript", "React", "Python"], r: "GitHub-Profile-Analyzer" },
    { t: "Project Management System", k: "Full-Stack Web", y: "2026", c: "sw", i: "layers", col: TONE.web, d: "Tracks projects, phases, tasks, activities and contacts with user dashboards, backed by a separate Java API and a MySQL database.", s: ["Next.js", "Spring Boot", "MySQL", "Chart.js"], r: "Project-Management-System" },
    { t: "Learning Management System", k: "Full-Stack Web", y: "2025", c: "sw", i: "terminal", col: TONE.lang, d: "LMS for course management, secure authentication and scalable content delivery with a Prisma-managed PostgreSQL schema.", s: ["Next.js", "Prisma", "PostgreSQL"], r: "Learning-Management-System-V2" },
    { t: "Fish Recommendations System", fl: 1, f: 1, k: "Web Platform", y: "2025", c: "sw", i: "leaf", col: TONE.iot, d: "Platform that recommends fish species by environment, size and sustainability, with user profiles, a species database and a sustainability tracker.", s: ["Next.js", "React", "Tailwind CSS", "Node.js"], r: "Fish-Recommendations-System" },
    { t: "Face Recognition System", k: "Computer Vision", y: "2025", c: "sw", i: "brain", col: TONE.ai, d: "Detects and recognises faces from images and live webcam video by encoding a self-captured dataset, using OpenCV and the face_recognition library.", s: ["Python", "OpenCV", "NumPy"], r: "FaceRecognitionSystem" },
    { t: "Library Management System", k: "Java Application", y: "2024", c: "sw", i: "wrench", col: TONE.tools, d: "Role-based library system where staff add books and track loans while students search by ISBN, borrow and return.", s: ["Java"], r: "LibraryManagementSystem" },
    { t: "Chakri Bakri", k: "Job Bidding Web App", y: "2024", c: "sw", i: "envelope", col: TONE.gold, d: "Job posting and bidding platform with authentication, job details, a bid form and listings stored in MongoDB.", s: ["React", "Firebase", "MongoDB"], r: "Job-Finder", live: "https://job-flnder.web.app/", liveLabel: "Live site" },
    { t: "IoT Environmental Monitor + Smart Irrigation", fl: 1, f: 1, k: "Academic \u00b7 Embedded", y: "2025", c: "iot", i: "chip", col: TONE.iot, d: "Multi-node sensor network with cloud aggregation and threshold alerting, plus automated irrigation driven by soil moisture feedback and edge relay control.", s: ["Arduino", "Raspberry Pi", "MQTT", "Python"] },
    { t: "GHURI Safe Travel Platform", fl: 1, f: 1, k: "Flutter + IoT", y: "2026", c: "sw iot", i: "phone", col: TONE.rose, d: "Flutter web app with a FastAPI backend for safe travel: IoT device tracking, property booking, guide services and payment processing.", s: ["Flutter", "FastAPI", "Dart"], r: "GHURI-VSC-1st" },
    { t: "RAGBench", fl: 1, f: 1, k: "RAG Evaluation Lab", y: "2026", c: "sw", i: "radar", col: TONE.ai, d: "Open-source lab for controlled retrieval experiments, trace inspection and reproducible run comparison across chunking and prompt strategies.", s: ["Python", "FastAPI", "Next.js"], r: "RAGBench" },
    { t: "KnowledgeOS", fl: 1, f: 1, k: "RAG Workspace", y: "2026", c: "sw", i: "database", col: TONE.web, d: "Grounded document search and RAG chat with hybrid search, reranking, streaming answers and source citations.", s: ["Next.js", "FastAPI", "pgvector", "Ollama"], r: "KnowledgeOS" },
    { t: "RepoPilot AI", fl: 1, f: 1, k: "Code-Aware RAG", y: "2026", c: "sw", i: "code", col: TONE.teal, d: "Code-aware RAG that chunks repositories with tree-sitter and answers codebase questions with line-level citations.", s: ["FastAPI", "pgvector"], r: "RepoPilot.AI" },
    { t: "AgentDesk", fl: 1, f: 1, k: "Agent Platform", y: "2026", c: "sw", i: "server", col: TONE.research, d: "Configure AI agents, run bounded multi-step tasks, approve sensitive tool calls and inspect the full execution trace.", s: ["Python", "FastAPI", "Next.js"], r: "AgentDesk" }
  ];
  var NP_TABS = [["featured", "Featured"], ["sw", "Software & Web"], ["iot", "IoT & Robotics"], ["all", "All"]];
  var npFilter = "featured", npExpanded = false, NP_LIMIT = 6;
  var npTabsEl = document.getElementById("npTabs"), npGridEl = document.getElementById("npGrid"), npMoreBtn = document.getElementById("npMore");
  function npMatch(p, f) {
    if (f === "all") return true;
    if (f === "featured") return !!p.f;
    return p.c.split(" ").indexOf(f) !== -1;
  }
  function npCard(p) {
    var href = p.r ? GH + "/" + p.r : (p.live || null);
    var mid = el("span", "np-ico", [iconTile(p.i, p.col, "lg")]);
    var vis = el("div", "np-visual", [el("span", "np-orb o1", []), el("span", "np-orb o2", []), mid, text("span", "np-cta", href ? "View project \u2197" : "Academic project")]);
    var visual = href ? extLink("", href, "np-visual-link") : el("div", "np-visual-link", []);
    if (href) visual.setAttribute("aria-label", "Open " + p.t);
    visual.appendChild(vis);
    var chips = p.s.slice(0, 4).map(function (n) {
      var lg = techLogo(n, 14);
      return el("span", "np-chip", lg ? [lg, n] : [n]);
    });
    if (p.s.length > 4) chips.push(text("span", "np-chip more", "+" + (p.s.length - 4)));
    var acts = [];
    if (p.r) acts.push(extLink("GitHub \u2197", GH + "/" + p.r, "np-btn"));
    if (p.live) acts.push(extLink((p.liveLabel || "Live") + " \u2197", p.live, "np-btn live"));
    var foot = el("div", "np-foot", [el("div", "np-acts", acts), el("div", "np-chips", chips)]);
    var card = el("article", "np-card", [visual, el("div", "np-body", [el("div", "np-meta", [text("span", "np-kind", p.k), text("b", null, p.y)]), text("h4", null, p.t), text("p", null, p.d), foot])]);
    card.style.setProperty("--c", p.col);
    return card;
  }
  function renderNp() {
    var list = PROJ.filter(function (p) { return npMatch(p, npFilter); }).sort(function (x, y) { return (y.fl || 0) - (x.fl || 0); });
    var shown = npExpanded ? list : list.slice(0, NP_LIMIT);
    npGridEl.textContent = "";
    shown.forEach(function (p, i) { var c = npCard(p); c.style.animationDelay = i * 45 + "ms"; npGridEl.appendChild(c); });
    Array.prototype.forEach.call(npTabsEl.children, function (b) {
      var on = b.getAttribute("data-f") === npFilter;
      b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (list.length > NP_LIMIT) { npMoreBtn.hidden = false; npMoreBtn.textContent = npExpanded ? "Show less \u2191" : "See all " + list.length + " projects \u2193"; }
    else npMoreBtn.hidden = true;
  }
  NP_TABS.forEach(function (t) {
    var n = PROJ.filter(function (p) { return npMatch(p, t[0]); }).length;
    var b = el("button", "np-tab", [t[1], text("small", null, String(n))]);
    b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("data-f", t[0]);
    b.addEventListener("click", function () { npFilter = t[0]; npExpanded = false; renderNp(); });
    npTabsEl.appendChild(b);
  });
  npMoreBtn.addEventListener("click", function () { npExpanded = !npExpanded; renderNp(); });
  renderNp();

  /* ---------- Research: paper-style cards, hover for method details ---------- */
  var research = [
    {
      type: "RESEARCH PROJECT", year: "2026", code: "R-01", color: TONE.teal, fig: "research/juterag-figure.svg",
      title: "JuteRAG: Vision-RAG Pipeline for Bangla Jute Disease Diagnosis",
      role: "Researcher", venue: "Research project", status: "2026",
      abstract: "A vision-RAG pipeline that combines DenseNet121 CNN classification, FAISS-indexed vector retrieval, and LLM-generated Bangla advisory output to support jute crop disease diagnosis.",
      keywords: ["Vision-RAG", "DenseNet121", "FAISS", "Bangla NLP", "Agriculture"],
      method: ["Classification with a DenseNet121 CNN", "Evidence retrieval from a FAISS vector index", "LLM-generated advisory in Bangla"],
      flow: [["INPUT", "LEAF", ""], ["CLASSIFY", "CNN", "n2"], ["RETRIEVE", "FAISS", "n3"], ["ADVISORY", "\u09ac\u09be\u0982\u09b2\u09be", "n4"]]
    },
    {
      type: "IEEE CONFERENCE PAPER", year: "2026", code: "R-02", color: TONE.blue, fig: "research/watchrover-figure.svg",
      title: "WatchRover: IoT Autonomous Disaster-Response Robot",
      role: "Co-Author", venue: "IEEE QPAIN, CUET", status: "2026",
      abstract: "ESP32 rover firmware fusing ultrasonic, IMU, and IR sensor data within an adaptive navigation state machine, with RF telemetry for live monitoring and manual override in disaster-zone scenarios.",
      keywords: ["ESP32", "Sensor Fusion", "State Machine", "RF Telemetry", "Autonomous Robotics"],
      method: ["Ultrasonic + IMU + IR multi-sensor fusion", "Adaptive navigation state machine", "RF telemetry with manual override"],
      flow: [["INPUT", "SENSORS", ""], ["DECIDE", "FSM", "n2"], ["ACT", "NAV", "n3"], ["REPORT", "RF", "n4"]],
      link: "https://doi.org/10.1109/QPAIN69676.2026.11546312"
    }
  ];
  var researchGrid = document.getElementById("researchGrid");
  research.forEach(function (r, ri) {
    var flowEl = el("div", "res-flow", []);
    r.flow.forEach(function (n, i) {
      if (i > 0) flowEl.appendChild(el("i", "res-arrow", []));
      flowEl.appendChild(el("div", "res-node " + n[2], [text("small", null, n[0]), text("b", null, n[1])]));
    });
    var methodList = el("ul", "res-method", r.method.map(function (m) { return el("li", null, [m]); }));
    var detail = el("div", "res-detail", [text("span", "res-detail-tag", "METHOD \u00b7 HOVER VIEW"), methodList, flowEl]);
    var figure = el("div", "res-figure", [img(r.fig, r.title + " figure", 1000, 700), text("span", "res-code", r.code), detail]);
    var facts = el("dl", "res-facts", [
      el("div", null, [text("dt", null, "Role"), text("dd", null, r.role)]),
      el("div", null, [text("dt", null, "Venue"), text("dd", null, r.venue)]),
      el("div", null, [text("dt", null, "Year"), text("dd", null, r.status)])
    ]);
    var kw = el("div", "res-keywords", r.keywords.map(function (k) { return text("span", null, k); }));
    var contentKids = [
      el("div", "res-top", [iconTile(ri === 0 ? "leaf" : "radar", r.color), text("span", "res-type", r.type), text("b", "res-year", r.year)]),
      text("h3", null, r.title),
      text("h4", null, "Abstract"),
      text("p", null, r.abstract),
      facts, kw
    ];
    if (r.link) contentKids.push(extLink("View paper (DOI) \u2197", r.link, "btn-solid res-link"));
    var card = el("article", "res-card reveal", [figure, el("div", "res-content", contentKids)]);
    card.style.setProperty("--c", r.color);
    researchGrid.appendChild(card);
  });

  /* ---------- Domain expertise: animated visual + points + rolling technology marquee ---------- */
  function sv(tag, attrs, kids) {
    var n = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "style") { /* CSP blocks style attributes, so apply through CSSOM */
        String(attrs[k]).split(";").forEach(function (decl) { var p = decl.split(":"); if (p.length === 2) n.style.setProperty(p[0].trim(), p[1].trim()); });
      } else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function domainVisual(kind, color) {
    var svg = sv("svg", { viewBox: "0 0 400 300", "class": "dv dv-" + kind, "aria-hidden": "true" });
    svg.style.setProperty("--c", color);
    var g = sv("g", {}); svg.appendChild(g);
    var i, j;
    if (kind === "ai") {
      var layers = [[70, [80, 150, 220]], [160, [50, 115, 185, 250]], [250, [80, 150, 220]], [335, [115, 185]]];
      for (i = 0; i < layers.length - 1; i++) layers[i][1].forEach(function (y1, a) {
        layers[i + 1][1].forEach(function (y2, b) { g.appendChild(sv("line", { x1: layers[i][0], y1: y1, x2: layers[i + 1][0], y2: y2, "class": "dv-line", style: "animation-delay:" + ((a + b) * 0.35) + "s" })); });
      });
      var n = 0;
      layers.forEach(function (L) { L[1].forEach(function (y) { g.appendChild(sv("circle", { cx: L[0], cy: y, r: 9, "class": "dv-node", style: "animation-delay:" + (n++ * 0.22) + "s" })); }); });
    } else if (kind === "iot") {
      var pts = [[60, 60], [340, 60], [60, 240], [340, 240]];
      pts.forEach(function (p, k) {
        g.appendChild(sv("path", { d: "M200 150 L" + p[0] + " " + p[1], "class": "dv-line", style: "animation-delay:" + k * 0.4 + "s" }));
        g.appendChild(sv("circle", { cx: p[0], cy: p[1], r: 15, "class": "dv-node", style: "animation-delay:" + k * 0.5 + "s" }));
        g.appendChild(sv("circle", { cx: p[0], cy: p[1], r: 26, "class": "dv-ring", style: "animation-delay:" + k * 0.5 + "s" }));
      });
      g.appendChild(sv("rect", { x: 160, y: 110, width: 80, height: 80, rx: 12, "class": "dv-chip" }));
      g.appendChild(sv("rect", { x: 178, y: 128, width: 44, height: 44, rx: 6, "class": "dv-core" }));
      [128, 150, 172].forEach(function (y) {
        g.appendChild(sv("line", { x1: 148, y1: y, x2: 160, y2: y, "class": "dv-pin" }));
        g.appendChild(sv("line", { x1: 240, y1: y, x2: 252, y2: y, "class": "dv-pin" }));
      });
    } else if (kind === "sw") {
      g.appendChild(sv("rect", { x: 40, y: 40, width: 230, height: 190, rx: 12, "class": "dv-win" }));
      g.appendChild(sv("line", { x1: 40, y1: 68, x2: 270, y2: 68, "class": "dv-bar" }));
      [58, 74, 90].forEach(function (x) { g.appendChild(sv("circle", { cx: x, cy: 54, r: 4, "class": "dv-dot" })); });
      [[60, 92, 120], [76, 112, 150], [76, 132, 90], [60, 152, 140], [76, 172, 110], [60, 192, 70]].forEach(function (l, k) {
        g.appendChild(sv("rect", { x: l[0], y: l[1], width: l[2], height: 8, rx: 4, "class": "dv-code", style: "animation-delay:" + k * 0.3 + "s" }));
      });
      g.appendChild(sv("rect", { x: 290, y: 90, width: 76, height: 150, rx: 14, "class": "dv-win" }));
      g.appendChild(sv("rect", { x: 302, y: 110, width: 52, height: 28, rx: 6, "class": "dv-code", style: "animation-delay:.2s" }));
      g.appendChild(sv("rect", { x: 302, y: 148, width: 52, height: 12, rx: 5, "class": "dv-code", style: "animation-delay:.6s" }));
      g.appendChild(sv("rect", { x: 302, y: 168, width: 34, height: 12, rx: 5, "class": "dv-code", style: "animation-delay:.9s" }));
    } else {
      g.appendChild(sv("rect", { x: 40, y: 50, width: 200, height: 150, rx: 12, "class": "dv-win" }));
      g.appendChild(sv("line", { x1: 40, y1: 78, x2: 240, y2: 78, "class": "dv-bar" }));
      g.appendChild(sv("path", { d: "M62 108 L82 124 L62 140", "class": "dv-chev" }));
      g.appendChild(sv("rect", { x: 94, y: 134, width: 56, height: 8, rx: 4, "class": "dv-code" }));
      g.appendChild(sv("rect", { x: 62, y: 160, width: 120, height: 8, rx: 4, "class": "dv-code", style: "animation-delay:.5s" }));
      var gx = [290, 290, 340, 340, 315], gy = [60, 130, 95, 165, 215];
      g.appendChild(sv("path", { d: "M290 60 L290 130 L315 215 M290 60 L340 95 L340 165 L315 215", "class": "dv-line" }));
      for (i = 0; i < gx.length; i++) g.appendChild(sv("circle", { cx: gx[i], cy: gy[i], r: 10, "class": "dv-node", style: "animation-delay:" + i * 0.3 + "s" }));
    }
    return svg;
  }

  var domains = [
    { kind: "ai", name: "AI & Machine Learning", color: TONE.ai, icon: "brain",
      points: ["RAG pipelines with hybrid search, reranking and cited answers", "Vision-RAG for crop disease: CNN classification, FAISS retrieval and LLM advisory output", "Local LLM integration with Ollama, pgvector and FastAPI services", "Controlled evaluation of RAG strategies and vision-language models"],
      tech: ["Python", "OpenCV", "Scikit-learn", "Pandas", "NumPy", "Ollama", "FastAPI", "pgvector", "FAISS|FA", "RAG Pipelines|RAG", "LLM Integration|LLM", "CNN|CNN", "VLMs|VLM"] },
    { kind: "iot", name: "IoT & Robotics Engineering", color: TONE.iot, icon: "chip",
      points: ["ESP32 firmware fusing ultrasonic, IMU and IR sensor data", "Multi-node sensor networks over MQTT with cloud aggregation and alerts", "PID control, obstacle avoidance and state-machine navigation", "I2C, UART, SPI and RF telemetry links with manual override"],
      tech: ["ESP32", "ESP8266", "Arduino", "Raspberry Pi", "MQTT", "C/C++", "I2C|I\u00b2C", "UART|TX", "SPI|SPI", "RF Telemetry|RF", "PID Control|PID", "Sensor Fusion|SF"] },
    { kind: "sw", name: "Software Development (Web & Mobile)", color: TONE.web, icon: "layers",
      points: ["Full-stack apps with Next.js, TypeScript, FastAPI and PostgreSQL", "Native Android with Kotlin and Jetpack Compose, cross-platform Flutter with Riverpod", "REST API design, Prisma ORM, SQL and NoSQL databases", "23 public repositories on GitHub, documented and runnable"],
      tech: ["TypeScript", "JavaScript", "Next.js", "React", "Node.js", "FastAPI", "Flutter", "Dart", "Kotlin", "Jetpack Compose", "Java", "Spring Boot", "Tailwind CSS", "Prisma", "PostgreSQL", "MySQL", "SQLite", "Firebase", "MongoDB", "REST APIs|API"] },
    { kind: "tools", name: "Tools, Research & Creative", color: TONE.tools, icon: "wrench",
      points: ["Git, GitHub and Linux (Ubuntu) based development workflows", "IEEE-format academic writing with LaTeX and technical documentation", "Graphic design, video editing and digital marketing"],
      tech: ["Git", "GitHub", "Linux", "Docker", "VS Code", "Android Studio", "Visual Studio", "LaTeX", "Photoshop", "Canva", "Meta Ads", "Video Editing|VE", "Technical Docs|DOC"] }
  ];
  function pill(spec) {
    var parts = spec.split("|"), name = parts[0], mono = parts[1];
    var lg = techLogo(name, 26);
    var tile = el("span", "pill-ico" + (lg ? "" : " mono"), lg ? [lg] : [mono || name.slice(0, 2).toUpperCase()]);
    return el("div", "pill", [tile, text("span", null, name)]);
  }
  function marqueeRow(items, reverse, secs) {
    var inner = el("div", "marquee-inner " + (reverse ? "ltr" : "rtl"), []);
    inner.style.animationDuration = secs + "s";
    for (var c = 0; c < 2; c++) {
      items.forEach(function (s) { var p = pill(s); if (c === 1) p.setAttribute("aria-hidden", "true"); inner.appendChild(p); });
    }
    return el("div", "marquee-track", [inner]);
  }
  var domRoot = document.getElementById("domains");
  domains.forEach(function (d, di) {
    var visual = el("div", "dom-visual", [domainVisual(d.kind, d.color), el("span", "dom-badge", [iconTile(d.icon, d.color, "lg")])]);
    var info = el("div", "dom-info", [
      text("span", "dom-kicker", "DOMAIN EXPERTISE \u00b7 0" + (di + 1)),
      text("h3", null, d.name),
      el("ul", "dom-points", d.points.map(function (p) { return el("li", null, [p]); }))
    ]);
    var rows = [];
    if (d.tech.length >= 7) {
      var mid = Math.ceil(d.tech.length / 2);
      rows.push(marqueeRow(d.tech.slice(0, mid), di % 2 !== 0, mid * 3.2));
      rows.push(marqueeRow(d.tech.slice(mid), di % 2 === 0, (d.tech.length - mid) * 3.2));
    } else rows.push(marqueeRow(d.tech, di % 2 !== 0, d.tech.length * 3.2));
    var tech = el("div", "dom-tech", [el("div", "dom-tech-head", [text("h4", null, "Technologies"), el("i", null, [])]), el("div", "dom-rows", rows)]);
    var row = el("article", "dom-row reveal" + (di % 2 ? " flip" : ""), [el("div", "dom-main", [visual, info]), tech]);
    row.style.setProperty("--c", d.color);
    domRoot.appendChild(row);
  });

  /* ---------- About extras: core expertise, stats, philosophy ---------- */
  var coreItems = ["Multimodal AI & RAG Systems", "Embedded Systems & Firmware", "Autonomous Robotics & Sensor Fusion", "IoT & Cloud Integration", "Full-Stack & Mobile Development", "Research & IEEE-Format Writing"];
  var coreList = document.getElementById("coreList");
  coreItems.forEach(function (c) {
    coreList.appendChild(el("li", null, [el("span", "core-tick", [svgIcon(["M5 12l4.5 4.5L19 7"])]), text("span", null, c)]));
  });
  var statsRoot = document.getElementById("aboutStats");
  [["23", "Public Repositories"], ["3", "Research Projects"], ["1", "IEEE Paper"], ["2026", "B.Sc. Graduate"]].forEach(function (s) {
    statsRoot.appendChild(el("div", "stat", [text("b", null, s[0]), text("span", null, s[1])]));
  });
  var philRoot = document.getElementById("philosophy");
  [["layers", "Integrated Engineering", "Viewing systems as a whole, from low-level firmware to intelligent software layers.", TONE.blue],
   ["radar", "Evidence First", "Preferring cited, evaluated and reproducible results over black-box answers.", TONE.ai],
   ["rocket", "Build in the Open", "Shipping public, documented repositories that anyone can run and review.", TONE.iot]].forEach(function (p, i) {
    var card = el("article", "phil reveal", [iconTile(p[0], p[3], "lg"), text("h4", null, p[1]), text("p", null, p[2])]);
    card.style.setProperty("--c", p[3]); card.style.setProperty("--d", i * 90 + "ms");
    philRoot.appendChild(card);
  });

  /* ---------- Awards & achievements: filterable cards ---------- */
  var ACH = [
    { d: "2026", cat: "publication", icon: "mic", color: TONE.blue, title: "IEEE QPAIN International Conference", from: "CUET, Bangladesh", text: "Co-authored and presented WatchRover: an IoT-enabled autonomous bot for disaster response and rough terrain navigation.", link: "https://doi.org/10.1109/QPAIN69676.2026.11546312", linkLabel: "View paper (DOI)" },
    { d: "2025", cat: "competition", icon: "flag", color: TONE.tools, title: "UIU CSE Fest \u2014 Team Leader, \u201cRed Crew\u201d", from: "Project Show", text: "Led the team through system design, prototyping, testing and the final Project Show." },
    { d: "2024", cat: "competition", icon: "bulb", color: TONE.lang, title: "National Innovation Competition", from: "TechnoCrats V.2", text: "Finalist: turned a real-world problem into a practical technology concept." },
    { d: null, cat: "competition", icon: "leaf", color: TONE.iot, title: "Bangladesh Environment Olympiad", from: "Green Earth Quest", text: "Round Champion." },
    { d: null, cat: "program", icon: "rocket", color: TONE.research, title: "Grameenphone Accelerator Program", from: "Tech Entrepreneurship Track, Savar Region", text: "Selected participant in the technology entrepreneurship track." },
    { d: null, cat: "certification", icon: "shield", color: TONE.rose, title: "Cyber Security Training", from: "Creative IT Institute, Dhaka", text: "Completed training in cyber security fundamentals." },
    { d: null, cat: "certification", icon: "terminal", color: TONE.web, title: "Python Programming Fundamentals", from: "Songjog Connecting People Foundation", text: "Completed a foundational Python programming course." },
    { d: null, cat: "certification", icon: "team", color: TONE.teal, title: "21st Century Employability Skilling Program (Advanced)", from: "Wadhwani Foundation", text: "Completed the advanced employability and soft-skills program." }
  ];
  var ACH_TABS = [["all", "All"], ["publication", "Publication"], ["competition", "Competitions"], ["program", "Programs"], ["certification", "Certifications"]];
  var CAT_LABEL = { publication: "Publication", competition: "Competition", program: "Program", certification: "Certification" };
  var achFilter = "all", achExpanded = false, ACH_LIMIT = 6;
  var achTabsEl = document.getElementById("achFilters"), achGridEl = document.getElementById("achGrid"), achMoreBtn = document.getElementById("achMore");
  function achCard(a) {
    var vis = el("div", "ach-visual", [el("span", "ach-orb", []), el("span", "ach-ico", [iconTile(a.icon, a.color, "lg")]), text("span", "ach-cat", CAT_LABEL[a.cat])]);
    var kids = [vis, el("div", "ach-meta", [text("span", "ach-date", a.d || "Recognition")]), text("h4", null, a.title), text("small", null, a.from), text("p", null, a.text)];
    if (a.link) kids.push(extLink(a.linkLabel + " \u2197", a.link, "ach-link"));
    var card = el("article", "ach-card", kids);
    card.style.setProperty("--c", a.color);
    return card;
  }
  function renderAch() {
    var list = ACH.filter(function (a) { return achFilter === "all" || a.cat === achFilter; });
    var shown = achExpanded ? list : list.slice(0, ACH_LIMIT);
    achGridEl.textContent = "";
    shown.forEach(function (a, i) { var c = achCard(a); c.style.animationDelay = i * 50 + "ms"; achGridEl.appendChild(c); });
    Array.prototype.forEach.call(achTabsEl.children, function (b) {
      var on = b.getAttribute("data-f") === achFilter; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (list.length > ACH_LIMIT) { achMoreBtn.hidden = false; achMoreBtn.textContent = achExpanded ? "Show less \u2191" : "See all " + list.length + " achievements \u2193"; }
    else achMoreBtn.hidden = true;
  }
  ACH_TABS.forEach(function (t) {
    var n = ACH.filter(function (a) { return t[0] === "all" || a.cat === t[0]; }).length;
    var b = el("button", "np-tab", [t[1], text("small", null, String(n))]);
    b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("data-f", t[0]);
    b.addEventListener("click", function () { achFilter = t[0]; achExpanded = false; renderAch(); });
    achTabsEl.appendChild(b);
  });
  achMoreBtn.addEventListener("click", function () { achExpanded = !achExpanded; renderAch(); });
  renderAch();

  /* ---------- Extracurricular activities with detail modal ---------- */
  var ACTS = [
    { icon: "team", color: TONE.web, tag: "Leadership", role: "Joint Secretary", title: "UFTB Robotics Club", org: "University of Frontier Technology, Bangladesh", text: "Contributed to organising club events and student engineering initiatives.", points: ["Helped organise club events and robotics activities", "Supported student engineering initiatives across the department"] },
    { icon: "shield", color: TONE.ai, tag: "National Event", role: "Executive Member", title: "Robofusion IRE 1.0", org: "National-level robotics event", text: "Assisted in planning the national level robotics event.", points: ["Supported event planning and coordination", "Worked with fellow organisers on a national-level robotics programme"] },
    { icon: "flag", color: TONE.tools, tag: "Project Show", role: "Team Leader", title: "Red Crew \u2014 UIU CSE Fest 2025", org: "UIU CSE Fest 2025", text: "Led \u201cRed Crew\u201d through system design and prototyping, then coordinated testing and delivery for the Project Show.", points: ["Led system design and prototyping", "Coordinated testing, delivery and the final Project Show"] },
    { icon: "bulb", color: TONE.rose, tag: "Creative", role: "Digital Marketing & Graphic Design", title: "Creative & Digital Work", org: "Including work with BYSDO", text: "Hands-on digital marketing and graphic design practice alongside engineering, including work with BYSDO.", points: ["Digital marketing with Meta Ads Manager", "Graphic design with Photoshop and Canva", "Video editing and social media content"] }
  ];
  var actRoot = document.getElementById("actGrid"), actModal = document.getElementById("actModal"), lastActBtn = null;
  function openAct(a, btn) {
    document.getElementById("actKind").textContent = a.tag.toUpperCase() + " \u00b7 " + a.org.toUpperCase();
    document.getElementById("actTitle").textContent = a.title;
    document.getElementById("actRole").textContent = a.role;
    document.getElementById("actDesc").textContent = a.text;
    var ul = document.getElementById("actPoints"); ul.textContent = "";
    a.points.forEach(function (p) { ul.appendChild(el("li", null, [p])); });
    lastActBtn = btn; actModal.classList.add("open"); document.getElementById("closeAct").focus();
  }
  function closeAct() { actModal.classList.remove("open"); if (lastActBtn) lastActBtn.focus(); }
  ACTS.forEach(function (a, i) {
    var card = el("button", "act-card reveal", [
      el("span", "act-ico", [iconTile(a.icon, a.color, "lg")]), text("span", "act-tag", a.tag),
      text("h4", null, a.title), text("b", "act-role", a.role), text("p", null, a.text),
      text("span", "act-more", "View details \u2192")
    ]);
    card.type = "button"; card.style.setProperty("--c", a.color); card.style.setProperty("--d", i * 80 + "ms");
    card.addEventListener("click", function () { openAct(a, card); });
    actRoot.appendChild(card);
  });
  document.getElementById("closeAct").addEventListener("click", closeAct);
  actModal.addEventListener("mousedown", function (e) { if (e.target === actModal) closeAct(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && actModal.classList.contains("open")) closeAct(); });

  /* ---------- Contact info cards ---------- */
  var contactLinks = [
    { label: "Email", value: "tamzid.omi@gmail.com", href: "mailto:tamzid.omi@gmail.com", icon: "envelope", color: TONE.blue },
    { label: "LinkedIn", value: "MD Tamzid Hossen Omi", href: "https://www.linkedin.com/in/md-tamzid-hossen-omi-93000a2b9", icon: "team", color: TONE.web },
    { label: "GitHub", value: "github.com/tamzid16", href: "https://github.com/tamzid16", icon: "code", color: TONE.tools },
    { label: "Location", value: "Dhaka, Bangladesh", href: "https://www.google.com/maps/search/Dhaka,+Bangladesh", icon: "flag", color: TONE.rose }
  ];
  var clRoot = document.getElementById("contactLinks");
  contactLinks.forEach(function (c) {
    var a = el("a", "contact-link2", [iconTile(c.icon, c.color, "lg"), el("div", null, [text("small", null, c.label), text("b", null, c.value)]), text("i", "cl-arrow", "\u2192")]);
    a.href = c.href; a.style.setProperty("--c", c.color);
    if (c.href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    clRoot.appendChild(a);
  });

  /* ---------- Left sidebar: social icons that rise in on scroll ---------- */
  var SOCIAL_PATHS = {"github": "M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", "linkedin": "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z", "researchgate": "M19.586 0q-1.226.001-2.073.565q-.846.565-1.213 1.68a3 3 0 0 0-.112.437a8 8 0 0 0-.078.53a9 9 0 0 0-.05.727q-.014.423-.013 1.016a31.121 31.123 0 0 0 .014 1.017a9 9 0 0 0 .05.727a8 8 0 0 0 .077.53h-.005a3 3 0 0 0 .113.438q.368 1.114 1.214 1.68q.847.564 2.075.564c.8 0 1.536-.213 2.105-.603c.57-.39.94-.916 1.175-1.65c.076-.235.135-.558.177-.93a11 11 0 0 0 .043-1.207v-.82q0-.142-.14-.142h-3.064q-.14 0-.14.141v.956q0 .14.14.14h1.666q.084.001.084.086c0 .36 0 .62-.036.865c-.038.244-.1.447-.147.606c-.108.385-.348.664-.638.876s-.738.35-1.227.35c-.545 0-.901-.15-1.21-.353c-.306-.203-.517-.454-.67-.915a3 3 0 0 1-.147-.762a17.366 17.367 0 0 1-.034-.656q-.015-.39-.014-.939a26.401 26.403 0 0 1 .014-.938a16 16 0 0 1 .035-.656a3.2 3.2 0 0 1 .148-.76a1.9 1.9 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352c.508 0 .815.096 1.144.303c.33.207.528.492.764.925q.069.141.198.07l1.044-.43q.113-.072.042-.199a3.6 3.6 0 0 0-.466-.742a3 3 0 0 0-.679-.607a3.3 3.3 0 0 0-.903-.41A4 4 0 0 0 19.586 0M8.217 5.836c-1.69 0-3.036.086-4.297.086c-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086c1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057c1.748 3.123 3.41 5.472 4.355 6.56c.86 1.032 2.177 1.691 3.839 1.691c.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518c-1.26-1.376-2.95-3.582-4.355-6.074c2.32-.545 4.04-2.722 4.04-4.9c0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552c0 2.263-1.547 3.782-4.097 3.782c-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z"};
  var sideLeft = document.getElementById("sideLeft");
  [["GitHub", GH, SOCIAL_PATHS.github], ["LinkedIn", "https://www.linkedin.com/in/md-tamzid-hossen-omi-93000a2b9", SOCIAL_PATHS.linkedin], ["ResearchGate", "https://www.researchgate.net/profile/Md-Omi-4?ev=hdr_xprf", SOCIAL_PATHS.researchgate], ["Email", "mailto:tamzid.omi@gmail.com", null]].forEach(function (s, i, arr) {
    var icon = s[2] ? svgIcon([s[2]]) : catIcon("envelope");
    if (s[2]) icon.classList.add("filled");
    var a = el("a", null, [icon]);
    a.href = s[1]; a.setAttribute("aria-label", s[0]); a.title = s[0];
    a.style.setProperty("--k", arr.length - 1 - i);
    if (s[1].indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    sideLeft.appendChild(a);
  });
  sideLeft.appendChild(el("i", null, []));

  /* ---------- Scroll progress, sticky nav state, sidebars, active section ---------- */
  var topbar = document.getElementById("topbar");
  var progress = document.getElementById("scrollProgress");
  var sideRight = document.getElementById("sideRight");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    topbar.classList.toggle("scrolled", y > 20);
    sideLeft.classList.toggle("show", y > 260);
    sideRight.classList.toggle("show", y > 360);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#topNav a"));
  var navMap = {};
  navLinks.forEach(function (a) { navMap[a.getAttribute("href").slice(1)] = a; });
  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      navLinks.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
      var a = navMap[en.target.id];
      if (a) { a.classList.add("active"); a.setAttribute("aria-current", "true"); }
    });
  }, { rootMargin: "-12% 0px -68% 0px", threshold: 0 });
  document.querySelectorAll("main section[id]").forEach(function (s) { navIO.observe(s); });
  document.getElementById("navResume").addEventListener("click", function () {
    document.getElementById("topNav").classList.remove("open");
    document.getElementById("openResume").click();
  });

  /* ---------- Gallery: 3D screen coverflow ---------- */
  var shots = [
    { f: "dashboard", t: "RAGBench dashboard" }, { f: "chat", t: "KnowledgeOS chat" }, { f: "telemetry", t: "Rover telemetry" },
    { f: "mobile", t: "GHURI mobile app" }, { f: "code", t: "RepoPilot code Q&A" }, { f: "research", t: "JuteRAG pipeline" }
  ];
  var cfStage = document.getElementById("cfStage");
  var cfDots = document.getElementById("cfDots");
  var cfCaption = document.getElementById("cfCaption");
  var slides = [], dots = [], cfIndex = 0, cfTimer = null;
  shots.forEach(function (s, i) {
    var screen = el("div", "cf-screen", [
      el("div", "cf-bar", [el("i", null, []), el("i", null, []), el("i", null, []), text("span", null, s.t)]),
      (function () { var g = img("gallery/" + s.f + ".svg", s.t, 1280, 800); g.loading = "eager"; return g; })(),
      el("div", "cf-glare", [])
    ]);
    var slide = el("div", "cf-slide", [screen, el("div", "cf-reflect", [])]);
    slide.addEventListener("click", function () { goTo(i); });
    cfStage.appendChild(slide); slides.push(slide);
    var d = el("button", "cf-dot", []); d.type = "button"; d.setAttribute("aria-label", "Show " + s.t);
    d.addEventListener("click", function () { goTo(i); });
    cfDots.appendChild(d); dots.push(d);
  });
  function layoutCf() {
    var n = slides.length;
    slides.forEach(function (sl, i) {
      var off = i - cfIndex;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      var a = Math.abs(off);
      sl.style.opacity = a > 2 ? 0 : 1 - a * 0.22;
      sl.style.pointerEvents = a > 2 ? "none" : "auto";
      sl.style.zIndex = 10 - a;
      sl.style.transform = "translateX(" + (off * 64) + "%) translateZ(" + (-a * 150) + "px) rotateY(" + (-off * 34) + "deg) scale(" + (1 - a * 0.06) + ")";
      sl.classList.toggle("active", off === 0);
    });
    dots.forEach(function (d, i) { d.classList.toggle("on", i === cfIndex); });
    cfCaption.textContent = String(cfIndex + 1).padStart(2, "0") + " / " + String(shots.length).padStart(2, "0") + "  \u00b7  " + shots[cfIndex].t;
  }
  function goTo(i) { cfIndex = (i + slides.length) % slides.length; layoutCf(); }
  document.getElementById("cfPrev").addEventListener("click", function () { goTo(cfIndex - 1); });
  document.getElementById("cfNext").addEventListener("click", function () { goTo(cfIndex + 1); });
  var cfWrap = document.getElementById("coverflow");
  cfWrap.tabIndex = 0;
  cfWrap.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") goTo(cfIndex - 1);
    if (e.key === "ArrowRight") goTo(cfIndex + 1);
  });
  function startCf() { if (!reducedMotion && !cfTimer) cfTimer = window.setInterval(function () { goTo(cfIndex + 1); }, 4200); }
  function stopCf() { window.clearInterval(cfTimer); cfTimer = null; }
  cfWrap.addEventListener("mouseenter", stopCf);
  cfWrap.addEventListener("mouseleave", startCf);
  layoutCf(); startCf();

  /* ---------- Web presence, with logo-style badges ---------- */
  function logoBadge(bg, color, iconNode) {
    var badge = el("div", "profile-logo", [iconNode]);
    badge.style.background = bg;
    badge.style.color = color;
    return badge;
  }
  var profiles = [
    { title: "LinkedIn", kind: "Professional", action: "Connect", desc: "Experience, education and professional connections.", href: "https://www.linkedin.com/in/md-tamzid-hossen-omi-93000a2b9", bg: "#0A66C2", logo: function () { return text("b", null, "in"); } },
    { title: "GitHub", kind: "Code", action: "View repositories", desc: "23 public repositories: RAG platforms, mobile apps and embedded work.", href: "https://github.com/tamzid16", bg: "#2b3340", logo: function () { return svgIcon(["M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1-.07 1.53 1.03 1.53 1.03.9 1.52 2.35 1.08 2.92.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z"]); } },
    { title: "ResearchGate", kind: "Research", action: "Discover", desc: "Research profile for publications and academic collaboration.", href: "https://www.researchgate.net/profile/Md-Omi-4?ev=hdr_xprf", bg: "#00a99b", logo: function () { return text("b", null, "RG"); } },
    { title: "Email", kind: "Direct", action: "Message", desc: "Direct line for roles, research collaboration or a quick hello.", href: "mailto:tamzid.omi@gmail.com", bg: "#2F7DFF", logo: function () { return catIcon("envelope"); } }
  ];
  var profileGrid = document.getElementById("profileGrid");
  profiles.forEach(function (p, i) {
    var ext = p.href.indexOf("http") === 0;
    var link = el("a", "np-visual-link", []);
    link.href = p.href; link.setAttribute("aria-label", "Open " + p.title);
    if (ext) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
    link.appendChild(el("div", "np-visual", [el("span", "np-orb o1", []), el("span", "np-orb o2", []), el("span", "np-ico", [logoBadge(p.bg, "#fff", p.logo())]), text("span", "np-cta", p.action + " \u2197")]));
    var btn = text("a", "np-btn", p.action + " \u2197"); btn.href = p.href;
    if (ext) { btn.target = "_blank"; btn.rel = "noopener noreferrer"; }
    var card = el("article", "np-card", [link, el("div", "np-body", [el("div", "np-meta", [text("span", "np-kind", p.kind), text("b", null, "@tamzid.omi")]), text("h4", null, p.title), text("p", null, p.desc), el("div", "np-foot", [el("div", "np-acts", [btn])])])]);
    card.style.setProperty("--c", p.bg === "#2b3340" ? "#9aa7c0" : p.bg);
    card.style.animationDelay = i * 60 + "ms";
    profileGrid.appendChild(card);
  });

  /* ---------- Inference Lab: dynamic puzzle pool ---------- */
  var puzzlePool = [
    {
      question: "Which crop-disease prediction should reach the farmer?",
      rule: "Trust a result only when retrieval is verified, image quality is not low, confidence is at least 80%, and calibration gap is below 8%.",
      candidates: [
        { name: "Model A", confidence: "96%", image: "Low", retrieval: "Missing", gap: "18%" },
        { name: "Model B", confidence: "82%", image: "High", retrieval: "Verified", gap: "5%" },
        { name: "Model C", confidence: "91%", image: "Medium", retrieval: "Verified", gap: "14%" }
      ],
      correct: "Model B",
      correctMsg: "Correct. Model B is grounded, calibrated, and supported by a high-quality image.",
      wrongMsg: "Unsafe prediction. High confidence cannot compensate for weak evidence or poor calibration."
    },
    {
      question: "Which WatchRover telemetry reading should trigger autonomous stop?",
      rule: "Trigger a stop only when obstacle distance is under 1m, sensor confidence is verified, and no manual override is active.",
      candidates: [
        { name: "Reading A", confidence: "60%", image: "0.4m", retrieval: "Unverified", gap: "Override off" },
        { name: "Reading B", confidence: "95%", image: "0.6m", retrieval: "Verified", gap: "Override off" },
        { name: "Reading C", confidence: "90%", image: "0.3m", retrieval: "Verified", gap: "Override ON" }
      ],
      correct: "Reading B",
      correctMsg: "Correct. Reading B is close, sensor-verified, and the robot is not under manual control.",
      wrongMsg: "Risky call. Either the sensor isn't verified, or a human already has manual control."
    },
    {
      question: "Which Agri-RAG retrieval chunk should the LLM cite?",
      rule: "Cite a chunk only when its source is peer-reviewed, relevance score is at least 0.75, and it is not older than 5 years.",
      candidates: [
        { name: "Chunk A", confidence: "Score .91", image: "Peer-rev.", gap: "2 yrs" },
        { name: "Chunk B", confidence: "Score .68", image: "Peer-rev.", gap: "1 yr" },
        { name: "Chunk C", confidence: "Score .88", image: "Blog post", gap: "3 yrs" }
      ],
      correct: "Chunk A",
      correctMsg: "Correct. Chunk A clears relevance, source quality, and recency \u2014 safe to cite.",
      wrongMsg: "Not citable. Either relevance is too low or the source isn't peer-reviewed."
    },
    {
      question: "Which IoT sensor batch should be flagged for recalibration?",
      rule: "Flag a batch only when drift exceeds 5%, and the last calibration was over 90 days ago.",
      candidates: [
        { name: "Batch A", confidence: "Drift 7%", image: "40 days", retrieval: "\u2014", gap: "\u2014" },
        { name: "Batch B", confidence: "Drift 8%", image: "120 days", retrieval: "\u2014", gap: "\u2014" },
        { name: "Batch C", confidence: "Drift 3%", image: "200 days", retrieval: "\u2014", gap: "\u2014" }
      ],
      correct: "Batch B",
      correctMsg: "Correct. Batch B has both excess drift and an overdue calibration window.",
      wrongMsg: "Not yet. Check both conditions \u2014 drift above 5% AND overdue past 90 days."
    },
    {
      question: "Which trained model is ready for production deployment?",
      rule: "Deploy only when validation accuracy is at least 90%, the train-test gap is under 4%, and the model passed bias testing.",
      candidates: [
        { name: "Model X", confidence: "94%", image: "Gap 9%", retrieval: "Passed", gap: "Overfit" },
        { name: "Model Y", confidence: "91%", image: "Gap 3%", retrieval: "Passed", gap: "Ready" },
        { name: "Model Z", confidence: "96%", image: "Gap 2%", retrieval: "Failed", gap: "Biased" }
      ],
      correct: "Model Y",
      correctMsg: "Correct. Model Y clears accuracy, generalizes well, and passed bias testing.",
      wrongMsg: "Not deployable. Either it's overfitting or it failed the bias check."
    },
    {
      question: "Which smart-home automation should fire right now?",
      rule: "Trigger only when motion is confirmed, it's after sunset, and no one is marked 'home' on the security panel.",
      candidates: [
        { name: "Rule A", confidence: "Motion: Yes", image: "Day", retrieval: "Away", gap: "\u2014" },
        { name: "Rule B", confidence: "Motion: Yes", image: "Night", retrieval: "Away", gap: "\u2014" },
        { name: "Rule C", confidence: "Motion: No", image: "Night", retrieval: "Away", gap: "\u2014" }
      ],
      correct: "Rule B",
      correctMsg: "Correct. Rule B has confirmed motion, it's after sunset, and the house is empty.",
      wrongMsg: "Don't fire yet \u2014 either it's daytime or there's no confirmed motion."
    },
    {
      question: "Which network packet should the IDS flag as a threat?",
      rule: "Flag traffic only when the source is unrecognized, the port is non-standard, and payload entropy is high (encrypted/obfuscated).",
      candidates: [
        { name: "Packet A", confidence: "Known IP", image: "Port 443", retrieval: "Low entropy", gap: "\u2014" },
        { name: "Packet B", confidence: "Unknown IP", image: "Port 443", retrieval: "Low entropy", gap: "\u2014" },
        { name: "Packet C", confidence: "Unknown IP", image: "Port 8831", retrieval: "High entropy", gap: "\u2014" }
      ],
      correct: "Packet C",
      correctMsg: "Correct. Packet C is unrecognized, non-standard, and looks obfuscated \u2014 flag it.",
      wrongMsg: "Not a threat yet. A known source or standard port with low entropy is normal traffic."
    }
  ];
  var usedPuzzles = [];
  var modelTable = document.getElementById("modelTable");
  var orbEl = document.getElementById("inferenceOrb");
  var orbSymbol = document.getElementById("orbSymbol");
  var orbLabel = document.getElementById("orbLabel");
  var inferenceMsg = document.getElementById("inferenceMsg");
  var puzzleQuestion = document.getElementById("puzzleQuestion");
  var puzzleRule = document.getElementById("puzzleRule");
  var scoreVal = document.getElementById("scoreVal");
  var streakVal = document.getElementById("streakVal");
  var score = 0, streak = 0, answered = false;

  function bumpScore(el2) {
    el2.classList.remove("pop");
    void el2.offsetWidth;
    el2.classList.add("pop");
  }

  function metricSpan(value, label) {
    return el("span", null, [document.createTextNode(value), text("small", null, label)]);
  }
  function loadPuzzle() {
    answered = false;
    if (usedPuzzles.length >= puzzlePool.length) usedPuzzles = [];
    var remaining = puzzlePool.map(function (_, i) { return i; }).filter(function (i) { return usedPuzzles.indexOf(i) === -1; });
    var pick = remaining[Math.floor(Math.random() * remaining.length)];
    usedPuzzles.push(pick);
    var puzzle = puzzlePool[pick];

    puzzleQuestion.textContent = puzzle.question;
    puzzleRule.textContent = puzzle.rule;
    modelTable.textContent = "";
    orbEl.className = "inference-orb";
    orbSymbol.textContent = "?";
    orbLabel.textContent = "Select a model";
    inferenceMsg.className = "";
    inferenceMsg.textContent = "Evaluate evidence, not confidence alone.";

    var shuffled = puzzle.candidates.slice().sort(function () { return Math.random() - 0.5; });
    shuffled.forEach(function (m) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.appendChild(text("b", null, m.name));
      btn.appendChild(metricSpan(m.confidence, "primary"));
      btn.appendChild(metricSpan(m.image, "quality"));
      btn.appendChild(metricSpan(m.retrieval, "verify"));
      btn.appendChild(metricSpan(m.gap, "margin"));
      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        modelTable.querySelectorAll("button").forEach(function (b) { b.classList.add("locked"); });
        btn.classList.add("selected");
        var solved = m.name === puzzle.correct;
        orbEl.className = "inference-orb " + (solved ? "safe" : "unsafe");
        orbSymbol.textContent = solved ? "\u2713" : "!";
        orbLabel.textContent = m.name;
        inferenceMsg.className = solved ? "solved" : "wrong";
        inferenceMsg.textContent = solved ? puzzle.correctMsg : puzzle.wrongMsg;
        if (solved) {
          score += 10 + streak * 2;
          streak += 1;
        } else {
          streak = 0;
        }
        scoreVal.textContent = score;
        streakVal.textContent = streak;
        bumpScore(scoreVal);
        bumpScore(streakVal);
        window.setTimeout(loadPuzzle, 1800);
      });
      modelTable.appendChild(btn);
    });
  }
  loadPuzzle();
  var newPuzzleBtn = document.getElementById("newPuzzleBtn");
  if (newPuzzleBtn) newPuzzleBtn.addEventListener("click", loadPuzzle);

  /* ---------- Resume modal ---------- */
  var resumeModal = document.getElementById("resumeModal");
  var openResumeBtn = document.getElementById("openResume");
  var closeResumeBtn = document.getElementById("closeResume");
  openResumeBtn.addEventListener("click", function () {
    resumeModal.classList.add("open");
    closeResumeBtn.focus();
  });
  closeResumeBtn.addEventListener("click", function () {
    resumeModal.classList.remove("open");
    openResumeBtn.focus();
  });
  resumeModal.addEventListener("mousedown", function (e) { if (e.target === resumeModal) resumeModal.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") resumeModal.classList.remove("open"); });

  /* ---------- Contact form ----------
     mailto: link opened in visitor's own email app -- nothing sent to or
     stored on any server; values go through encodeURIComponent, never
     inserted as HTML, so there's no injection surface. */
  var msgInput = document.getElementById("cf-msg");
  var meterBar = document.getElementById("meterBar");
  var meterText = document.getElementById("meterText");
  meterBar.style.width = "3%";
  msgInput.addEventListener("input", function () {
    var len = msgInput.value.length;
    meterBar.style.width = Math.max(3, len / 6) + "%";
    meterText.textContent = len + "/600 SIGNAL STRENGTH";
  });
  document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cf-name").value;
    var email = document.getElementById("cf-email").value;
    var msg = msgInput.value;
    var subjField = document.getElementById("cf-subject").value;
    var subject = encodeURIComponent(subjField ? subjField + " (from " + name + ")" : "Portfolio message from " + name);
    var body = encodeURIComponent(msg + "\n\nFrom: " + name + " (" + email + ")");
    window.location.href = "mailto:tamzid.omi@gmail.com?subject=" + subject + "&body=" + body;
    document.getElementById("formNote").textContent = "Opening your email client...";
  });

  /* ---------- Omi chatbot: rule-based, client-side only, no external calls ---------- */
  var KB = [
    { kw: ["skill", "stack", "technology", "tech", "language", "know"], a: "I work across Python, C/C++, JavaScript, TypeScript and Dart, with an AI/ML focus on RAG pipelines, FAISS, pgvector, Ollama and LLM integration, plus embedded work on ESP32, Arduino, Raspberry Pi and MQTT. Full breakdown in the Skills section." },
    { kw: ["project", "built", "build", "repo", "watchrover", "ghuri", "knowledgeos", "ragbench", "repopilot", "agentdesk", "fish", "docintel", "devicemonitor", "expenseiq", "campusconnect"], a: "I have 23 public repositories. Flagship work: KnowledgeOS and RAGBench (RAG platforms), RepoPilot AI and AgentDesk (code-aware RAG and agent observability), GHURI (Flutter travel safety with IoT), and native Android apps such as DeviceMonitor, ExpenseIQ and CampusConnect. Use the Projects tabs to filter by Software & Web or IoT & Robotics." },
    { kw: ["research", "thesis", "agri-rag", "agri rag", "juterag", "jute", "rag", "paper"], a: "My research spans Agri-RAG and JuteRAG \u2014 multimodal retrieval-augmented frameworks for crop and jute disease diagnosis \u2014 and I'm a co-author on the WatchRover IEEE paper. My ResearchGate profile is linked in Web Presence." },
    { kw: ["education", "study", "degree", "university", "school", "graduate"], a: "I hold a B.Sc. in Internet of Things and Robotics Engineering (2026) from the University of Frontier Technology, Bangladesh (UFTB)." },
    { kw: ["achievement", "award", "ieee", "competition", "qpain"], a: "Highlights: co-authoring WatchRover at IEEE QPAIN 2026 (CUET), leading \u201cRed Crew\u201d at UIU CSE Fest 2025, and finalist placement at TechnoCrats V.2, among others \u2014 full list in the Achievements section." },
    { kw: ["leadership", "robotics club", "robofusion", "secretary", "activities", "extracurricular", "red crew"], a: "I served as Joint Secretary of the UFTB Robotics Club, as an Executive Member for Robofusion IRE 1.0, and led the Red Crew team at UIU CSE Fest 2025. Details are in the Extracurricular Activities section." },
    { kw: ["contact", "email", "reach", "hire", "job", "work with", "available"], a: "Best way to reach me is through the Contact form below, or directly at tamzid.omi@gmail.com. I'm currently open to roles in IoT, Robotics, or Software Engineering." },
    { kw: ["location", "based", "where", "dhaka", "bangladesh"], a: "I'm based in Dhaka, Bangladesh." },
    { kw: ["resume", "cv"], a: "You can view or download my resume using the Resume button in the navigation bar or the VIEW RESUME button at the top of the page." },
    { kw: ["github", "linkedin", "researchgate", "profile", "social"], a: "All my profiles \u2014 GitHub, LinkedIn, and ResearchGate \u2014 are linked in the Web Presence section, or in the footer." },
    { kw: ["hello", "hi", "hey", "yo"], a: "Hey! I'm Omi's assistant. Ask me about skills, projects, research, or how to get in touch." }
  ];
  var FALLBACK = "I don't have a direct answer for that, but you can reach Omi at tamzid.omi@gmail.com or through the Contact form below.";
  var SUGGESTIONS = ["What are your core skills?", "Tell me about WatchRover", "What's Agri-RAG?", "How do I contact you?"];

  function botReply(userText) {
    var lower = userText.toLowerCase();
    for (var i = 0; i < KB.length; i++) {
      for (var k = 0; k < KB[i].kw.length; k++) {
        if (lower.indexOf(KB[i].kw[k]) !== -1) return KB[i].a;
      }
    }
    return FALLBACK;
  }

  var chatbot = document.getElementById("chatbot");
  var chatToggle = document.getElementById("chatbotToggle");
  var chatClose = document.getElementById("chatbotClose");
  var chatPanel = document.getElementById("chatbotPanel");
  var chatMessages = document.getElementById("chatbotMessages");
  var chatForm = document.getElementById("chatbotForm");
  var chatInput = document.getElementById("chatbotInput");
  var chatSuggestions = document.getElementById("chatbotSuggestions");

  function addMessage(role, str) {
    var msg = text("div", "chat-msg " + role, str);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function renderSuggestions() {
    chatSuggestions.textContent = "";
    SUGGESTIONS.forEach(function (s) {
      var btn = text("button", null, s);
      btn.type = "button";
      btn.addEventListener("click", function () {
        addMessage("user", s);
        window.setTimeout(function () { addMessage("bot", botReply(s)); }, 350);
      });
      chatSuggestions.appendChild(btn);
    });
  }
  var chatInitialized = false;
  function openChat() {
    chatbot.classList.add("open");
    chatToggle.setAttribute("aria-expanded", "true");
    chatPanel.setAttribute("aria-hidden", "false");
    if (!chatInitialized) {
      addMessage("bot", "Hi, I'm Omi's assistant. Ask me about skills, projects, research, or how to reach Omi directly.");
      renderSuggestions();
      chatInitialized = true;
    }
    chatInput.focus();
  }
  function closeChat() {
    chatbot.classList.remove("open");
    chatToggle.setAttribute("aria-expanded", "false");
    chatPanel.setAttribute("aria-hidden", "true");
  }
  chatToggle.addEventListener("click", function () {
    if (chatbot.classList.contains("open")) closeChat(); else openChat();
  });
  chatClose.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && chatbot.classList.contains("open")) closeChat(); });
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = chatInput.value.trim();
    if (!val) return;
    addMessage("user", val);
    chatInput.value = "";
    window.setTimeout(function () { addMessage("bot", botReply(val)); }, 400);
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { entry.target.classList.toggle("visible", entry.isIntersecting); });
  }, { threshold: 0.1, rootMargin: "-3% 0px -5%" });
  document.querySelectorAll(".reveal").forEach(function (element) { io.observe(element); });
  document.querySelectorAll(".proj-card, .res-card").forEach(function (element) {
    element.classList.add("reveal");
    io.observe(element);
  });

  /* ---------- Card hover lighting: glow follows the cursor ---------- */
  var GLOW_SEL = ".np-card,.proj-card,.ach-card,.act-card,.phil,.stat,.contact-card";
  document.addEventListener("mousemove", function (e) {
    var card = e.target && e.target.closest ? e.target.closest(GLOW_SEL) : null;
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

})();
