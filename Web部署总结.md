# Web部署总结
1. 解释名词

		1、WSGI 全称是 Web Server Gateway Interface，也就是 Web 服务器网关接口，
		2、WSGI 按照 web 组件分类，可以分为 web 应用程序，web 服务器，web 中间件。
		3、Web 应用程序端的部分通过 Python 语言的各种 Web 框架实现，比如 Flask，Django
		4、Web 服务器通过 uWSGI 实现，也可以用最常见的 Web 服务器，比如 Apache、Nginx，但这些 Web 服务器没有内置 WSGI 的实现，5、是通过扩展完成的。
		6、uWSGI 是一个 Web 服务器程序。
		7、uWSGI + Nginx 构成 Web 服务器，Nginx 处理静态文件，并通过 uwsgi_pass 将动态内容交给 uWSGI 处理。
		8、uwsgi 是一种协议，uWSGI 实现了 uwsgi、WSGI、http 等协议。
2. Nginx配置

		server{
				listen 443;
				server_name qideli.net;  #域名
				ssl on;
				ssl_certificate /etc/nginx/1_qideli.net_bundle.crt;   #证书文件目录
				ssl_certificate_key /etc/nginx/2_qideli.net.key;
				ssl_session_timeout 5m;
				ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
				ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
				ssl_prefer_server_ciphers on;
				location /{
							uwsgi_pass 0.0.0.0:5000;    #5000端口为flask服务器运行端口
							include uwsgi_params;       #Nginx与uWsgi关联
							}
		}
3. uWsigi配置

		[uwsgi]
		socket = 127.0.0.1:5000          #运行本地服务器的ip及端口
		chdir = /home/jayyoung/Dashio_IMS_Nginx          #本地应用程序目录
		wsgi-file = run.py          #web应用程序文件
		callable = app     #web应用程序变量名
4. supervisor配置

		[program:Dashio_IMS_Nginx]          # project_name这里写上你的项目名称
		command = uwsgi --ini /home/jayyoung/Dashio_IMS_Nginx/uwsgi.ini  # 跟手动启动的命令一样
		stopsignal=QUIT
		autostart=true
		autorestart=true
		stdout_logfile=/var/log/uwsgi/supervisor_.log     # 运行日志
		stderr_logfile=/var/log/uwsgi/supervisor_err.log  # 错误日志
5. https/http重定向

		http的连接是明文传输；HTTPS协议由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议。
		在http的server里增加rewrite ^(.*) https://$host$1 permanent;
		server {
		        listen       80;
		        server_name  qideli.net www.qideli.net; #域名
		        rewrite ^(.*) https://$host$1 permanent;
		       }
6. 域名解析

		1、域名首先需要过审
		2、在云服务器中进行解析
		3、更改Nginx设置
		4、将ssl证书添加进来，并更改服务器名称
7. 服务器部署注意事项

		1、python2,3下都可以用 uwsgi 分别装就行
		2、守护进程之后，重启服务器  ps aux | grep uwsgi ，将进程kill
		3、静态文件static以及templates 直接replace
		4、python2，3切换 update-alternatives --list python 直接改优先级就可
		5、查看uwsgi对应的python版本 uwsgi --python-version



