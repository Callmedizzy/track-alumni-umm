import sys, os
from pathlib import Path
ROOT_DIR = Path(r'd:\Website Alumni Tracker')
sys.path.insert(0, str(ROOT_DIR / 'backend'))
os.environ['DATABASE_URL'] = f"sqlite:///{(ROOT_DIR / 'backend' / 'alumni_dev.db').as_posix()}"
os.chdir(ROOT_DIR / 'backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import AlumniCareer, AlumniBase

e = create_engine(os.environ['DATABASE_URL'], connect_args={'check_same_thread': False})
db = sessionmaker(bind=e)()

sample1 = db.query(AlumniBase, AlumniCareer).join(AlumniCareer, AlumniBase.nim == AlumniCareer.nim).order_by(AlumniBase.id).limit(10).all()
sample2 = db.query(AlumniBase, AlumniCareer).join(AlumniCareer, AlumniBase.nim == AlumniCareer.nim).filter(AlumniBase.prodi == 'Ilmu Hukum').limit(5).all()
sample3 = db.query(AlumniBase, AlumniCareer).join(AlumniCareer, AlumniBase.nim == AlumniCareer.nim).filter(AlumniBase.prodi == 'Pendidikan Dokter').limit(5).all()

print(f'{"NAMA":<25} | {"PRODI":<20} | {"STATUS":<10} | {"TEMPAT KERJA":<30} | {"POSISI"}')
print('-' * 115)
for a, c in sample1 + sample2 + sample3:
    sk = c.status_kerja.value if c.status_kerja else '-'
    tk = (c.tempat_kerja or '-')[:30]
    pos = (c.posisi or '-')[:25]
    nama = a.nama[:25]
    prodi = (a.prodi or '-')[:20]
    print(f'{nama:<25} | {prodi:<20} | {sk:<10} | {tk:<30} | {pos}')
