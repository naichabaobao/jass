[貼吧](https://tieba.baidu.com/p/6235060595?pid=127236515130&cid=0&red_tag=2862340933#127236515130)
[Gitee源碼](https://gitee.com/naichabaobao/jass)
[GitHub源碼](https://github.com/naichabaobao/jass)
[Q群,點擊加入](https://shang.qq.com/wpa/qunwpa?idkey=56ca07f1d46b310f878eb4ccf4e153697d85aac546385fab0e31b569d3b0a79e)

***vscode最低版本1.49***

***common.j 為1.32.7***

### 使用步骤
1. 下载安装 visual studio  Code
2.  visual studio  Code   安装 Jass插件
3.  WE触发器    自定义脚本区    #include  "Main.j"


### "Main.j"  内容

--------------------------------------------------------

```jass
// 友情提供: 枫舞
#include  "****.j"    //这是引入的其他j文件

//触发器主体  注:Main文件 要有一个空的触发
// -------------------------------------------------------

//以下为外部引用触发器的格式
//Main  为触发器名字
//MainAction  为动作函数名 对应T的动作
//MainEvent   为触发函数名 对应T的事件
library Main initializer MainEvent
  function MainAction takes nothing returns nothing
          
  endfunction
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
![include-dome](/naichabaobao/jass/raw/master/static/images/include-dome.png)

### 1.6.12
##### 2022年6月13日
###### 新的配置项exclude
![include-dome](/naichabaobao/jass/raw/master/static/images/exclude-dome.png)

### 1.6.1
![param](/naichabaobao/jass/raw/master/static/images/comment-param.png)
![param-display](/naichabaobao/jass/raw/master/static/images/comment-param-display.png)

### 1.6.15
##### 2022年7月28日
###### dzGetColor颜色
![dzGetColor](/naichabaobao/jass/raw/master/static/images/dz-color.png)

--------------------------------------------------------------

***请我喝奶茶***
![一起出份力赞助我开发吧！爱你哟](/naichabaobao/jass/raw/master/static/images/qrcode.png)

```---star一下吧！---```
