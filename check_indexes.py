import sqlite3
conn = sqlite3.connect('C:\\Users\\Reymundo\\Desktop\\team-speedrunners-django-system\\db.sqlite3')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="index" AND name LIKE "%chatmessage%"')
print(cursor.fetchall())
conn.close()