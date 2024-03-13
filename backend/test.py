from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://admin:admin@localhost:4321/adminData'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

association_table = db.Table('association_table', db.Model.metadata,
                            db.Column('device_id', db.Integer,db.ForeignKey('device.id')),
                            db.Column('sensor_id', db.Integer, db.ForeignKey('sensor.id')),
                        )

class Device(db.Model):
    __tablename__ = "device"
    id = db.Column('id',db.Integer, primary_key=True)
    device_IP = db.Column('device_IP',db.String(64),  nullable=False, unique = True)
    def __repr__(self):
        return '<Post: {}>'.format(self.id)

class Sensor(db.Model):
    __tablename__ = "sensor"
    id = db.Column('id',db.Integer, primary_key=True)
    sensor_type = db.Column('sensor_type',db.String(64), nullable = False , unique = True)
    def __repr__(self):
        return '<Post: {}>'.format(self.id)

class Data(db.Model):
    __tablename__ = "data"
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column('device_id',db.Integer, db.ForeignKey('device.id'), unique=False)
    sensor_id = db.Column('sensor_id', db.Integer, db.ForeignKey('sensor.id'), unique = False)
    device = db.relationship("Device", backref = "deviceRef", foreign_keys = [device_id])
    sensor = db.relationship("Sensor", backref = "sensorRef", foreign_keys = [sensor_id])
    time = db.Column('time',db.DateTime, default=datetime.now())
    value = db.Column('value',db.Float)
    def __repr__(self):
        return '<Post: {}>'.format(self.id)


class CRUD_DB():
    def __init__(self, device_IP, sensor_type, date, value):
        self.device_IP = device_IP
        self.sensor_type = sensor_type
        self.date = date
        self.value = value 
        self.device = Device.query.filter_by(device_IP = device_IP).first()
        self.sensor = Sensor.query.filter_by(sensor_type = sensor_type).first()
        if self.device == None or self.sensor == None:
            self.device = Device(device_IP = device_IP)
            self.sensor = Sensor(sensor_type = sensor_type)

    def add(self):
        data = Data(device = self.device, sensor = self.sensor, time = self.date, value = self.value)
        db.session.add(data)
        db.session.commit()

    def clean_all(self):
        db.session.query(Data).delete()
        db.session.query(Device).delete()
        db.session.query(Sensor).delete()
        db.session.commit()
    

    
with app.app_context():
    db.create_all()
    check = CRUD_DB(device_IP="192.197.192.12", sensor_type="Led", date = datetime.now(), value = 12.3)
    check.add()
    # db.session.query
    
    # sensor = Sensor.query.get(sensor_type='Temperature')
    # device = Device.query.filter_by(id=7).first()
    # sensor = Sensor.query.filter_by(id = 4 ).first()

    # Create new instance of Data and associate with Device and Sensor
    # data = Data(device = device,sensor =  sensor, time=datetime.now(), value=27.5)
    # db.session.add(data)
    # data_to_update = Data.query.filter_by(id=1).first()
    # data_to_update.value = 25.9

    # db.session.add(data)
    # db.session.commit()

    # db.session.query(Data).delete()
    # db.session.query(Device).delete()
    # db.session.query(Sensor).delete()
    # db.session.commit()

# Close the session
    db.session.close()


