from datetime import datetime, timedelta
import os

import bcrypt
from flask import Blueprint, jsonify, request
import jwt

from db import get_db_connection

caretakers_bp = Blueprint("caretakers", __name__)


def ensure_caretaker_tables(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS caretakers (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(150) NOT NULL,
            phone VARCHAR(30) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            relationship VARCHAR(80),
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS caretaker_patients (
            id SERIAL PRIMARY KEY,
            caretaker_id INTEGER REFERENCES caretakers(id) ON DELETE CASCADE,
            patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            relationship VARCHAR(80),
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(caretaker_id, patient_id)
        )
    """)


@caretakers_bp.route("/caretaker/register", methods=["POST"])
def register_caretaker():
    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name")
    phone = data.get("phone")
    password = data.get("password")
    patient_phone = data.get("patient_phone")
    relationship = data.get("relationship", "caretaker")

    if not full_name or not phone or not password or not patient_phone:
        return jsonify({
            "success": False,
            "message": "Caretaker name, phone, password, and patient phone are required"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()
    ensure_caretaker_tables(cur)

    cur.execute("SELECT id, full_name FROM users WHERE phone=%s", (patient_phone,))
    patient = cur.fetchone()

    if not patient:
        cur.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Patient phone not found. Create the patient account first."
        }), 404

    cur.execute("SELECT id FROM caretakers WHERE phone=%s", (phone,))
    existing = cur.fetchone()

    if existing:
        cur.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Caretaker phone already registered"
        }), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    cur.execute("""
        INSERT INTO caretakers (full_name, phone, password_hash, relationship)
        VALUES (%s,%s,%s,%s)
        RETURNING id
    """, (full_name, phone, hashed, relationship))

    caretaker_id = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO caretaker_patients (caretaker_id, patient_id, relationship)
        VALUES (%s,%s,%s)
        ON CONFLICT (caretaker_id, patient_id) DO NOTHING
    """, (caretaker_id, patient[0], relationship))

    cur.execute("""
        INSERT INTO emergency_contacts
        (
            user_id,
            contact_name,
            relationship,
            phone
        )
        VALUES (%s,%s,%s,%s)
    """, (patient[0], full_name, relationship, phone))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Caretaker registered and linked to patient"
    })


@caretakers_bp.route("/caretaker/login", methods=["POST"])
def login_caretaker():
    data = request.get_json(silent=True) or {}

    phone = data.get("phone")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()
    ensure_caretaker_tables(cur)

    cur.execute("""
        SELECT
            c.id,
            c.full_name,
            c.password_hash,
            cp.patient_id,
            u.full_name
        FROM caretakers c
        JOIN caretaker_patients cp
            ON cp.caretaker_id=c.id
        JOIN users u
            ON u.id=cp.patient_id
        WHERE c.phone=%s
        ORDER BY cp.created_at ASC
        LIMIT 1
    """, (phone,))

    caretaker = cur.fetchone()

    cur.close()
    conn.close()

    if not caretaker:
        return jsonify({
            "success": False,
            "message": "Invalid caretaker credentials"
        }), 401

    if not bcrypt.checkpw(password.encode(), caretaker[2].encode()):
        return jsonify({
            "success": False,
            "message": "Invalid caretaker credentials"
        }), 401

    token = jwt.encode(
        {
            "caretaker_id": caretaker[0],
            "patient_id": caretaker[3],
            "role": "caretaker",
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return jsonify({
        "success": True,
        "token": token,
        "role": "caretaker",
        "caretaker": {
            "id": caretaker[0],
            "name": caretaker[1]
        },
        "user": {
            "id": caretaker[3],
            "name": caretaker[4]
        }
    })
