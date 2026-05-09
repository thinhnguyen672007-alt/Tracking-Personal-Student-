// js/overview.js — Dashboard overview page

async function loadOverview() {
  // Show skeletons while loading
  UI.showSkeletons("stat-grid", 4);

  const result = await api.get("/overview");
  if (!result.success) {
    UI.toast("Không thể tải dữ liệu dashboard", "error");
    return;
  }

  const d = result.data;

  // Render stat cards
  document.getElementById("stat-grid").innerHTML = `
    <div class="stat-card sc-purple lift">
      <div class="stat-icon">👨‍🎓</div>
      <div class="stat-value">${d.totalStudents}</div>
      <div class="stat-label">Tổng học sinh</div>
    </div>
    <div class="stat-card sc-green lift">
      <div class="stat-icon">📋</div>
      <div class="stat-value">${d.totalSessions}</div>
      <div class="stat-label">Tổng buổi học</div>
    </div>
    <div class="stat-card sc-orange lift">
      <div class="stat-icon">🎯</div>
      <div class="stat-value">${d.activeClasses}</div>
      <div class="stat-label">Lịch đang dạy</div>
    </div>
    <div class="stat-card sc-blue lift">
      <div class="stat-icon">🟢</div>
      <div class="stat-value">${d.freeSlots}</div>
      <div class="stat-label">Slot trống</div>
      ${d.freeSlots < 3
        ? `<div class="stat-change" style="color:var(--accent-orange)">⚠ Sắp hết slot!</div>`
        : `<div class="stat-change">✓ Còn đủ slot</div>`}
    </div>
  `;

  // Render chart
  renderWeeklyChart(d.weeklyActivity);
}

function renderWeeklyChart(data) {
  const canvas = document.getElementById("weekly-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const labels = ["T2","T3","T4","T5","T6","T7","CN"];

  // Map data to days
  const counts = days.map(day => {
    const found = data.find(d => d.day_of_week === day);
    return found ? found.count : 0;
  });

  const max = Math.max(...counts, 1);
  const W = canvas.width;
  const H = canvas.height;
  const padL = 30, padB = 30, padT = 16, padR = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = chartW / days.length * 0.5;
  const gap  = chartW / days.length;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
  }

  // Bars
  counts.forEach((val, i) => {
    const x = padL + gap * i + (gap - barW) / 2;
    const barH = (val / max) * chartH;
    const y = padT + chartH - barH;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
    grad.addColorStop(0, "rgba(99,102,241,0.9)");
    grad.addColorStop(1, "rgba(139,92,246,0.3)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barW / 2, H - 8);

    // Value
    if (val > 0) {
      ctx.fillStyle = "rgba(248,250,252,0.8)";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(val, x + barW / 2, y - 4);
    }
  });
}