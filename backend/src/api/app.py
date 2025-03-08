from flask import Flask
from api.routes.results import results_bp
from api.routes.create import create_bp
from api.routes.generate import generate_bp

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

app.register_blueprint(results_bp, url_prefix="/sim")
app.register_blueprint(create_bp, url_prefix="/sim")
app.register_blueprint(generate_bp, url_prefix="/sim")