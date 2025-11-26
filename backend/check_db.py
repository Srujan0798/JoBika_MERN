import sqlite3

conn = sqlite3.connect('jobika.db')
cursor = conn.cursor()

print("=== Users Table Schema ===")
cursor.execute('PRAGMA table_info(users)')
for row in cursor.fetchall():
    print(f"Column: {row[1]}, Type: {row[2]}")

print("\n=== All Tables ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for row in cursor.fetchall():
    print(f"Table: {row[0]}")

print("\n=== Job Count ===")
cursor.execute("SELECT COUNT(*) FROM jobs")
print(f"Total jobs: {cursor.fetchone()[0]}")

conn.close()
