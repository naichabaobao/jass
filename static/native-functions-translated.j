// MathAPI

// Convert degrees to radians
native Deg2Rad takes real degrees returns real
// Convert radians to degrees
native Rad2Deg takes real radians returns real

// Sine (radians) [R]
native Sin takes real radians returns real
// Cosine (radians) [R]
native Cos takes real radians returns real
// Tangent (radians) [R]
native Tan takes real radians returns real

// Arc sine (radians) [R]
// y should be between -1 and 1... returns 0 when input is invalid
native Asin takes real y returns real
// Arc cosine (radians) [R]
native Acos takes real x returns real

// Arc tangent (radians) [R]
native Atan takes real x returns real

// Arc tangent of Y/X (radians) [R]
// When x == 0 and y == 0, returns 0
native Atan2 takes real y, real x returns real

// Square root
// When x <= 0, returns 0
native SquareRoot takes real x returns real

// Power
// When power == 0.0, returns 1
// When x == 0.0 and power < 0, returns 0
// computes x to the y power
native Pow takes real x, real power returns real
// Round to nearest integer
constant native MathRound takes real r returns integer


// String Utility API

// Convert integer to real
native I2R takes integer i returns real
// Convert real to integer (rounds down for positive, rounds up for negative)
// 7.x returns 7, -7.x returns -7
native R2I takes real r returns integer
// Convert integer to string
native I2S takes integer i returns string
// Convert real to string
native R2S takes real r returns string
// Convert real to string with formatting
// @param precision Number of decimal places to keep
native R2SW takes real r, integer width, integer precision returns string
// Convert string to integer
native S2I takes string s returns integer
// Convert string to real
native S2R takes string s returns real
// Get handle ID
// tips: Generally used for hashtable keys
// @param h Any handle subtype
native GetHandleId takes handle h returns integer
// Extract substring [R]
// @param source Source content
// @param start Starting position, index starts at 0
// @param end Ending position, length of desired string
native SubString takes string source, integer start, integer end returns string
// Get string length
native StringLength takes string s returns integer
// Convert string case (for English)
native StringCase takes string source, boolean upper returns string
// Convert string to hash code
native StringHash takes string s returns integer

// Get translation of external string [R]
// Retrieves the translation text corresponding to the query content from Globalstrings.fdf file, returns different values for different languages
// When the string doesn't exist (the queried string itself doesn't exist in current version, not that the string exists but has no translation), returns the query content unchanged (English also has translations, with only first letter capitalized, but all strings are uppercase and use underscores instead of spaces, so translation and string are never equal), can be used to determine game version (e.g., 1.27, 1.30, etc.)
// Cannot be used in AI scripts because scripts cannot access external content, returns null
native GetLocalizedString takes string source returns string
// Get localized hotkey
// Theoretically cannot be used in AI scripts
native GetLocalizedHotkey takes string source returns integer


// Map Setup API
//
//  These are native functions for describing the map configuration
//  these funcs should only be used in the "config" function of
//  a map script. The functions should also be called in this order
//  ( i.e. call SetPlayers before SetPlayerColor...
//

// Set map name
native SetMapName takes string name returns nothing
// Set map description
native SetMapDescription takes string description returns nothing
// Set number of teams
native SetTeams takes integer teamcount returns nothing
// Set number of players, must be called before setting player colors
native SetPlayers takes integer playercount returns nothing
// Set start location (bind specified start location number to specified coordinates)
native DefineStartLocation takes integer whichStartLoc, real x, real y returns nothing
// Set start location (bind specified start location number to specified location)
native DefineStartLocationLoc takes integer whichStartLoc, location whichLocation returns nothing
// Set start location priority count (for specified player slot)
native SetStartLocPrioCount takes integer whichStartLoc, integer prioSlotCount returns nothing
// Set start location priority (for specified start location number)
// @param whichStartLoc Specified start location number (according to player start points set on map)
// @param prioSlotIndex Player slot
// @param otherStartLocIndex Other start location (only effective when allowing players to change start locations)
// @param priority Start location priority
native SetStartLocPrio takes integer whichStartLoc, integer prioSlotIndex, integer otherStartLocIndex, startlocprio priority returns nothing
// Get start location priority slot (for specified player slot)
// Returns as integer
native GetStartLocPrioSlot takes integer whichStartLoc, integer prioSlotIndex returns integer
// Get start location priority (for specified player slot)
native GetStartLocPrio takes integer whichStartLoc, integer prioSlotIndex returns startlocprio
// Set enemy start location count (for specified player slot)
native SetEnemyStartLocPrioCount takes integer whichStartLoc, integer prioSlotCount returns nothing
// Set enemy start location priority (relative to specified start location)
// @param whichStartLoc Specified start location number (according to player start points set on map)
// @param prioSlotIndex Player slot
// @param otherStartLocIndex Other start location number (only effective when allowing players to change start locations)
// @param priority Start location priority
native SetEnemyStartLocPrio takes integer whichStartLoc, integer prioSlotIndex, integer otherStartLocIndex, startlocprio priority returns nothing
// Set game (team) type support status
native SetGameTypeSupported takes gametype whichGameType, boolean value returns nothing
// Set map flag (for specified parameter type)
native SetMapFlag takes mapflag whichMapFlag, boolean value returns nothing
// Set game start location placement method (specify placement method)
native SetGamePlacement takes placement whichPlacementType returns nothing
// Set game speed
native SetGameSpeed takes gamespeed whichspeed returns nothing
// Set game difficulty [R]
native SetGameDifficulty takes gamedifficulty whichdifficulty returns nothing
// Set resource density
native SetResourceDensity takes mapdensity whichdensity returns nothing
// Set unit density
native SetCreatureDensity takes mapdensity whichdensity returns nothing

