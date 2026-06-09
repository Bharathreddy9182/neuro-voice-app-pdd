from flask import Blueprint, jsonify
from db import get_db_connection

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

@dashboard_bp.route(
    "/dashboard/<int:user_id>",
    methods=["GET"]
)
def get_dashboard(user_id):

    conn = get_db_connection()
    cur = conn.cursor()

    # -------------------------
    # REMINDERS
    # -------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM reminders
        WHERE user_id=%s
    """, (user_id,))
    total_reminders = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM reminders
        WHERE user_id=%s
        AND status='pending'
    """, (user_id,))
    pending_reminders = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM reminders
        WHERE user_id=%s
        AND status='completed'
    """, (user_id,))
    completed_reminders = cur.fetchone()[0]

    # -------------------------
    # MEMORIES
    # -------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM memories
        WHERE user_id=%s
    """, (user_id,))
    total_memories = cur.fetchone()[0]

    cur.execute("""
        SELECT memory_text
        FROM memories
        WHERE user_id=%s
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id,))

    memory_row = cur.fetchone()

    recent_memory = (
        memory_row[0]
        if memory_row
        else "No memories yet"
    )

    # -------------------------
    # MEDICATIONS
    # -------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM medications
        WHERE user_id=%s
    """, (user_id,))
    total_medications = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM medications
        WHERE user_id=%s
        AND (
            status='pending'
            OR status IS NULL
        )
    """, (user_id,))
    pending_medications = cur.fetchone()[0]

    cur.execute("""
        SELECT
            medicine_name,
            dosage,
            reminder_time
        FROM medications
        WHERE user_id=%s
        AND (
            status='pending'
            OR status IS NULL
        )
        ORDER BY reminder_time ASC
        LIMIT 3
    """, (user_id,))

    medication_rows = cur.fetchall()

    medications = []

    for row in medication_rows:
        medications.append({
            "medicine_name": row[0],
            "dosage": row[1],
            "reminder_time": str(row[2])
        })

    # -------------------------
    # TODAY REMINDERS
    # -------------------------

    cur.execute("""
        SELECT
            id,
            title,
            reminder_date,
            reminder_time,
            priority,
            status
        FROM reminders
        WHERE user_id=%s
        AND reminder_date=CURRENT_DATE
        ORDER BY reminder_time ASC
        LIMIT 3
    """, (user_id,))

    reminder_rows = cur.fetchall()

    reminders = []

    for row in reminder_rows:

        reminders.append({
            "id": row[0],
            "title": row[1],
            "reminder_date": str(row[2]),
            "reminder_time": str(row[3]),
            "priority": row[4],
            "status": row[5]
        })

    # -------------------------
    # CARE TEAM
    # -------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM emergency_contacts
        WHERE user_id=%s
    """, (user_id,))
    total_contacts = cur.fetchone()[0]

    # -------------------------
    # MEMORY HEALTH SCORE
    # -------------------------

    memory_health_score = min(
        100,
        (
            total_memories * 5
            +
            completed_reminders * 3
        )
    )

    cur.close()
    conn.close()

    return jsonify({

        "total_reminders":
        total_reminders,

        "pending_reminders":
        pending_reminders,

        "completed_reminders":
        completed_reminders,

        "total_memories":
        total_memories,

        "recent_memory":
        recent_memory,

        "today_reminders":
        reminders,

        "total_medications":
        total_medications,

        "pending_medications":
        pending_medications,

        "recent_medications":
        medications,

        "total_contacts":
        total_contacts,

        "memory_health_score":
        memory_health_score
    })
