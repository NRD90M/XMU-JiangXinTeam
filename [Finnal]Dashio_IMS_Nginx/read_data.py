import pandas as pd

def read_data():
    data_path = './data.csv'

    wavelength = pd.read_csv(data_path, usecols=[0]).values.tolist()[500:1000]
    data_water = pd.read_csv(data_path, usecols=[1]).values.tolist()[500:1000]
    data_alcohol = pd.read_csv(data_path, usecols=[2]).values.tolist()[500:1000]

    data_show = []

    for i in range(len(wavelength)):
        data = []
        data.append(float(wavelength[i][0]))
        data.append(float(data_water[i][0]))
        data.append(float(data_alcohol[i][0]))
        data_show.append(data)
    return data_show

    # print(data_show)
