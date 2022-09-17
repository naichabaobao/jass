[貼吧](https://tieba.baidu.com/p/6235060595?pid=127236515130&cid=0&red_tag=2862340933#127236515130)
[gitee源碼](https://gitee.com/naichabaobao/jass)
[GitHub源碼](https://github.com/naichabaobao/jass)
[Q群,點擊加入](https://shang.qq.com/wpa/qunwpa?idkey=56ca07f1d46b310f878eb4ccf4e153697d85aac546385fab0e31b569d3b0a79e)

***vscode最低版本1.49***

***common.j 為1.33***


### 使用步骤
1. 下载安装 visual studio  Code
2. visual studio  Code   安装 Jass插件
3. WE触发器    自定义脚本区    #include  "c://dir/any.j"



--------------------------------------------------------

```cpp
#include  "c://dir/any.j" // WE触发器    自定义脚本区
```

>any.j

```
//以下为外部引用触发器的格式
//Main  为触发器名字
//MainAction  为动作函数名 对应T的动作
//MainEvent   为触发函数名 对应T的事件

library Main initializer MainEvent
  // 动作
  function MainAction takes nothing returns nothing
          
  endfunction
  // initializer MainEvent 指定此方法后vjass会自动执行一次,类似事件'地图初始化'
  function MainEvent takes nothing returns nothing
    local trigger mainTrigger = CreateTrigger()
    call TriggerRegisterTimerEventSingle(mainTrigger,0)
    call TriggerAddAction(mainTrigger, function MainAction)
  endfunction
endlibrary
```
--------------------------------------------------------

### 1.6.7
##### 2022年6月5日
###### include宏路径提示
![include-dome](https://user-images.githubusercontent.com/38098031/188805957-823950f9-c4c7-4f03-87c1-9d29cf41003e.png)


### 1.6.12
##### 2022年6月13日
###### 新的配置项exclude
![exclude-dome](https://user-images.githubusercontent.com/38098031/188805922-077ff428-6317-40d0-83e9-2229ba9d3a67.png)


### 1.6.1
![comment-param](https://user-images.githubusercontent.com/38098031/188806025-26f0eb38-88d3-45ac-9bcc-6fdb338fbbbb.png)


### 1.6.15
##### 2022年7月28日
###### dzGetColor颜色
![dzGetColor](https://user-images.githubusercontent.com/38098031/188805851-21f793a6-c5e4-4f2c-89eb-a18383352df9.png)


--------------------------------------------------------------

***请我喝奶茶***
![loveme](https://user-images.githubusercontent.com/38098031/190127376-c47656c3-8b28-4ff2-a242-78bb28a3652e.png)

![一起出份力赞助我开发吧！爱你哟](https://user-images.githubusercontent.com/38098031/189883735-7bbdb474-259a-4bc7-8a6b-09707aa013a4.png)

```---star一下吧！---```
