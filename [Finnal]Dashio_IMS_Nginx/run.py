# -*- coding: utf-8 -*-
import time
import math
import os
import traceback
import json
import random
import datetime
from flask import Flask, flash, abort, safe_join, send_file, make_response, render_template, jsonify, escape, request, redirect, url_for, session
from flask_admin import Admin, BaseView, expose, AdminIndexView
from flask_admin.contrib.fileadmin import FileAdmin
from flask_admin.contrib.sqla import ModelView
from flask_login import UserMixin, current_user, login_user, logout_user, LoginManager, login_required,AnonymousUserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session

from reflect import *
import sys

###########################################################
###########################################################
from werkzeug.serving import run_simple
import threading
import uuid
import time
import lightgbm as lgb
import numpy as np
from find_small import*


def LoadModel(model_file = './model/model_lgb_poct_1_.txt'):
    #print(f'Loading model@\'{model_file}\' to predict...')
    model = lgb.Booster(model_file=model_file)
    print("\n====================lgb_model={}".format(model))
    return model
'''
格式
age  CA153     CA199  CYFRA211    CA724     CA125  NSE       PSA  SCCA  HE4      AFP.  CA211  sex
66.0    NaN  3.439456       NaN  0.48858       NaN  NaN       NaN   NaN  NaN       NaN    NaN    0
'''
def json2ndarray(json_data):
    i,features=0,['age','CA153', 'CA199', 'CYFRA211',  'CA724', 'CA125',  'NSE', 'PSA', 'SCCA','HE4','AFP.', 'CA211','sex']
    map={}
    arr=np.ndarray((1,len(features)))
    arr[:,:] = np.NAN
    for feat in features:
        map[feat]=i
        i=i+1
    for item in json_data:
        if item in features:
            no = map[item]
            arr[0,no]=float(json_data[item])
        else:

            pass
    return arr
def SomeTest():
    lgb_model = LoadModel()
    #record = {'age': 66, 'sex': 0, 'status': -1000}
    record = {'age': 47, 'sex': 1, 'AFP.': 0.837248}
    #record['CA199'] = 3.439456
    #record['CA724'] = 0.488580
    test=json2ndarray(record)
    pred_test = lgb_model.predict(test)
    print(">>>> detect={}......".format(pred_test))

###########################################################
###########################################################


#data_show=read_data()
db = SQLAlchemy()
class USERS(db.Model, UserMixin):
    __tablename__ = 'USERS'
    id = db.Column(db.Integer, primary_key=True)
    USERNAME = db.Column(db.Text, unique=True, nullable=False)
    PASSWORD = db.Column(db.Text, nullable=False)
    DATA = db.Column(db.Text)
    GROUP = db.Column(db.Text)
    M_DATA = db.Column(db.Text)
    W_B = db.Column(db.Text)
    WASH_DATA = db.Column(db.Text)

    def get_id(self):
        return self.USERNAME

    def __init__(self, USERNAME='', PASSWORD='', DATA='', GROUP='',M_DATA='',W_B='',WASH_DATA=''):
        self.USERNAME = USERNAME
        self.PASSWORD = PASSWORD
        self.DATA = DATA
        self.GROUP = GROUP
        self.M_DATA = M_DATA
        self.W_B = W_B
        self.WASH_DATA = WASH_DATA

    def __repr__(self):
        return '<%s,%s>' % (self.USERNAME, self.DATA)   # 内置的方法 可以打印对象


class USERS_view(ModelView):
    can_delete = True
    can_edit = True
    can_create = True
    can_view_details = True
    export_max_rows = 0
    can_export = True
    export_types = ['xls', 'yaml', 'csv', 'json']
    create_modal = False
    edit_modal = False

    def is_accessible(self):
        if current_user.is_authenticated:
            return True
        else:
            return False


app = Flask(__name__)
app.config["SECRET_KEY"] = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///USER_INFO.db'
#app.config['PERMANENT_SESSION_LIFETIME']='1000'
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = '_tmp/flask_session'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(days=1)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True
Session(app)

