from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)  # habilita CORS para o frontend poder chamar a API

# Conexão com o MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["domus_db"]
despesas_collection = db["despesas"]

@app.route("/despesas", methods=["GET"])
def listar_despesas():
    despesas = []
    for despesa in despesas_collection.find():
        despesa["_id"] = str(despesa["_id"])
        despesas.append(despesa)
    return jsonify(despesas)

@app.route("/despesas", methods=["POST"])
def adicionar_despesa():
    data = request.get_json()
    despesas_collection.insert_one(data)
    return jsonify({"message": "Despesa adicionada com sucesso!"}), 201

@app.route("/despesas/<id>", methods=["DELETE"])
def excluir_despesa(id):
    result = despesas_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"message": "Despesa excluída!"}), 200
    else:
        return jsonify({"error": "Despesa não encontrada."}), 404

@app.route("/despesas/<id>", methods=["PUT"])
def editar_despesa(id):
    from bson import ObjectId
    data = request.get_json()
    result = despesas_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    if result.matched_count:
        return jsonify({"message": "Despesa atualizada!"}), 200
    else:
        return jsonify({"error": "Despesa não encontrada."}), 404

if __name__ == "__main__":
    app.run(debug=True)
