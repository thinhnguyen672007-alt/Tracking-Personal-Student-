// js/ui.js — Toast notifications + Modal management

const UI = {
  // =============================================
  // TOAST
  // =============================================
  toast(message, type = "info", duration = 3000) {
    const icons = {
      success: "✅",
      error:   "❌",
      warning: "⚠️",
      info:    "ℹ️",
    };

    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // =============================================
  // MODAL
  // =============================================
  openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add("open");
      // Close on overlay click
      overlay.onclick = (e) => {
        if (e.target === overlay) this.closeModal(id);
      };
    }
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove("open");
  },

  closeAllModals() {
    document.querySelectorAll(".modal-overlay.open")
      .forEach(m => m.classList.remove("open"));
  },

  // =============================================
  // SKELETON LOADING
  // =============================================
  skeletonCard() {
    return `
      <div class="skeleton-card">
        <div class="skeleton" style="height:20px;width:40%;margin-bottom:12px"></div>
        <div class="skeleton" style="height:36px;width:60%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:14px;width:30%"></div>
      </div>`;
  },

  showSkeletons(containerId, count = 4) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = Array(count).fill(this.skeletonCard()).join("");
  },

  // =============================================
  // FORMAT HELPERS
  // =============================================
  formatTime(timeStr) {
    if (!timeStr) return "--";
    return timeStr.slice(0, 5); // "08:00:00" → "08:00"
  },

  formatDate(dateStr) {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  },

  // Sessions badge color
  sessionsBadge(remaining) {
    if (remaining <= 2) return "badge-red";
    if (remaining <= 5) return "badge-orange";
    return "badge-green";
  },
};