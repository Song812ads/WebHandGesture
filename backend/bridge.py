import signal
import queue
import threading
import time
import sys
sys.path.append("MQTT")
from MQTTSNclient import Callback
from MQTTSNclient import Client
#from MQTTSNclient import publish
import MQTTSN
from mqtt_client import MQTTClient as mqtt

message_q=queue.Queue()

class MyCallback(Callback):
  def on_message(self,client,TopicId,Topicname, payload, qos, retained, msgid):
    m= "Arrived" +" topic  " +str(TopicId)+ "message " +\
       str(payload) +"  qos= " +str(qos) +" ret= " +str(retained)\
       +"  msgid= " + str(msgid)
    print("got the message ",m)
    message_q.put(payload)
    try:
      if (not message_q.empty()):
        mess = message_q.get()
        print("Publishing message to RSMB", topic2_id, mess)
        bridge.pub(topic2,mess)
        pass
    except:
      print("Error")
      client.disconnect()
      client.loop_stop()
      bridge.dis()
    return True

######
def empty_queue(delay=0):
    while not message_q.empty():
      m=message_q.get()
      print("Received message  ",m)
    if delay!=0:
      time.sleep(delay)
########
if __name__=="__main__":
  try:
    host="192.168.67.128"
    port=1884
    client = Client("user")#change so only needs name
    client.message_arrived_flag=False
    client.registerCallback(MyCallback())
    print ("threads ",threading.activeCount()) 
    print("connecting ",host)
    client.connected_flag=False

    client.connect(host,port)

    client.lookfor(MQTTSN.CONNACK)
    try:
      if client.waitfor(MQTTSN.CONNACK)==None:
          print("connection failed")
          raise SystemExit("no Connection quitting")
    except:
      print("connection failed")
      raise SystemExit("no Connection quitting")
    client.loop_start() #start loop
    topic1="/t1"
    topic2="/t2"
    print("connected now subscribing")
    client.subscribed_flag=False
    q = queue.Queue()
    bridge = mqtt("bridge", q)
    bridge.sub(topic1)
    topic1_id,_ = client.register(topic1)

    while True:
      topic2_id,rc = client.subscribe(topic2,1)
      if rc==None:
        print("subscribe failed")
        raise SystemExit("Subscription failed quitting")
      if rc==0:
        print("subscribed ok to ",topic2)
        break

    try:
      while True:
        if (not q.empty()):
          mess = q.get()
          print("publishing message to Broker ",topic1_id,mess)
          id= client.publish(topic1_id,mess,qos=1)
    except:
      print ("Error")
      client.disconnect()
      client.loop_stop()
      bridge.dis()

    print ("threads ",threading.activeCount()) 
    print("disconnecting")
    client.disconnect()
    client.loop_stop()
    bridge.dis()

  except KeyboardInterrupt:
    client.disconnect()
    client.loop_stop()
    bridge.dis()