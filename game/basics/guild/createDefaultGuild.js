const defaultServerSettings = require(`../../../discord/defaults/defaultServerSettings`)
const factions = require(`../factions`)
const planets = require(`../planet/index`).naiveList

module.exports = function ({ discordGuild, channelId }) {
  const planet = planets[Math.floor(Math.random() * planets.length)]
  const ship = {
    name: getShipName(),
    launched: Date.now(),
    credits: 0,
    captain: false,
    status: {
      dead: false,
      docked: planet.name,
    },
    power: 5,
    members: [],
    seen: { planets: [] },
    log: [],
    lastAttack: 0,
    equipment: [
      {
        equipmentType: `chassis`,
        list: [
          {
            id: `starter`,
            repaired: Date.now(),
            repair: 0.9,
          },
        ],
      },
      {
        equipmentType: `engine`,
        list: [
          {
            id: `basic1`,
            repaired: Date.now(),
            repair: 0.8,
          },
        ],
      },
      {
        equipmentType: `armor`,
        list: [],
      },
      // {
      //   id: 'steelPlating',
      //   repaired: Date.now(),
      //   repair: 0.6,
      // },
      {
        equipmentType: `weapon`,
        list: [
          {
            id: `starter`,
            repaired: Date.now(),
            repair: 0.7,
          },
        ],
      },
      {
        equipmentType: `telemetry`,
        list: [
          {
            id: `image1`,
            repaired: Date.now(),
            repair: 0.8,
          },
        ],
      },
      {
        equipmentType: `scanner`,
        list: [
          {
            id: `basic1`,
            repaired: Date.now(),
            repair: 0.5,
          },
        ],
      },
      {
        equipmentType: `transceiver`,
        list: [
          {
            id: `transceiver1`,
            repaired: Date.now(),
            repair: 0.5,
          },
        ],
      },
      {
        equipmentType: `battery`,
        list: [
          {
            id: `battery1`,
            repaired: Date.now(),
            repair: 0.9,
          },
        ],
      },
    ],
    cargo: [
      {
        cargoType: `fuel`,
        amount: 8,
      },
      // {
      //   cargoType: 'food',
      //   amount: 2,
      // },
    ],
    location: [...planet.location],
    bearing: [Math.random() - 0.5, Math.random() - 0.5],
    speed: 0,
  }

  const data = {
    active: true,
    id: discordGuild.id,
    name: discordGuild.name,
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
  `Rampart`,
  `Interceptor`,
  `Carthage`,
  `Cain`,
  `The Spectator`,
  `ISS Despot`,
  `SC Nemesis`,
  `CS Shade`,
  `BS Herminia`,
  `BC Vanguard`,
  `The Promise`,
  `Scythe`,
  `Harlegand`,
  `Zion`,
  `STS Little Rascal`,
  `HMS Ravager`,
  `Carbonaria`,
  `SS Infinitum`,
  `LWSS Lucky`,
  `Spectator`,
  `Phalanx`,
  `Destiny`,
  `LWSS The Trident`,
  `Priestess`,
  `HMS Providence`,
  `HWSS Carnage`,
  `HMS Romulus`,
  `Nemesis`,
  `Zenith`,
  `Basilisk`,
  `Euphoria`,
  `CS Trailblazer`,
  `SC Saratoga`,
  `STS Myrmidon`,
  `Deonida`,
  `SC Inferno`,
  `The Liberator`,
  `The Trident`,
  `Inquisitor`,
  `Shear Razor`,
  `Providence`,
  `BC Perilous`,
  `STS Wyvern`,
  `CS Thunderbolt`,
  `LWSS Messenger`,
  `CS Neurotoxin`,
  `Insurgent`,
  `Neurotoxin`,
  `Tranquility`,
  `Harlequin`,
  `Normandy`,
  `Lullaby`,
  `SSE Empress`,
  `Leo`,
  `ISS The Inquisitor`,
  `SS Churchill`,
  `Seleucia`,
  `Deinonychus`,
  `Legacy`,
  `Conqueror`,
  `LWSS Thanatos`,
  `HMS Ashaton`,
  `SC Albatross`,
  `CS Hammer`,
  `SS Ghunne`,
  `Dakota`,
  `Neptune`,
  `Dispatcher`,
  `SSE Coyote`,
  `CS Remorseless`,
  `BS Tortoise`,
  `ISS Actium`,
  `HMS Invader`,
  `Zion`,
  `The Inquisitor`,
  `Opal Star`,
  `Escorial`,
  `Calypso`,
  `Actium`,
  `LWSS Navigator`,
  `STS Ghunne`,
  `ISS Utopia`,
  `SS The Javelin`,
  `Gravity`,
]
