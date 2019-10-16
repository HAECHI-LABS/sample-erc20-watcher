require('dotenv').config()
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const Henesis = require('@haechi-labs/henesis-sdk-js').default;

const model = [];
const { CLIENT_ID, INTEGRATION_ID } = process.env;
app.use(cors({
  allowedHeaders: ['Current-Page', 'Last-Page', 'Authorization'],
  exposedHeaders: ['Current-Page', 'Last-Page', 'Authorization'],
}));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/events', function(req,res) {
    res.json(model); 
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

async function henesis () {
  const henesis = new Henesis(CLIENT_ID);

  // subscribe "streamedBlock", then create subscription object.
  const subscription = await henesis.subscribe(
    "streamedBlock",
    {
      integrationId:INTEGRATION_ID,
      subscriptionId: "your-subscription-id"
    }
  );

  subscription.on('message', async (message) => {
    const events = messageToEvents(message)
    events.forEach( event => model.push(event))
    console.log(`data received, event:${events}`)
    message.ack();
  });

  subscription.on('error', err => {
    console.error(err);
  });

  subscription.on('close', err => {
    console.error(err);
  });
    
  //parsing logic
  function messageToEvents(message) {
       const events = message.data.events;
       const blockMeta = message.data.blockMeta;
       return events.map(event => {
           return {
               event: event.eventName.split('(')[0],
               contract: event.contractName,
               transactionHash: event.transaction.hash,
               args: dataToArgs(event.data),
               blockMeta,
           }
       });
       function dataToArgs(data) {
           const res = {};
           for (let item of data) {
               res[item.name] = item.value;
           }
           return res;
       }
   }
}

async function main() {
    henesis()
    app.listen(3000);
}
main()