// Get number of teams
native GetTeams takes nothing returns integer
// Get number of players
native GetPlayers takes nothing returns integer

// Check if specified game (team) type is supported
native IsGameTypeSupported takes gametype whichGameType returns boolean
// Get selected game (team) type
native GetGameTypeSelected takes nothing returns gametype
// Check if map flag/option is enabled (for specified parameter)
// Some parameters support being set during game creation
native IsMapFlagSet takes mapflag whichMapFlag returns boolean
// Get game start location placement method
constant native GetGamePlacement takes nothing returns placement
// Get game speed
constant native GetGameSpeed takes nothing returns gamespeed
// Get game difficulty, game difficulty and AI difficulty are two different parameters
constant native GetGameDifficulty takes nothing returns gamedifficulty
// Get resource density
constant native GetResourceDensity takes nothing returns mapdensity
// Get unit density
constant native GetCreatureDensity takes nothing returns mapdensity
// Get X coordinate of specified start location number
// Input 0~11/23. When start locations are not fixed, start location numbers and players won't correspond by number
constant native GetStartLocationX takes integer whichStartLocation returns real
// Get Y coordinate of specified start location number
// Input 0~11/23. When start locations are not fixed, start location numbers and players won't correspond by number
constant native GetStartLocationY takes integer whichStartLocation returns real
// Get specified start location number, returns as location
// Input 0~11/23 returns the start location of that number. When start locations are not fixed, start location numbers and players won't correspond by number
// Creates a location, remember to clean up after use
constant native GetStartLocationLoc takes integer whichStartLocation returns location


// Set specified player's team
native SetPlayerTeam takes player whichPlayer, integer whichTeam returns nothing
// Set specified player's start location number
// @param startLocIndex Player start location number, input 0~11/23
native SetPlayerStartLocation takes player whichPlayer, integer startLocIndex returns nothing
// Forces player to have the specified start loc and marks the start loc as occupied
// which removes it from consideration for subsequently placed players
// ( i.e. you can use this to put people in a fixed loc and then
//   use random placement for any unplaced players etc )

// Force specified player start location number (default used for triggers that set player start locations by player group)
native ForcePlayerStartLocation takes player whichPlayer, integer startLocIndex returns nothing
// Set specified player color [R]
native SetPlayerColor takes player whichPlayer, playercolor color returns nothing
// Set specified player alliance type (for specified item) [R]
native SetPlayerAlliance takes player sourcePlayer, player otherPlayer, alliancetype whichAllianceSetting, boolean value returns nothing
// Set specified player tax rate [R]
// @param sourcePlayer Taxpaying player
// @param otherPlayer Tax collecting player
// @param whichResource Tax type, gold or lumber [PLAYER_STATE_RESOURCE_GOLD, PLAYER_STATE_RESOURCE_LUMBER]
// @param rate Tax rate
native SetPlayerTaxRate takes player sourcePlayer, player otherPlayer, playerstate whichResource, integer rate returns nothing
// Set specified player race preference
native SetPlayerRacePreference takes player whichPlayer, racepreference whichRacePreference returns nothing
// Set specified player race selectability
native SetPlayerRaceSelectable takes player whichPlayer, boolean value returns nothing
// Set specified player controller type
native SetPlayerController takes player whichPlayer, mapcontrol controlType returns nothing
// Set specified player name
native SetPlayerName takes player whichPlayer, string name returns nothing

