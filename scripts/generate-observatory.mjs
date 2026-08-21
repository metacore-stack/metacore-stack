import { mkdir, writeFile } from "node:fs/promises";

const login = process.env.GITHUB_LOGIN || "metacore-stack";
const token = process.env.GITHUB_TOKEN || "";
const preview = process.env.METACORE_PREVIEW === "1";
const api = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "metacore-observatory",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function getJson(path) {
  const response = await fetch(`${api}${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

async function getRepositories() {
  const repositories = [];
  for (let page = 1; ; page += 1) {
    const batch = await getJson(`/users/${login}/repos?type=owner&sort=updated&per_page=100&page=${page}`);
    repositories.push(...batch);
    if (batch.length < 100) return repositories;
  }
}

async function mapInBatches(items, size, task) {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...(await Promise.all(items.slice(index, index + size).map(task))));
  }
  return results;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function compact(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortened(value, length = 24) {
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`;
}

async function collectPublicSignal() {
  if (preview) {
    return {
      metrics: [
        ["REPOSITORIES", "62"],
        ["TOTAL STARS", "233"],
        ["VISIBILITY", "PUBLIC"],
        ["REFRESH", "24H"],
      ],
      languages: [
        ["Python", 43],
        ["JavaScript", 22],
        ["TypeScript", 18],
        ["Jupyter", 10],
        ["Vue", 7],
      ],
      systems: ["AI INTELLIGENCE", "PLATFORM SYSTEMS", "SECURE AUTOMATION"],
      synced: "FIRST LIVE SYNC READY",
    };
  }

  const [profile, repositories] = await Promise.all([getJson(`/users/${login}`), getRepositories()]);
  const visible = repositories.filter((repository) => !repository.fork && !repository.archived);
  const languageMaps = await mapInBatches(visible, 8, async (repository) => {
    try {
      return await getJson(`/repos/${login}/${encodeURIComponent(repository.name)}/languages`);
    } catch {
      return {};
    }
  });

  const languageTotals = new Map();
  for (const languageMap of languageMaps) {
    for (const [language, bytes] of Object.entries(languageMap)) {
      languageTotals.set(language, (languageTotals.get(language) || 0) + bytes);
    }
  }
  const totalLanguageBytes = [...languageTotals.values()].reduce((sum, value) => sum + value, 0) || 1;
  const languages = [...languageTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language, bytes]) => [language, Math.max(4, Math.round((bytes / totalLanguageBytes) * 100))]);

  const stars = repositories.reduce((sum, repository) => sum + repository.stargazers_count, 0);
  const forks = repositories.reduce((sum, repository) => sum + repository.forks_count, 0);
  const systems = [...visible]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 3)
    .map((repository) => shortened(repository.name.toUpperCase()));

  return {
    metrics: [
      ["REPOSITORIES", compact(profile.public_repos)],
      ["TOTAL STARS", compact(stars)],
      ["FOLLOWERS", compact(profile.followers)],
      ["PUBLIC FORKS", compact(forks)],
    ],
    languages,
    systems,
    synced: `SYNCHRONIZED ${new Date().toISOString().slice(0, 10)} UTC`,
  };
}

function renderMetric([label, value], index) {
  const x = 52 + (index % 2) * 178;
  const y = 150 + Math.floor(index / 2) * 104;
  return `
    <g transform="translate(${x} ${y})">
      <rect width="160" height="86" rx="14" fill="#0b1524" stroke="#243349"/>
      <path d="M14 1H146" stroke="url(#edge)" opacity=".72"/>
      <text x="16" y="28" class="label">${escapeXml(label)}</text>
      <text x="16" y="64" class="metric">${escapeXml(value)}</text>
    </g>`;
}

function renderLanguage([language, percentage], index) {
  const y = 168 + index * 39;
  const width = Math.min(214, Math.max(24, percentage * 2.14));
  return `
    <g transform="translate(684 ${y})">
      <text y="-8" class="language">${escapeXml(shortened(language, 18))}</text>
      <text x="216" y="-8" text-anchor="end" class="percent">${percentage}%</text>
      <rect width="216" height="7" rx="3.5" fill="#172337"/>
      <rect width="${width}" height="7" rx="3.5" fill="url(#signal)" class="bar" style="animation-delay:${index * 120}ms"/>
    </g>`;
}

function renderSystem(name, index) {
  const x = 52 + index * 296;
  return `
    <g transform="translate(${x} 411)">
      <circle cx="7" cy="-4" r="4" fill="${["#38bdf8", "#a78bfa", "#34d399"][index]}" class="pulse" style="animation-delay:${index * 450}ms"/>
      <text x="20" class="system">${escapeXml(name)}</text>
    </g>`;
}

