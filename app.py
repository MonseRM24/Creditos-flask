from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Credito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(100), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    tasa_interes = db.Column(db.Float, nullable=False)
    plazo = db.Column(db.Integer, nullable=False)
    fecha_otorgamiento = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'cliente': self.cliente,
            'monto': self.monto,
            'tasa_interes': self.tasa_interes,
            'plazo': self.plazo,
            'fecha_otorgamiento': self.fecha_otorgamiento
        }

# Crear base de datos si no existe
if not os.path.exists('database.db'):
    with app.app_context():
        db.create_all()

# ---------------------------
# Rutas principales
# ---------------------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/creditos', methods=['GET'])
def get_creditos():
    creditos = Credito.query.all()
    return jsonify([c.to_dict() for c in creditos])

@app.route('/api/creditos', methods=['POST'])
def add_credito():
    data = request.json
    nuevo_credito = Credito(
        cliente=data['cliente'],
        monto=data['monto'],
        tasa_interes=data['tasa_interes'],
        plazo=data['plazo'],
        fecha_otorgamiento=data['fecha_otorgamiento']
    )
    db.session.add(nuevo_credito)
    db.session.commit()
    return jsonify({'message': 'Crédito registrado correctamente'}), 201

@app.route('/api/creditos/<int:id>', methods=['PUT'])
def update_credito(id):
    data = request.json
    credito = Credito.query.get_or_404(id)
    credito.cliente = data['cliente']
    credito.monto = data['monto']
    credito.tasa_interes = data['tasa_interes']
    credito.plazo = data['plazo']
    credito.fecha_otorgamiento = data['fecha_otorgamiento']
    db.session.commit()
    return jsonify({'message': 'Crédito actualizado correctamente'})

@app.route('/api/creditos/<int:id>', methods=['DELETE'])
def delete_credito(id):
    credito = Credito.query.get_or_404(id)
    db.session.delete(credito)
    db.session.commit()
    return jsonify({'message': 'Crédito eliminado correctamente'})

if __name__ == '__main__':
    app.run(debug=True)