from datetime import date, timedelta
import re

from flask import Blueprint, jsonify, request

from db import get_db_connection

ai_bp = Blueprint("ai", __name__)

STOP_WORDS = {
    "a", "an", "and", "are", "at", "for", "from", "i", "in", "is", "it",
    "me", "my", "of", "on", "or", "the", "to", "what", "when", "where",
    "who", "with", "you", "your",
}


def normalize(value):
    return str(value or "").lower().strip()


def has_any(message, words):
    return any(word in message for word in words)


def tokenize(message):
    words = re.findall(r"[a-z0-9]+", normalize(message))
    return [word for word in words if len(word) > 2 and word not in STOP_WORDS]


def format_lines(lines):
    return "\n".join(f"- {line}" for line in lines)


def row_date(value):
    if isinstance(value, date):
        return value

    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def date_matches(value, message):
    reminder_date = row_date(value)

    if not reminder_date:
        return True

    today = date.today()

    if "today" in message:
        return reminder_date == today

    if "tomorrow" in message:
        return reminder_date == today + timedelta(days=1)

    return True


def parse_command_text(message, prefixes):
    for prefix in prefixes:
        if message.startswith(prefix):
            return message[len(prefix):].strip(" .")

    return ""


def parse_voice_date(message):
    today = date.today()

    if "tomorrow" in message:
        return today + timedelta(days=1)

    if "today" in message:
        return today

    match = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", message)
    if match:
        parsed = row_date(match.group(1))
        if parsed:
            return parsed

    return today


def parse_voice_time(message):
    match = re.search(r"\b([01]?\d|2[0-3]):([0-5]\d)\b", message)
    if match:
        return f"{int(match.group(1)):02d}:{match.group(2)}"

    match = re.search(r"\b([1-9]|1[0-2])\s*(am|pm)\b", message)
    if match:
        hour = int(match.group(1))
        meridian = match.group(2)

        if meridian == "pm" and hour != 12:
            hour += 12
        if meridian == "am" and hour == 12:
            hour = 0

        return f"{hour:02d}:00"

    return "09:00"


def create_memory_from_voice(user_id, message):
    memory_text = parse_command_text(
        message,
        ("remember ", "save memory ", "add memory ")
    )

    if not memory_text:
        return None

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO memories (user_id, memory_text)
        VALUES (%s,%s)
    """, (user_id, memory_text))

    conn.commit()
    cur.close()
    conn.close()

    return f"I saved this memory: {memory_text}"


def create_reminder_from_voice(user_id, message):
    title = parse_command_text(
        message,
        ("add reminder ", "create reminder ", "remind me ")
    )

    if not title:
        return None

    title = re.sub(r"\b(today|tomorrow)\b", "", title)
    title = re.sub(r"\b(at|on)\s+([01]?\d|2[0-3]):[0-5]\d\b", "", title)
    title = re.sub(r"\b(at|on)\s+([1-9]|1[0-2])\s*(am|pm)\b", "", title)
    title = re.sub(r"\b20\d{2}-\d{2}-\d{2}\b", "", title).strip(" .")

    if not title:
        title = "Voice reminder"

    reminder_date = parse_voice_date(message)
    reminder_time = parse_voice_time(message)

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
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        user_id,
        title,
        "Created by Neuro voice assistant",
        reminder_date,
        reminder_time,
        "medium"
    ))

    conn.commit()
    cur.close()
    conn.close()

    return f"I added reminder: {title} on {reminder_date} at {reminder_time}."


def fetch_companion_context(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT memory_text
        FROM memories
        WHERE user_id=%s
        ORDER BY created_at DESC
    """, (user_id,))
    memories = [row[0] for row in cur.fetchall()]

    cur.execute("""
        SELECT title, reminder_date, reminder_time, status
        FROM reminders
        WHERE user_id=%s
        ORDER BY reminder_date ASC, reminder_time ASC
    """, (user_id,))
    reminders = cur.fetchall()

    cur.execute("""
        SELECT medicine_name, dosage, reminder_time, status
        FROM medications
        WHERE user_id=%s
        ORDER BY reminder_time ASC
    """, (user_id,))
    medications = cur.fetchall()

    cur.execute("""
        SELECT contact_name, relationship, phone
        FROM emergency_contacts
        WHERE user_id=%s
    """, (user_id,))
    contacts = cur.fetchall()

    cur.close()
    conn.close()

    return memories, reminders, medications, contacts


