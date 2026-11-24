
import {
  submitJob,
  listJobs,
  advanceJob,
  approveJob
} from "./vcee-engine-.js";

const app = document.querySelector("#app");

const STORAGE = {
  jobs: "vcee-factory-jobs-v1",
  ledger: "vcee-production-ledger-v1",
  profile: "vcee-creator-profile-v1",
  assets: "vcee-asset-vault-v1"
};

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36).slice(2, 6).toUpperCase()}`;

let jobs = read(STORAGE.jobs, []);
let ledger = read(STORAGE.ledger, []);
let assets = read(STORAGE.assets, []);
let profile = read(STORAGE.profile, {
  name: "Creator Studio",
  platform: "Independent"
});

let activePage = "dashboard";
let assetFilter = "ALL";
let assetSearch = "";

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

function record(type, description, reference = "") {
  ledger.unshift({
    id: uid("LOG"),
    type,
    description,
    reference,
    timestamp: new Date().toISOString()
  });

  ledger = ledger.slice(0, 500);
  write(STORAGE.ledger, ledger);
}

function saveJobs() {
  write(STORAGE.jobs, jobs);
}

function saveAssets() {
  write(STORAGE.assets, assets);
}

function seedData() {
  if (jobs.length === 0) {
    jobs = [
      {
        id: uid("JOB"),
        title: "Creator Channel Launch",
        type: "Brand Package",
        platform: "YouTube",
        description: "Build a launch identity and creative package.",
        status: "IN PRODUCTION",
        createdAt: new Date().toISOString()
      },
      {
        id: uid("JOB"),
        title: "Weekly Stream Highlights",
        type: "Video Production",
        platform: "Twitch",
        description: "Create a collection of highlight clips.",
        status: "QUALITY REVIEW",
        createdAt: new Date().toISOString()
      }
    ];
    saveJobs();
  }

  if (assets.length === 0) {
    assets = [
      {
        id: uid("AST"),
        name: "Creator Brand Identity",
        type: "Graphics",
        project: "Creator Channel Launch",
        version: "1.0",
        status: "APPROVED",
        rights: "Creator-provided",
        license: "Internal use",
        notes: "Initial identity package.",
        createdAt: new Date().toISOString()
      },
      {
        id: uid("AST"),
        name: "Stream Highlight Collection",
        type: "Video",
        project: "Weekly Stream Highlights",
        version: "1.0",
        status: "IN REVIEW",
        rights: "Confirm source rights",
        license: "Pending",
        notes: "Source footage and derivative clips.",
        createdAt: new Date().toISOString()
      }
    ];
    saveAssets();
  }
}

seedData();

const factories = [
  ["VCI", "Creator Intelligence", "brain"],
  ["DVF", "Design Visualization", "palette"],
  ["MPF", "Media Production", "clapperboard"],
  ["ICF", "Interactive Creation", "boxes"],
  ["IAR", "IP Asset Refinery", "database"],
  ["PDE", "Publishing & Distribution", "send"]
];

const agents = [
  ["ELEANOR", "Creator Intelligence", "Interprets the brief"],
  ["ZEUS", "Orchestration", "Coordinates production"],
  ["OMEGA", "Quality Control", "Reviews deliverables"],
  ["KRONOS", "Forecasting", "Models timelines"],
  ["TITAN", "Operations", "Monitors execution"]
];

function stat(label, value, detail) {
  return `
    <div class="stat-card">
      <span>${escapeHTML(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHTML(detail)}</small>
    </div>
  `;
}

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function badge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function pageHeader(title, subtitle, action = "") {
  return `
    <div class="page-header">
      <div>
        <div class="eyebrow">VCEE / CREATOR OPERATIONS</div>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      ${action}
    </div>
  `;
}

function renderDashboard() {
  const approved = jobs.filter(j => j.status === "APPROVED" || j.status === "DELIVERED").length;
  const active = jobs.filter(j => !["APPROVED", "DELIVERED"].includes(j.status)).length;

  return `
    ${pageHeader("Creator Command", "Your creative operation. One connected production environment.",
      `<button class="primary-btn" data-action="new-project">＋ New Project</button>`)}

    <div class="welcome-panel">
      <div>
        <div class="eyebrow">YOUR CREATOR ENTERPRISE</div>
        <h2>Turn your ideas into <span>creative assets.</span></h2>
        <p>Manage projects, coordinate production, and build your intellectual-property library.</p>
        <button class="primary-btn" data-page="vault">OPEN ASSET VAULT →</button>
      </div>
      <div class="welcome-orbit">
        <div class="orbit-ring"></div>
        <div class="orbit-core">VCEE</div>
      </div>
    </div>

    <div class="stats-grid">
      ${stat("TOTAL PROJECTS", jobs.length, "Registered production jobs")}
      ${stat("ACTIVE PRODUCTION", active, "Projects in progress")}
      ${stat("APPROVED PROJECTS", approved, "Passed creator approval")}
      ${stat("REGISTERED ASSETS", assets.length, "Items in your asset vault")}
    </div>

    <div class="section-heading">
      <div><h2>Recent Production</h2><p>Your active creative pipeline</p></div>
      <button class="text-btn" data-page="production">VIEW ALL →</button>
    </div>

    ${renderJobCards(jobs.slice(0, 4))}

    <div class="section-heading">
      <div><h2>Creative Factories</h2><p>Six specialized production capabilities</p></div>
    </div>
    <div class="factory-grid">
      ${factories.map(([id, name, icon]) => `
        <div class="factory-card">
          <div class="factory-icon">${icon.toUpperCase()}</div>
          <div class="eyebrow">${id}</div>
          <strong>${name}</strong>
          <small>Production capability</small>
        </div>
      `).join("")}
    </div>

    <div class="section-heading">
      <div><h2>Intelligence Team</h2><p>Coordinating the creator workflow</p></div>
    </div>
    <div class="agent-grid">
      ${agents.map(([name, role, desc]) => `
        <div class="agent-card">
          <div class="agent-avatar">${name[0]}</div>
          <div><strong>${name}</strong><small>${role}</small><p>${desc}</p></div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderJobCards(items) {
  if (!items.length) {
    return `<div class="empty-state">No projects yet. Create your first production project.</div>`;
  }

  return `
    <div class="job-list">
      ${items.map(job => `
        <div class="job-card">
          <div class="job-main">
            <div class="eyebrow">${escapeHTML(job.type)} / ${escapeHTML(job.platform)}</div>
            <strong>${escapeHTML(job.title)}</strong>
            <small>${escapeHTML(job.description || "Production project")}</small>
          </div>
          ${badge(job.status)}
          <button class="small-btn" data-action="view-job" data-id="${escapeHTML(job.id)}">OPEN</button>
        </div>
      `).join("")}
    </div>
  `;
}

function renderProduction() {
  return `
    ${pageHeader("My Production", "Track your creative projects from brief to delivery.",
      `<button class="primary-btn" data-action="new-project">＋ New Project</button>`)}
    <div class="stats-grid">
      ${stat("ALL PROJECTS", jobs.length, "Total registered")}
      ${stat("IN PRODUCTION", jobs.filter(j => j.status === "IN PRODUCTION").length, "Being produced")}
      ${stat("QUALITY REVIEW", jobs.filter(j => j.status === "QUALITY REVIEW").length, "Awaiting review")}
      ${stat("DELIVERED", jobs.filter(j => j.status === "DELIVERED").length, "Completed")}
    </div>
    ${renderJobCards(jobs)}
  `;
}

function renderVault() {
  const filtered = assets.filter(asset => {
    const matchesFilter = assetFilter === "ALL" || asset.type === assetFilter;
    const haystack = `${asset.name} ${asset.project} ${asset.id} ${asset.type}`.toLowerCase();
    return matchesFilter && haystack.includes(assetSearch.toLowerCase());
  });

  const types = ["ALL", ...new Set(assets.map(a => a.type))];

  return `
    ${pageHeader("Creator Asset Vault", "Your organized library of creative work and intellectual-property records.",
      `<button class="primary-btn" data-action="new-asset">＋ Register Asset</button>`)}

    <div class="vault-banner">
      <div>
        <div class="eyebrow">IAR / IP ASSET REFINERY</div>
        <h2>Your creative work deserves a <span>permanent record.</span></h2>
        <p>Register, organize, track, and reuse the assets created across your projects.</p>
      </div>
      <div class="vault-count">
        <strong>${assets.length.toString().padStart(2, "0")}</strong>
        <small>REGISTERED ASSETS</small>
      </div>
    </div>

    <div class="stats-grid">
      ${stat("TOTAL ASSETS", assets.length, "Registered records")}
      ${stat("APPROVED", assets.filter(a => a.status === "APPROVED").length, "Approved records")}
      ${stat("IN REVIEW", assets.filter(a => a.status === "IN REVIEW").length, "Awaiting approval")}
      ${stat("PROJECTS LINKED", new Set(assets.map(a => a.project).filter(Boolean)).size, "Connected projects")}
    </div>

    <div class="vault-toolbar">
      <input id="asset-search" class="search-input" placeholder="Search assets, projects, or IDs..." value="${escapeHTML(assetSearch)}">
      <div class="filter-row">
        ${types.map(type => `
          <button class="filter-btn ${assetFilter === type ? "selected" : ""}" data-filter="${escapeHTML(type)}">${escapeHTML(type)}</button>
        `).join("")}
      </div>
    </div>

    ${filtered.length ? `
      <div class="asset-grid">
        ${filtered.map(asset => `
          <div class="asset-card">
            <div class="asset-visual">
              <span>${escapeHTML(asset.type.toUpperCase())}</span>
              <div class="asset-visual-mark">V</div>
            </div>
            <div class="asset-card-body">
              <div class="asset-card-top">
                <span class="eyebrow">${escapeHTML(asset.id)}</span>
                ${badge(asset.status)}
              </div>
              <h3>${escapeHTML(asset.name)}</h3>
              <p>${escapeHTML(asset.project || "Unassigned project")}</p>
              <div class="asset-meta">
                <span>VERSION</span><strong>${escapeHTML(asset.version)}</strong>
              </div>
              <div class="asset-meta">
                <span>RIGHTS</span><strong>${escapeHTML(asset.rights)}</strong>
              </div>
              <button class="secondary-btn full-btn" data-action="view-asset" data-id="${escapeHTML(asset.id)}">VIEW ASSET RECORD →</button>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<div class="empty-state">No matching assets. Register a new asset or change your search.</div>`}
  `;
}

function renderLedger() {
  return `
    ${pageHeader("Production Ledger", "A chronological record of activity across your creator enterprise.")}
    <div class="stats-grid">
      ${stat("TOTAL EVENTS", ledger.length, "Recorded actions")}
      ${stat("ASSET EVENTS", ledger.filter(x => x.type.includes("ASSET")).length, "Asset activity")}
      ${stat("PROJECT EVENTS", ledger.filter(x => x.type.includes("PROJECT")).length, "Project activity")}
      ${stat("LATEST EVENT", ledger.length ? new Date(ledger[0].timestamp).toLocaleDateString() : "—", "Most recent record")}
    </div>
    <div class="ledger-list">
      ${ledger.length ? ledger.map(item => `
        <div class="ledger-item">
          <div class="ledger-dot"></div>
          <div class="ledger-content">
            <strong>${escapeHTML(item.description)}</strong>
            <small>${escapeHTML(item.type)} / ${escapeHTML(item.reference)}</small>
          </div>
          <time>${new Date(item.timestamp).toLocaleString()}</time>
        </div>
      `).join("") : `<div class="empty-state">No ledger activity yet.</div>`}
    </div>
  `;
}

function renderProfile() {
  return `
    ${pageHeader("Creator Profile", "Manage your creator enterprise identity.")}
    <div class="form-panel">
      <label>CREATOR / STUDIO NAME</label>
      <input id="profile-name" value="${escapeHTML(profile.name)}">
      <label>PRIMARY PLATFORM</label>
      <select id="profile-platform">
        ${["Independent", "Twitch", "YouTube", "Kick", "TikTok"].map(x =>
          `<option ${profile.platform === x ? "selected" : ""}>${x}</option>`
        ).join("")}
      </select>
      <button class="primary-btn" data-action="save-profile">SAVE PROFILE</button>
    </div>
  `;
}

function render() {
  const pages = {
    dashboard: renderDashboard,
    production: renderProduction,
    vault: renderVault,
    ledger: renderLedger,
    profile: renderProfile
  };

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">V</div>
          <div><strong>VCEE</strong><small>CREATOR ENTERPRISE</small></div>
        </div>

        <div class="nav-label">WORKSPACE</div>
        <button class="nav-item ${activePage === "dashboard" ? "active" : ""}" data-page="dashboard">⌂ <span>Creator Command</span></button>
        <button class="nav-item ${activePage === "production" ? "active" : ""}" data-page="production">▤ <span>My Production</span></button>
        <button class="nav-item ${activePage === "vault" ? "active" : ""}" data-page="vault">▦ <span>Asset Vault</span><span class="nav-count">${assets.length}</span></button>
        <button class="nav-item ${activePage === "ledger" ? "active" : ""}" data-page="ledger">≋ <span>Activity Ledger</span></button>

        <div class="nav-label">ACCOUNT</div>
        <button class="nav-item ${activePage === "profile" ? "active" : ""}" data-page="profile">◎ <span>Creator Profile</span></button>

        <div class="sidebar-bottom">
          <div class="online-indicator"></div>
          <div><strong>VCEE SYSTEM</strong><small>LOCAL PROTOTYPE ONLINE</small></div>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div><span class="live-dot"></span> CREATOR WORKSPACE</div>
          <div class="top-profile"><span>${escapeHTML(profile.name)}</span><div class="profile-avatar">C</div></div>
        </header>
        <section class="page-content">${pages[activePage]()}</section>
        <footer>VCEE CREATOR ENTERPRISE <span>BUILDING THE CREATOR ECONOMY</span></footer>
      </main>
    </div>
  `;
}

function connectToEngine(job) {
  try {
    const result = submitJob({
      title: job.title,
      type: job.type,
      platform: job.platform,
      description: job.description
    });

    const engineJobs = listJobs();
    const engineJob = Array.isArray(engineJobs) ? engineJobs.at(-1) : null;

    job.engineId =
      result?.id ||
      result?.jobId ||
      result?.job?.id ||
      engineJob?.id ||
      null;
  } catch (error) {
    console.warn("VCEE engine connection:", error);
  }
}

function createProject() {
  const title = prompt("PROJECT NAME:");
  if (!title?.trim()) return;

  const type = prompt("PROJECT TYPE (Video, Graphics, Brand Package, Audio):", "Video");
  if (type === null) return;

  const platform = prompt("PLATFORM (Twitch, YouTube, Kick, TikTok, Independent):", "Independent");
  if (platform === null) return;

  const description = prompt("PROJECT BRIEF:", "");
  if (description === null) return;

  const job = {
    id: uid("JOB"),
    title: title.trim(),
    type: type.trim() || "General",
    platform: platform.trim() || "Independent",
    description: description.trim(),
    status: "QUEUED",
    createdAt: new Date().toISOString()
  };

  connectToEngine(job);
  jobs.unshift(job);
  saveJobs();
  record("PROJECT CREATED", `Created project: ${job.title}`, job.id);
  render();
}

function createAsset() {
  const name = prompt("ASSET NAME:");
  if (!name?.trim()) return;

  const type = prompt("ASSET TYPE (Video, Graphics, Audio, Design, Document, Other):", "Graphics");
  if (type === null) return;

  const project = prompt(
    "ASSOCIATED PROJECT:",
    jobs[0]?.title || ""
  );
  if (project === null) return;

  const rights = prompt(
    "RIGHTS / OWNERSHIP CLAIM (describe the source and rights):",
    "Confirm ownership"
  );
  if (rights === null) return;

  const license = prompt("LICENSE / PERMITTED USE:", "Pending confirmation");
  if (license === null) return;

  const notes = prompt("ASSET NOTES:", "");
  if (notes === null) return;

  const asset = {
    id: uid("AST"),
    name: name.trim(),
    type: type.trim() || "Other",
    project: project.trim(),
    version: "1.0",
    status: "IN REVIEW",
    rights: rights.trim(),
    license: license.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString()
  };

  assets.unshift(asset);
  saveAssets();
  record("ASSET REGISTERED", `Registered asset: ${asset.name}`, asset.id);
  activePage = "vault";
  render();
}

function viewAsset(id) {
  const asset = assets.find(a => a.id === id);
  if (!asset) return;

  const choice = prompt(
    `${asset.name}\n\nID: ${asset.id}\nType: ${asset.type}\nProject: ${asset.project}\nVersion: ${asset.version}\nStatus: ${asset.status}\nRights: ${asset.rights}\nLicense: ${asset.license}\nNotes: ${asset.notes}\n\nEnter a command:\n1 = Create new version\n2 = Mark approved\n3 = Mark in review\n4 = Edit rights/license\n5 = Delete asset\nCancel = Close`
  );

  if (choice === "1") {
    const version = prompt("NEW VERSION NUMBER:", nextVersion(asset.version));
    if (!version?.trim()) return;
    asset.version = version.trim();
    record("ASSET VERSION UPDATED", `Updated ${asset.name} to version ${asset.version}`, asset.id);
  } else if (choice === "2") {
    if (!confirm("Confirm that this asset has passed creator review?")) return;
    asset.status = "APPROVED";
    record("ASSET APPROVED", `Approved asset: ${asset.name}`, asset.id);
  } else if (choice === "3") {
    asset.status = "IN REVIEW";
    record("ASSET REVIEW", `Returned asset to review: ${asset.name}`, asset.id);
  } else if (choice === "4") {
    const rights = prompt("RIGHTS / OWNERSHIP CLAIM:", asset.rights);
    if (rights === null) return;
    const license = prompt("LICENSE / PERMITTED USE:", asset.license);
    if (license === null) return;
    asset.rights = rights;
    asset.license = license;
    record("ASSET RIGHTS UPDATED", `Updated rights record: ${asset.name}`, asset.id);
  } else if (choice === "5") {
    if (!confirm("Delete this asset record? This does not delete any original media file.")) return;
    assets = assets.filter(a => a.id !== id);
    saveAssets();
    record("ASSET RECORD DELETED", `Deleted asset record: ${asset.name}`, asset.id);
    render();
    return;
  } else {
    return;
  }

  saveAssets();
  render();
}

function nextVersion(version) {
  const parts = String(version).split(".");
  const number = Number(parts.pop());
  return [...parts, String((Number.isFinite(number) ? number : 0) + 1)].join(".");
}

function viewJob(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  const stages = ["QUEUED", "IN PRODUCTION", "QUALITY REVIEW", "APPROVED", "DELIVERED"];
  const index = stages.indexOf(job.status);
  const next = stages[Math.min(index + 1, stages.length - 1)];

  if (index >= stages.length - 1) {
    alert("This project has reached delivery.");
    return;
  }

  if (next === "APPROVED" && !confirm("Creator approval required. Approve this project?")) return;
  if (next === "DELIVERED" && !confirm("Confirm final delivery?")) return;

  try {
    if (job.engineId) {
      if (next === "APPROVED") approveJob(job.engineId, "CREATOR");
      else advanceJob(job.engineId, "VCEE COMMAND");
    }
  } catch (error) {
    console.warn("Engine workflow update:", error);
  }

  job.status = next;
  saveJobs();
  record("PROJECT UPDATED", `${job.title} moved to ${next}`, job.id);
  render();
}

app.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    activePage = pageButton.dataset.page;
    render();
    return;
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    assetFilter = filter.dataset.filter;
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;

  if (action === "new-project") createProject();
  if (action === "new-asset") createAsset();
  if (action === "view-asset") viewAsset(id);
  if (action === "view-job") viewJob(id);

  if (action === "save-profile") {
    profile.name = document.querySelector("#profile-name").value.trim() || "Creator Studio";
    profile.platform = document.querySelector("#profile-platform").value;
    write(STORAGE.profile, profile);
    record("PROFILE UPDATED", "Updated creator profile");
    render();
  }
});

app.addEventListener("input", event => {
  if (event.target.id === "asset-search") {
    const cursor = event.target.selectionStart;
    assetSearch = event.target.value;
    const position = cursor;
    render();
    const input = document.querySelector("#asset-search");
    input.focus();
    input.setSelectionRange(position, position);
  }
});

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Orbitron:wght@500;600;700;800&display=swap');

:root {
  color-scheme: dark;
  --bg: #080b13;
  --panel: #101522;
  --panel2: #151d2d;
  --line: rgba(151,174,210,.13);
  --muted: #8290a8;
  --cyan: #42e5ed;
  --purple: #a58bff;
  --green: #56e6ae;
  --text: #edf3ff;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: Manrope, sans-serif; }
button,input,select { font: inherit; }
button { cursor: pointer; }
.app-shell { min-height: 100vh; display: flex; }
.sidebar { width: 245px; flex-shrink: 0; background: #0c111d; border-right: 1px solid var(--line); padding: 26px 17px; display: flex; flex-direction: column; }
.brand { display:flex; align-items:center; gap:12px; margin: 0 0 48px 5px; }
.brand-mark { width:43px;height:43px;display:grid;place-items:center;border:1px solid var(--cyan);color:var(--cyan);font-family:Orbitron;font-weight:800;font-size:24px;box-shadow:0 0 23px #42e5ed2b; }
.brand strong { display:block;font-family:Orbitron;letter-spacing:2px;font-size:17px; }
.brand small,.sidebar-bottom small { display:block;color:var(--muted);font:9px 'DM Mono';letter-spacing:1.4px;margin-top:4px; }
.nav-label,.eyebrow { color:#71819c;font:10px 'DM Mono';letter-spacing:1.8px; }
.nav-label { margin:20px 9px 12px; }
.nav-item { display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:#a8b4c8;padding:13px 12px;text-align:left;border-radius:7px;margin-bottom:4px;font-size:12px; }
.nav-item:hover,.nav-item.active { background:#172437;color:var(--cyan); }
.nav-item.active { box-shadow:inset 2px 0 var(--cyan); }
.nav-count { margin-left:auto;color:var(--cyan);font:10px 'DM Mono'; }
.sidebar-bottom { margin-top:auto;border-top:1px solid var(--line);padding:20px 5px 0;display:flex;gap:10px;align-items:center;font-size:10px; }
.online-indicator,.live-dot { width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);display:inline-block; }
.main-area { min-width:0;flex:1; }
.topbar { height:67px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;padding:0 4%;color:#9aa9c0;font:10px 'DM Mono';letter-spacing:1px; }
.top-profile { display:flex;align-items:center;gap:12px;text-transform:uppercase; }
.profile-avatar { width:31px;height:31px;border:1px solid var(--purple);border-radius:50%;display:grid;place-items:center;color:var(--purple); }
.page-content { max-width:1450px;margin:auto;padding:38px 4.5%;min-height:calc(100vh - 110px); }
.page-header { display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:29px; }
h1 { font-size:29px;letter-spacing:-1px;margin:9px 0 5px; }
.page-header p,.section-heading p { color:var(--muted);font-size:12px;margin:0; }
.primary-btn,.secondary-btn,.small-btn { border:1px solid var(--cyan);background:var(--cyan);color:#061116;padding:12px 17px;font-size:10px;font-weight:800;letter-spacing:1px;border-radius:4px; }
.primary-btn:hover { box-shadow:0 0 22px #42e5ed50; }
.secondary-btn { background:transparent;color:var(--cyan); }
.small-btn { background:transparent;color:var(--cyan);padding:8px 11px; }
.text-btn { border:0;background:transparent;color:var(--cyan);font:10px 'DM Mono'; }
.welcome-panel,.vault-banner { min-height:225px;padding:31px 35px;border:1px solid #28344a;border-radius:9px;background:radial-gradient(ellipse at 80% 50%,#273b5d 0%,transparent 48%),linear-gradient(120deg,#141d30,#101522);display:flex;align-items:center;justify-content:space-between;overflow:hidden;margin-bottom:25px; }
.welcome-panel h2,.vault-banner h2 {font-size:29px;max-width:560px;margin:12px 0;}
.welcome-panel h2 span,.vault-banner h2 span {color:var(--cyan);}
.welcome-panel p,.vault-banner p {color:#9aa9c0;font-size:12px;max-width:520px;line-height:1.8;margin-bottom:23px;}
.welcome-orbit { width:170px;height:170px;border:1px solid #42e5ed5a;border-radius:50%;display:grid;place-items:center;position:relative;margin-right:8%; }
.orbit-ring { position:absolute;width:125px;height:125px;border:1px dashed #a58bff99;border-radius:50%;animation:spin 20s linear infinite; }
.orbit-core { font:700 25px Orbitron;color:var(--cyan);text-shadow:0 0 22px var(--cyan); }
@keyframes spin { to { transform:rotate(360deg); } }
.stats-grid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin:22px 0 36px; }
.stat-card { border:1px solid var(--line);background:var(--panel);border-radius:7px;padding:17px; }
.stat-card span,.stat-card small {display:block;color:var(--muted);font:9px 'DM Mono';letter-spacing:1px;}
.stat-card strong {display:block;font:700 28px Orbitron;margin:12px 0;color:var(--cyan);}
.stat-card small {letter-spacing:0;font-size:10px;}
.section-heading { display:flex;justify-content:space-between;align-items:center;margin:36px 0 17px; }
.section-heading h2 {font-size:17px;margin:0 0 5px;}
.factory-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px; }
.factory-card,.agent-card {background:var(--panel);border:1px solid var(--line);padding:18px;border-radius:7px;}
.factory-icon {color:var(--purple);font:11px Orbitron;margin-bottom:19px;}
.factory-card strong,.factory-card small {display:block;}
.factory-card strong {font-size:12px;}
.factory-card small {color:var(--muted);font-size:10px;margin-top:6px;}
.agent-grid {display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
.agent-card {display:flex;gap:10px;align-items:flex-start;padding:13px;}
.agent-avatar {width:29px;height:29px;flex-shrink:0;border:1px solid var(--purple);color:var(--purple);display:grid;place-items:center;font:12px Orbitron;}
.agent-card strong,.agent-card small {display:block;}
.agent-card strong {font:10px Orbitron;}
.agent-card small,.agent-card p {font-size:9px;color:var(--muted);}
.agent-card p {margin-bottom:0;}
.job-list {display:grid;gap:10px;}
.job-card {display:flex;align-items:center;gap:15px;background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:17px;}
.job-main {flex:1;min-width:0;}
.job-main strong,.job-main small {display:block;}
.job-main strong {margin:7px 0;font-size:13px;}
.job-main small {color:var(--muted);font-size:10px;}
.status {padding:6px 9px;border-radius:3px;font:9px 'DM Mono';white-space:nowrap;background:#26344a;color:#9db0cb;}
.status.approved,.status.delivered {background:#14352f;color:var(--green);}
.status.in-production {background:#15353b;color:var(--cyan);}
.status.quality-review,.status.in-review {background:#342b49;color:#c3a9ff;}
.status.queued {background:#303342;color:#bbc1d2;}
.vault-banner {min-height:190px;}
.vault-count {text-align:center;border-left:1px solid var(--line);padding:12px 28px;}
.vault-count strong {font:700 45px Orbitron;color:var(--cyan);display:block;}
.vault-count small {font:9px 'DM Mono';color:var(--muted);}
.vault-toolbar {display:grid;gap:14px;margin:20px 0;}
.search-input,.form-panel input,.form-panel select {width:100%;background:#111a29;border:1px solid var(--line);color:var(--text);padding:13px;border-radius:5px;outline:none;}
.search-input:focus,.form-panel input:focus,.form-panel select:focus {border-color:var(--cyan);}
.filter-row {display:flex;flex-wrap:wrap;gap:8px;}
.filter-btn {background:var(--panel);border:1px solid var(--line);color:#aab7ca;padding:8px 13px;border-radius:4px;font:9px 'DM Mono';}
.filter-btn.selected {border-color:var(--cyan);color:var(--cyan);background:#11252d;}
.asset-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;}
.asset-card {border:1px solid var(--line);background:var(--panel);border-radius:7px;overflow:hidden;}
.asset-visual {height:115px;background:radial-gradient(circle at 50% 50%,#293d5b,#111827 68%);display:flex;align-items:flex-start;justify-content:space-between;padding:13px;color:var(--cyan);font:9px 'DM Mono';}
.asset-visual-mark {font:700 60px Orbitron;color:#42e5ed45;align-self:center;margin:auto;}
.asset-card-body {padding:16px;}
.asset-card-top {display:flex;align-items:center;justify-content:space-between;gap:8px;}
.asset-card h3 {font-size:14px;margin:14px 0 5px;}
.asset-card p {font-size:10px;color:var(--muted);margin:0 0 17px;}
.asset-meta {display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid var(--line);font:9px 'DM Mono';}
.asset-meta span {color:var(--muted);}
.asset-meta strong {color:#c5d2e7;font-weight:400;text-align:right;}
.full-btn {width:100%;margin-top:13px;}
.ledger-list {border:1px solid var(--line);border-radius:7px;background:var(--panel);padding:8px 20px;}
.ledger-item {display:flex;align-items:center;gap:15px;padding:16px 0;border-bottom:1px solid var(--line);}
.ledger-item:last-child {border:0;}
.ledger-dot {width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 10px var(--cyan);}
.ledger-content {flex:1;}
.ledger-content strong,.ledger-content small {display:block;}
.ledger-content strong {font-size:11px;}
.ledger-content small,.ledger-item time {color:var(--muted);font:9px 'DM Mono';margin-top:5px;}
.ledger-item time {white-space:nowrap;}
.form-panel {max-width:600px;display:grid;gap:12px;background:var(--panel);border:1px solid var(--line);padding:25px;border-radius:7px;}
.form-panel label {font:10px 'DM Mono';color:var(--muted);margin-top:8px;}
.empty-state {padding:35px;border:1px dashed #38455d;color:var(--muted);text-align:center;border-radius:7px;font-size:12px;}
footer {border-top:1px solid var(--line);padding:19px 4.5%;font:9px 'DM Mono';color:var(--muted);letter-spacing:1px;display:flex;justify-content:space-between;}
footer span {color:var(--cyan);}
@media(max-width:1000px) {
 .sidebar {width:190px;}
 .stats-grid {grid-template-columns:repeat(2,1fr);}
 .asset-grid {grid-template-columns:repeat(2,1fr);}
 .agent-grid {grid-template-columns:repeat(2,1fr);}
}
@media(max-width:680px) {
 .app-shell {display:block;}
 .sidebar {width:100%;padding:13px;display:block;}
 .brand {margin:0 0 12px;}
 .nav-label,.sidebar-bottom {display:none;}
 .nav-item {display:inline-flex;width:auto;padding:9px;font-size:10px;}
 .nav-item span:not(.nav-count) {display:none;}
 .topbar {padding:0 15px;}
 .page-content {padding:25px 15px;}
 .page-header {align-items:flex-start;flex-direction:column;}
 .welcome-panel {padding:23px;}
 .welcome-panel h2,.vault-banner h2 {font-size:22px;}
 .welcome-orbit {display:none;}
 .stats-grid {gap:8px;}
 .stat-card {padding:12px;}
 .stat-card strong {font-size:22px;}
 .factory-grid,.asset-grid {grid-template-columns:1fr;}
 .agent-grid {grid-template-columns:1fr 1fr;}
 .job-card {flex-wrap:wrap;}
 .vault-banner {padding:20px;}
 .vault-count {padding:10px;}
 footer {font-size:8px;}
}
`;

if (!document.querySelector("#vcee-styles")) {
  const style = document.createElement("style");
  style.id = "vcee-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

render();





