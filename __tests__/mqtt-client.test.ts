const mockClientOn = jest.fn().mockImplementation((type, handler) => {
  if (type === 'connect') {
    handler()
  }
})

const mockSuccessfullConnection = {
  on: mockClientOn,
  subscribe: jest.fn(),
}

const mockConnect = jest.fn()

jest.mock('mqtt', () => {
  return { connect: mockConnect }
})

const mockConnectAndSendMessage = (topic, msg) => (type, handler) => {
  if (type === 'message') {
    handler(topic, msg)
  }
  if (type === 'connect') {
    handler()
  }
}

import { MqttClient } from '../src/mqtt-client.js'

describe('mqtt client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    mockConnect.mockReturnValue(mockSuccessfullConnection)
  })
  describe('connection', () => {
    it('Instanciates a client', () => {
      const client = new MqttClient()
      expect(typeof client).toBe(`object`)
    })
    it('call mqtt.connect on connection', async () => {
      const client = new MqttClient()
      await client.connect('my-server')
      expect(mockConnect).toHaveBeenCalledWith('my-server')
    })
    it('add messageHandler on connection', async () => {
      const client = new MqttClient()

      // Add this after client initialization since function is bound
      const messageHandlerSpy = jest.spyOn(client as any, 'messageHandler')

      await client.connect('my-server')
      expect(mockClientOn).toHaveBeenCalledWith('message', messageHandlerSpy)
    })
    it('expect connect to reject on MQTT library error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console as any, 'error')
        .mockImplementation(jest.fn())

      mockConnect.mockReturnValue({
        on: jest.fn().mockImplementation((type, handler) => {
          if (type === 'error') {
            handler('Staged Error')
          }
        }),
      })

      const client = new MqttClient()

      await expect(client.connect('my-server')).rejects.toBe('Staged Error')

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
  describe('adding listeners', () => {
    it('expect addListener to call MQTT library subscribe with correct topic after connection', async () => {
      const client = new MqttClient()

      client.addListener('my-topic-1', /my-topic-1\/match/, jest.fn())
      client.addListener('my-topic-2', /my-topic-2\/match/, jest.fn())

      await client.connect('my-server')

      expect(mockSuccessfullConnection.subscribe).toHaveBeenCalledWith(
        ['my-topic-1', 'my-topic-2'],
        expect.anything(),
      )
    })
    it('expect addListener to not subscribe to duplicate topic', async () => {
      const client = new MqttClient()

      client.addListener('my-topic', /my-topic\/match-1/, jest.fn())
      client.addListener('my-topic', /my-topic\/match-2/, jest.fn())

      await client.connect('my-server')

      expect(mockSuccessfullConnection.subscribe).toHaveBeenCalledWith(
        ['my-topic'],
        expect.anything(),
      )
    })
    it('expect addListener to throw if connection is already established', async () => {
      const client = new MqttClient()
      await client.connect('my-server')

      const callFunction = () =>
        client.addListener('topic', /topic\/match/, jest.fn())

      expect(callFunction).toThrow()
    })
  })
  describe('messages', () => {
    it('callback is called when topic matches watched expression', async () => {
      const topic = 'my-devices/18'
      const message = 'hello test'
      const myCallback = jest.fn()

      const messageBuffer = Buffer.from(message, 'utf8')
      mockClientOn.mockImplementation(
        mockConnectAndSendMessage(topic, messageBuffer),
      )

      const client = new MqttClient()
      client.addListener('any', /my-devices\/+/, myCallback)

      await client.connect('my-server')
      expect(myCallback).toHaveBeenCalledWith(topic, message)
    })
    it('correct callback is called when multiple listeners exist', async () => {
      const topic = 'my-devices/18'
      const message = 'message 1'

      const myCallback1 = jest.fn()
      const myCallback2 = jest.fn()

      const messageBuffer = Buffer.from(message, 'utf8')
      mockClientOn.mockImplementation(
        mockConnectAndSendMessage(topic, messageBuffer),
      )

      const client = new MqttClient()
      client.addListener('any', /my-other-devices\/+/, myCallback1)
      client.addListener('any', /my-devices\/+/, myCallback2)

      await client.connect('my-server')
      expect(myCallback2).toHaveBeenCalledWith(topic, message)
    })
    it('callback is NOT called when topic dont match watched expression', async () => {
      const topic = 'my-devices/18'
      const message = 'hello test'
      const myCallback = jest.fn()

      const messageBuffer = Buffer.from(message, 'utf8')
      mockClientOn.mockImplementation(
        mockConnectAndSendMessage(topic, messageBuffer),
      )

      const client = new MqttClient()
      client.addListener('any', /my-core\/\+/, myCallback)

      await client.connect('my-server')
      expect(myCallback).not.toHaveBeenCalled()
    })
  })
})
