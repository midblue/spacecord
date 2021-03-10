GAME_TITLE = `Spacecord (Title TBD)`
INVITE_LINK = `https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=268561472&scope=bot`
APP_COLOR = `#00bbff`
SUCCESS_COLOR = `#00ff55`
FAILURE_COLOR = `#ff0000`

STEP_INTERVAL = 20 * 60 * 1000
GENERAL_RESPONSE_TIME = 2 * 60 * 1000
GENERAL_VOTE_TIME = 10 * 1000
// gENERAL_VOTE_TIME = 5*60*1000

POWER_UNIT = `GWh`
DISTANCE_UNIT = `AU`
SPEED_UNIT = `AU/tick`
HEALTH_UNIT = `HP`
TICK_UNIT = `tick`
WEIGHT_UNIT = `ton`
WEIGHT_UNITS = `tons`
TIME_UNIT = `tick`
TIME_UNITS = `ticks`
TICKS_PER_HOUR = (60 * 60 * 1000) / STEP_INTERVAL
TIME_UNIT_LONG = `day`
TIME_UNIT_LONGS = `days`
TIME_UNIT_LONG_LENGTH = 24 * 60 * 60 * 1000
TIME_UNIT_SHORTS_PER_LONG = TIME_UNIT_LONG_LENGTH / STEP_INTERVAL

SLEEP = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
