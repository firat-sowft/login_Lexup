import os
from flask import Flask, request, jsonify, render_template
from flask_mail import Mail, Message
from flask_cors import CORS
from pymongo import MongoClient
import datetime
import random
import string

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

app.config['MONGO_URI'] = os.getenv('MONGO_URI')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)
client = MongoClient(app.config['MONGO_URI'])
db = client.get_database('test')

def generate_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    email = request.json['email']
    if not db.users.find_one({"email": email}):
        verification_code = generate_verification_code()
        db.verification_codes.insert_one({
            "email": email,
            "code": verification_code,
            "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        })
        msg = Message('Verification Code', sender=app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f'Your verification code is {verification_code}'
        mail.send(msg)
        return jsonify({'message': 'Verification code sent'})
    else:
        return jsonify({'message': 'Email already registered'}), 400

@app.route('/send_forgot_password_code', methods=['POST'])
def send_forgot_password_code():
    email = request.json['email']
    if db.users.find_one({"email": email}):
        verification_code = generate_verification_code()
        db.verification_codes.insert_one({
            "email": email,
            "code": verification_code,
            "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        })
        msg = Message('Verification Code', sender=app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f'Your verification code is {verification_code}'
        mail.send(msg)
        return jsonify({'message': 'Verification code sent'})
    else:
        return jsonify({'message': 'Email not found'}), 404

@app.route('/verify_code', methods=['POST'])
def verify_code():
    email = request.json['email']
    code = request.json['code']
    record = db.verification_codes.find_one({"email": email, "code": code})
    if record and record['expires_at'] > datetime.datetime.utcnow():
        return jsonify({'message': 'Code verified'})
    else:
        return jsonify({'message': 'Invalid or expired code'}), 400

@app.route('/register', methods=['POST'])
def register():
    email = request.json['email']
    password = request.json['password']
    if db.users.find_one({"email": email}):
        return jsonify({'message': 'Email already registered'}), 400
    db.users.insert_one({"email": email, "password": password})
    return jsonify({'message': 'User registered'})

@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    user = db.users.find_one({"email": email, "password": password})
    if user:
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'message': 'Invalid email or password'}), 400

@app.route('/reset_password', methods=['POST'])
def reset_password():
    email = request.json['email']
    code = request.json['code']
    new_password = request.json['new_password']
    record = db.verification_codes.find_one({"email": email, "code": code})
    if record and record['expires_at'] > datetime.datetime.utcnow():
        db.users.update_one({"email": email}, {"$set": {"password": new_password}})
        db.verification_codes.delete_one({"email": email, "code": code})
        return jsonify({'message': 'Password reset successful'})
    else:
        return jsonify({'message': 'Invalid or expired code'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
