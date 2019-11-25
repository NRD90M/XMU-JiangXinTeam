import os
import requests
import json
import matplotlib.pyplot as plt
import serial
import time

def set_moto_speed(ser,sp):  # 设置转速
    bufout = []
    bufout.append(0x55)
    bufout.append(0x08)
    bufout.append(0x01)
    bufout.append((sp >> 8) & 0xFF)
    bufout.append(sp & 0xFF)
    bufout.append(0x07)
    bufout.append(0x66)
    for j in bufout:
        ser.write(bytes([j]))

def set_moto_time(ser,tm):  # 设置时间
    bufout = []
    bufout.append(0x55)
    bufout.append(0x08)
    bufout.append(0x02)
    bufout.append((tm >> 8) & 0xFF)
    bufout.append(tm & 0xFF)
    bufout.append(0x07)
    bufout.append(0x66)
    for j in bufout:
        ser.write(bytes([j]))


def moto_start(ser,on):  # 启停
    bufout = [0x55, 0x08, 0x03, on, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))


def moto_get_white():  # 1 step
    portName="/dev/deviceMOTO"
    ser = serial.Serial(port=portName,baudrate=9600)
    bufout = [0x55, 0x08, 0x07, 0x00, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))
    ser.close()

def moto_get_test(ser):  # 11 step
    bufout = [0x55, 0x08, 0x06, 0x00, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))
        
def Centrifugation(sp,tm):
    portName="/dev/deviceMOTO"
    ser = serial.Serial(port=portName,baudrate=9600)
    set_moto_speed(ser,0x0f)
    set_moto_time(ser,0x0f)
    moto_start(ser,0x01)
    time.sleep(tm)
    moto_start(ser,0x00)
    ser.close()
        
def trans_data_to_app(Ldata,Wdata,Bdata,T1data,T2data,T3data,T4data,T5data,T6data,T7data,T8data,T9data,T10data,T11data): #data为list类型
    headers = {'Content-Type': 'application/json'} # headers中添加上content-type这个参数，指定为json格式
    dict_data={}
    for i in range(len(Wdata)):
        dict_data["Wdata"+str(i)] = Wdata[i]
    for i in range(len(Bdata)):
        dict_data["Bdata"+str(i)] = Bdata[i]
    for i in range(len(Ldata)):
        dict_data["Ldata"+str(i)] = Ldata[i]
    for i in range(len(T1data)):
        dict_data["T1data"+str(i)] = T1data[i]
    for i in range(len(T2data)):
        dict_data["T2data"+str(i)] = T2data[i]
    for i in range(len(T3data)):
        dict_data["T3data"+str(i)] = T3data[i]
    for i in range(len(T4data)):
        dict_data["T4data"+str(i)] = T4data[i]
    for i in range(len(T5data)):
        dict_data["T5data"+str(i)] = T5data[i]
    for i in range(len(T6data)):
        dict_data["T6data"+str(i)] = T6data[i]
    for i in range(len(T7data)):
        dict_data["T7data"+str(i)] = T7data[i]
    for i in range(len(T8data)):
        dict_data["T8data"+str(i)] = T8data[i]       
    for i in range(len(T9data)):
        dict_data["T9data"+str(i)] = T9data[i]
    for i in range(len(T10data)):
        dict_data["T10data"+str(i)] = T10data[i]
    for i in range(len(T11data)):
        dict_data["T11data"+str(i)] = T11data[i]       
    ret = requests.post(url='http://localhost:80/get_data_from_pi', headers=headers, data=json.dumps(dict_data)).text
    moto_get_white()
    return ret

def trans_WB_data_to_app(Wdata,Bdata): #data为list类型
    headers = {'Content-Type': 'application/json'} # headers中添加上content-type这个参数，指定为json格式
    dict_data={}
    for i in range(len(Wdata)):
        dict_data["Wdata"+str(i)] = Wdata[i]
    for i in range(len(Bdata)):
        dict_data["Bdata"+str(i)] = Bdata[i]
    ret = requests.post(url='http://localhost:80/get_data_from_pi', headers=headers, data=json.dumps(dict_data)).text
    return ret

def reset_request():
    headers = {'Content-Type': 'application/json'} # headers中添加上content-type这个参数，指定为json格式
    reset_dict={"reset":1}
    ret = requests.post(url='http://localhost:80/get_data_from_pi', headers=headers, data=json.dumps(reset_dict)).text
    return ret

while True:
    try:
        measure_comd = requests.get("http://localhost:80/api/pi_M/jay").content.decode('UTF-8')  # 获取控制命令
        wash_comd = requests.get("http://localhost:80/pi_wash/jay").content.decode('UTF-8')  # 获取控制命令
        white_comd = requests.get("http://localhost:80/api/pi_white/jay").content.decode('UTF-8')  # 获取控制命令
        print("measure_comd:",measure_comd)
        print("wash_comd:",wash_comd)
        print("white_comd",white_comd)

        if measure_comd == "M_1":
            #print(os.system("sudo ./testavs"))
            path1='./fuzhi.txt'
            path2='./bochang.txt'
            path3='./Light_Dark.txt'
            WB_lamda=[]
            Wdata=[]
            Bdata=[]
            y1=[]
            y2=[]
            y3=[]
            y4=[]
            y5=[]
            y6=[]
            y7=[]
            y8=[]
            y9=[]
            y10=[]
            y11=[]
            x=[]
            n=0
            with open(path1,'r') as f:
                for line in f:                
                    if n < 2048:
                        y1.append(float(line.strip()))   
                    if n >= 2048 and  n < 2048*2:
                        y2.append(float(line.strip()))
                    if n >= 2048*2 and n < 2048*3:
                        y3.append(float(line.strip()))
                    if n >= 2048*3 and n < 2048*4:
                        y4.append(float(line.strip()))
                    if n >= 2048*4 and n < 2048*5:
                        y5.append(float(line.strip()))
                    if n >= 2048*5 and n < 2048*6:
                        y6.append(float(line.strip()))
                    if n >= 2048*6 and n < 2048*7:
                        y7.append(float(line.strip()))
                    if n >= 2048*7 and n < 2048*8:
                        y8.append(float(line.strip()))
                    if n >= 2048*8 and n < 2048*9:
                        y9.append(float(line.strip()))
                    if n >= 2048*9 and n < 2048*10:
                        y10.append(float(line.strip()))
                    if n >= 2048*10 and n < 2048*11:
                        y11.append(float(line.strip()))
                    n+=1               
            with open(path2,'r') as f:
                for line in f:
                    x.append(float(line.strip()))
                    
            WB_lamda=[]
            Wdata=[]
            Bdata=[]
            n=0
            with open(path3,'r') as f:
                for line in f:                
                    if n < 2048:
                        WB_lamda.append(float(line.strip()))   
                    if n >= 2048 and  n < 2048*2:
                        Wdata.append(float(line.strip()))
                    if n >= 2048*2 and n < 2048*3:
                        Bdata.append(float(line.strip()))
                    n+=1
            print(trans_data_to_app(x,Wdata,Bdata,y1,y2,y3,y4,y5,y6,y7,y8,y9))

        if wash_comd == "wash_1":
            print("washing...")
            #Centrifugation(0x0f,5)
            print(reset_request())
            
        if white_comd == "white_1":
            #print(os.system("sudo ./Light_Dark"))
            print(reset_request())
    except:
        print("error")
