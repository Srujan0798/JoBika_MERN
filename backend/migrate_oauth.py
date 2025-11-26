import sqlite3

def migrate():
    conn = sqlite3.connect('jobika.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN oauth_provider TEXT")
        print("Added oauth_provider column")
    except sqlite3.OperationalError:
        print("oauth_provider column already exists")
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN oauth_id TEXT")
        print("Added oauth_id column")
    except sqlite3.OperationalError:
        print("oauth_id column already exists")
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
