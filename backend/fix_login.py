import sqlite3
import bcrypt
import os

# Samakan dengan path di .env
db_path = 'alumni_dev.db'

def fix():
    if not os.path.exists(db_path):
        print(f"❌ File {db_path} tidak ditemukan!")
        return

    password = "admin"
    # Generate hash yang pasti valid untuk library bcrypt ini
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Pastikan tabel users ada
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not cursor.fetchone():
        print("❌ Tabel 'users' tidak ditemukan!")
        return

    # Update admin
    cursor.execute("UPDATE users SET password_hash = ?, role = 'admin' WHERE username = 'admin'", (hashed,))
    if cursor.rowcount == 0:
        # Jika belum ada, insert
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                       ('admin', hashed, 'admin'))
    
    conn.commit()
    conn.close()
    print(f"✅ User 'admin' berhasil di-reset.")
    print(f"👉 USERNAME: admin")
    print(f"👉 PASSWORD: admin")

if __name__ == "__main__":
    fix()
