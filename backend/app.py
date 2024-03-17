from flask import Flask,render_template,send_from_directory,send_file ,request, jsonify, redirect, url_for, make_response
from flask_cors import CORS, cross_origin
import os
from mqtt_client import MQTTClient
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_required, login_user, current_user, logout_user
from  werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import json
from functools import wraps
from OpenSSL import SSL
import socket
# import tensorflowjs as tfjs
import ssl

app = Flask(__name__)
app.config['SECRET_KEY'] = 'nhungngay0em'
cors = CORS(app, origins='*', X_Content_Type_Options= 'nosniff')
login_manager = LoginManager()
login_manager.init_app(app)
context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
context.load_cert_chain('certificate.crt', 'privatekey.key')
client = MQTTClient('user_web')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'Authorization' in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        # return 401 if token is not passed
        if not token:
            return jsonify({'message' : 'Token is missing !!'}), 401
        # current_user = current_user
        try:
            data = jwt.decode(token, app.secret_key, ["HS256"])
            auth = data.get('username')
            if auth!='song' and auth!='demo':
                return jsonify({'message' : 'Invalid Token !!'}), 401
        except:
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        # returns the current logged in users context to the routes
        return  f(auth,*args, **kwargs)
    return decorated

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/topic', methods = ['POST'])
@token_required
def topic_handle(auth):
    data = request.json
    if auth == 'song':
        if client is None:
            return jsonify({'error': 'MQTT client not initialized'}), 500
        else:
            client.pub('/t1',data)
            client.pub('/t1','ok')
    return jsonify({'message': 'JSON data received'}), 200
#'D:/contiki/doan/web_AI/my-app/src/static/tfjsv2/group1-shard1of1.bin'
@app.route('/static/tfjsv2/model.json')
def serve_model():
    model_path = 'static/tfjsv2/model.json'
    return send_file(model_path, mimetype='application/json')

@app.route('/static/tfjsv2/group1-shard1of1.bin')
def serve_binary_weights():
    weights_path = 'static/tfjsv2/group1-shard1of1.bin'
    return send_file(weights_path, mimetype='application/octet-stream')

# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')  
# def serve(path):
#     if path != "" and os.path.exists(app.static_folder + '/' + path):
#         return send_from_directory(app.static_folder, path)
#     else:
#         return send_from_directory(app.static_folder, 'index.html')

@app.route('/log', methods = ['POST'])
def login():
    if request.method == "POST":
        data = jwt.decode(request.json,app.secret_key,["HS256"])
        username = data['username']
        password = data['password']
        if (username == None or password == None):
            print('here')
            return make_response(
                'Authorize fail',403,{'WWW-Authenticate' : 'Basic realm = "Login required" !!'}
            )
        if (username == 'demo' and password == 'demo') or (username == 'song' and password == 'song'):
            token = jwt.encode({
                'username': username
            },
            app.config['SECRET_KEY']
            ) 
            return make_response(jsonify({'token': token}),200)

        else:
            return make_response(
                'Authorize fail',403,{'WWW-Authenticate' : 'Basic realm = "Login required" !!'}
            )
        
    return make_response(
        'Could not verify',
        403,
        {'WWW-Authenticate' : 'Basic realm ="Wrong Password !!"'}
    )

@app.route('/logout', methods = ['GET'])
def logout():
    logout_user()
    return redirect(url_for('serve'))


@app.route('/check_user',methods=['GET'])
@token_required
def checkUser(auth):
    if auth:
        return jsonify('True'),200
    else:
        return jsonify('False'),401

@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('serve'))

if __name__ == "__main__":
    app.run(ssl_context = context)