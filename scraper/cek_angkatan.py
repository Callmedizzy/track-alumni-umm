import sys, os
sys.path.insert(0, 'backend')
os.environ['DATABASE_URL'] = 'sqlite:///backend/alumni_dev.db'
os.chdir(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.models import AlumniBase

engine = create_engine('sqlite:///backend/alumni_dev.db', connect_args={'check_same_thread': False})
db = sessionmaker(bind=engine)()

rows = (db.query(AlumniBase.tahun_masuk, func.count(AlumniBase.id))
        .group_by(AlumniBase.tahun_masuk)
        .order_by(AlumniBase.tahun_masuk.desc())
        .limit(25).all())

print('\nDistribusi Alumni per Tahun Masuk')
print('-' * 35)
print(f'  {"Tahun":>6}  |  {"Jumlah":>8}')
print('-' * 35)
for tahun, jumlah in rows:
    bar = '#' * min(30, jumlah // 500)
    label = str(tahun) if tahun else 'Tidak diketahui'
    print(f'  {label:>6}  |  {jumlah:>8,}  {bar}')
print('-' * 35)
print(f'  Total  |  {db.query(func.count(AlumniBase.id)).scalar():>8,}')
