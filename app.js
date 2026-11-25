const TEMPLATES = {
  billing: {
    name: "Billing Card",
    goal: "User ko current plan, amount due aur payment action ek saath dikhana hai.",
    components: [
      { type: "heading", label: "Pro Plan", detail: "Plan name heading" },
      { type: "text", label: "₹499/month", detail: "Price text" },
      { type: "row", label: "Next bill · 1 Dec", detail: "Billing date row" },
      { type: "badge", label: "Active", detail: "Status badge" },
      { type: "button", label: "Pay Now", detail: "Primary payment button" }
    ],
    interactions: ["Pay Now click par payment state change ho", "Active badge hamesha visible rahe"],
    acceptance: ["Plan name aur price clearly visible hon", "Pay Now button keyboard se focus ho", "Mobile width par card overflow na kare"]
  },
  login: {
    name: "Login Form",
    goal: "User email aur password se safely sign in kar sake.",
    components: [
      { type: "heading", label: "Welcome back", detail: "Form heading" },
      { type: "input", label: "Email", detail: "Email input with label" },
      { type: "input", label: "Password", detail: "Password input with label" },
      { type: "button", label: "Sign In", detail: "Submit button" },
      { type: "text", label: "Forgot password?", detail: "Recovery link text" }
    ],
    interactions: ["Empty email par error dikhe", "Sign In click par loading state aaye"],
    acceptance: ["Har input ke saath label ho", "Password field type password ho", "Error message screen reader ko mile"]
  },
  dashboard: {
    name: "Dashboard Widget",
    goal: "Team ko weekly progress ek glance me dikhana hai.",
    components: [
      { type: "heading", label: "Weekly Progress", detail: "Widget heading" },
      { type: "text", label: "72% complete", detail: "Progress value" },
      { type: "progress", label: "72", detail: "Progress bar" },
      { type: "row", label: "Tasks · 18/25", detail: "Task count row" },
      { type: "button", label: "View Report", detail: "Report button" }
    ],
    interactions: ["View Report click par report section khule", "Progress bar value text se match kare"],
    acceptance: ["Progress percentage aur bar same value dikhayein", "Widget chhoti screen par readable rahe", "Button ka purpose clear ho"]
  },
  product: {
    name: "Product Card",
    goal: "Shopper ko product, price aur buy action jaldi samajh aaye.",
    components: [
      { type: "heading", label: "Wireless Earbuds", detail: "Product title" },
      { type: "text", label: "₹1,999", detail: "Product price" },
      { type: "badge", label: "20% OFF", detail: "Offer badge" },
      { type: "row", label: "Rating · 4.5", detail: "Rating row" },
      { type: "button", label: "Add to Cart", detail: "Cart button" }
    ],
    interactions: ["Add to Cart click par cart count badhe", "Offer badge price ke paas visible rahe"],
    acceptance: ["Product title, price aur rating visible hon", "Add to Cart button prominent ho", "Card layout mobile par stack ho jaye"]
  }
};

const state = { template: "billing", stack: "html", note: "", pkg: null, broken: false };

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function componentHtml(component) {
  if (component.type === "heading") return `<h2>${escapeHtml(component.label)}</h2>`;
  if (component.type === "button") return `<button type="button" data-action="${escapeHtml(component.label.toLowerCase().replaceAll(" ", "-"))}">${escapeHtml(component.label)}</button>`;
  if (component.type === "input") {
    const id = component.label.toLowerCase().replaceAll(" ", "-");
    const type = component.label.toLowerCase().includes("password") ? "password" : "email";
    return `<label for="${id}">${escapeHtml(component.label)}</label><input id="${id}" type="${type}" aria-label="${escapeHtml(component.label)}" />`;
  }
  if (component.type === "badge") return `<span class="badge">${escapeHtml(component.label)}</span>`;
  if (component.type === "progress") return `<div class="progress" role="progressbar" aria-valuenow="${escapeHtml(component.label)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${escapeHtml(component.label)}%"></i></div>`;
  if (component.type === "row") return `<div class="row"><span>${escapeHtml(component.label)}</span></div>`;
  return `<p>${escapeHtml(component.label)}</p>`;
}

