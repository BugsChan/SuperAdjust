# 超级点评

超级点评是一个能够点评所有网页的浏览器插件

# SuperAdjust

SupuerAdjust is a browser extention that can adjust in any website you want.

## 简介

Niupingwang文件夹下面是服务端，用nodejs+express写成;  
需要用到mongodb，mongodb连接可在config.json中配置;  
mongodb需要初始化，使用init.sql中的内容初始化;  
apps下面是客户端，仅有chrome浏览器插件。  
浏览器插件需要配置服务器域名，配置文件为js/Config.js。  

## Introducing

The dictionary Niupingwang is the server side. It should run by nodejs and express;  
You also need mongodb, you can config mongodb's url at config.json;  
The mongodb need be inited, you can use the content of init.sql to do this;  
The client is in the dictionary apps, Only for chrome like browsers;  
You should config the server's hostname before you use it. The file you can config is js/Config.js;  