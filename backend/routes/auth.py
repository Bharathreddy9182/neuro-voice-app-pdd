from flask import Blueprint, request, jsonify
from db import get_db_connection
import bcrypt

auth_bp = Blueprint("auth", __name__)

import jwt
import os
from datetime import datetime, timedelta

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    full_name = data.get("full_name")
    phone = data.get("phone")
    password = data.get("password")
    age = data.get("age")

    if not full_name or not phone or not password:
        return jsonify({
            "success": False,
            "message": "Missing fields"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE phone=%s",
        (phone,)
    )

    existing = cur.fetchone()

    if existing:
        cur.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Phone already registered"
        }), 400

    hashed = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()

    cur.execute("""
        INSERT INTO users
        (
            full_name,
            phone,
            password_hash,
            age
        )
        VALUES (%s,%s,%s,%s)
    """,
    (
        full_name,
        phone,
        hashed,
        age
    ))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Registration successful"
    })

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    phone = data.get("phone")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id,
            full_name,
            password_hash
        FROM users
        WHERE phone=%s
    """,
    (phone,)
    )

    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    if not bcrypt.checkpw(
        password.encode(),
        user[2].encode()
    ):
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    token = jwt.encode(
        {
            "user_id": user[0],
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user[0],
            "name": user[1]
        }
    })