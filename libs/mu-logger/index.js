const {Client} = require('@elastic/elasticsearch');

class Logger {
  constructor(clientName) {
    this.clientName = clientName;
    this.esClient = new Client({
      node: 'http://localhost:9200'
    });
    this.#checkAndCreateIndex().then().catch(e => {
      if (!e.message.includes('resource_already_exists_exception')) {
        throw e;
      }
    });
  }

  async #checkAndCreateIndex() {
    const indexName = 'mu_logs';
    const indexExists = await this.esClient.indices.exists({index: indexName});
    if (!indexExists) {
      await this.esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              app: {
                type: 'keyword'
              },
              logType: {
                type: 'keyword'
              },
              date: {
                type: 'date'
              },
              message: {
                type: 'text',
                index: false
              }
            }
          }
        }
      });
    }
  }

  #log(logObject) {
    const {logType, message} = logObject;
    this.esClient.index({
      index: 'mu_logs',
      body: {
        app: this.clientName,
        logType,
        date: new Date(),
        message
      }
    }).then();
  }

  #transformMessage = message => {
    if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message);
    }
    return message;
  };

  info(message) {
    message = this.#transformMessage(message);
    this.#log({
      logType: 'info',
      message
    });
    console.log(`INFO: ${message}`);
  }

  warning(message) {
    message = this.#transformMessage(message);
    this.#log({
      logType: 'warning',
      message
    });
    console.warn(`WARNING: ${message}`);
  }

  error(message) {
    message = this.#transformMessage(message);
    this.#log({
      logType: 'error',
      message
    });
    console.error(`ERROR: ${message}`);
  }

}

module.exports = Logger;
