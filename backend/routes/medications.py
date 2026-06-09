from flask import Blueprint, request, jsonify
from db import get_db_connection

medications_bp = Blueprint(
    "medications",
    __name__
)

@medications_bp.route(
    "/medications",
    methods=["POST"]
)
def create_medication():

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO medications
        (
            user_id,
            medicine_name,
            dosage,
            reminder_time,
            status
        )
        VALUES
        (
            %s,%s,%s,%s,%s
        )
        RETURNING id
    """,
    (
        data["user_id"],
        data["medicine_name"],
        data["dosage"],
        data["reminder_time"],
        "pending"
    ))

    medication_id = cur.fetchone()[0]

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "id": medication_id
    })


@medications_bp.route(
    "/medications/<int:user_id>",
    methods=["GET"]
)
def get_medications(user_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            medicine_name,
            dosage,
            reminder_time,
            status
        FROM medications
        WHERE user_id=%s
        ORDER BY reminder_time ASC
    """,
    (user_id,)
    )

    rows = cur.fetchall()

    medications = []

    for row in rows:

        medications.append({
            "id": row[0],
            "medicine_name": row[1],
            "dosage": row[2],
            "reminder_time": str(row[3]),
            "status": row[4]
        })

    cur.close()
    conn.close()

    return jsonify(medications)


@medications_bp.route(
    "/medications/<int:medication_id>",
    methods=["PUT"]
)
def update_medication(medication_id):

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE medications
        SET
            medicine_name=%s,
            dosage=%s,
            reminder_time=%s,
            status=%s
        WHERE id=%s
    """,
    (
        data["medicine_name"],
        data["dosage"],
        data["reminder_time"],
        data.get("status", "pending"),
        medication_id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@medications_bp.route(
    "/medications/<int:medication_id>/complete",
    methods=["PATCH"]
)
def complete_medication(medication_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE medications
        SET status='completed'
        WHERE id=%s
    """,
    (medication_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@medications_bp.route(
    "/medications/<int:medication_id>/pending",
    methods=["PATCH"]
)
def pending_medication(medication_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE medications
        SET status='pending'
        WHERE id=%s
    """,
    (medication_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@medications_bp.route(
    "/medications/<int:medication_id>",
    methods=["DELETE"]
)
def delete_medication(medication_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE
        FROM medications
        WHERE id=%s
    """,
    (medication_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })
