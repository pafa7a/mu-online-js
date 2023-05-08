# mu-online-js packet manager

mu-online-js packet manager is a library that provides a simple way to define and manage packet structures used in the popular MMORPG game Mu Online.
It allows you to define packet structures in a single place and easily convert between buffer and object representations of these structures.
The library is designed to be used in any Mu Online server application that runs on node.js.

## Features

- Define packet structures in a single place
- Convert between buffer and object representations of packet structures
- Designed to be used in any Mu Online server application that runs on node.js

## Installation
```npm install @mu-online-js/mu-packet-manager```

or

```yarn add @mu-online-js/mu-packet-manager```


## Usage

First, you need to require the library in your code:

```javascript
const packetManager = require('@mu-online-js/mu-packet-manager');
```

You can define your packet structure using an object and convert it to a buffer like this:

```javascript
const messageStruct = {
  header: {
    type: 0xC2,
    size: 'auto',
    headCode: 0xF4,
    subCode: 0x06,
  },
  serverCount: 1,
  serverLoadInfo: [{
    serverId: 0,
    loadPercentage: 20
  }]
}
const message = new packetManager()
  .useStruct(structs.CSServerListResponse)
  .toBuffer(messageStruct);
```

You can also convert a buffer to an object like this:

```javascript
const data = Buffer;/* a buffer received from the client/server */
const messageObj = new packetManager()
  .fromBuffer(data)
  .useStruct(structs.CSServerListResponse)
  .toObject();
```

## Contributing
Contributions are welcome!
If you find a bug or have a feature request, please open an issue.
If you want to contribute code, please open a pull request.

## License
mu-online-js packet manager is licensed under the MIT License.
