const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, "data", "alumni.json");

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, "[]", "utf-8");
      console.log("File data/alumni.json dibuat otomatis.");
    }
  } catch (error) {
    console.error("Gagal memastikan file data.", error);
  }
}

function readAlumniData() {
  // Read JSON file safely; return empty array if file missing or invalid
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Gagal membaca data alumni.", error);
    return [];
  }
}

function writeAlumniData(data) {
  // Persist data to JSON file with pretty formatting
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Gagal menulis data alumni.", error);
    return false;
  }
}


// GET /alumni -> list all alumni
app.get("/alumni", (req, res) => {
  const alumni = readAlumniData();
  res.json(alumni);
});

// POST /alumni -> add new alumni
app.post("/alumni", (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { namaLulusan, nim, tahunMasuk, tanggalLulus, fakultas, programStudi, job, company, location } = req.body || {};

    // Basic validation
    if (!namaLulusan || !nim || !tahunMasuk || !tanggalLulus || !fakultas || !programStudi || !job || !company || !location) {
      return res.status(400).json({
        message: "Semua field wajib diisi."
      });
    }

    const alumni = readAlumniData();
    const newAlumni = {
      id: Date.now(),
      namaLulusan: String(namaLulusan).trim(),
      nim: String(nim).trim(),
      tahunMasuk: String(tahunMasuk).trim(),
      tanggalLulus: String(tanggalLulus).trim(),
      fakultas: String(fakultas).trim(),
      programStudi: String(programStudi).trim(),
      job: String(job).trim(),
      company: String(company).trim(),
      location: String(location).trim()
    };

    alumni.push(newAlumni);
    const saved = writeAlumniData(alumni);

    if (!saved) {
      return res.status(500).json({ message: "Gagal menyimpan data alumni." });
    }

    res.status(201).json(newAlumni);
  } catch (error) {
    console.error("Error pada POST /alumni.", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// POST /alumni/bulk -> add multiple alumni
app.post("/alumni/bulk", (req, res) => {
  try {
    const records = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({ message: "Data harus berupa array." });
    }

    const alumni = readAlumniData();
    const newRecords = [];

    records.forEach((record, index) => {
      const { namaLulusan, nim, tahunMasuk, tanggalLulus, fakultas, programStudi, job, company, location } = record;
      
      const newAlumni = {
         id: Date.now() + index, // prevent id collision
         namaLulusan: String(namaLulusan || "").trim(),
         nim: String(nim || "").trim(),
         tahunMasuk: String(tahunMasuk || "").trim(),
         tanggalLulus: String(tanggalLulus || "").trim(),
         fakultas: String(fakultas || "").trim(),
         programStudi: String(programStudi || "").trim(),
         job: String(job || "").trim(),
         company: String(company || "").trim(),
         location: String(location || "").trim()
      };
      
      newRecords.push(newAlumni);
      alumni.push(newAlumni);
    });

    const saved = writeAlumniData(alumni);
    if (!saved) {
      return res.status(500).json({ message: "Gagal menyimpan data bulk alumni." });
    }

    res.status(201).json(newRecords);
  } catch (error) {
    console.error("Error pada POST /alumni/bulk.", error);
    res.status(500).json({ message: "Terjadi kesalahan bulk insert pada server." });
  }
});

// PUT /alumni/:id -> update alumni by id
app.put("/alumni/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { namaLulusan, nim, tahunMasuk, tanggalLulus, fakultas, programStudi, job, company, location } = req.body || {};

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID alumni tidak valid." });
    }

    if (!namaLulusan || !nim || !tahunMasuk || !tanggalLulus || !fakultas || !programStudi || !job || !company || !location) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const alumni = readAlumniData();
    const index = alumni.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Data alumni tidak ditemukan." });
    }

    const updatedAlumni = {
      ...alumni[index],
      namaLulusan: String(namaLulusan).trim(),
      nim: String(nim).trim(),
      tahunMasuk: String(tahunMasuk).trim(),
      tanggalLulus: String(tanggalLulus).trim(),
      fakultas: String(fakultas).trim(),
      programStudi: String(programStudi).trim(),
      job: String(job).trim(),
      company: String(company).trim(),
      location: String(location).trim()
    };

    alumni[index] = updatedAlumni;
    const saved = writeAlumniData(alumni);

    if (!saved) {
      return res.status(500).json({ message: "Gagal memperbarui data alumni." });
    }

    res.json(updatedAlumni);
  } catch (error) {
    console.error("Error pada PUT /alumni/:id.", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// GET /alumni/search?name= -> search by name
app.get("/alumni/search", (req, res) => {
  const query = (req.query.name || "").toString().trim().toLowerCase();
  const alumni = readAlumniData();

  if (!query) {
    return res.json(alumni);
  }

  const results = alumni.filter((item) =>
    (item.namaLulusan || "").toLowerCase().includes(query)
  );

  res.json(results);
});

// DELETE /alumni/:id -> delete alumni by id
app.delete("/alumni/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const alumni = readAlumniData();

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID alumni tidak valid." });
    }

    const updated = alumni.filter((item) => item.id !== id);

    if (updated.length === alumni.length) {
      return res.status(404).json({ message: "Data alumni tidak ditemukan." });
    }

    const saved = writeAlumniData(updated);
    if (!saved) {
      return res.status(500).json({ message: "Gagal menghapus data alumni." });
    }

    res.json({ message: "Data alumni berhasil dihapus." });
  } catch (error) {
    console.error("Error pada DELETE /alumni/:id.", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// Ensure data file exists on startup
ensureDataFile();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
