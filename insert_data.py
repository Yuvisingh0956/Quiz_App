import sqlite3
import os

try:
    instance_folder = "instance"  # Name of your instance folder
    database_file = "quma.sqlite3"
    database_path = os.path.join(instance_folder, database_file)

    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()

    cursor.execute("INSERT INTO subject (name, description) VALUES ('Math', 'Mathematics')")
    cursor.execute("INSERT INTO subject (name, description) VALUES ('Physics', 'Physics')")
    cursor.execute("INSERT INTO subject (name, description) VALUES ('Chemistry', 'Chemistry')")
    cursor.execute("INSERT INTO subject (name, description) VALUES ('Biology', 'Biology')")

    conn.commit()
    print("Data inserted successfully.")

except sqlite3.Error as e:
    print("Error:", e)

finally:
    if conn:
        conn.close()