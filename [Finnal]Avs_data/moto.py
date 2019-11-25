#---V1.0---#
import random
import time
import serial

portName="/dev/deviceMOTO"
ser = serial.Serial(port=portName,baudrate=9600)
def set_moto_speed(sp):  # 设置转速
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

def set_moto_time(tm):  # 设置时间
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


def moto_start(on):  # 启停
    bufout = [0x55, 0x08, 0x03, on, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))


def moto_get_white():  # 白参考
    bufout = [0x55, 0x08, 0x05, 0x00, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))

def moto_get_test():  # 启动测试
    bufout = [0x55, 0x08, 0x06, 0x00, 0x00, 0x07, 0x66]
    for j in bufout:
        ser.write(bytes([j]))


def Centrifugation(sp,tm):
    portName="/dev/deviceMOTO"
    ser = serial.Serial(port=portName,baudrate=9600)
    #set_moto_speed(ser,0x14)
    set_moto_time(ser,0x0f)
    moto_start(ser,0x01)
    time.sleep(tm)
    moto_start(ser,0x00)
    ser.close()


if __name__ == '__main__':
    set_moto_time(0x01)
    moto_start(0x01)
    time.sleep(2)
    moto_start(0x00)
