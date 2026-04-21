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
const paginationContainer = document.getElementById("paginationControls");
const dropdownHolder = document.getElementById("searchCategoryHolder");
const dropdownTrigger = document.getElementById("dropdownTrigger");
const categoryOptions = document.getElementById("categoryOptions");
const selectedCategoryLabel = document.getElementById("selectedCategoryLabel");
const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchBtn = document.getElementById("heroSearchBtn");
const verifyModal = document.getElementById("verifyModal");
const captchaCheckbox = document.getElementById("captchaCheckbox");

const STATUS_STORAGE_KEY = "alumniStatusMap";
const ADMIN_STORAGE_KEY = "adminLogin";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const PAGE_LIMIT = 50;

let editingId = null;
let lastData = [];
let currentPage = 1;
let totalPages = 1;
let totalRecords = 0;
let currentSearch = "";
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

function updateStatsFromValues(total, identified, verify, untracked) {
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
}

// ===== Pagination =====
function renderPagination() {
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  if (totalPages <= 1) {
    paginationContainer.innerHTML = `<span class="page-info">Menampilkan ${totalRecords} data</span>`;
    return;
  }

  const start = (currentPage - 1) * PAGE_LIMIT + 1;
  const end = Math.min(currentPage * PAGE_LIMIT, totalRecords);

  let html = `<span class="page-info">Menampilkan ${start}-${end} dari ${totalRecords} data</span>`;
  html += `<div class="page-buttons">`;

  // Previous
  html += `<button class="btn page-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">← Prev</button>`;

  // Page numbers (show max 7 pages around current)
  const maxVisible = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    html += `<button class="btn page-btn" data-page="1">1</button>`;
    if (startPage > 2) html += `<span class="page-dots">...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="btn page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
    html += `<button class="btn page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  // Next
  html += `<button class="btn page-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next →</button>`;
  html += `</div>`;

  paginationContainer.innerHTML = html;

  // Attach click events
  paginationContainer.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.getAttribute("data-page"));
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        fetchAlumni();
      }
    });
  });
}

// ===== Data fetching (paginated) =====
async function fetchAlumni() {
  if (!tableBody) return;

  try {
    let url;
    if (currentSearch) {
      url = `/alumni/search?name=${encodeURIComponent(currentSearch)}&page=${currentPage}&limit=${PAGE_LIMIT}`;
    } else {
      url = `/alumni?page=${currentPage}&limit=${PAGE_LIMIT}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    // Handle paginated response
    const data = result.data || result;
    totalRecords = result.total || data.length;
    totalPages = result.totalPages || 1;
    currentPage = result.page || 1;

    renderTable(data);
    renderPagination();
  } catch (error) {
    setStatus("Gagal memuat data alumni.", "error");
  }
}

// Fetch stats for dashboard page (lightweight endpoint)
async function fetchDashboardStats() {
  try {
    const response = await fetch("/alumni/stats");
    const stats = await response.json();
    updateStatsFromValues(stats.total, stats.identified, stats.verify, stats.untracked);
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
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchAlumni();
  });
}

// Search on Enter key
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      fetchAlumni();
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    currentPage = 1;
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
// Dashboard page – fetch lightweight stats
if (totalCountEl && !tableBody) {
  fetchDashboardStats();
}

// Table page – fetch paginated alumni data
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

// ===== Custom Dropdown & Hero Search =====
let selectedCategory = "semua";

if (dropdownTrigger) {
  dropdownTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownHolder.classList.toggle("open");
    categoryOptions.classList.toggle("hidden");
  });
}

if (categoryOptions) {
  categoryOptions.addEventListener("click", (e) => {
    const item = e.target.closest(".dropdown-opt");
    if (!item) return;

    selectedCategory = item.getAttribute("data-value");
    selectedCategoryLabel.textContent = item.textContent;

    // Update active state in UI
    categoryOptions.querySelectorAll(".dropdown-opt").forEach(opt => opt.classList.remove("active"));
    item.classList.add("active");

    // Close dropdown
    dropdownHolder.classList.remove("open");
    categoryOptions.classList.add("hidden");
  });
}

// Close dropdown when clicking outside
document.addEventListener("click", () => {
  if (dropdownHolder) {
    dropdownHolder.classList.remove("open");
    categoryOptions.classList.add("hidden");
  }
});

// Modified hero search to show verification modal
if (heroSearchBtn) {
  heroSearchBtn.removeEventListener("click", null); // Clear previous if any
  heroSearchBtn.addEventListener("click", () => {
    // Search Restriction: Check if logged in
    if (!isAdmin()) {
      showLoginModal();
      // Optional: highlight login button or show a toast/status
      return;
    }

    const query = heroSearchInput.value.trim();
    if (!query) return;

    // Show verification modal instead of direct redirect
    verifyModal.classList.remove("hidden");
    
    // Reset captcha state
    captchaCheckbox.classList.remove("loading", "verified");
  });

  heroSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      heroSearchBtn.click();
    }
  });
}

// Simulated reCAPTCHA Interaction
if (captchaCheckbox) {
  captchaCheckbox.addEventListener("click", () => {
    if (captchaCheckbox.classList.contains("loading") || captchaCheckbox.classList.contains("verified")) return;

    captchaCheckbox.classList.add("loading");

    // Simulate "checking" delay
    setTimeout(() => {
      captchaCheckbox.classList.remove("loading");
      captchaCheckbox.classList.add("verified");

      // Wait a bit after checkmark appears, then redirect
      setTimeout(() => {
        const query = heroSearchInput.value.trim();
        sessionStorage.setItem("heroSearchQuery", query);
        sessionStorage.setItem("heroSearchCategory", selectedCategory);
        window.location.href = "daftar.html";
      }, 800);
    }, 1500);
  });
}

// Close verification modal on click outside content
if (verifyModal) {
  verifyModal.addEventListener("click", (e) => {
    if (e.target === verifyModal) {
      verifyModal.classList.add("hidden");
    }
  });
}


// Logic for daftar.html to pick up hero search
if (tableBody) {
  const pendingQuery = sessionStorage.getItem("heroSearchQuery");
  const pendingCat = sessionStorage.getItem("heroSearchCategory");

  if (pendingQuery) {
    sessionStorage.removeItem("heroSearchQuery");
    sessionStorage.removeItem("heroSearchCategory");
    
    currentSearch = pendingQuery;
    if (searchInput) searchInput.value = pendingQuery;
    fetchAlumni();
  }
}
