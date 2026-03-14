const form = document.getElementById("alumniForm");
const tableBody = document.querySelector("#alumniTable tbody");
const searchInput = document.getElementById("searchName");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const submitBtn = form.querySelector("button[type='submit']");

let editingId = null;
let lastData = [];

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function validateGraduationYear(yearValue) {
  const yearString = String(yearValue ?? "").trim();
  const yearNumber = Number(yearString);
  const currentYear = new Date().getFullYear();

  if (!yearString) {
    return "Tahun lulus wajib diisi.";
  }

  if (!Number.isInteger(yearNumber)) {
    return "Tahun lulus harus berupa angka.";
  }

  if (yearNumber > currentYear) {
    return "Tahun lulus tidak boleh lebih besar dari tahun sekarang.";
  }

  return "";
}

function resetFormMode() {
  editingId = null;
  submitBtn.textContent = "Simpan Data";
}

function setEditMode(alumni) {
  editingId = alumni.id;
  form.name.value = alumni.name;
  form.program.value = alumni.program;
  form.graduationYear.value = alumni.graduationYear;
  form.job.value = alumni.job;
  form.company.value = alumni.company;
  form.location.value = alumni.location;
  submitBtn.textContent = "Perbarui Data";
  setStatus("Mode edit: perbarui data lalu simpan.");
  form.name.focus();
}

function renderTable(data) {
  lastData = Array.isArray(data) ? data : [];
  tableBody.innerHTML = "";

  if (!lastData.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7" class="empty">Data tidak ditemukan.</td>';
    tableBody.appendChild(row);
    return;
  }

  lastData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.program}</td>
      <td>${item.graduationYear}</td>
      <td>${item.job}</td>
      <td>${item.company}</td>
      <td>${item.location}</td>
      <td>
        <button class="btn ghost" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="btn danger" data-action="delete" data-id="${item.id}">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function fetchAlumni(url = "/alumni") {
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderTable(data);
  } catch (error) {
    setStatus("Gagal memuat data alumni.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: form.name.value.trim(),
    program: form.program.value.trim(),
    graduationYear: form.graduationYear.value.trim(),
    job: form.job.value.trim(),
    company: form.company.value.trim(),
    location: form.location.value.trim()
  };

  const yearError = validateGraduationYear(payload.graduationYear);
  if (yearError) {
    setStatus(yearError, "error");
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

    if (!response.ok) {
      const errorData = await response.json();
      setStatus(errorData.message || "Gagal menyimpan data.", "error");
      return;
    }

    setStatus(editingId ? "Data alumni berhasil diperbarui." : "Data alumni berhasil disimpan.", "success");
    form.reset();
    resetFormMode();
    fetchAlumni();
  } catch (error) {
    setStatus("Terjadi kesalahan pada server.", "error");
  }
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const url = query ? `/alumni/search?name=${encodeURIComponent(query)}` : "/alumni";
  fetchAlumni(url);
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  fetchAlumni();
});

// Event delegation for edit/delete button
tableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");
  if (!action || !id) return;

  if (action === "edit") {
    const alumni = lastData.find((item) => String(item.id) === String(id));
    if (alumni) {
      setEditMode(alumni);
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

      setStatus("Data alumni berhasil dihapus.", "success");
      fetchAlumni();
    } catch (error) {
      setStatus("Terjadi kesalahan pada server.", "error");
    }
  }
});

// Initial load
fetchAlumni();
