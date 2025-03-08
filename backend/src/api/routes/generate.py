from flask import Blueprint, jsonify

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/generate", methods=["POST", "PUT"])
def generate_simulation_config():
    return jsonify({"message": "Not implemented."}), 501