// Show/hide score screen [R]
// Score statistics panel after game ends, official campaigns don't show by default
native SetPlayerOnScoreScreen takes player whichPlayer, boolean flag returns nothing

// Get team number of specified player
native GetPlayerTeam takes player whichPlayer returns integer
// Get start location number of specified player
// Returns 0~11/23. When start locations are not fixed, start location numbers and players won't correspond by number
native GetPlayerStartLocation takes player whichPlayer returns integer
// Get specified player color
native GetPlayerColor takes player whichPlayer returns playercolor
// Check if specified player is selectable
native GetPlayerSelectable takes player whichPlayer returns boolean
// Check specified player controller type
native GetPlayerController takes player whichPlayer returns mapcontrol
// Check specified player slot state
// Referee's state is left game PLAYER_SLOT_STATE_LEFT
native GetPlayerSlotState takes player whichPlayer returns playerslotstate
// Get specified player tax rate [R]
// @param sourcePlayer Taxpaying player
// @param otherPlayer Tax collecting player
// @param whichResource Tax type, gold or lumber [PLAYER_STATE_RESOURCE_GOLD, PLAYER_STATE_RESOURCE_LUMBER]
native GetPlayerTaxRate takes player sourcePlayer, player otherPlayer, playerstate whichResource returns integer
// Check if specified player's preset race is the specified race
// If scenario-player hasn't set the specified race (must have fixed start locations to take effect), takes the race the room player independently selected, should return false when using random
native IsPlayerRacePrefSet takes player whichPlayer, racepreference pref returns boolean
// Get specified player name
native GetPlayerName takes player whichPlayer returns string


// Timer API
//

// Create timer [R]
native CreateTimer takes nothing returns timer
// Destroy timer [R]
native DestroyTimer takes timer whichTimer returns nothing
// Start timer (countdown) [C]
// @param whichTimer Timer
// @param timeout Timeout/initial countdown value
// @param periodic Whether to loop
// @param handlerFunc Function to run when timer expires
native TimerStart takes timer whichTimer, real timeout, boolean periodic, code handlerFunc returns nothing
// Get elapsed time/counted time of timer
native TimerGetElapsed takes timer whichTimer returns real
// Get remaining time of timer
native TimerGetRemaining takes timer whichTimer returns real
// Get initial time/initial countdown value of timer
native TimerGetTimeout takes timer whichTimer returns real
// Pause timer (countdown) [R]
native PauseTimer takes timer whichTimer returns nothing
// Resume timer (countdown) [R]
native ResumeTimer takes timer whichTimer returns nothing
// Get expired timer
// Used together with TimerStart
native GetExpiredTimer takes nothing returns timer


// Group API
//

// Create unit group [R]
// Creates unit group, remember to clean up after use
native CreateGroup takes nothing returns group
// Destroy unit group [R]
native DestroyGroup takes group whichGroup returns nothing
// Add specified unit to unit group [R]
native GroupAddUnit takes group whichGroup, unit whichUnit returns boolean
// Remove specified unit from unit group [R]
native GroupRemoveUnit takes group whichGroup, unit whichUnit returns boolean
// Add units from addGroup to whichGroup [Fast]
// @version 1.33
native BlzGroupAddGroupFast takes group whichGroup, group addGroup returns integer
// Remove units from removeGroup from whichGroup [Fast]
// @version 1.33
native BlzGroupRemoveGroupFast takes group whichGroup, group removeGroup returns integer
// Clear unit group
// For cleanup use DestroyGroup, not clear
native GroupClear takes group whichGroup returns nothing
// Get number of units in unit group
// @version 1.33
native BlzGroupGetSize takes group whichGroup returns integer
// Get unit at specified index in unit group
// @version 1.33
native BlzGroupUnitAt takes group whichGroup, integer index returns unit
// Add units with specified unit name to unit group
// @param unitname Unit name, case-insensitive, can be found in common.ai and object editor files, when using GOLDMINE, will include gold mine, entangled gold mine, haunted gold mine
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsOfType takes group whichGroup, string unitname, boolexpr filter returns nothing
// Add units of specified player to unit group
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsOfPlayer takes group whichGroup, player whichPlayer, boolexpr filter returns nothing
// Add units with specified unit name to unit group, with unit count limit
// @param unitname Unit name, case-insensitive, can be found in common.ai and object editor files, when using GOLDMINE, will include gold mine, entangled gold mine, haunted gold mine
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
// @param countLimit Count limit
native GroupEnumUnitsOfTypeCounted takes group whichGroup, string unitname, boolexpr filter, integer countLimit returns nothing
// Add units in specified rectangle region to unit group
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsInRect takes group whichGroup, rect r, boolexpr filter returns nothing
// Add units in specified rectangle region to unit group, with unit count limit
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
// @param countLimit Count limit
native GroupEnumUnitsInRectCounted takes group whichGroup, rect r, boolexpr filter, integer countLimit returns nothing
// Add units in specified circular range to unit group (specify center coordinates)
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsInRange takes group whichGroup, real x, real y, real radius, boolexpr filter returns nothing
// Add units in specified circular range to unit group (specify center location)
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsInRangeOfLoc takes group whichGroup, location whichLocation, real radius, boolexpr filter returns nothing
// [Deprecated] Add units in specified circular range to unit group (specify center coordinates), with unit count limit
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
// @param countLimit Count limit
// @deprecated Deprecated function
native GroupEnumUnitsInRangeCounted takes group whichGroup, real x, real y, real radius, boolexpr filter, integer countLimit returns nothing
// [Deprecated] Add units in specified circular range to unit group (specify center location), with unit count limit
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
// @param countLimit Count limit
// @deprecated Deprecated function
native GroupEnumUnitsInRangeOfLocCounted takes group whichGroup, location whichLocation, real radius, boolexpr filter, integer countLimit returns nothing
// Add units selected by specified player to unit group
// @param filter Boolean expression, not recommended in AI scripts, i.e., filter should be null
native GroupEnumUnitsSelected takes group whichGroup, player whichPlayer, boolexpr filter returns nothing