def answer_identity(memories):
    for memory in memories:
        clean_memory = str(memory or "").strip()
        lowered = clean_memory.lower()

        match = re.search(r"\bmy name is\s+(.+)", lowered)
        if match:
            return f"Your name is {match.group(1).strip().title()}."

        if lowered.startswith("i am "):
            return f"You are {clean_memory[5:].strip()}."

    return "I do not know your name yet. Add it in memories, for example: My name is Sandeep."


def answer_contacts(message, contacts):
    for name, relationship, phone in contacts:
        relation = normalize(relationship)

        if relation and relation in message:
            return f"Your {relation} is {name}. Phone number is {phone}."

    if not contacts:
        return "No emergency contacts found."

    lines = [f"{relationship}: {name} ({phone})" for name, relationship, phone in contacts]
    return f"Your emergency contacts are:\n{format_lines(lines)}"


def answer_reminders(message, reminders):
    pending = [
        row for row in reminders
        if normalize(row[3]) in ("pending", "") and date_matches(row[1], message)
    ]

    if not pending:
        if "today" in message:
            return "You have no pending reminders for today."
        if "tomorrow" in message:
            return "You have no pending reminders for tomorrow."
        return "You have no pending reminders."

    lines = [f"{title} on {reminder_date} at {reminder_time}" for title, reminder_date, reminder_time, _ in pending]

    if "today" in message:
        return f"Today you have these reminders:\n{format_lines(lines)}"

    if "tomorrow" in message:
        return f"Tomorrow you have these reminders:\n{format_lines(lines)}"

    return f"You have these pending reminders:\n{format_lines(lines)}"


def answer_medications(message, medications):
    pending = [
        row for row in medications
        if normalize(row[3]) in ("pending", "")
    ]

    if not pending:
        return "You have no pending medications."

    lines = [f"{name} ({dosage}) at {reminder_time}" for name, dosage, reminder_time, _ in pending]

    if has_any(message, ("medicine", "medication", "tablet", "pill")):
        return f"You should take:\n{format_lines(lines)}"

    return f"Your pending medications are:\n{format_lines(lines)}"


def answer_summary(memories, reminders, medications, contacts):
    pending_reminders = [row for row in reminders if normalize(row[3]) in ("pending", "")]
    pending_medications = [row for row in medications if normalize(row[3]) in ("pending", "")]

    return (
        "Here is your companion summary:\n"
        f"- Memories saved: {len(memories)}\n"
        f"- Pending reminders: {len(pending_reminders)}\n"
        f"- Pending medications: {len(pending_medications)}\n"
        f"- Emergency contacts: {len(contacts)}"
    )


def search_memories(message, memories):
    query_words = set(tokenize(message))

    if not query_words:
        return None

    best_memory = None
    best_score = 0

    for memory in memories:
        memory_words = set(tokenize(memory))
        score = len(query_words.intersection(memory_words))

        if score > best_score:
            best_score = score
            best_memory = memory

    if best_memory and best_score > 0:
        return f"According to your memory, {best_memory}"

    return None


@ai_bp.route("/ai/chat", methods=["POST"])
def ai_chat():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    message = normalize(data.get("message"))

    if not user_id:
        return jsonify({
            "success": False,
            "reply": "User is missing. Please log in again."
        }), 400

    if not message:
        return jsonify({
            "success": False,
            "reply": "Please ask me something."
        }), 400

    voice_reply = (
        create_memory_from_voice(user_id, message)
        or create_reminder_from_voice(user_id, message)
    )

    if voice_reply:
        return jsonify({
            "success": True,
            "reply": voice_reply
        })

    memories, reminders, medications, contacts = fetch_companion_context(user_id)

    if has_any(message, ("who am i", "what is my name", "tell me my name")):
        reply = answer_identity(memories)
    elif has_any(message, ("summary", "overview", "status", "dashboard")):
        reply = answer_summary(memories, reminders, medications, contacts)
    elif has_any(message, ("contact", "call", "emergency", "phone", "number")):
        reply = answer_contacts(message, contacts)
    elif has_any(message, ("reminder", "task", "appointment", "schedule", "today", "tomorrow")):
        reply = answer_reminders(message, reminders)
    elif has_any(message, ("medicine", "medication", "tablet", "pill", "dose", "dosage")):
        reply = answer_medications(message, medications)
    else:
        reply = search_memories(message, memories)

        if not reply:
            reply = (
                "I could not find that in your saved data. I can answer from your "
                "memories, reminders, medications, and emergency contacts without any paid AI API."
            )

    return jsonify({
        "success": True,
        "reply": reply
    })
