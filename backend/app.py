from flask import Flask,render_template,send_from_directory,send_file ,request, jsonify, redirect, url_for, make_response
from flask_cors import CORS, cross_origin
from mqtt_client import MQTTClient
import jwt
from datetime import datetime, timedelta
import json
from functools import wraps
from database import  Device,Sensor, Data, CRUD_DB, app, db
import tensorflow as tf
import numpy as np

# app = Flask(__name__)
app.config['SECRET_KEY'] = 'nhungngay0em'
cors = CORS(app, origins='*', X_Content_Type_Options= 'nosniff')
client = MQTTClient('user_web')

path = 'D:/contiki/doan/web_AI/hand-gesture/model'
class KeyPointClassifier(object):
    def __init__(
        self,
        model_path=path+'/keypoint_classifier/keypoint_classifier.tflite',
        num_threads=1,
    ):
        self.interpreter = tf.lite.Interpreter(model_path=model_path,
                                               num_threads=num_threads)

        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

    def __call__(
        self,
        landmark_list,
    ):
        input_details_tensor_index = self.input_details[0]['index']
        self.interpreter.set_tensor(
            input_details_tensor_index,
            np.array([landmark_list], dtype=np.float32))
        self.interpreter.invoke()

        output_details_tensor_index = self.output_details[0]['index']

        result = self.interpreter.get_tensor(output_details_tensor_index)

        result_index = np.argmax(np.squeeze(result))

        return result_index
    

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
        try:
            data = jwt.decode(token, app.secret_key, ["HS256"])
            auth = data.get('username')
            if auth!='song' and auth!='demo':
                print(auth)
                return jsonify({'message' : 'Invalid Token !!'}), 401
        except:
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        return  f(auth,*args, **kwargs)
    return decorated

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


@app.route('/check_user',methods=['GET'])
@token_required
def checkUser(auth):
    if auth:
        return jsonify({'user':auth}),200
    else:
        return jsonify('False'),401


@app.route('/fetch_graph', methods=['POST'])
@token_required
def fetch_graph(auth):
    data = request.get_json()
    device = data.get('device')
    date = data.get('date')
    # print(device)
    data = CRUD_DB('123', device)
    time_sensor = data.get_data_with_date(datetime.strptime(date, '%d-%m-%Y'))[0]
    data_sensor = data.get_data_with_date(datetime.strptime(date, '%d-%m-%Y'))[1].astype(int).tolist()
    time_sensei = [t.strftime('%H:%M') for t in time_sensor]
    response = {
        'time': time_sensei,
        'data': data_sensor
    }
    return jsonify(response)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    data = data.get('data')
    # print(data)
    pred = model(data)
    return json.dumps(pred, indent=2, default=int)


if __name__ == "__main__": 
    with app.app_context():
        model = KeyPointClassifier()
        db.create_all()
        app.run('localhost',8000, debug=True)
        