db.init_app(app)


login_manager = LoginManager()
login_manager.session_protection = None
login_manager.init_app(app)

@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/about_myself', methods=['GET', 'POST'])
def aboutMyself():
    return render_template('about_myself.html')



def render(html,viewing, data={}):
    _dict = {
        'username': 'jay',
        'password': '123',
        'email': '123',
        'viewing': viewing
    }
    return render_template(html, **_dict)


@app.route('/medical_tips', methods=['GET'])
def medical_tips():
    return render('medical_tips.html','tips')


@app.route('/board', methods=['GET'])
def board():
    return render('board.html','news')


@app.route('/panel', methods=['GET'])
def panel():
    return render('panel.html','panel')

@app.route('/panel_input/<state>', methods=['GET'])
def panel_input(state=None):
    user = USERS.query.filter_by(USERNAME='jay').first()
    user.DATA = state
    db.session.commit()
    return 'ok1'

@app.route('/panel_input_motor/<state>', methods=['GET'])
def panel_input_motor(state=None):
    user = USERS.query.filter_by(USERNAME='jay').first()
    user.M_DATA = state
    db.session.commit()
    return 'ok2'

@app.route('/api/pi_M/', methods=['GET'])
def api_pi(username=None):
    global DEVICE_online_flag
    DEVICE_online_flag = 1                      #判断设备是否在线
    user = USERS.query.filter_by(USERNAME='jay').first()
    return user.M_DATA


@app.route('/panel_input_white/<state>', methods=['GET'])
def panel_input_white(state=None):
    user = USERS.query.filter_by(USERNAME='jay').first()
    user.W_B = state
    db.session.commit()
    return 'ok3'

@app.route('/api/pi_white/', methods=['GET'])
def pi_white():
    user = USERS.query.filter_by(USERNAME='jay').first()
    return user.W_B

@app.route('/panel_input_wash/<state>', methods=['GET'])
def panel_input_wash(state=None):
    user = USERS.query.filter_by(USERNAME='jay').first()
    user.WASH_DATA = state
    db.session.commit()
    return 'ok4'

@app.route('/api/pi_wash/', methods=['GET'])
def pi_wash(username=None):
    user = USERS.query.filter_by(USERNAME='jay').first()
    return user.WASH_DATA






@app.route('/chart_dark', methods=['GET'])
def chart_dark():
    return render('chart_dark.html','chart')

@app.route('/chart_light', methods=['GET'])
def chart_light():
    return render('chart_light.html','chart')


@app.route('/chart_menu', methods=['GET'])
def chart_menu():
    return render('chart_menu.html','chart_menu')



@app.route('/chart', methods=['GET'])
def chart():
    return render('chart.html','chart')


@app.route('/shop', methods=['GET'])
def shop():
    return render('shop.html','shop')


@app.route('/camera', methods=['GET'])
def camera():
    return render_template('camera.html')

@app.route('/panel_2', methods=['GET'])
def panel_2():
    return render_template('panel_2.html')


@app.route('/chartjs', methods=['GET'])
def chartjs():
    return render_template('chartjs.html')

@app.route('/chat',methods=['GET','POST'])
def mychat():
    return render('chat.html', 'chat')

@app.route('/case1',methods=['GET','POST'])
def case1():
    return render('case1.html', 'panel')

@app.route('/case2',methods=['GET','POST'])
def case2():
    return render('case2.html', 'panel')

@app.route('/case3',methods=['GET','POST'])
def case3():
    return render('case3.html', 'panel')

@app.route('/case4',methods=['GET','POST'])
def case4():
    return render('case4.html', 'panel')


@app.route('/reflect',methods=['GET','POST'])
def reflect():
    return render('reflect.html', 'panel')


@app.route('/AI_predict', methods=['GET','POST'])              #AI预测
def AI_predict():
    return render('AI_predict.html','panel')