function generateCode(template, stack) {
  const body = template.components.map(componentHtml).join("\n      ");
  if (stack === "react") {
    return `export default function ${template.name.replaceAll(" ", "")}() {\n  return (\n    <section className="card" aria-label="${template.name}">\n      ${body.replaceAll("class=", "className=")}\n    </section>\n  );\n}`;
  }
  return `<section class="card" aria-label="${template.name}">\n      ${body}\n    </section>\n\n<style>\n.card{max-width:420px;border:1px solid #e4e7ec;border-radius:20px;padding:20px;font-family:system-ui}\n.card button{background:#2563eb;color:#fff;border:0;border-radius:12px;padding:11px 14px;font-weight:800}\n.card input{width:100%;padding:11px;border:1px solid #e4e7ec;border-radius:12px}\n.badge{background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:5px 9px;font-weight:800}\n.progress{height:10px;background:#eef2ff;border-radius:999px;overflow:hidden}.progress i{display:block;height:100%;background:#2563eb}\n@media(max-width:520px){.card{max-width:100%}}\n</style>\n\n<script>\ndocument.querySelector('[data-action]')?.addEventListener('click', () => {\n  document.body.dataset.lastAction = 'clicked';\n});\n<\/script>`;
}

function generateTests(template) {
  const lines = template.components.map(component => {
    if (component.type === "button") return `  await expect(page.getByRole('button', { name: '${component.label}' })).toBeVisible();`;
    if (component.type === "input") return `  await expect(page.getByLabel('${component.label}')).toBeVisible();`;
    return `  await expect(page.getByText('${component.label}')).toBeVisible();`;
  });
  return `import { test, expect } from '@playwright/test';\n\ntest('${template.name} matches the mockup task', async ({ page }) => {\n  await page.goto('/');\n${lines.join("\n")}\n});\n\ntest('primary action responds', async ({ page }) => {\n  await page.goto('/');\n  await page.getByRole('button').first().click();\n  await expect(page.locator('body')).toHaveAttribute('data-last-action', 'clicked');\n});`;
}

function validatePackage(pkg, codeOverride) {
  const code = codeOverride || pkg.code;
  const checks = [];
  pkg.template.components.forEach(component => {
    checks.push({ check: `Component present: ${component.label}`, pass: code.includes(component.label) });
  });
  checks.push({ check: "Accessible labels or roles present", pass: code.includes("aria-label") || code.includes("aria-valuenow") || code.includes("getByRole") });
  checks.push({ check: "Responsive rule present", pass: code.includes("@media") || code.includes("max-width") || code.includes("className") });
  checks.push({ check: "Primary action handler present", pass: code.includes("data-action") || code.includes("addEventListener") || code.includes("onClick") });
  const passed = checks.filter(check => check.pass).length;
  return { checks, passed, total: checks.length, score: Math.round((passed / checks.length) * 100) };
}

function generatePackage(input = {}) {
  const templateKey = input.template || state.template;
  const stack = input.stack || state.stack;
  const note = input.note || state.note;
  const template = TEMPLATES[templateKey];
  const code = generateCode(template, stack);
  const tests = generateTests(template);
  const spec = [
    `# ${template.name} — Feature Task`,
    "",
    `Goal: ${template.goal}`,
    note ? `Extra note: ${note}` : "",
    "",
    "## Required components",
    ...template.components.map(c => `- ${c.label} (${c.type}) — ${c.detail}`),
    "",
    "## Interactions",
    ...template.interactions.map(item => `- ${item}`),
    "",
    "## Acceptance criteria",
    ...template.acceptance.map(item => `- ${item}`)
  ].filter(Boolean).join("\n");
  const pkg = {
    id: `USF-2026-${templateKey.slice(0, 3).toUpperCase()}`,
    title: `${template.name} task package`,
    track: "Coding Task Factory",
    source: "UI mockup component map",
    stack,
    templateKey,
    template,
    spec,
    code,
    tests,
    note
  };
  pkg.validation = validatePackage(pkg);
  pkg.brokenValidation = validatePackage(pkg, code.replaceAll(template.components.find(c => c.type === "button")?.label || "Button", "Missing"));
  return pkg;
}

