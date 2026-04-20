// ===== Element references (nullable – not every page has every element) =====
const form = document.getElementById("alumniForm");
const tableBody = document.querySelector("#alumniTable tbody");
const searchInput = document.getElementById("searchName");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("statusMessage");
const submitBtn = document.getElementById("submitBtn");
const statusSelect = document.getElementById("status");
const totalCountEl = document.getElementById("totalCount");
const identifiedCountEl = document.getElementById("identifiedCount");
const verifyCountEl = document.getElementById("verifyCount");
const untrackedCountEl = document.getElementById("untrackedCount");
const authButton = document.getElementById("authButton");
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const cancelLogin = document.getElementById("cancelLogin");
const loginHint = document.getElementById("loginHint");
const excelFileInput = document.getElementById("excelFileInput");
const importExcelBtn = document.getElementById("importExcelBtn");
const importContainer = document.getElementById("importContainer");

const STATUS_STORAGE_KEY = "alumniStatusMap";
const ADMIN_STORAGE_KEY = "adminLogin";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

let editingId = null;
let lastData = [];
let statusMap = loadStatusMap();

function loadStatusMap() {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveStatusMap() {
  localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
}

function normalizeStatus(status) {
  if (!status) return "Belum Dilacak";
  if (status === "Teridentifikasi") return "Teridentifikasi";
  if (status === "Perlu Verifikasi") return "Perlu Verifikasi";
  if (status === "Belum Dilacak") return "Belum Dilacak";
  return "Belum Dilacak";
}

function getStatusFor(item) {
  return normalizeStatus(item.status || statusMap[item.id]);
}

function setStatusForId(id, status) {
  statusMap[id] = normalizeStatus(status);
  saveStatusMap();
}

function removeStatusForId(id) {
  delete statusMap[id];
  saveStatusMap();
}

function getStatusClass(status) {
  if (status === "Teridentifikasi") return "status-identified";
  if (status === "Perlu Verifikasi") return "status-verify";
  return "status-untracked";
}

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}



function updateStats(data) {
  const total = data.length;
  let identified = 0;
  let verify = 0;
  let untracked = 0;

  data.forEach((item) => {
    const status = normalizeStatus(item.status);
    if (status === "Teridentifikasi") identified += 1;
    else if (status === "Perlu Verifikasi") verify += 1;
    else untracked += 1;
  });

  if (totalCountEl) totalCountEl.textContent = total;
  if (identifiedCountEl) identifiedCountEl.textContent = identified;
  if (verifyCountEl) verifyCountEl.textContent = verify;
  if (untrackedCountEl) untrackedCountEl.textContent = untracked;
}

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
}

