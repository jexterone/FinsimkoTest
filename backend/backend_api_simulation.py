from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


DB_CONFIG = {
    'dbname': os.getenv('PG_DBNAME'),
    'user': os.getenv('PG_USER'),
    'password': os.getenv('PG_PASSWORD'),
    'host': os.getenv('PG_HOST', 'localhost'),
    'port': os.getenv('PG_PORT', '5432')
}

def get_conn():
    try:

        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print("Ошибка подключения к БД:", repr(e))
        return None


@app.route('/api/state', methods=['GET'])
def get_state():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT term, value FROM inputs")
    inputs = cursor.fetchall()
    cursor.execute("SELECT term, team, approved FROM status")
    status = cursor.fetchall()
    cursor.execute("SELECT valuation, agreed FROM output")
    valuation = cursor.fetchone()
    conn.close()
    return jsonify({
        "inputs": [{"term": t, "value": v} for t, v in inputs],
        "status": [{"term": t, "team": team, "approved": ok} for t, team, ok in status],
        "valuation": valuation[0],
        "agreed": valuation[1]
    })

@app.route('/api/update_input', methods=['POST'])
def update_input():
    data = request.json
    term = data['term']
    value = float(data['value'])
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE inputs SET value=%s WHERE term=%s", (value, term))
    cursor.execute("UPDATE status SET approved=FALSE WHERE term=%s", (term,))
    conn.commit()
    recalculate_valuation(cursor)
    check_full_agreement(cursor)
    conn.commit()
    conn.close()
    return jsonify({"status": "updated"})

@app.route('/api/toggle_status', methods=['POST'])
def toggle_status():
    data = request.json
    term = data['term']
    team = data['team']
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT approved FROM status WHERE term=%s AND team=%s", (term, team))
    current = cursor.fetchone()[0]
    new_status = not current
    cursor.execute("UPDATE status SET approved=%s WHERE term=%s AND team=%s", (new_status, term, team))
    check_full_agreement(cursor)
    conn.commit()
    conn.close()
    return jsonify({"status": "toggled"})

def recalculate_valuation(cursor):
    cursor.execute("SELECT value FROM inputs WHERE term='EBITDA'")
    ebitda = cursor.fetchone()[0]
    cursor.execute("SELECT value FROM inputs WHERE term='Multiple'")
    multiple = cursor.fetchone()[0]
    cursor.execute("SELECT value FROM inputs WHERE term='Factor Score'")
    factor = cursor.fetchone()[0]
    valuation = ebitda * multiple * factor
    cursor.execute("UPDATE output SET valuation=%s", (valuation,))

def check_full_agreement(cursor):
    cursor.execute("SELECT term FROM inputs")
    terms = [row[0] for row in cursor.fetchall()]
    all_agreed = True
    for term in terms:
        cursor.execute("SELECT approved FROM status WHERE term=%s AND team='team2'", (term,))
        t2 = cursor.fetchone()
        if not t2 or not t2[0]:
            all_agreed = False
            break
    cursor.execute("UPDATE output SET agreed=%s", (all_agreed,))


if __name__ == '__main__':
    app.run(debug=True)