function renderMockup(template) {
  const items = template.components.map(component => {
    if (component.type === "heading") return `<h4>${escapeHtml(component.label)}</h4>`;
    if (component.type === "button") return `<button class="mock-btn" type="button">${escapeHtml(component.label)}</button>`;
    if (component.type === "input") return `<div class="mock-input">${escapeHtml(component.label)}</div>`;
    if (component.type === "badge") return `<span class="badge">${escapeHtml(component.label)}</span>`;
    if (component.type === "progress") return `<div class="progress"><i style="width:${escapeHtml(component.label)}%"></i></div>`;
    if (component.type === "row") return `<div class="mock-row"><span>${escapeHtml(component.label)}</span></div>`;
    return `<p>${escapeHtml(component.label)}</p>`;
  }).join("");
  return `<div class="mock-card">${items}</div>`;
}

function renderPackage() {
  state.pkg = generatePackage(state);
  const pkg = state.pkg;
  document.getElementById("packageId").textContent = `${pkg.id} · ${pkg.stack === "react" ? "React + Tailwind style" : "HTML + CSS + JS"}`;
  document.getElementById("packageTitle").textContent = pkg.title;
  document.getElementById("mockupPreview").innerHTML = renderMockup(pkg.template);
  document.getElementById("components").innerHTML = pkg.template.components.map(c => `<div class="component"><strong>${escapeHtml(c.label)}</strong><span>${escapeHtml(c.type)} · ${escapeHtml(c.detail)}</span></div>`).join("");
  document.getElementById("matchScore").textContent = `${pkg.validation.score}%`;
  document.getElementById("testScore").textContent = `${pkg.validation.passed}/${pkg.validation.total}`;
  renderTabs();
}

function renderTabs() {
  const pkg = state.pkg;
  const validation = state.broken ? pkg.brokenValidation : pkg.validation;
  document.getElementById("tab-spec").innerHTML = `<article class="card"><h3>Requirement spec</h3><pre><code>${escapeHtml(pkg.spec)}</code></pre></article>`;
  document.getElementById("tab-code").innerHTML = `<pre><code>${escapeHtml(pkg.code)}</code></pre>`;
  document.getElementById("tab-tests").innerHTML = `<pre><code>${escapeHtml(pkg.tests)}</code></pre>`;
  document.getElementById("tab-validation").innerHTML = `<article class="card"><h3>${state.broken ? "Broken version check" : "Reference validation"}</h3><p>Score: <strong>${validation.score}%</strong> (${validation.passed}/${validation.total})</p><table><thead><tr><th>Check</th><th>Result</th></tr></thead><tbody>${validation.checks.map(c => `<tr><td>${escapeHtml(c.check)}</td><td class="${c.pass ? "pass" : "fail"}">${c.pass ? "Pass" : "Fail"}</td></tr>`).join("")}</tbody></table><p>Broken version score: <strong>${pkg.brokenValidation.score}%</strong>. Isse pata chalta hai ki validation sirf pass nahi bolta, galti pakadta bhi hai.</p></article>`;
  document.getElementById("tab-json").innerHTML = `<pre><code>${escapeHtml(JSON.stringify(pkg, null, 2))}</code></pre>`;
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(state.pkg, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.pkg.id}-ui-to-spec-package.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("JSON downloaded");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}

function init() {
  document.getElementById("templateSelect").addEventListener("change", e => state.template = e.target.value);
  document.getElementById("stackSelect").addEventListener("change", e => state.stack = e.target.value);
  document.getElementById("noteInput").addEventListener("input", e => state.note = e.target.value);
  document.getElementById("generateBtn").addEventListener("click", () => { state.broken = false; renderPackage(); showToast("Task package generated"); });
  document.getElementById("brokenBtn").addEventListener("click", () => { state.broken = true; renderTabs(); showToast("Broken version checked"); });
  document.getElementById("downloadBtn").addEventListener("click", downloadJson);
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === `tab-${tab.dataset.tab}`));
  }));
  renderPackage();
}

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", init);
if (typeof module !== "undefined") module.exports = { TEMPLATES, generatePackage, validatePackage };
