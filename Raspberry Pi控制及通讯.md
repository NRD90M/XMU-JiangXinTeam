# Raspberry Pi控制及通讯
1. **avsPY.py**
	整个程序的主文件（只需要运行这个py文件即可）。

1. **moto.py**
	控制电机转动的.py文件，通过串口向stm32发送命令控制电机。（被avsPY.py调用）

1. **Light_Dark.txt**
	存放参考通道明暗参考光谱数据的.txt文件。控制光谱仪的C++源码将读取的光谱数据存入.txt文件，与服务器交互的python源码读取.txt内的光谱数据并发送给服务器。

1. **fuzhi.txt**
	存放9个测量通道光谱数据的.txt文件，数据长度为：2048X通道数。

1. **bochang.txt**
	存放横坐标（波长）的.txt文件，数据长度为2048个波长点。

1. **Makefile**
	用于将c++源码编译成可执行文件。使用方法：make Makefile。（在编译不同的C++源文件时，要修改Makefile文件里要编译的对应的C++文件名）。

1. **Light_Dark.cpp**
	控制光谱仪获取参考通达明暗参考光谱的源码。会使光谱仪自动获取一次明参考和一次暗参考，并将明暗参考光谱数据存入Light_Dark.txt中。

1. **Light_Dark**
	Light_Dark.cpp编译后的可执行文件，python内运行的方法："os.system("sudo ./Light_Dark")"。（被avsPY.py调用）

1. **testavs.cpp**
	控制光谱仪自动连续获取9个测量通道光谱数据的源码，并将获取的光谱数据依次存入fuzhi.txt文件中。

1. **testavs**
	testavs.cpp编译后的可执行文件，python内运行的方法："os.system("sudo ./testavs")"。 （被avsPY.py调用）

1. **其它** 
	其它为控制光谱仪所必要的库文件。