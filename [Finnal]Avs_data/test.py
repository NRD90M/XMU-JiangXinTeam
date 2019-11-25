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

def moto_get_test():  # 启动测试
    bufout = [0x55, 0x08, 0x06, 0x00, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))
        

def Centrifugation(sp,tm):
    portName="/dev/deviceMOTO"
    ser = serial.Serial(port=portName,baudrate=9600)
    set_moto_time(ser,tm)
    set_moto_speed(ser,sp)
    moto_start(ser,0x01)
    ser.close()
        
moto_get_white()