function setAdmin(value) {
  if (value) {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

function showLoginModal() {
  if (!loginModal) return;
  loginError.classList.add("hidden");
  loginForm.reset();
  loginModal.classList.remove("hidden");
}

function hideLoginModal() {
  if (!loginModal) return;
  loginModal.classList.add("hidden");
}

function updateAuthUI() {
  const admin = isAdmin();
  if (authButton) authButton.textContent = admin ? "Logout Admin" : "Login Admin";
  if (loginHint) loginHint.classList.toggle("hidden", admin);
  if (importContainer) importContainer.classList.toggle("hidden", !admin);
  if (excelFileInput) excelFileInput.disabled = !admin;
  if (importExcelBtn) importExcelBtn.disabled = !admin;
  if (submitBtn) submitBtn.classList.toggle("hidden", !admin);

  if (form) {
    form.querySelectorAll("input, select").forEach((input) => {
      input.disabled = !admin;
    });
  }

  if (!admin) {
    resetFormMode();
  }

  if (tableBody) renderTable(lastData);
}

function resetFormMode() {
  editingId = null;
  if (submitBtn) submitBtn.textContent = "Simpan Data";
  if (statusSelect) statusSelect.value = "Belum Dilacak";
}

function setEditMode(alumni) {
  if (!isAdmin()) {
    setStatus("Silakan login sebagai admin untuk mengubah data alumni.", "warning");
    return;
  }

  if (!form) return;

  editingId = alumni.id;
  form.namaLulusan.value = alumni.namaLulusan || "";
  form.nim.value = alumni.nim || "";
  form.tahunMasuk.value = alumni.tahunMasuk || "";
  form.tanggalLulus.value = alumni.tanggalLulus || "";
  form.fakultas.value = alumni.fakultas || "";
  form.programStudi.value = alumni.programStudi || "";
  form.job.value = alumni.job || "";
  form.company.value = alumni.company || "";
  form.location.value = alumni.location || "";
  if (statusSelect) statusSelect.value = normalizeStatus(alumni.status);
  if (submitBtn) submitBtn.textContent = "Perbarui Data";
  setStatus("Mode edit: perbarui data lalu simpan.");
  form.namaLulusan.focus();
}

function renderTable(data) {
  if (!tableBody) return;

  const enriched = Array.isArray(data)
    ? data.map((item) => ({
        ...item,
        status: getStatusFor(item)
      }))
    : [];

  lastData = enriched;
  tableBody.innerHTML = "";

  if (!lastData.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="11" class="empty">Data tidak ditemukan.</td>';
    tableBody.appendChild(row);
    updateStats([]);
    return;
  }

  const admin = isAdmin();

  lastData.forEach((item) => {
    const statusClass = getStatusClass(item.status);
    const actions = admin
      ? `<button class="btn ghost" data-action="edit" data-id="${item.id}">Edit</button>
         <button class="btn danger" data-action="delete" data-id="${item.id}">Hapus</button>`
      : `<span class="muted">-</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.namaLulusan || "-"}</td>
      <td>${item.nim || "-"}</td>
      <td>${item.tahunMasuk || "-"}</td>
      <td>${item.tanggalLulus || "-"}</td>
      <td>${item.fakultas || "-"}</td>
      <td>${item.programStudi || "-"}</td>
      <td>${item.job || "-"}</td>
      <td>${item.company || "-"}</td>
      <td>${item.location || "-"}</td>
      <td><span class="status-pill ${statusClass}">${item.status}</span></td>
      <td>${actions}</td>
    `;
    tableBody.appendChild(row);
  });

  updateStats(lastData);
}

async function fetchAlumni(url = "/alumni") {
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderTable(data);
    // Also update dashboard stats if on that page
    if (totalCountEl && !tableBody) {
      updateStats(data.map((item) => ({ ...item, status: getStatusFor(item) })));
    }
  } catch (error) {
    setStatus("Gagal memuat data alumni.", "error");
  }
}

// Fetch stats for dashboard page (even without table)
async function fetchDashboardStats() {
  try {
    const response = await fetch("/alumni");
    const data = await response.json();
    const enriched = data.map((item) => ({ ...item, status: getStatusFor(item) }));
    updateStats(enriched);
  } catch (error) {
    console.error("Gagal memuat statistik dashboard.", error);
  }
}

// ===== Form submit =====
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin()) {
      setStatus("Silakan login sebagai admin untuk mengubah data alumni.", "warning");
      return;
    }

    const payload = {
      namaLulusan: form.namaLulusan.value.trim(),
      nim: form.nim.value.trim(),
      tahunMasuk: form.tahunMasuk.value.trim(),
      tanggalLulus: form.tanggalLulus.value,
      fakultas: form.fakultas.value.trim(),
      programStudi: form.programStudi.value.trim(),
      job: form.job.value.trim(),
      company: form.company.value.trim(),
      location: form.location.value.trim(),
      status: statusSelect ? statusSelect.value : "Belum Dilacak"
    };

    if (!payload.status) {
      setStatus("Status pelacakan wajib diisi.", "error");
      return;
    }

    const url = editingId ? `/alumni/${editingId}` : "/alumni";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let result = null;
      try {
        result = await response.json();
      } catch (error) {
        result = null;
      }

      if (!response.ok) {
        setStatus(result?.message || "Gagal menyimpan data.", "error");
        return;
      }

      const savedId = result?.id ?? editingId;
      if (savedId) {
        setStatusForId(savedId, payload.status);
      }

      setStatus(editingId ? "Data alumni berhasil diperbarui." : "Data alumni berhasil disimpan.", "success");
      form.reset();
      resetFormMode();
      fetchAlumni();
    } catch (error) {
      setStatus("Terjadi kesalahan pada server.", "error");
    }
  });
}

