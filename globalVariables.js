GAME_TITLE = `Spacecord (Title TBD)`
INVITE_LINK = `https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=268561472&scope=bot`
APP_COLOR = `#00bbff`
SUCCESS_COLOR = `#00ff55`
FAILURE_COLOR = `#ff0000`

// # each step is "a day" in game time
// # REAL_TIME_TO_GAME_TIME_MULTIPLIER:0.00003333333
// # step interval is "a day" so it's just 1/STEP_INTERVAL

// # 20 mins
STEP_INTERVAL = 1200000
REAL_TIME_TO_GAME_TIME_MULTIPLIER = 1 / 1200000
GENERAL_RESPONSE_TIME = 2 * 60 * 1000
GENERAL_VOTE_TIME = 10 * 1000
// # GENERAL_VOTE_TIME:300000
// # 5*60*1000 (5m)

POWER_UNIT = `GWh`
DISTANCE_UNIT = `AU`
SPEED_UNIT = `AU/day`
HEALTH_UNIT = `HP`
TICK_UNIT = `day`
WEIGHT_UNIT = `ton`
WEIGHT_UNITS = `tons`
TIME_UNIT = `day`
TIME_UNITS = `days`
TIME_UNIT_LONG = `year`
TIME_UNIT_LONGS = `years`
TIME_UNIT_SHORTS_PER_LONG = 365
TIME_UNIT_LONGS_MULTIPLIER = 1 / 365

SLEEP = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
