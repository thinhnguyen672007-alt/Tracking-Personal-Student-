// js/schedule.js — Available Schedule, Active Classes, Free Slots

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_VI = { Monday:"Thứ 2", Tuesday:"Thứ 3", Wednesday:"Thứ 4",
                  Thursday:"Thứ 5", Friday:"Thứ 6", Saturday:"Thứ 7", Sunday:"Chủ nhật" };

// =============================================
// AVAILABLE SCHEDULE
// =============================================
async function loadSchedule() {
  const result = await api.get("/slots");
  if (!result.success) { UI.toast("Lỗi tải lịch", "error"); return; }

  // Group by day
  const grouped = {};
  DAYS.forEach(d => grouped[d] = []);
  result.data.forEach(slot => grouped[slot.day_of_week].push(slot));

  const html = DAYS.map(day => {
    const slots = grouped[day];
    return `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-weight:600;font-size:14px">${DAYS_VI[day]}</div>
          <span style="font-size:11px;color:var(--text-muted)">${slots.length} slot</span>
        </div>
        ${slots.length === 0
          ? `<div style="font-size:12px;color:var(--text-muted);padding:8px 0">Chưa có slot nào</div>`
          : slots.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:13px;color:var(--text-primary);min-width:110px">
                ${UI.formatTime(s.start_time)} – ${UI.formatTime(s.end_time)}
              </span>
              ${s.is_assigned
                ? `<span class="badge badge-purple">${s.student_name || "Đã có HS"}</span>`
                : `<span class="badge badge-green">Trống</span>`}
              <button class="btn btn-danger" style="margin-left:auto;padding:5px 12px;font-size:11px"
                onclick="deleteSlot(${s.id})">Xóa</button>
            </div>`).join("")}
      </div>`;
  }).join("");

  document.getElementById("schedule-list").innerHTML = html;
}

async function deleteSlot(id) {
  if (!confirm("Xóa slot này?")) return;
  const result = await api.delete(`/slots/${id}`);
  if (result.success) {
    UI.toast("Đã xóa slot", "success");
    loadSchedule();
  } else {
    UI.toast(result.error || "Lỗi xóa slot", "error");
  }
}

async function submitAddSlot() {
  const day   = document.getElementById("slot-day").value;
  const start = document.getElementById("slot-start").value;
  const end   = document.getElementById("slot-end").value;

  if (!day || !start || !end) { UI.toast("Vui lòng điền đủ thông tin", "warning"); return; }
  if (start >= end) { UI.toast("Giờ kết thúc phải sau giờ bắt đầu", "warning"); return; }

  const result = await api.post("/slots", { day_of_week: day, start_time: start, end_time: end });
  if (result.success) {
    UI.toast("Đã thêm slot mới", "success");
    UI.closeModal("modal-add-slot");
    loadSchedule();
    loadOverview(); // Cập nhật stat cards
  } else {
    UI.toast(result.error || "Lỗi thêm slot", "error");
  }
}

// =============================================
// ACTIVE CLASSES
// =============================================
async function loadActive() {
  const result = await api.get("/slots/active");
  if (!result.success) { UI.toast("Lỗi tải Active Classes", "error"); return; }

  if (result.data.length === 0) {
    document.getElementById("active-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <p>Chưa có lịch dạy nào đang active</p>
      </div>`;
    return;
  }

  const html = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ngày</th><th>Giờ</th><th>Học sinh</th>
            <th>Lớp</th><th>Còn lại</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${result.data.map(s => `
            <tr onclick="showActiveDetail(${JSON.stringify(s).replace(/"/g,'&quot;')})">
              <td>${DAYS_VI[s.day_of_week]}</td>
              <td>${UI.formatTime(s.start_time)} – ${UI.formatTime(s.end_time)}</td>
              <td style="color:var(--text-primary);font-weight:500">${s.student_name}</td>
              <td><span class="badge badge-purple">${s.student_class}</span></td>
              <td><span class="badge ${UI.sessionsBadge(s.remaining_sessions)}">${s.remaining_sessions} buổi</span></td>
              <td>
                <button class="btn btn-ghost" style="padding:5px 10px;font-size:11px"
                  onclick="event.stopPropagation();unassignSlot(${s.id})">Hủy assign</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  document.getElementById("active-list").innerHTML = html;
}

function showActiveDetail(slot) {
  document.getElementById("detail-content").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--border)">
        <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;flex-shrink:0">
          ${slot.student_name.charAt(0)}
        </div>
        <div>
          <div style="font-size:16px;font-weight:600">${slot.student_name}</div>
          <div style="font-size:12px;color:var(--text-muted)">Lớp ${slot.student_class}</div>
        </div>
      </div>
      ${detailRow("📅 Lịch học", `${DAYS_VI[slot.day_of_week]}, ${UI.formatTime(slot.start_time)} – ${UI.formatTime(slot.end_time)}`)}
      ${detailRow("📞 Số điện thoại", slot.student_phone || "—")}
      ${detailRow("👨‍👩‍👦 Phụ huynh", slot.parent_name || "—")}
      ${detailRow("📋 Buổi còn lại", `<span class="badge ${UI.sessionsBadge(slot.remaining_sessions)}">${slot.remaining_sessions} buổi</span>`)}
    </div>`;
  UI.openModal("modal-detail");
}

function detailRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
    <span style="font-size:12px;color:var(--text-muted)">${label}</span>
    <span style="font-size:13px;color:var(--text-primary)">${value}</span>
  </div>`;
}

async function unassignSlot(id) {
  if (!confirm("Hủy assign học sinh khỏi slot này?")) return;
  const result = await api.post(`/slots/${id}/unassign`, {});
  if (result.success) {
    UI.toast("Đã hủy assign", "success");
    loadActive();
    loadOverview();
  } else {
    UI.toast(result.error || "Lỗi", "error");
  }
}

// =============================================
// FREE SLOTS
// =============================================
async function loadFree() {
  const result = await api.get("/slots/free");
  if (!result.success) { UI.toast("Lỗi tải Free Slots", "error"); return; }

  if (result.data.length === 0) {
    document.getElementById("free-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🟢</div>
        <p>Không có slot trống nào</p>
      </div>`;
    return;
  }

  const html = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
    ${result.data.map(s => `
      <div class="card lift" style="cursor:pointer;border-color:rgba(16,185,129,0.2)"
        onclick="openAssignModal(${s.id}, '${DAYS_VI[s.day_of_week]}', '${UI.formatTime(s.start_time)}', '${UI.formatTime(s.end_time)}')">
        <div style="font-size:11px;color:var(--accent-green);font-weight:600;margin-bottom:8px">🟢 FREE</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:4px">${DAYS_VI[s.day_of_week]}</div>
        <div style="font-size:13px;color:var(--text-secondary)">${UI.formatTime(s.start_time)} – ${UI.formatTime(s.end_time)}</div>
        <div style="margin-top:12px;font-size:11px;color:var(--text-muted)">Click để assign học sinh</div>
      </div>`).join("")}
  </div>`;

  document.getElementById("free-list").innerHTML = html;
}

async function openAssignModal(slotId, day, start, end) {
  // Load students list
  const result = await api.get("/students");
  if (!result.success) { UI.toast("Lỗi tải danh sách học sinh", "error"); return; }

  document.getElementById("assign-slot-info").textContent = `${day}, ${start} – ${end}`;
  document.getElementById("assign-slot-id").value = slotId;

  const select = document.getElementById("assign-student-select");
  select.innerHTML = `<option value="">-- Chọn học sinh --</option>` +
    result.data.map(s =>
      `<option value="${s.id}">${s.name} (${s.class}) — còn ${s.remaining_sessions} buổi</option>`
    ).join("");

  UI.openModal("modal-assign");
}

async function submitAssign() {
  const slotId    = document.getElementById("assign-slot-id").value;
  const studentId = document.getElementById("assign-student-select").value;
  if (!studentId) { UI.toast("Vui lòng chọn học sinh", "warning"); return; }

  const result = await api.post(`/slots/${slotId}/assign`, { student_id: studentId });
  if (result.success) {
    UI.toast("Đã assign học sinh vào slot!", "success");
    UI.closeModal("modal-assign");
    loadFree();
    loadOverview();
  } else {
    UI.toast(result.error || "Lỗi assign", "error");
  }
}