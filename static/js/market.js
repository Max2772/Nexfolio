/**
 * market.js
 * ──────────────────────────────────────────────
 * Логика для страницы рынка (Market overview).
 * Работает для stocks, crypto и steam — тип определяется
 * через data-market-type на элементе .market-page.
 *
 * Зависит от: base.js (initSparkline)
 *
 * Содержит:
 *   - initSparklines      — мини-графики в таблице
 *   - initSearch          — live-фильтрация строк по тикеру/имени
 *   - initSort            — сортировка по клику на заголовок
 *   - initFilterPills     — переключение фильтров (gainers/losers/all)
 *   - initPagination      — клиентская пагинация
 */

"use strict";

/* ── Sparklines ─────────────────────────────────────────────────────── */
function initSparklines() {
  document.querySelectorAll("canvas[data-spark]").forEach((canvas) => {
    const raw   = canvas.dataset.spark || "";
    const color = canvas.dataset.color || "#00e676";
    const data  = raw.split(",").map(Number).filter((n) => !isNaN(n));
    if (data.length < 2) return;
    drawSparkline(canvas, data, color);
  });
}

function drawSparkline(canvas, data, color) {
  const ctx = canvas.getContext("2d");
  const w   = canvas.width;
  const h   = canvas.height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / rng) * (h - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.lineJoin    = "round";
  ctx.stroke();
}

/* ── Search ─────────────────────────────────────────────────────────── */
/**
 * Фильтрует строки таблицы по data-ticker и data-name.
 * Обновляет счётчик и пустой state.
 */
function initSearch() {
  const input = document.getElementById("marketSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    applyFilters();
  });
}

/* ── Filter pills ───────────────────────────────────────────────────── */
/**
 * Gainers / Losers / All — фильтрует по data-change (число).
 */
function initFilterPills() {
  const pills = document.querySelectorAll(".filter-pill[data-filter]");
  if (!pills.length) return;

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      applyFilters();
    });
  });
}

/* ── Combined filter logic ──────────────────────────────────────────── */
function applyFilters() {
  const query     = (document.getElementById("marketSearch")?.value || "").toLowerCase().trim();
  const activePill = document.querySelector(".filter-pill.active[data-filter]");
  const filterVal  = activePill?.dataset.filter || "all";

  const rows    = document.querySelectorAll(".market-row");
  let   visible = 0;

  rows.forEach((row) => {
    const ticker  = (row.dataset.ticker || "").toLowerCase();
    const name    = (row.dataset.name   || "").toLowerCase();
    const change  = parseFloat(row.dataset.change || "0");

    const matchesSearch = !query || ticker.includes(query) || name.includes(query);
    const matchesFilter =
      filterVal === "all"    ? true :
      filterVal === "gainers"? change > 0 :
      filterVal === "losers" ? change < 0 : true;

    const show = matchesSearch && matchesFilter;
    row.style.display = show ? "" : "none";
    if (show) visible++;
  });

  updateCount(visible);
  updateEmpty(visible);
  updatePagination(visible);
}

/* ── Sort ───────────────────────────────────────────────────────────── */
/**
 * Кликабельные th.th-sort сортируют tbody по data-атрибуту ячеек.
 * data-sort на th указывает какой data-* атрибут читать с td.
 * data-type="number" → числовая сортировка, иначе строковая.
 */
function initSort() {
  const headers = document.querySelectorAll("th.th-sort");
  if (!headers.length) return;

  let currentSort  = null;
  let currentOrder = "desc";

  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const col  = th.dataset.sort;
      const type = th.dataset.type || "string";

      if (currentSort === col) {
        currentOrder = currentOrder === "asc" ? "desc" : "asc";
      } else {
        currentSort  = col;
        currentOrder = "desc";
      }

      // Update header classes
      headers.forEach((h) => h.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(currentOrder === "asc" ? "sort-asc" : "sort-desc");

      sortTable(col, type, currentOrder);
    });
  });
}

function sortTable(col, type, order) {
  const tbody = document.querySelector(".market-table tbody");
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll(".market-row"));

  rows.sort((a, b) => {
    const aVal = a.dataset[col] || "";
    const bVal = b.dataset[col] || "";

    let cmp;
    if (type === "number") {
      cmp = parseFloat(aVal) - parseFloat(bVal);
    } else {
      cmp = aVal.localeCompare(bVal);
    }
    return order === "asc" ? cmp : -cmp;
  });

  rows.forEach((row) => tbody.appendChild(row));

  // Re-draw sparklines after DOM reorder
  initSparklines();
}

/* ── Pagination ─────────────────────────────────────────────────────── */
const PAGE_SIZE_DEFAULT = 20;
let currentPage = 1;

function initPagination() {
  const select = document.getElementById("perPageSelect");
  if (select) {
    select.addEventListener("change", () => {
      currentPage = 1;
      renderPage();
    });
  }

  renderPage();

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn[data-page]");
    if (!btn || btn.disabled) return;
    currentPage = parseInt(btn.dataset.page, 10);
    renderPage();
  });
}

function getPageSize() {
  const select = document.getElementById("perPageSelect");
  return select ? parseInt(select.value, 10) : PAGE_SIZE_DEFAULT;
}

function renderPage() {
  const allRows    = Array.from(document.querySelectorAll(".market-row"));
  const visibleRows = allRows.filter((r) => r.style.display !== "none");
  const pageSize   = getPageSize();
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));

  currentPage = Math.min(currentPage, totalPages);

  visibleRows.forEach((row, i) => {
    const start = (currentPage - 1) * pageSize;
    row.style.display = i >= start && i < start + pageSize ? "" : "none";
  });

  renderPaginationButtons(totalPages);
  updateCount(visibleRows.length);
}

function renderPaginationButtons(totalPages) {
  const container = document.getElementById("paginationBtns");
  if (!container) return;

  container.innerHTML = "";

  // Prev
  const prev = makePageBtn("←", currentPage - 1, currentPage === 1);
  container.appendChild(prev);

  // Page numbers (show max 5 around current)
  const range = pageRange(currentPage, totalPages);
  range.forEach((p) => {
    if (p === "…") {
      const dot = document.createElement("span");
      dot.textContent = "…";
      dot.style.cssText = "display:flex;align-items:center;color:var(--text-muted);font-size:12px;padding:0 4px;";
      container.appendChild(dot);
    } else {
      const btn = makePageBtn(p, p, false);
      if (p === currentPage) btn.classList.add("active");
      container.appendChild(btn);
    }
  });

  // Next
  const next = makePageBtn("→", currentPage + 1, currentPage === totalPages);
  container.appendChild(next);
}

function makePageBtn(label, page, disabled) {
  const btn         = document.createElement("button");
  btn.className     = "page-btn";
  btn.textContent   = label;
  btn.dataset.page  = page;
  btn.disabled      = disabled;
  return btn;
}

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total-4, total-3, total-2, total-1, total];
  return [1, "…", current-1, current, current+1, "…", total];
}

function updatePagination(visibleCount) {
  const pageSize   = getPageSize();
  const totalPages = Math.max(1, Math.ceil(visibleCount / pageSize));
  currentPage = 1;
  renderPaginationButtons(totalPages);
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function updateCount(n) {
  const el = document.getElementById("assetCount");
  if (el) el.textContent = n;
}

function updateEmpty(visible) {
  const empty = document.getElementById("marketEmpty");
  const table = document.querySelector(".market-table");
  if (!empty || !table) return;
  empty.style.display = visible === 0 ? "block" : "none";
}

/* ── Bootstrap ───────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSparklines();
  initSearch();
  initFilterPills();
  initSort();
  initPagination();
});