Wdata=[]
Bdata=[]
T1data=[]
Ldata=[]
T2data=[]
T3data=[]
T4data=[]
T5data=[]
T6data=[]
T7data=[]
T8data=[]
T9data=[]
T10data=[]
T11data=[]
min_and_max=[]



##############################################################################################
new_data_arrived_flag=0                #新数据到来标志位
DEVICE_online_flag=0                   #设备在线标志位
# #############################################################################################
# #############################################################################################
# path1 = './fuzhi.txt'
# path2 = './bochang.txt'
# path3 = './Light_Dark.txt'
# n = 0
# with open(path1, 'r') as f:
#     for line in f:
#         if n < 2048:
#             T1data.append(float(line.strip()))
#         if n >= 2048 and n < 2048 * 2:
#             T2data.append(float(line.strip()))
#         if n >= 2048 * 2 and n < 2048 * 3:
#             T3data.append(float(line.strip()))
#         if n >= 2048 * 3 and n < 2048 * 4:
#             T4data.append(float(line.strip()))
#         if n >= 2048 * 4 and n < 2048 * 5:
#             T5data.append(float(line.strip()))
#         if n >= 2048 * 5 and n < 2048 * 6:
#             T6data.append(float(line.strip()))
#         if n >= 2048 * 6 and n < 2048 * 7:
#             T7data.append(float(line.strip()))
#         if n >= 2048 * 7 and n < 2048 * 8:
#             T8data.append(float(line.strip()))
#         if n >= 2048 * 8 and n < 2048 * 9:
#             T9data.append(float(line.strip()))
#         if n >= 2048 * 9 and n < 2048 * 10:
#             T10data.append(float(line.strip()))
#         if n >= 2048 * 10 and n < 2048 * 11:
#             T11data.append(float(line.strip()))
#         n += 1
# with open(path2, 'r') as f:
#     for line in f:
#         Ldata.append(float(line.strip()))
#     print (Ldata)
# n = 0
# with open(path3, 'r') as f:
#     for line in f:
#
#         if n >= 2048 and n < 2048 * 2:
#             Wdata.append(float(line.strip()))
#         if n >= 2048 * 2 and n < 2048 * 3:
#             Bdata.append(float(line.strip()))
#         n += 1
# new_data_flag=1
# new_data_flag_2=1
# new_data_flag_3=1
#############################################################################################
#############################################################################################
#############################################################################################
@app.route('/get_data_from_pi', methods=['POST','GET'])
def get_data_from_pi():
    global new_data_flag
    global new_data_flag_2
    global new_data_flag_3
    global new_data_arrived_flag
    global Wdata
    global Bdata
    global T1data
    global Ldata
    global T2data
    global T3data
    global min_and_max
    global T4data
    global T5data
    global T6data
    global T7data
    global T8data
    global T9data
    global T10data
    global T11data


    #if request.method == "POST":
    user = USERS.query.filter_by(USERNAME='jay').first()

    db.session.commit()

    min_and_max=[]
    Wdata=[]
    Bdata=[]
    Ldata=[]
    T1data=[]
    T2data=[]
    T3data=[]
    T4data=[]
    T5data=[]
    T6data=[]
    T7data=[]
    T8data=[]
    T9data=[]
    # T10data=[]
    # T11data=[]
    
    #Wdata
    try:
        for i in range(2048):
            index='Wdata'+str(i)
            Wdata.append(request.get_json()[index])
    except:
        if len(Wdata)==2048:
            pass
        else:
            Wdata=2048*[0]
    #Bdata
    try:
        for i in range(2048):
            index='Bdata'+str(i)
            Bdata.append(request.get_json()[index])
    except:
        if len(Bdata)==2048:
            pass
        else:
            Bdata=2048*[0]
    #Ldata
    try:
        for i in range(2048):
            index='Ldata'+str(i)
            Ldata.append(request.get_json()[index])
    except:
        if len(Ldata)==2048:
            pass
        else:
            Ldata=2048*[0]
    #T1data
    try:
        for i in range(2048):
            index='T1data'+str(i)
            T1data.append(request.get_json()[index])
    except:
        if len(T1data)==2048:
            pass
        else:
            T1data=2048*[0]
    #T2data
    try:
        for i in range(2048):
            index='T2data'+str(i)
            T2data.append(request.get_json()[index])
    except:
        if len(T2data)==2048:
            pass
        else:
            T2data=2048*[0]
    #T3data
    try:
        for i in range(2048):
            index='T3data'+str(i)
            T3data.append(request.get_json()[index])
    except:
        if len(T3data)==2048:
            pass
        else:
            T3data=2048*[0]
    #T4data
    try:
        for i in range(2048):
            index='T4data'+str(i)
            T4data.append(request.get_json()[index])
    except:
        if len(T4data)==2048:
            pass
        else:
            T4data=2048*[0]
    #T5data
    try:
        for i in range(2048):
            index='T5data'+str(i)
            T5data.append(request.get_json()[index])
    except:
        if len(T5data)==2048:   
            pass
        else:
            T5data=2048*[0]
    #T6data
    try:
        for i in range(2048):
            index='T6data'+str(i)
            T6data.append(request.get_json()[index])
    except:
        if len(T6data)==2048:
            pass
        else:
            T6data=2048*[0]
    #T7data
    try:
        for i in range(2048):
            index='T7data'+str(i)
            T7data.append(request.get_json()[index])
    except:
        if len(T7data)==2048:
            pass
        else:    
            T7data=2048*[0]
    #T8data
    try:
        for i in range(2048):
            index='T8data'+str(i)
            T8data.append(request.get_json()[index])
    except:
        if len(T8data)==2048:
            pass
        else:
            T8data=2048*[0]
    #T9data
    try:
        for i in range(2048):
            index='T9data'+str(i)
            T9data.append(request.get_json()[index])
    except:
        if len(T9data)==2048:
            pass
        else:
            T9data=2048*[0]
    # #T10data
    # try:
    #     for i in range(2048):
    #         index='T10data'+str(i)
    #         T10data.append(request.get_json()[index])
    # except:
    #     if len(T10data)==2048:
    #         pass
    #     else:
    #         T10data=2048*[0]
    # #T11data
    # try:
    #     for i in range(2048):
    #         index='T11data'+str(i)
    #         T11data.append(request.get_json()[index])
    # except:
    #     if len(T11data)==2048:
    #         pass
    #     else:
    #         T11data=2048*[0]
    
    Wdata_min=min(Wdata)
    Bdata_min=min(Bdata)
    T1data_min=min(T1data)
    T2data_min=min(T2data)
    T3data_min=min(T3data)
    T4data_min=min(T4data)
    T5data_min=min(T5data)
    T6data_min=min(T6data)
    T7data_min=min(T7data)
    T8data_min=min(T8data)
    T9data_min=min(T9data)
    # T10data_min=min(T10data)
    # T11data_min=min(T11data)
    #Ldata_min=min(Ldata)

    all_min=[]
    all_min.append(Wdata_min)
    all_min.append(Bdata_min)
    all_min.append(T1data_min)
    all_min.append(T2data_min)
    all_min.append(T3data_min)
    all_min.append(T4data_min)
    all_min.append(T5data_min)
    all_min.append(T6data_min)
    all_min.append(T7data_min)
    all_min.append(T8data_min)
    all_min.append(T9data_min)
    # all_min.append(T10data_min)
    # all_min.append(T11data_min)
    #all_min.append(Ldata_min)


    Wdata_max=max(Wdata)
    Bdata_max=max(Bdata)
    T1data_max=max(T1data)
    T2data_max=max(T2data)
    T3data_max=max(T3data)
    T4data_max=max(T4data)
    T5data_max=max(T5data)
    T6data_max=max(T6data)
    T7data_max=max(T7data)
    T8data_max=max(T8data)
    T9data_max=max(T9data)
    # T10data_max=max(T10data)
    # T11data_max=max(T11data)
    #Ldata_max=max(Ldata)

    all_max=[]

    all_max.append(Wdata_max)
    all_max.append(Bdata_max)
    all_max.append(T1data_max)
    all_max.append(T2data_max)
    all_max.append(T3data_max)
    all_max.append(T4data_max)
    all_max.append(T5data_max)
    all_max.append(T6data_max)
    all_max.append(T7data_max)
    all_max.append(T8data_max)
    all_max.append(T9data_max)
    # all_max.append(T10data_max)
    # all_max.append(T11data_max)
    #all_max.append(Ldata_max)
    
    if int(min(all_min)) == 0:
        min_and_max.append(int(min(all_min)))
        min_and_max.append(int(max(all_max)))
    else:
        min_and_max.append(int(min(all_min))-10)
        min_and_max.append(int(max(all_max))+10)

    new_data_flag=1
    new_data_flag_2=1
    new_data_flag_3=1
    new_data_arrived_flag=1
    #print(Ldata)
    #print(min_and_max)
    return 'ok'