function renderSvg(signal) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="460" viewBox="0 0 1000 460" role="img" aria-labelledby="title description">
  <title id="title">Metacore Stack public engineering observatory</title>
  <description id="description">Animated public GitHub repository signal with repository totals, language distribution, and leading systems. Personal identity fields are suppressed.</description>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#06101d"/>
      <stop offset=".52" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#130d26"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#38bdf8"/>
      <stop offset=".5" stop-color="#8b5cf6"/>
      <stop offset="1" stop-color="#34d399"/>
    </linearGradient>
    <linearGradient id="signal" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#38bdf8"/>
      <stop offset=".55" stop-color="#8b5cf6"/>
      <stop offset="1" stop-color="#34d399"/>
    </linearGradient>
    <radialGradient id="core">
      <stop stop-color="#f0f9ff"/>
      <stop offset=".18" stop-color="#67e8f9"/>
      <stop offset=".5" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="#7dd3fc" stroke-opacity=".06"/>
    </pattern>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <style>
    text{font-family:Inter,Segoe UI,Arial,sans-serif}.mono,.label,.percent,.system{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
    .eyebrow{fill:#7dd3fc;font-size:13px;font-weight:700;letter-spacing:3px}.headline{fill:#f8fafc;font-size:27px;font-weight:750}.sub{fill:#8292a8;font-size:13px}
    .label{fill:#7f91a8;font-size:10px;font-weight:700;letter-spacing:1.7px}.metric{fill:#f8fafc;font-size:28px;font-weight:750}.language{fill:#cbd5e1;font-size:13px}.percent{fill:#64748b;font-size:11px}.system{fill:#a7b5c7;font-size:11px;font-weight:700;letter-spacing:1px}
    .spin{transform-box:fill-box;transform-origin:center;animation:spin 16s linear infinite}.spin-reverse{transform-box:fill-box;transform-origin:center;animation:spin 11s linear infinite reverse}
    .pulse{animation:pulse 2.5s ease-in-out infinite}.bar{transform-box:fill-box;transform-origin:left;animation:reveal 1.3s cubic-bezier(.2,.8,.2,1) both}.scan{animation:scan 5s ease-in-out infinite}
    @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}@keyframes reveal{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes scan{0%,100%{transform:translateX(0)}50%{transform:translateX(744px)}}
    @media (prefers-reduced-motion:reduce){.spin,.spin-reverse,.pulse,.bar,.scan{animation:none}}
  </style>
  <rect x="1" y="1" width="998" height="458" rx="20" fill="url(#background)" stroke="#30363d" stroke-width="2"/>
  <rect x="1" y="1" width="998" height="458" rx="20" fill="url(#grid)"/>
  <path d="M22 2H978" stroke="url(#edge)" stroke-width="2"/>

  <text x="52" y="48" class="eyebrow">METACORE STACK / PUBLIC SIGNAL</text>
  <text x="52" y="79" class="headline">Engineering Observatory</text>
  <text x="52" y="99" class="sub">Live repository intelligence with personal identity fields suppressed.</text>
  <g transform="translate(824 42)">
    <rect width="126" height="32" rx="16" fill="#09231f" stroke="#34d399" stroke-opacity=".45"/>
    <circle cx="18" cy="16" r="5" fill="#34d399" class="pulse"/>
    <text x="34" y="20" class="system" fill="#a7f3d0">SIGNAL ONLINE</text>
  </g>

  <rect x="36" y="100" width="372" height="248" rx="18" fill="#080f1a" fill-opacity=".74" stroke="#243349"/>
  <text x="52" y="133" class="label">PUBLIC NETWORK METRICS</text>
  ${signal.metrics.map(renderMetric).join("")}

  <g transform="translate(522 224)" filter="url(#glow)">
    <circle r="105" fill="none" stroke="#38bdf8" stroke-opacity=".1"/>
    <circle r="82" fill="none" stroke="#38bdf8" stroke-opacity=".35" stroke-dasharray="18 12" class="spin"/>
    <circle r="62" fill="none" stroke="#a78bfa" stroke-opacity=".55" stroke-dasharray="5 11" class="spin-reverse"/>
    <circle r="44" fill="url(#core)" class="pulse"/>
    <circle cy="-82" r="5" fill="#34d399"/>
    <circle cx="71" cy="41" r="5" fill="#38bdf8"/>
    <circle cx="-71" cy="41" r="5" fill="#a78bfa"/>
  </g>
  <text x="522" y="218" text-anchor="middle" class="label" fill="#e0f2fe">CORE</text>

  <rect x="652" y="100" width="312" height="248" rx="18" fill="#080f1a" fill-opacity=".74" stroke="#243349"/>
  <text x="684" y="133" class="label">LANGUAGE VECTOR / PUBLIC REPOS</text>
  ${signal.languages.map(renderLanguage).join("")}

  <path d="M52 376H948" stroke="#263449"/>
  <rect x="52" y="375" width="152" height="2" rx="1" fill="url(#edge)" class="scan"/>
  <text x="52" y="394" class="label">LEADING SYSTEMS</text>
  ${signal.systems.map(renderSystem).join("")}
  <text x="948" y="436" text-anchor="end" class="percent">${escapeXml(signal.synced)}</text>
</svg>`;
}

const signal = await collectPublicSignal();
await mkdir("assets", { recursive: true });
await writeFile("assets/metacore-observatory.svg", renderSvg(signal), "utf8");
console.log(`Generated assets/metacore-observatory.svg for ${login}`);
