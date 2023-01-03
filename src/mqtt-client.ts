import mqtt from 'mqtt'

type Matcher = [pattern: RegExp, callback: MessageCallback]

export type MessageCallback = (topic: string, message: string) => void

export class MqttClient {
  private client: mqtt.MqttClient
  private matchers = [] as Matcher[]
  private subscriptions = [] as string[]

  constructor() {
    this.messageHandler = this.messageHandler.bind(this)
  }

  async connect(broker: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(broker)

      this.client.on('connect', async () => {
        this.client.on('message', this.messageHandler)

        await this.subscribe()

        resolve()
      })
      this.client.on('error', (err) => {
        console.error('Connection failed', err)
        reject(err)
      })
    })
  }

  private async subscribe() {
    const subscriptions = pruneDuplicates(this.subscriptions)
    this.client.subscribe(subscriptions, function (err, granted) {
      if (!err) {
        const grantedTopic = granted[0].topic
        console.log('subscribed to', grantedTopic, granted)
        return
      }
    })
  }

  private messageHandler(topic: string, msgB: Buffer) {
    topic
    msgB

    const match = this.matchers.find(([expression, _callback]) =>
      expression.test(topic),
    )

    if (!match) return

    const message = msgB.toString()
    const [_expression, callback] = match

    callback(topic, message)
  }

  addListener(
    subscribeTopic: string,
    matchTopic: RegExp,
    callback: MessageCallback,
  ) {
    if (this.client) {
      throw 'addListener must be called before connection'
    }

    this.matchers.push([matchTopic, callback])
    this.subscriptions.push(subscribeTopic)
  }
}

const pruneDuplicates = (values: string[]): string[] => [...new Set(values)]
