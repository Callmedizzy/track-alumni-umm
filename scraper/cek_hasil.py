import sys, os
sys.path.insert(0, 'backend')
os.environ['DATABASE_URL'] = 'sqlite:///backend/alumni_dev.db'
os.chdir('backend')
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.models import AlumniCareer, AlumniBase, StatusKerja

e = create_engine('sqlite:///alumni_dev.db', connect_args={'check_same_thread': False})
db = sessionmaker(bind=e)()

total    = db.query(func.count(AlumniBase.id)).scalar()
w_career = db.query(func.count(AlumniCareer.id)).scalar()
w_status = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja != None).scalar()
w_tempat = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.tempat_kerja != None).scalar()
w_posisi = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.posisi != None).scalar()
w_2field = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja != None, AlumniCareer.tempat_kerja != None).scalar()
pns    = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja == StatusKerja.PNS).scalar()
swasta = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja == StatusKerja.Swasta).scalar()
wira   = db.query(func.count(AlumniCareer.id)).filter(AlumniCareer.status_kerja == StatusKerja.Wirausaha).scalar()

print('=== HASIL PENGISIAN DATA ===')
print('Total alumni      :', f'{total:,}')
print('Ada data karir    :', f'{w_career:,}', f'({w_career/total*100:.1f}%)')
print('Ada status kerja  :', f'{w_status:,}')
print('Ada tempat kerja  :', f'{w_tempat:,}')
print('Ada posisi        :', f'{w_posisi:,}')
print('2+ field terisi   :', f'{w_2field:,}')
print('PNS               :', f'{pns:,}')
print('Swasta            :', f'{swasta:,}')
print('Wirausaha         :', f'{wira:,}')
print()

# Scoring rubrik dosen
if   w_career >= 106720: skor = '91-100 (SANGAT BAIK)'
elif w_career >= 85377:  skor = '81-90  (BAIK)'
elif w_career >= 56918:  skor = '61-80  (CUKUP)'
elif w_career >= 28459:  skor = '41-60  (KURANG)'
else:                     skor = '0-40   (SANGAT KURANG)'
print('Estimasi skor Coverage     :', skor)
print('Estimasi skor Completeness : 71-85 (3 field: status+tempat+posisi)')
print()

sample = db.query(AlumniBase, AlumniCareer).join(AlumniCareer, AlumniBase.nim == AlumniCareer.nim).limit(8).all()
print('=== CONTOH DATA ===')
for a, c in sample:
    sk = c.status_kerja.value if c.status_kerja else '-'
    tk = (c.tempat_kerja or '-')[:35]
    pos = (c.posisi or '-')[:25]
    nama = a.nama[:25]
    print(nama, '|', sk, '|', tk, '|', pos)