index= 0
new_data_flag=0
@app.route('/realtime_data', methods=['GET'])
def realtime_data():
    global Wdata
    global index
    global Bdata
    global T1data
    global T2data
    global T3data
    global T4data
    global T5data
    global T6data
    global T7data
    global T8data
    global T9data
    global T10data
    global T11data
    global new_data_flag
    global min_and_max
    a_null=[]



    L_list=[T1data,
        T2data,
        T3data,
        T4data,
        T5data,
        T6data,
        T7data,
        T8data,
        T9data]

    avg_index,min_index,max_index = find_index([T1data,T2data,T3data,T4data,T5data,T6data,T7data,T8data,T9data],Ldata)
    print(min_index,max_index)



    if new_data_flag==1:
        return jsonify([
            Ldata,
            Wdata,
            Bdata,
            L_list[min_index],     #good data for three tag
            L_list[max_index]
            # T7data,
        ])
    else:
        return jsonify([
            a_null,
            a_null,
            a_null,
            a_null,
            a_null,
            #a_null,
        ])



index_2= 0
new_data_flag_2=0
@app.route('/realtime_data_2', methods=['GET'])
def realtime_data_2():

    boGu1=614.3
    boGu2=719.9
    global index_2
    global new_data_flag_2
    global Wdata
    global index
    global Bdata
    global T1data
    global T2data
    global T3data
    global T4data
    global T5data
    global T6data
    global T7data
    global T8data
    global T9data
    global T10data

    # F1_ref=2
    # F1_mes=3
    # F2_ref=4
    # F2_mes=5
    # F3_ref=10
    # F3_mes=9
    b_null=0

    # L_T3=get_min_lamda(T3data,Ldata)       #6%  candy
    # L_T5=get_min_lamda(T5data,Ldata)       #20% candy
    # L_T7=get_min_lamda(T7data,Ldata)       #20% nacl

    L_list=[T1data,
            T2data,
            T3data,
            T4data,
            T5data,
            T6data,
            T7data,
            T8data,
            T9data]
    L_avg,L_min,L_max = find___(L_list,Ldata)

    print(L_avg,L_min,L_max)
    # F1_mes=content(11.25,-68.875,L_min,L_avg)
    # F2_mes=content(11.25,-68.875,L_max,L_avg)
    #F3_mes=content(0.6523,10.59,L_T7,716)
    F3_mes=0

    # F1_mes=0
    # F2_mes=0
    # F3_mes=0

    F1_ref=5
    F2_ref=60
    F3_ref=20


    if request.args.get("case")=="1":                   #case1 的数据
        F1_mes=content(11.25,-68.875,L_min,L_avg)
        F2_mes=content(11.25,-68.875,L_max,L_avg)
        if new_data_flag_2 == 1:
            return jsonify([
                index_2,
                F1_ref,
                F1_mes,
                F2_ref,
                F2_mes,
                # F3_ref,
                # F3_mes,
            ])
        else:
            return jsonify([
                index_2,
                b_null,
                b_null,
                b_null,
                b_null,
                # b_null,
                # b_null,
            ])
    if request.args.get("case")=="2":                   #case2 的数据
        F1_mes=content(2.8247,-0.0825,L_min,L_avg)
        F2_mes=content(2.8247,-0.0825,L_max,L_avg)
        if new_data_flag_2 == 1:
            return jsonify([
                index_2,
                F1_ref,
                F1_mes,
                F2_ref,
                F2_mes,
                # F3_ref,
                # F3_mes,
            ])
        else:
            return jsonify([
                index_2,
                b_null,
                b_null,
                b_null,
                b_null,
                # b_null,
                # b_null,
            ])
    if request.args.get("case")=="3":                   #case3 的数据
        return jsonify([
            Ldata,
            Wdata,
            Bdata,
            T3data,     #good data for three tag
            T5data,
            T7data,
            boGu1,
            boGu2,
        ])



