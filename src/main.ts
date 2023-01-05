import { MessageCallback, MqttClient } from './mqtt-client.js'
import { Z2mClient } from './z2m-client.js'

let groups = {}
let devices = {}

const zigbee = new Z2mClient()

const tempSettings = {
  mqtt: {
    broker: 'mqtt://mqtt.brickpile.se',
    base_topic: 'zigbee2mqtt',
  },
}

const main = async () => {
  console.log(groups, devices)

  const mqtt = new MqttClient()

  mqtt.addListener('zigbee2mqtt/bridge/#', /bridge\/groups$/, groupsCallback)
  mqtt.addListener('zigbee2mqtt/bridge/#', /bridge\/devices$/, devicesCallback)

  mqtt.connect(tempSettings.mqtt.broker)
}

const groupsCallback: MessageCallback = (_topic: string, message: string) => {
  console.log('Group callback, size:', message.length)

  groups = JSON.parse(message)

  console.log(zigbee)
  zigbee.updateGroups(groups)
}

const devicesCallback: MessageCallback = (_topic: string, message: string) => {
  console.log('Device callback, size:', message.length)

  devices = JSON.parse(message)
}

main()
