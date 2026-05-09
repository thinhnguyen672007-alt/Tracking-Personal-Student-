// js/students.js — Student management

async function loadStudents() {
  const result = await api.get("/students");
  if (!result.success) { UI.toast("Lỗi tải danh sách học sinh", "error"); return; }

  if (result.data.length === 0) {
    document.getElementById("students-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👨‍🎓</div>
        <p>Chưa có học sinh nào. Thêm học sinh đầu tiên!</p>
      </div>`;
    return;
  }

  const html = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Tên</th><th>Lớp</th><th>SĐT</th><th>Tổng buổi</th><th>Còn lại</th><th></th></tr>
        </thead>
        <tbody>
          ${result.data.map(s => `
            <tr onclick="showStudentDetail(${s.id})">
              <td style="color:var(--text-primary);font-weight:500">${s.name}</td>
              <td><span class="badge badge-purple">${s.class}</span></td>
              <td style="color:var(--text-muted)">${s.phone || "—"}</td>
              <td>${s.total_sessions}</td>
              <td><span class="badge ${UI.sessionsBadge(s.remaining_sessions)}">${s.remaining_sessions} buổi</span></td>
              <td style="display:flex;gap:6px" onclick="event.stopPropagation()">
                <button class="btn btn-ghost" style="padding:5px 10px;font-size:11px"
                  onclick="openEditStudent(${s.id})">Sửa</button>
                <button class="btn btn-danger" style="padding:5px 10px;font-size:11px"
                  onclick="deleteStudent(${s.id})">Xóa</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  document.getElementById("students-list").innerHTML = html;
}

async function showStudentDetail(id) {
  const result = await api.get(`/students/${id}`);
  if (!result.success) { UI.toast("Lỗi tải thông tin học sinh", "error"); return; }
  const s = result.data;

  document.getElementById("detail-content").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--border)">
        <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white">
          ${s.name.charAt(0)}
        </div>
        <div>
          <div style="font-size:16px;font-weight:600">${s.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">Lớp ${s.class}</div>
        </div>
      </div>
      ${detailRow("📞 Số điện thoại", s.phone || "—")}
      ${detailRow("👨‍👩‍👦 Phụ huynh", s.parent_name || "—")}
      ${detailRow("📋 Tổng buổi", s.total_sessions)}
      ${detailRow("✅ Đã học", s.used_sessions)}
      ${detailRow("⏳ Còn lại", `<span class="badge ${UI.sessionsBadge(s.remaining_sessions)}">${s.remaining_sessions} buổi</span>`)}
      ${s.day_of_week ? detailRow("📅 Lịch học", `${DAYS_VI[s.day_of_week]}, ${UI.formatTime(s.start_time)} – ${UI.formatTime(s.end_time)}`) : detailRow("📅 Lịch học", "Chưa assign slot")}
      ${s.notes ? detailRow("📝 Ghi chú", s.notes) : ""}
    </div>`;
  UI.openModal("modal-detail");
}

async function addStudentClick() {
  // Check free slots first
  const result = await api.get("/slots/free");
  if (result.success && result.data.length < 3) {
    UI.toast(`Chỉ còn ${result.data.length} slot trống. Cần ít nhất 3 slot!`, "warning");
    return;
  }
  // Clear form
  document.getElementById("student-form").reset();
  document.getElementById("student-id").value = "";
  document.getElementById("student-modal-title").textContent = "Thêm học sinh mới";
  UI.openModal("modal-student");
}

async function openEditStudent(id) {
  const result = await api.get(`/students/${id}`);
  if (!result.success) return;
  const s = result.data;

  document.getElementById("student-id").value           = s.id;
  document.getElementById("student-name").value         = s.name;
  document.getElementById("student-class").value        = s.class;
  document.getElementById("student-phone").value        = s.phone || "";
  document.getElementById("student-parent").value       = s.parent_name || "";
  document.getElementById("student-sessions").value     = s.total_sessions;
  document.getElementById("student-notes").value        = s.notes || "";
  document.getElementById("student-modal-title").textContent = "Sửa thông tin học sinh";
  UI.openModal("modal-student");
}

async function submitStudent() {
  const id = document.getElementById("student-id").value;
  const body = {
    name:           document.getElementById("student-name").value.trim(),
    class:          document.getElementById("student-class").value.trim(),
    phone:          document.getElementById("student-phone").value.trim(),
    parent_name:    document.getElementById("student-parent").value.trim(),
    total_sessions: parseInt(document.getElementById("student-sessions").value) || 0,
    notes:          document.getElementById("student-notes").value.trim(),
  };

  if (!body.name || !body.class) {
    UI.toast("Tên và lớp là bắt buộc", "warning"); return;
  }

  const result = id
    ? await api.put(`/students/${id}`, body)
    : await api.post("/students", body);

  if (result.success) {
    UI.toast(id ? "Đã cập nhật học sinh" : "Đã thêm học sinh mới", "success");
    UI.closeModal("modal-student");
    loadStudents();
    loadOverview();
  } else if (result.warning) {
    UI.toast(result.message, "warning");
  } else {
    UI.toast(result.error || "Lỗi", "error");
  }
}

async function deleteStudent(id) {
  if (!confirm("Xóa học sinh này? Hành động không thể hoàn tác!")) return;
  const result = await api.delete(`/students/${id}`);
  if (result.success) {
    UI.toast("Đã xóa học sinh", "success");
    loadStudents();
    loadOverview();
  } else {
    UI.toast(result.error || "Lỗi xóa", "error");
  }
}