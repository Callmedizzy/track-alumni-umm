"""
Debug: Lihat apa yang sebenarnya dikembalikan DuckDuckGo untuk 1 alumni.
"""
import sys, os
sys.path.insert(0, 'backend')
os.environ['DATABASE_URL'] = 'sqlite:///backend/alumni_dev.db'
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from duckduckgo_search import DDGS
import json

ddgs = DDGS()

# Coba dengan nama alumni UMM yang lebih spesifik
test_names = [
    ("Rizky Maulana", "Teknik Informatika"),
    ("Devi Rahmawati", "Manajemen"),
    ("Muhammad Faisal", "Teknik Sipil"),
]

for nama, prodi in test_names:
    print(f"\n{'='*60}")
    print(f"MENCARI: {nama} ({prodi})")
    print('='*60)

    query = f'"{nama}" UMM Universitas Muhammadiyah Malang linkedin'
    try:
        results = ddgs.text(query, max_results=5)
        if results:
            for i, r in enumerate(results, 1):
                print(f"\n--- Hasil #{i} ---")
                print(f"Title : {r.get('title','')}")
                print(f"URL   : {r.get('href','')}")
                print(f"Body  : {r.get('body','')[:300]}")
        else:
            print("(tidak ada hasil)")
    except Exception as e:
        print(f"ERROR: {e}")

    import time; time.sleep(2)
