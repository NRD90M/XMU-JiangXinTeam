def reflect__(Demo,White,Black):
    ref=[]
    for i in range(len(Demo)):
        if(abs(White[i]-Black[i]))>10:
            each_ref=float((Demo[i]-Black[i]))/(White[i]-Black[i])
            round(each_ref,2)
            ref.append(each_ref)
        else:
            each_ref=0
            ref.append(each_ref)

    return ref

def content(k,b,demo_min,demo_min_oringal):
    y=k*(demo_min-demo_min_oringal)+b
    return round(y,2)


def get_all_index(list,item):
    tmp=[]
    tag=0
    for i in list:
        if i == item:
            tmp.append(tag)
        tag += 1
    return tmp

def get_min_lamda(y,lam):
    maxnum = max(y)
    index = get_all_index(y,maxnum)[0]
    minnum = min(y[index:960])
    index1 = get_all_index(y[index:960],minnum)[0]+index
    return(lam[index1])


if __name__ == "__main__":
    T3data=[100,300,400,500,700,400,500,550]
    l=[1,2,3,4,5,6,7,8]
    print(get_min_lamda(T3data,l))
    # a=[10,17,18]
    # b=[2,3,4]
    # c=[1,1,1]
    # t=reflect(a,b,c)
    # print(t)