// ===== Excel import =====
if (importExcelBtn) {
  importExcelBtn.addEventListener("click", async () => {
    if (!isAdmin()) return;

    const file = excelFileInput.files[0];
    if (!file) {
      setStatus("Silakan pilih file Excel (.xlsx, .xls) atau CSV terlebih dahulu.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          setStatus("File Excel kosong atau format tidak sesuai.", "error");
          return;
        }

        // Map JSON properties robustly
        const payloadRecords = json.map(row => {
          return {
            namaLulusan: row["Nama Lulusan"] || row["Nama"] || row["nama"] || "",
            nim: row["NIM"] || row["nim"] || "",
            tahunMasuk: row["Tahun Masuk"] || row["Tahun"] || row["tahunMasuk"] || "",
            tanggalLulus: row["Tanggal Lulus"] || row["Lulus"] || row["tanggalLulus"] || "",
            fakultas: row["Fakultas"] || row["fakultas"] || "",
            programStudi: row["Program Studi"] || row["Prodi"] || row["programStudi"] || "",
            job: row["Pekerjaan"] || row["job"] || "",
            company: row["Perusahaan"] || row["company"] || "",
            location: row["Lokasi"] || row["location"] || "",
            status: normalizeStatus(row["Status"] || row["status"])
          };
        });

        setStatus(`Mengirim ${payloadRecords.length} data ke server...`, "warning");

        const response = await fetch("/alumni/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadRecords)
        });

        if (!response.ok) {
          const err = await response.json();
          setStatus(err.message || "Gagal mengimpor data.", "error");
          return;
        }

        const result = await response.json();
        
        if (Array.isArray(result)) {
          result.forEach((item, index) => {
            setStatusForId(item.id, payloadRecords[index].status);
          });
        }

        setStatus(`Berhasil menambahkan ${result.length} data dari Excel.`, "success");
        excelFileInput.value = "";
        fetchAlumni();
      } catch (error) {
        console.error(error);
        setStatus("Gagal membaca file Excel.", "error");
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// ===== Search =====
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const url = query ? `/alumni/search?name=${encodeURIComponent(query)}` : "/alumni";
    fetchAlumni(url);
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    fetchAlumni();
  });
}

// ===== Auth =====
if (authButton) {
  authButton.addEventListener("click", () => {
    if (isAdmin()) {
      setAdmin(false);
      setStatus("Logout berhasil.", "success");
      updateAuthUI();
      return;
    }

    showLoginModal();
  });
}

if (cancelLogin) {
  cancelLogin.addEventListener("click", () => {
    hideLoginModal();
  });
}

if (loginModal) {
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      hideLoginModal();
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdmin(true);
      hideLoginModal();
      setStatus("Login admin berhasil.", "success");
      updateAuthUI();
    } else {
      loginError.classList.remove("hidden");
    }
  });
}

// Event delegation for edit/delete button
if (tableBody) {
  tableBody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");
    if (!action || !id) return;

    if (!isAdmin()) {
      setStatus("Silakan login sebagai admin untuk mengubah data alumni.", "warning");
      return;
    }

    if (action === "edit") {
      // On daftar page, redirect to form page with alumni data in sessionStorage
      const alumni = lastData.find((item) => String(item.id) === String(id));
      if (alumni) {
        if (!form) {
          // We're on daftar.html – store data and redirect
          sessionStorage.setItem("editAlumni", JSON.stringify(alumni));
          window.location.href = "form.html";
        } else {
          setEditMode(alumni);
        }
      }
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm("Yakin ingin menghapus data alumni ini?");
      if (!confirmed) return;

      try {
        const response = await fetch(`/alumni/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const errorData = await response.json();
          setStatus(errorData.message || "Gagal menghapus data.", "error");
          return;
        }

        removeStatusForId(id);
        setStatus("Data alumni berhasil dihapus.", "success");
        fetchAlumni();
      } catch (error) {
        setStatus("Terjadi kesalahan pada server.", "error");
      }
    }
  });
}

// ===== Initial load =====
// Dashboard page – fetch stats
if (totalCountEl && !tableBody) {
  fetchDashboardStats();
}

// Table page – fetch alumni data
if (tableBody) {
  fetchAlumni();
}

updateAuthUI();
resetFormMode();

// Check if we need to load edit data from redirect (daftar -> form)
if (form) {
  const editData = sessionStorage.getItem("editAlumni");
  if (editData) {
    try {
      const alumni = JSON.parse(editData);
      sessionStorage.removeItem("editAlumni");
      // Wait a tick for auth UI to settle
      setTimeout(() => {
        if (isAdmin()) {
          setEditMode(alumni);
        }
      }, 100);
    } catch (e) {
      sessionStorage.removeItem("editAlumni");
    }
  }
}
