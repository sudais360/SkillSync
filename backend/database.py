import pyodbc

class Database:
    def __init__(self, server, database, username, password):
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.conn = None
        self.cursor = None

    def connect(self):
        try:
            conn_str = f'DRIVER=ODBC Driver 17 for SQL Server;SERVER={self.server};DATABASE={self.database};UID={self.username};PWD={self.password};MARS_Connection=yes'
            self.conn = pyodbc.connect(conn_str)
            print("Connected to the database.")
        except Exception as e:
            print(f"Error connecting to the database: {e}")


    def execute_query(self, query, params=None):
        try:
            conn_str = f'DRIVER=ODBC Driver 17 for SQL Server;SERVER={self.server};DATABASE={self.database};UID={self.username};PWD={self.password};MARS_Connection=yes'
            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return rows
        except Exception as e:
            print(f"Error executing query: {e}")
            return None


    def close(self):
        if self.conn:
            if self.cursor:
                self.cursor.close()
            self.conn.close()
            print("Connection closed.")
