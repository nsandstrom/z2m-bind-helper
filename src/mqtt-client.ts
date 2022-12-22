import mqtt from 'mqtt'

type matcher = [pattern: string, callback: any]

const matchers: matcher[] = [
  [
    'zigbee2mqtt/bridge/groups',
    () => {
      console.log('grps')
    },
  ],
]

class MqttClient {
  private client: mqtt.MqttClient

  // constructor() {}

  async connect(broker: string): Promise<void> {
    console.log('CLASSY connect to', broker)

    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(broker)

      this.client.on('connect', () => {
        console.log('Connected!')
        resolve()
      })
      this.client.on('error', (err) => {
        console.error('Connection failed', err)
        reject()
      })
    })
  }
}

const firren = new MqttClient()

console.log(firren)

firren.connect('Mah brokeh!')

const settings = {
  broker: 'mqtt://mqtt.my_broker.se',
  base_topic: 'zigbee2mqtt',
}

const client = mqtt.connect('mqtt://mqtt.my_broker.se', {
  // clientId: "fiskpinne2",clean: false
})

client.on('message', function (topic, messageB) {
  const message = messageB.toString()

  console.log('Parse', topic)

  const match = matchers.find((m) => topic.match(m[0]))

  if (!match) return

  console.log('Fond!')

  const callback = match[1]

  callback()
  return

  if (topic.match('zigbee2mqtt/bridge/devices')) {
    console.log('⚙️: Devices')

    // parseDevices(message)
  } else if (topic == 'zigbee2mqtt/bridge/groups') {
    console.log('⚙️: Groups')
    // switchAction(topic)
  } else if (topic.match(/zigbee2mqtt\/\w+\/action/)) {
    console.log(topic, message)
    // switchAction(topic)
  } else {
    // console.log('Unknown', topic)
  }
  // message is Buffer
  // client.end()
})

client.on('connect', function () {
  client.subscribe(`zigbee2mqtt/bridge/#`, (err, granted) => {
    if (!err) {
      if (granted.length > 0) {
        const grantedTopic = granted[0].topic
        console.log('subscribed to', grantedTopic)
      }
      return
    }
  })

  // client.subscribe(`zigbee2mqtt/bridge/#`)
  // client.subscribe(`zigbee2mqtt/bridge/devices`)
  // client.subscribe(`zigbee2mqtt/bridge/groups`)
  // client.subscribe(`${settings.base_topic}/#`, function (err) {
  // client.subscribe(`zigbee2mqtt/+/action`, function (err) {
  //   if (!err) {
  //     console.log('subscribed')
  //   }
  // })
})

export const addListener = (topic: string, callback: any): void => {
  console.log('Add a listener', callback, 'on', topic)

  const fullTopic = `${settings.base_topic}/${topic}`
  client.subscribe(
    fullTopic,
    {
      // qos: 1,
      // rap: false
    } as mqtt.IClientSubscribeOptions,
    function (err, granted) {
      if (!err) {
        const grantedTopic = granted[0].topic
        console.log('subscribed to', grantedTopic)
        return
      }
    },
  )
}

export const startListening = (): void => {
  console.log('start parsing messages')
  console.log('Is probably parsing now')
}
