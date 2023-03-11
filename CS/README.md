The code is a Node.js script that creates a TCP server and a UDP server. The TCP server listens on port 44405 and
implements a custom protocol. The protocol has two messages: "sayHello" and "serverListResponse". When a client connects
to the TCP server, the server sends a "sayHello" message to the client. The server can receive two types of messages
from the client: "serverInfoResponse" and "serverListResponse". If the client sends a "serverInfoResponse" message, the
server sends back information about a game server based on the ID specified in the message. If the client sends a "
serverListResponse" message, the server sends a list of available game servers to the client.

The UDP server listens on port 55557 and receives data in a specific format. When the data has a specific type of
header, the UDP server extracts information from the data and logs it to the console.

The code also loads a list of game servers from a JSON file and stores it in an array.