// Issue (unit group) order (no target)
// @param order Ability order string can be found in object editor files
native GroupImmediateOrder takes group whichGroup, string order returns boolean
// Issue (unit group) order by ID (no target)
// @param order Ability order ID can be found in object editor files
native GroupImmediateOrderById takes group whichGroup, integer order returns boolean
// Issue (unit group) order (specify coordinates) [R]
// @param order Ability order string can be found in object editor files
native GroupPointOrder takes group whichGroup, string order, real x, real y returns boolean
// Issue (unit group) order (specify location)
// @param order Ability order string can be found in object editor files
native GroupPointOrderLoc takes group whichGroup, string order, location whichLocation returns boolean
// Issue (unit group) order by ID (specify coordinates)
// @param order Ability order ID can be found in object editor files
native GroupPointOrderById takes group whichGroup, integer order, real x, real y returns boolean
// Issue (unit group) order by ID (specify location)
// @param order Ability order ID can be found in object editor files
native GroupPointOrderByIdLoc takes group whichGroup, integer order, location whichLocation returns boolean
// Issue (unit group) order (specify unit/item/destructible)
// @param order Ability order string can be found in object editor files
native GroupTargetOrder takes group whichGroup, string order, widget targetWidget returns boolean
// Issue (unit group) order by ID (specify unit/item/destructible)
// @param order Ability order ID can be found in object editor files
native GroupTargetOrderById takes group whichGroup, integer order, widget targetWidget returns boolean

// This will be difficult to support with potentially disjoint, cell-based regions
// as it would involve enumerating all the cells that are covered by a particular region
// a better implementation would be a trigger that adds relevant units as they enter
// and removes them if they leave...

// Perform single action for each unit in specified unit group
native ForGroup takes group whichGroup, code callback returns nothing
// Get first unit in unit group
// When units in the group haven't changed (added or removed), the order won't change, i.e., it will get the same unit each time
// When a unit in the group is automatically set to null by the system due to death or removal, units after that unit cannot be retrieved using this command, recommend clearing the group and re-selecting units
native FirstOfGroup takes group whichGroup returns unit


// Force API
//

// Create player group [R]
native CreateForce takes nothing returns force
// Destroy player group [R]
native DestroyForce takes force whichForce returns nothing
// Add player to player group [R]
native ForceAddPlayer takes force whichForce, player whichPlayer returns nothing
// Remove player from player group [R]
native ForceRemovePlayer takes force whichForce, player whichPlayer returns nothing
// Check if player is in player group
native BlzForceHasPlayer takes force whichForce, player whichPlayer returns boolean
// Clear player group
// For cleanup use DestroyForce, not clear
native ForceClear takes force whichForce returns nothing
// Enumerate players in player group (with specified boolean expression)
native ForceEnumPlayers takes force whichForce, boolexpr filter returns nothing
// Enumerate players in specified player group (specify number of players to match)
// @param countLimit Maximum number of players to match
native ForceEnumPlayersCounted takes force whichForce, boolexpr filter, integer countLimit returns nothing
// Enumerate allies of specified player in player group
native ForceEnumAllies takes force whichForce, player whichPlayer, boolexpr filter returns nothing
// Enumerate enemies of specified player in player group
native ForceEnumEnemies takes force whichForce, player whichPlayer, boolexpr filter returns nothing
// Perform action for each player in specified player group (single action)
native ForForce takes force whichForce, code callback returns nothing