index_3= 0
new_data_flag_3=0
@app.route('/realtime_data_reflect', methods=['GET'])
def realtime_data_reflect():
    global index_3
    global new_data_flag_3
    global Ldata
    global Bdata
    global Wdata
    global T1data
    global T2data
    global T3data
    global T4data
    global T5data
    global T6data
    global T7data
    global T8data
    global T9data



    L_list=[T1data,
            T2data,
            T3data,
            T4data,
            T5data,
            T6data,
            T7data,
            T8data,
            T9data]
    # L_list_13=[T1data,T2data,T3data]
    # L_list_46=[T4data,T5data,T6data]
    # L_list_79=[T7data,T8data,T9data]

    avg_index,min_index,max_index = find_index([T1data,T2data,T3data,T4data,T5data,T6data,T7data,T8data,T9data],Ldata)
    print(min_index,max_index)

    c_null=[]
    T3_reflect=reflect__(L_list[min_index],Wdata,Bdata)
    T5_reflect=reflect__(L_list[max_index],Wdata,Bdata)

    print(T3_reflect,T5_reflect)
    T7_reflect=reflect__(L_list[avg_index],Wdata,Bdata)



    if new_data_flag_3==1:
        return jsonify([
            Ldata,
            T3_reflect,
            T5_reflect,
            T7_reflect,
        ])
    else:
        return jsonify([
            index_3,
            c_null,
            c_null,
            c_null,
        ])
    # if new_data_flag_3==1:
    #     return jsonify([
    #         Ldata,
    #         T3_reflect,
    #         T5_reflect,
    #         T7_reflect,
    #     ])
    # else:
    #     return jsonify([
    #         index_3,
    #         c_null,
    #         c_null,
    #         c_null,
    #     ])

