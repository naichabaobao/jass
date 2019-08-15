\nndfunction 
function Trig_Path_8aConditions takes nothing returns boolean

return((GetOwningPlayer(GetEnteringUnit()) = =Player(11)))

endfunction 
function Trig_Path_8aActions takes nothing returns nothing

call IssuePointOrderLoc(GetEnteringUnit(),"move",GetRectCenter(gg_rct_bottomleftgo) )
endfunction 
// aa / a
       function InitTrig_Path_8a takes nothing returns nothing

set gg_trg_Path_8a = CreateTrigger()

call YDWETriggerRegisterEnterRectSimpleNull(gg_trg_Path_8a,gg_rct_8a)

call TriggerAddCondition(gg_trg_Path_8a,Condition(function Trig_Path_8aConditions))

call TriggerAddAction(gg_trg_Path_8a,function Trig_Path_8aActions)

endfunction 
function Trig_Path_9_Teal_SpawnConditions takes nothing returns boolean

return((GetOwningPlayer(GetEnteringUnit()) = =Player(11)))

e ,ea