// Region and Location API

// Convert coordinates to rectangle region
// Creates rectangle region, remember to clean up after use
native Rect takes real minx, real miny, real maxx, real maxy returns rect
// Convert locations to rectangle region
// Creates rectangle region, remember to clean up after use
native RectFromLoc takes location min, location max returns rect
// Remove rectangle region [R]
native RemoveRect takes rect whichRect returns nothing
// Set rectangle region (specify coordinates) [R]
native SetRect takes rect whichRect, real minx, real miny, real maxx, real maxy returns nothing
// Set rectangle region (specify locations) [R]
native SetRectFromLoc takes rect whichRect, location min, location max returns nothing
// Move rectangle region (specify coordinates) [R]
native MoveRectTo takes rect whichRect, real newCenterX, real newCenterY returns nothing
// Move rectangle region (specify new center location)
native MoveRectToLoc takes rect whichRect, location newCenterLoc returns nothing

// Get X coordinate of rectangle region center
native GetRectCenterX takes rect whichRect returns real
// Get Y coordinate of rectangle region center
native GetRectCenterY takes rect whichRect returns real
// Get minimum X coordinate of rectangle region
native GetRectMinX takes rect whichRect returns real
// Get minimum Y coordinate of rectangle region
native GetRectMinY takes rect whichRect returns real
// Get maximum X coordinate of rectangle region
native GetRectMaxX takes rect whichRect returns real
// Get maximum Y coordinate of rectangle region
native GetRectMaxY takes rect whichRect returns real

// Create irregular region [R]
native CreateRegion takes nothing returns region
// Remove irregular region [R]
native RemoveRegion takes region whichRegion returns nothing

// Add rectangle region to specified irregular region [R]
native RegionAddRect takes region whichRegion, rect r returns nothing
// Clear rectangle region from specified irregular region [R]
native RegionClearRect takes region whichRegion, rect r returns nothing

// Add cell at specified coordinates to irregular region [R]
native RegionAddCell takes region whichRegion, real x, real y returns nothing
// Add cell at specified location to irregular region [R]
native RegionAddCellAtLoc takes region whichRegion, location whichLocation returns nothing
// Clear cell at specified coordinates from irregular region [R]
native RegionClearCell takes region whichRegion, real x, real y returns nothing
// Clear cell at specified location from irregular region [R]
native RegionClearCellAtLoc takes region whichRegion, location whichLocation returns nothing

// Convert coordinates to location
// Creates location, remember to clean up after use
native Location takes real x, real y returns location
// Remove location [R]
native RemoveLocation takes location whichLocation returns nothing
// Move location (to specified coordinates) [R]
native MoveLocation takes location whichLocation, real newX, real newY returns nothing
// Get X coordinate of location
native GetLocationX takes location whichLocation returns real
// Get Y coordinate of location
native GetLocationY takes location whichLocation returns real

// Get Z coordinate (height) of location (asynchronous) [R]
// This function is asynchronous. The values it returns are not guaranteed synchronous between each player.
//  If you attempt to use it in a synchronous manner, it may cause a desync.
native GetLocationZ takes location whichLocation returns real

// Check if unit is in irregular region
native IsUnitInRegion takes region whichRegion, unit whichUnit returns boolean
// Check if coordinates are in irregular region
native IsPointInRegion takes region whichRegion, real x, real y returns boolean
// Check if location is in irregular region
native IsLocationInRegion takes region whichRegion, location whichLocation returns boolean

// Returns full map bounds, including unplayable borders, in world coordinates

// Get complete map region (including unplayable borders)
// Creates region, remember to clean up after use
native GetWorldBounds takes nothing returns rect


// Native trigger interface
//

// Create trigger [R]
native CreateTrigger takes nothing returns trigger
// Destroy trigger [R]
native DestroyTrigger takes trigger whichTrigger returns nothing
// Reset trigger
native ResetTrigger takes trigger whichTrigger returns nothing
// Enable trigger
native EnableTrigger takes trigger whichTrigger returns nothing
// Disable trigger
native DisableTrigger takes trigger whichTrigger returns nothing
// Check if trigger is enabled
native IsTriggerEnabled takes trigger whichTrigger returns boolean

// Wait on sleeps for trigger
native TriggerWaitOnSleeps takes trigger whichTrigger, boolean flag returns nothing 