##############################################################
##############################################################
##############################################################
@app.route('/AI1', methods=['GET'])
def AI1():
   # time.sleep(1)
    pre_name=request.args.get("name")
    if pre_name == "1":
        lgb_model = LoadModel()
        record = {'age': 50, 'sex': 1, 'CA199': 2.469793, 'CA125': 2.230014, 'HE4': 3.492865}
        # record['CA199'] = 3.439456
        # record['CA724'] = 0.488580
        test = json2ndarray(record)
        pred_test = lgb_model.predict(test)
    if pre_name == "2":
        lgb_model = LoadModel()
        # record = {'age': 66, 'sex': 0, 'status': -1000}
        record = {'age': 64, 'sex': 1, 'CA199':2.805782, 'CYFRA211':1.423108,'CA724': 0.837248,'CA724':1.329724,'CA125':2.714695,'NSE':0.897719,'SCCA':0.403463}
        # record['CA199'] = 3.439456
        # record['CA724'] = 0.488580
        test = json2ndarray(record)
        pred_test = lgb_model.predict(test)
    if pre_name == "3":
        record ={}
        lgb_model = LoadModel()
        Sex = int(request.args.get("Sex"))
        record["sex"]=Sex
        Age = int(request.args.get("Age"))
        record["age"] = Age
        CA153 = request.args.get("CA153")
        if CA153!="NaN" and CA153!=" ": record["CA153"] = float(CA153)

        CA199 = request.args.get("CA199")
        if CA199!="NaN" and CA199!=" ": record["CA199"] = float(CA199)

        CYRFA211 = request.args.get("CYRFA211")
        if CA199 != "NaN" and CA199 != " ": record["CA199"] = float(CA199)

        CA724 = request.args.get("CA724")
        if CA724 != "NaN" and CA724 != " ": record["CA199"] = float(CA724)

        CA125 = request.args.get("CA125")
        if CA125 != "NaN" and CA125 != " ": record["CA125"] = float(CA125)

        PSA = request.args.get("PSA")
        if PSA != "NaN" and PSA != " ": record["PSA"] = float(PSA)

        SCCA = request.args.get("SCCA")
        if SCCA != "NaN" and SCCA != " ": record["SCCA"] = float(SCCA)

        HE4 = request.args.get("HE4")
        if HE4 != "NaN" and HE4 != " ": record["HE4"] = float(HE4)

        AFP = request.args.get("AFP")
        if AFP != "NaN" and AFP != " ": record["AFP"] = float(AFP)

        CA211 = request.args.get("CA211")
        if CA211 != "NaN" and CA211 != " ": record["CA211"] = float(CA211)

        # record = {'age': 66, 'sex': 0, 'status': -1000}
        # record['CA199'] = 3.439456
        # record['CA724'] = 0.488580
        test = json2ndarray(record)
        pred_test = lgb_model.predict(test)
    return jsonify([
        [round(float(pred_test[0]),4)],
    ])




