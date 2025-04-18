





<!-- ![冰封王座巫妖王](https://t13.baidu.com/it/u=2708679913,2610909064&fm=224&app=112&f=JPEG?w=500&h=251) -->
<!-- ![冰封王座巫妖王](https://github.com/naichabaobao/jass/blob/f7ff28fd7a52ea9b532afecd23aa5a024a57c1c4/static/jass.png) -->
![冰封王座巫妖王](https://github.com/naichabaobao/jass/blob/master/static/images/blizzard-nova.jpg?raw=true)


--------------------------------------------------------
# Usage

## Install & Init

* Open your terminal and run

1. 
```sh
git clone https://github.com/naichabaobao/jass.git
npm install
```

2. open vscode |**Run and Debug**|
3. click |**测试jass插件**| or click **F5**
4. open '**.j**' or '**.jass**' ext file in new window

## Example Code

```cpp
#include  "c://dir/any.j" // WE触发器    自定义脚本区
```

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

## Statement

- ***vscode version 1.63***
- ***common.j version 1.33***
- ***物编数据 code version 2.02+***

## Link
[貼吧](https://tieba.baidu.com/p/6235060595?pid=127236515130&cid=0&red_tag=2862340933#127236515130)
[GitHub源碼](https://github.com/naichabaobao/jass)
[Q群,點擊加入](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=j4VO5JOZy4x2zX9qRXWpG9mTs0lZq0_A&authKey=V1Vz47EJpB%2BkkZQ2bSKEIPBCpAqBJTQ%2Bg3wty9x0BtrvAp16ZkIWhDdF0p56rcq%2B&noverify=0&group_code=786204376)

--------------------------------------------------------

### **请我喝奶茶**
![loveme](https://user-images.githubusercontent.com/38098031/190127376-c47656c3-8b28-4ff2-a242-78bb28a3652e.png)

![一起出份力赞助我开发吧！爱你哟](https://user-images.githubusercontent.com/38098031/189883735-7bbdb474-259a-4bc7-8a6b-09707aa013a4.png)

```---star一下吧！---```
