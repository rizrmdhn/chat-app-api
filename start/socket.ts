import WebSocket from 'App/Services/WebSocket'

WebSocket.boot()

/**
 * Listen for incoming socket connections
 */
WebSocket.io.on('connection', (socket) => {
  socket.emit('greeting', 'Hello from server')

  socket.on('greeting', (data) => {
    console.log(data)
  })
})
