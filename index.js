require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const { EventStreamer } = require('@haechi-labs/henesis-sdk-js');

const model = [];
const { CLIENT_ID, INTEGRATION_ID } = process.env;

app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/events', function(req, res) {
  res.json(model);
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

async function henesis() {
  let processedBlockNumber = 0;
  // create event streamer instance
  const eventStreamer = new EventStreamer(CLIENT_ID); // you can get client id using henesis-cli

  // subscribe "streamedBlock", then create subscription object.
  const subscription = await eventStreamer.subscribe(
      'streamedBlock',
      {
        integrationId: INTEGRATION_ID,
        subscriptionId: 'your-subscription-id',
        ackTimeout: 30 * 1000 // default is 10 * 1000(ms)
      }
  );

  subscription.on('message', async message => {
    // In case of disconnection due to network abnormalities (such as Wi-Fi problem), up to one duplicated message can be delivered.
    // You can check message duplication with messageId or block number.
    if (getBlockNumber(message) > processedBlockNumber) {
      const events = messageToEvents(message);
      // processing events
      // For example, you can save events to your database.
      events.forEach(event => model.push(event));
      console.log(JSON.stringify(events, undefined, 2));
      // You need to remember the processed index(messageId or block number) of the message you received.
      setProcessedBlockNumber(message);
    }
    message.ack(); // (MUST) Send an ACK message even if duplicated message!!
  });

  subscription.on('error', err => {
    console.error(err);
  });

  subscription.on('close', err => {
    console.error(err);
  });

  //parsing logic
  function messageToEvents(message) {
    const blockMeta = message.data.blockMeta;
    const events = message.data.events;
    return events.map(event => {
      return {
        event: event.eventName.split('(')[0],
        contract: event.contractName,
        transactionHash: event.transaction.hash,
        args: dataToArgs(event.data),
        blockMeta
      };
    });
    function dataToArgs(data) {
      const res = {};
      for (let item of data) {
        res[item.name] = item.value;
      }
      return res;
    }
  }

  function getBlockNumber(message) {
    return message.data.blockMeta.blockNumber;
  }

  function setProcessedBlockNumber(message) {
    processedBlockNumber = message.data.blockMeta.blockNumber;
  }
}

async function main() {
  henesis();
  app.listen(3000);
}
main();
