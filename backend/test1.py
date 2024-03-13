from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from test import Device, Sensor, Data, db  # Import your SQLAlchemy models and db instance
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Create a SQLAlchemy session
Session = sessionmaker(bind=db.engine)
session = Session()

# Create new instances of Device and Sensor
device = Device(device_IP='192.168.1.100')
sensor = Sensor(sensor_type='Temperature')

# Create new instance of Data and associate with Device and Sensor
data = Data(device=device, sensor=sensor, time=datetime.now(), value=25.5)
with app.app_context():
# Add the objects to the session and commit changes
    db.session.add(device)
    db.session.add(sensor)
    db.session.add(data)
    db.session.commit()

    # Close the session
    db.session.close()