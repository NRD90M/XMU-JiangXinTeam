# -*- coding: utf-8 -*-
import numpy as np

def get_all_index(list,item):
    tmp=[]
    tag=0
    for i in list:
        if i == item:
            tmp.append(tag)
        tag += 1
    return tmp


def find___(lis,x):
    erroe_flag=0
    right_error_flag=0
    _need0_2=[]
    _need6_8=[]
    _need3_5=[]
    for i in range(9):
        maxnum = max(lis[i])   
        maxnum_index = get_all_index(lis[i],maxnum)[0]    
        start_index = maxnum_index+100        
        for j1 in range(start_index,1900):    
            right_error_flag=0
            erroe_flag = 0
            for j2 in range(100):            
                if lis[i][j1] > lis[i][j1-j2] or lis[i][j1+j2] <lis[i][j1]:
                    erroe_flag=1
                    break
            if erroe_flag==0:
                for j3 in range(100):              
                    if lis[i][j1+j3]>lis[i][j1+j3+1]:
                        right_error_flag+=1
                if right_error_flag<8:
                    if i<3:
                        print (j1,i+1,right_error_flag,x[j1])
                        _need0_2.append(x[j1])
                    elif i>5:
                        _need6_8.append(x[j1])
                    else:
                        _need3_5.append(x[j1])
                break                 

    a=np.mean(_need0_2)
    b=max(_need6_8)
    c=min(_need3_5)
    print(a,c,b)
    return a,c,b

def find_index(lis, x):  
    erroe_flag = 0
    right_error_flag = 0
    _need0_2 = []
    _need6_8 = []
    _need3_5 = []
    i_list_1 = []
    i_list_2 = []
    i_list_3 = []
    for i in range(9):
        maxnum = max(lis[i])  
        maxnum_index = get_all_index(lis[i], maxnum)[0]  
        start_index = maxnum_index + 100  
        for j1 in range(start_index, 1900):  
            right_error_flag = 0
            erroe_flag = 0
            for j2 in range(100):  
                if lis[i][j1] > lis[i][j1 - j2] or lis[i][j1 + j2] < lis[i][j1]:
                    erroe_flag = 1
                    break
            if erroe_flag == 0:
                for j3 in range(100): 
                    if lis[i][j1 + j3] > lis[i][j1 + j3 + 1]:
                        right_error_flag += 1
                if right_error_flag < 8:
                    print (j1, i + 1, right_error_flag, x[j1])
                    if i < 3:

                        i_list_1.append(i)
                        _need0_2.append(x[j1])
                    elif i > 5:
                        _need6_8.append(x[j1])
                        i_list_2.append(i)
                    else:
                        _need3_5.append(x[j1])
                        i_list_3.append(i)
                break  

    a = np.mean(_need0_2)

    b = max(_need6_8)
    b_index = get_all_index(_need6_8, b)

    c = min(_need3_5)
    c_index = get_all_index(_need3_5, c)
    print (b_index,c_index)
    print (i_list_3[c_index[0]], i_list_2[b_index[0]])

    return i_list_1[0],i_list_3[c_index[0]], i_list_2[b_index[0]]

