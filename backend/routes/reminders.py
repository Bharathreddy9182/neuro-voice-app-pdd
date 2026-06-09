from flask import Blueprint, request, jsonify
from db import get_db_connection

reminders_bp = Blueprint("reminders", __name__)


@reminders_bp.route("/reminders", methods=["POST"])
def create_reminder():

    data = request.json

    user_id = data.get("user_id")
    title = data.get("title")
    description = data.get("description")
    reminder_date = data.get("reminder_date")
    reminder_time = data.get("reminder_time")
    priority = data.get("priority", "medium")

    if not title:
        return jsonify({
            "success": False,
            "message": "Title required"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO reminders
        (
            user_id,
            title,
            description,
            reminder_date,
            reminder_time,
            priority
        )
        VALUES
        (
            %s,%s,%s,%s,%s,%s
        )
        RETURNING id
    """,
    (
        user_id,
        title,
        description,
        reminder_date,
        reminder_time,
        priority
    ))

    reminder_id = cur.fetchone()[0]

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "id": reminder_id
    })


@reminders_bp.route("/reminders/<int:user_id>", methods=["GET"])
def get_reminders(user_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            title,
            description,
            reminder_date,
            reminder_time,
            priority,
            status
        FROM reminders
        WHERE user_id=%s
        ORDER BY reminder_date ASC,
                 reminder_time ASC
    """,
    (user_id,)
    )

    rows = cur.fetchall()

    reminders = []

    for row in rows:

        reminders.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "reminder_date": str(row[3]),
            "reminder_time": str(row[4]),
            "priority": row[5],
            "status": row[6]
        })

    cur.close()
    conn.close()

    return jsonify(reminders)


@reminders_bp.route(
    "/reminders/<int:reminder_id>",
    methods=["PUT"]
)
def update_reminder(reminder_id):

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE reminders
        SET
            title=%s,
            description=%s,
            reminder_date=%s,
            reminder_time=%s,
            priority=%s,
            updated_at=NOW()
        WHERE id=%s
    """,
    (
        data["title"],
        data["description"],
        data["reminder_date"],
        data["reminder_time"],
        data["priority"],
        reminder_id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@reminders_bp.route(
    "/reminders/<int:reminder_id>/complete",
    methods=["PATCH"]
)
def complete_reminder(reminder_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE reminders
        SET status='completed'
        WHERE id=%s
    """,
    (reminder_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@reminders_bp.route(
    "/reminders/<int:reminder_id>",
    methods=["DELETE"]
)
def delete_reminder(reminder_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM reminders WHERE id=%s",
        (reminder_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })
