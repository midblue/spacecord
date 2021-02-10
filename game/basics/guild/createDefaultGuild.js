const defaultServerSettings = require('../../../discord/defaults/defaultServerSettings')
const factions = require('../factions')

module.exports = function ({ discordGuild, channelId }) {
  const ship = {
    name: getShipName(),
    launched: Date.now(),
    model: 'shipA',
    credits: 50,
    captain: false,
    hp: 1,
    status: {
      flying: true,
    },
    power: 11,
    members: [],
    seen: { planets: [] },
    log: [],
    lastAttack: 0,
    equipment: {
      engine: [
        {
          id: 'basic1',
          repaired: Date.now(),
          repair: 0.8,
        },
      ],
      armor: [
        {
          id: 'steelPlating',
          repaired: Date.now(),
          repair: 0.6,
        },
      ],
      weapon: [
        {
          id: 'basic1',
          repaired: Date.now(),
          repair: 0.7,
        },
      ],
      telemetry: [
        {
          id: 'telemetry1',
          repaired: Date.now(),
          repair: 0.8,
        },
      ],
      scanner: [
        {
          id: 'basic1',
          repaired: Date.now(),
          repair: 0.5,
        },
      ],
      transceiver: [
        {
          id: 'transceiver1',
          repaired: Date.now(),
          repair: 0.5,
        },
      ],
      battery: [
        {
          id: 'battery1',
          repaired: Date.now(),
          repair: 0.9,
        },
      ],
    },
    cargo: [
      {
        type: 'fuel',
        amount: 8,
      },
      {
        type: 'food',
        amount: 2,
      },
    ],
    location: [Math.random() * 4, Math.random() * 4],
    bearing: [Math.random() - 0.5, Math.random() - 0.5],
    speed: 0,
  }

  const data = {
    guildId: discordGuild.id,
    guildName: discordGuild.name,
    channel: channelId,
    faction: {
      color: Object.keys(factions)[
        Math.floor(Object.keys(factions).length * Math.random())
      ],
    },
    ship,
    created: Date.now(),
    settings: { ...defaultServerSettings },
  }
  return data
}

function getShipName() {
  return names[Math.floor(Math.random() * names.length)]
}

const names = [
  'Rampart',
  'Interceptor',
  'Carthage',
  'Cain',
  'The Spectator',
  'ISS Despot',
  'SC Nemesis',
  'CS Shade',
  'BS Herminia',
  'BC Vanguard',
  'The Promise',
  'Scythe',
  'Harlegand',
  'Zion',
  'STS Little Rascal',
  'HMS Ravager',
  'Carbonaria',
  'SS Infinitum',
  'LWSS Lucky',
  'Spectator',
  'Phalanx',
  'Destiny',
  'LWSS The Trident',
  'Priestess',
  'HMS Providence',
  'HWSS Carnage',
  'HMS Romulus',
  'Nemesis',
  'Zenith',
  'Basilisk',
  'Euphoria',
  'CS Trailblazer',
  'SC Saratoga',
  'STS Myrmidon',
  'Deonida',
  'SC Inferno',
  'The Liberator',
  'The Trident',
  'Inquisitor',
  'Shear Razor',
  'Providence',
  'BC Perilous',
  'STS Wyvern',
  'CS Thunderbolt',
  'LWSS Messenger',
  'CS Neurotoxin',
  'Insurgent',
  'Neurotoxin',
  'Tranquility',
  'Harlequin',
  'Normandy',
  'Lullaby',
  'SSE Empress',
  'Leo',
  'ISS The Inquisitor',
  'SS Churchill',
  'Seleucia',
  'Deinonychus',
  'Legacy',
  'Conqueror',
  'LWSS Thanatos',
  'HMS Ashaton',
  'SC Albatross',
  'CS Hammer',
  'SS Ghunne',
  'Dakota',
  'Experience',
  'Neptune',
  'Dispatcher',
  'SSE Coyote',
  'CS Remorseless',
  'BS Tortoise',
  'ISS Actium',
  'HMS Invader',
  'Zion',
  'The Inquisitor',
  'Opal Star',
  'Escorial',
  'Calypso',
  'Actium',
  'LWSS Navigator',
  'STS Ghunne',
  'ISS Utopia',
  'SS The Javelin',
]
