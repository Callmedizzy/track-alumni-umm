import bcrypt
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = "sqlite:///./alumni_dev.db"

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def reset_passwords():
    print("Resetting passwords...")
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    
    users = [
        {"username": "admin", "password": "admin123", "role": "admin"},
        {"username": "viewer", "password": "viewer123", "role": "viewer"},
    ]
    
    with Session() as session:
        for u in users:
            hashed = hash_password(u["password"])
            # Update or Insert
            existing = session.execute(
                text("SELECT id FROM users WHERE username = :un"),
                {"un": u["username"]},
            ).fetchone()
            
            if existing:
                session.execute(
                    text("UPDATE users SET password_hash = :hp, role = :role WHERE username = :un"),
                    {"hp": hashed, "role": u["role"], "un": u["username"]}
                )
                print(f"Updated user '{u['username']}' with password '{u['password']}'")
            else:
                session.execute(
                    text("INSERT INTO users (username, password_hash, role) VALUES (:un, :hp, :role)"),
                    {"un": u["username"], "hp": hashed, "role": u["role"]}
                )
                print(f"Created user '{u['username']}' with password '{u['password']}'")
        
        session.commit()
    print("Reset complete.")

if __name__ == "__main__":
    reset_passwords()
