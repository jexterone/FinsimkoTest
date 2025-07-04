import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'dbname': os.getenv('PG_DBNAME'),
    'user': os.getenv('PG_USER'),
    'password': os.getenv('PG_PASSWORD'),
    'host': os.getenv('PG_HOST', 'localhost'),
    'port': os.getenv('PG_PORT', '5432')
}


def get_conn():
    return psycopg2.connect(**DB_CONFIG)


def display_state():
    conn = get_conn()
    cursor = conn.cursor()
    print("\nТЕКУЩИЕ ЗНАЧЕНИЯ:")
    cursor.execute("SELECT term, value FROM inputs")
    for term, value in cursor.fetchall():
        print(f"  {term}: {value}")

    print("\nСТАТУСЫ:")
    cursor.execute("SELECT term, approved FROM status WHERE team = 'team2' ORDER BY term")
    for term, approved in cursor.fetchall():
        status = "OK" if approved else "TBD"
        print(f"  {term}: {status}")

    cursor.execute("SELECT valuation, agreed FROM output")
    valuation, agreed = cursor.fetchone()
    print(f"\n💰 Valuation: {valuation}")
    print(f"🔒 Согласовано полностью? {'Да' if agreed else 'Нет'}")
    conn.close()


def recalculate_valuation(cursor):
    cursor.execute("SELECT value FROM inputs WHERE term='EBITDA'")
    ebitda = cursor.fetchone()[0]
    cursor.execute("SELECT value FROM inputs WHERE term='Multiple'")
    multiple = cursor.fetchone()[0]
    cursor.execute("SELECT value FROM inputs WHERE term='Factor Score'")
    factor = cursor.fetchone()[0]
    valuation = ebitda * multiple * factor
    cursor.execute("UPDATE output SET valuation=%s", (valuation,))


def check_agreement(cursor):
    cursor.execute("SELECT term FROM inputs")
    terms = [row[0] for row in cursor.fetchall()]
    all_ok = True
    for term in terms:
        cursor.execute("SELECT approved FROM status WHERE term=%s AND team='team1'", (term,))
        t1 = cursor.fetchone()[0]
        cursor.execute("SELECT approved FROM status WHERE term=%s AND team='team2'", (term,))
        t2 = cursor.fetchone()[0]
        if not (t1 and t2):
            all_ok = False
            break
    cursor.execute("UPDATE output SET agreed=%s", (all_ok,))


def team1_mode():
    conn = get_conn()
    cursor = conn.cursor()
    while True:
        cursor.execute("SELECT id, term, value FROM inputs")
        rows = cursor.fetchall()
        print("\n--- Team 1 ---")
        for row in rows:
            print(f"{row[0]}. {row[1]} = {row[2]}")
        choice = input("Введите ID поля для изменения (или 'q' для выхода): ")
        if choice.lower() == 'q':
            break
        try:
            field_id = int(choice)
            cursor.execute("SELECT term FROM inputs WHERE id=%s", (field_id,))
            term = cursor.fetchone()[0]
            new_val = float(input(f"Введите новое значение для {term}: "))
            cursor.execute("UPDATE inputs SET value=%s WHERE id=%s", (new_val, field_id))
            cursor.execute("UPDATE status SET approved=FALSE WHERE term=%s", (term,))
            recalculate_valuation(cursor)
            check_agreement(cursor)
            conn.commit()
            print(f"✅ Обновлено: {term}")
        except Exception as e:
            print("Ошибка:", e)
    conn.close()


def team2_mode():
    conn = get_conn()
    cursor = conn.cursor()
    while True:
        cursor.execute("SELECT DISTINCT term FROM inputs")
        terms = [row[0] for row in cursor.fetchall()]
        print("\n--- Team 2 ---")
        for i, term in enumerate(terms, 1):
            cursor.execute("SELECT approved FROM status WHERE term=%s AND team='team2'", (term,))
            approved = cursor.fetchone()[0]
            print(f"{i}. {term}: {'OK' if approved else 'TBD'}")
        choice = input("Выберите номер термина для переключения (или 'q'): ")
        if choice.lower() == 'q':
            break
        try:
            idx = int(choice) - 1
            term = terms[idx]
            cursor.execute("SELECT approved FROM status WHERE term=%s AND team='team2'", (term,))
            current = cursor.fetchone()[0]
            new_status = not current
            cursor.execute("UPDATE status SET approved=%s WHERE term=%s AND team='team2'", (new_status, term))
            check_agreement(cursor)
            conn.commit()
            print(f"🔁 {term} теперь {'OK' if new_status else 'TBD'}")
        except Exception as e:
            print("Ошибка:", e)
    conn.close()


def main_menu():
    while True:
        print("\n=== Finsimco CLI Simulation ===")
        print("1. Team 1 — ввод данных")
        print("2. Team 2 — подтверждение")
        print("3. Показать текущее состояние")
        print("0. Выход")
        choice = input("Выбор: ")
        if choice == '1':
            team1_mode()
        elif choice == '2':
            team2_mode()
        elif choice == '3':
            display_state()
        elif choice == '0':
            break
        else:
            print("❌ Неверный выбор")


if __name__ == '__main__':
    main_menu()
