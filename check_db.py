import sqlite3
conn = sqlite3.connect('C:\\Users\\Reymundo\\Desktop\\team-speedrunners-django-system\\db.sqlite3')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
print("Tables:", cursor.fetchall())
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='presenta_chatmessage'")
print("ChatMessage table:", cursor.fetchone())
conn.close()