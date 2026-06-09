from flask import Blueprint, request, jsonify
from db import get_db_connection

contacts_bp = Blueprint(
    "contacts",
    __name__
)

@contacts_bp.route(
    "/contacts",
    methods=["POST"]
)
def create_contact():

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO emergency_contacts
        (
            user_id,
            contact_name,
            relationship,
            phone
        )
        VALUES
        (
            %s,%s,%s,%s
        )
        RETURNING id
    """,
    (
        data["user_id"],
        data["contact_name"],
        data["relationship"],
        data["phone"]
    ))

    contact_id = cur.fetchone()[0]

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "id": contact_id
    })


@contacts_bp.route(
    "/contacts/<int:user_id>",
    methods=["GET"]
)
def get_contacts(user_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            contact_name,
            relationship,
            phone
        FROM emergency_contacts
        WHERE user_id=%s
        ORDER BY contact_name
    """,
    (user_id,)
    )

    rows = cur.fetchall()

    contacts = []

    for row in rows:

        contacts.append({
            "id": row[0],
            "contact_name": row[1],
            "relationship": row[2],
            "phone": row[3]
        })

    cur.close()
    conn.close()

    return jsonify(contacts)


@contacts_bp.route(
    "/contacts/<int:contact_id>",
    methods=["PUT"]
)
def update_contact(contact_id):

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE emergency_contacts
        SET
            contact_name=%s,
            relationship=%s,
            phone=%s
        WHERE id=%s
    """,
    (
        data["contact_name"],
        data["relationship"],
        data["phone"],
        contact_id
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })


@contacts_bp.route(
    "/contacts/<int:contact_id>",
    methods=["DELETE"]
)
def delete_contact(contact_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE
        FROM emergency_contacts
        WHERE id=%s
    """,
    (contact_id,)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True
    })
