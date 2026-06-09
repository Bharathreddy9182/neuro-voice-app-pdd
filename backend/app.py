from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.reminders import reminders_bp
from routes.dashboard import dashboard_bp
from routes.memories import memories_bp
from routes.ai import ai_bp
from routes.medications import medications_bp
from routes.emergency_contacts import contacts_bp
from routes.profile import profile_bp
from routes.caretakers import caretakers_bp
app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(reminders_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(memories_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(medications_bp)
app.register_blueprint(contacts_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(caretakers_bp)
@app.route("/")
def home():
    return {
        "project": "Neuro Voice Companion",
        "status": "Running"
    }

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