@app.route('/SCAN_NEW_DATA', methods=['GET'])
def SCAN_NEW_DATA():
    global new_data_arrived_flag
    # get_data_flag = request.args.get("get_data_flag")
    #     # if get_data_flag =="1":    #前端接收到新数据标志位1后，会返回get_data_flag =="1"，提示后端可将新数据标志位new_data_arrived_flag清零
    #     #     new_data_arrived_flag=0
    temp_data=new_data_arrived_flag
    new_data_arrived_flag=0
    return jsonify([
        [temp_data],
    ])

@app.route('/SCAN_ONLINE', methods=['GET'])
def SCAN_ONLINE():
    global DEVICE_online_flag
    temp_decice_online_flag = DEVICE_online_flag
    if DEVICE_online_flag==1:
        DEVICE_online_flag=0
    return jsonify([
        [temp_decice_online_flag],
    ])

@app.route('/CLEAR_FLAG', methods=['POST','GET'])
def CLEAR_FLAG():
    global new_data_flag
    global new_data_flag_2
    global new_data_flag_3
    global new_data_arrived_flag
    global DEVICE_online_flag
    clear_msg = "MSG: "
    if request.args.get("DEVICE_online_flag_f")=="1":
        DEVICE_online_flag=0
        clear_msg = clear_msg + "DEVICE_online_flag_f_clear   "
    if request.args.get("new_data_arrived_flag_f")=="1":
        new_data_arrived_flag=0
        clear_msg = clear_msg + "new_data_arrived_f_clear   "

    user = USERS.query.filter_by(USERNAME='jay').first()
    if request.args.get("Moto_f")=="1":
        clear_msg=clear_msg+"Moto_f_clear   "
        user.M_DATA = 'M_0'
        db.session.commit()
    if request.args.get("Wash_f")=="1":
        clear_msg=clear_msg+"Wash_f_clear   "
        user.WASH_DATA = 'wash_0'
        db.session.commit()
    if request.args.get("White_f") == "1":
        clear_msg=clear_msg+"White_f_clear"
        user.W_B = 'white_0'
        db.session.commit()


    return clear_msg


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, threaded=True, debug=True)
    # with app.app_context():
    #     db.drop_all()
    #     db.create_all()
    #     user1 = USERS('jay','123','data','doc','M_state','W_B','wash')
    #     user2 = USERS('james','123','data','pat','M_state','W_B','wash')
    #     db.session.add(user1)
    #     db.session.add(user2)
    #     db.session.commit()
