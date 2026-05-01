import sys, os, random
from pathlib import Path

ROOT_DIR = Path(r'd:\Website Alumni Tracker')
sys.path.insert(0, str(ROOT_DIR / 'backend'))
os.environ['DATABASE_URL'] = f"sqlite:///{(ROOT_DIR / 'backend' / 'alumni_dev.db').as_posix()}"
os.chdir(ROOT_DIR / 'backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import AlumniBase, AlumniContact

e = create_engine(os.environ['DATABASE_URL'], connect_args={'check_same_thread': False})
db = sessionmaker(bind=e)()

alumni_list = db.query(AlumniBase).order_by(AlumniBase.id).all()
total = len(alumni_list)
print("Mengisi data kontak...")

filled = 0
for i, a in enumerate(alumni_list):
    c = db.query(AlumniContact).filter(AlumniContact.nim == a.nim).first()
    if not c:
        c = AlumniContact(nim=a.nim)
        db.add(c)
        
    username = a.nama.lower().replace(" ", "").replace("'", "")[:15]
    if random.random() > 0.3:  # 70% chance to have linkedin
        c.linkedin = f"https://linkedin.com/in/{username}-{a.nim[-4:]}"
    if random.random() > 0.4:
        c.instagram = f"https://instagram.com/{username}_{a.nim[-2:]}"
    if random.random() > 0.5:
        c.email = f"{username}.{a.nim[-3:]}@gmail.com"
        
    filled += 1
    if filled % 1000 == 0:
        db.commit()
        print(f"{filled}/{total}...")

db.commit()
print("Selesai isi data kontak!")
