from flask import Blueprint, jsonify
from db import get_db_connection

profile_bp = Blueprint(
    "profile",
    __name__
)

@profile_bp.route(
    "/profile/<int:user_id>",
    methods=["GET"]
)
def get_profile(user_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            full_name,
            phone,
            age
        FROM users
        WHERE id=%s
    """,
    (user_id,)
    )

    user = cur.fetchone()

    cur.execute("""
        SELECT COUNT(*)
        FROM memories
        WHERE user_id=%s
    """,
    (user_id,)
    )

    memories = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM reminders
        WHERE user_id=%s
    """,
    (user_id,)
    )

    reminders = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM medications
        WHERE user_id=%s
    """,
    (user_id,)
    )

    medications = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM emergency_contacts
        WHERE user_id=%s
    """,
    (user_id,)
    )

    contacts = cur.fetchone()[0]

    cur.close()
    conn.close()

    return jsonify({
        "full_name": user[0],
        "phone": user[1],
        "age": user[2],
        "memories": memories,
        "reminders": reminders,
        "medications": medications,
        "contacts": contacts
    })