/**
 * messages.js
 * ──────────────────────────────────────────────
 * Логика для toast-уведомлений Django messages.
 *
 * Что делает:
 *   - Автоматически скрывает каждый toast через DURATION мс
 *   - Кнопка ✕ закрывает toast немедленно
 *   - Пауза при наведении (hover останавливает таймер)
 */

"use strict";

(function () {
  const DURATION = 4000; // мс до автоскрытия

  /**
   * Убирает toast с анимацией и удаляет из DOM.
   * @param {HTMLElement} toast
   */
  function dismissToast(toast) {
    if (toast.classList.contains("toast--hiding")) return;
    toast.classList.add("toast--hiding");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  /**
   * Инициализирует один toast:
   *   - запускает таймер автоскрытия
   *   - вешает обработчик на кнопку закрытия
   *   - приостанавливает таймер при hover
   * @param {HTMLElement} toast
   */
  function initToast(toast) {
    // Передаём длительность в CSS для progress bar
    toast.style.setProperty("--toast-duration", `${DURATION}ms`);

    let timer = setTimeout(() => dismissToast(toast), DURATION);
    let startTime = Date.now();
    let remaining = DURATION;

    // Пауза при наведении
    toast.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      remaining -= Date.now() - startTime;

      // Останавливаем CSS-анимацию progress bar
      const bar = toast.querySelector(".toast__progress");
      if (bar) bar.style.animationPlayState = "paused";
    });

    toast.addEventListener("mouseleave", () => {
      startTime = Date.now();
      timer = setTimeout(() => dismissToast(toast), remaining);

      const bar = toast.querySelector(".toast__progress");
      if (bar) bar.style.animationPlayState = "running";
    });

    // Кнопка закрытия
    const closeBtn = toast.querySelector(".toast__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        clearTimeout(timer);
        dismissToast(toast);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toast").forEach(initToast);
  });
})();