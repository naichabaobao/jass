1. 下载安装 visual studio  Code

2.  visual studio  Code   安装 Jass插件

3  WE触发器    自定义脚本区    #include  "Main.j"


"Main.j"  内容

--------------------------------------------------------
#include  "****.j"    //这是引入的其他j文件

//触发器主体  注:Main文件 要有一个空的触发
-------------------------------------------------------

//以下为外部引用触发器的格式
//Main  为触发器名字
//MainAction  为动作函数名 对应T的动作
//MainEvent   为触发函数名 对应T的事件

library Main initializer MainEvent
    function MainAction takes nothing returns nothing
        
    endfunction
    function MainEvent takes nothing returns nothing
        local trigger mainTrigger=CreateTrigger()
        call TriggerRegisterTimerEventSingle(mainTrigger,0)
        call TriggerAddAction(mainTrigger,function MainAction)
    endfunction
endlibrary

--------------------------------------------------------