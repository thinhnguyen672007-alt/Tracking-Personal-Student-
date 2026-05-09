// js/documents.js — Document management

async function loadDocuments() {
  const result = await api.get("/documents");
  if (!result.success) { UI.toast("Lỗi tải documents", "error"); return; }

  const grouped = result.data; // already grouped by class_name
  const classes = Object.keys(grouped);

  if (classes.length === 0) {
    document.getElementById("documents-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <p>Chưa có tài liệu nào. Upload tài liệu đầu tiên!</p>
      </div>`;
    return;
  }

  const html = classes.map(cls => `
    <div class="card" style="margin-bottom:16px">
      <div style="font-weight:600;font-size:14px;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">📁</span> Lớp ${cls}
        <span style="font-size:11px;color:var(--text-muted);font-weight:400">${grouped[cls].length} tài liệu</span>
      </div>
      ${grouped[cls].map(doc => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px">${fileIcon(doc.mime_type)}</span>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--text-primary)">${doc.original_name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${UI.formatFileSize(doc.file_size)} · ${UI.formatDate(doc.uploaded_at)}</div>
          </div>
          <a href="http://localhost:3000/uploads/${doc.stored_name}" target="_blank"
            class="btn btn-ghost" style="padding:5px 12px;font-size:11px;text-decoration:none">Xem</a>
          <button class="btn btn-danger" style="padding:5px 12px;font-size:11px"
            onclick="deleteDocument(${doc.id})">Xóa</button>
        </div>`).join("")}
    </div>`).join("");

  document.getElementById("documents-list").innerHTML = html;
}

function fileIcon(mime) {
  if (mime.includes("pdf"))   return "📄";
  if (mime.includes("word"))  return "📝";
  if (mime.includes("image")) return "🖼️";
  if (mime.includes("presentation")) return "📊";
  return "📎";
}

async function submitUpload() {
  const file      = document.getElementById("doc-file").files[0];
  const className = document.getElementById("doc-class").value.trim();

  if (!file)      { UI.toast("Vui lòng chọn file", "warning"); return; }
  if (!className) { UI.toast("Vui lòng nhập tên lớp", "warning"); return; }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("class_name", className);

  UI.toast("Đang upload...", "info");
  const result = await api.upload("/documents/upload", formData);

  if (result.success) {
    UI.toast("Upload thành công!", "success");
    UI.closeModal("modal-upload-doc");
    document.getElementById("doc-file").value = "";
    loadDocuments();
  } else {
    UI.toast(result.error || "Lỗi upload", "error");
  }
}

async function deleteDocument(id) {
  if (!confirm("Xóa tài liệu này?")) return;
  const result = await api.delete(`/documents/${id}`);
  if (result.success) {
    UI.toast("Đã xóa tài liệu", "success");
    loadDocuments();
  } else {
    UI.toast(result.error || "Lỗi xóa", "error");
  }
}