'use strict';

module.exports.incoming = (event, context, callback) => {
  const stage = event && event.requestContext ? event.requestContext.stage : 'development';
  let ConfigFile = require('config');
  let stripe_api_key    =
    stage == 'test'
    ? ConfigFile.stripe.test_sk
    : ConfigFile.stripe.live_sk;
	var aws = require('aws-sdk'),
		  async = require('async');
  var stripe = require('stripe')(stripe_api_key);
  var incoming = {};

  console.log('Event: %j', event);
  async.waterfall([
  function(nextProcess) {
    let event;  // https://stripe.com/docs/api#event_object
    try {
      event = JSON.parse(event.body);
      console.log('Incoming: %j', event);
      nextProcess(null, event);
    } catch(err){
      nextProcess(err);
    }
  },
  function(event, nextProcess) {
    // Verify the event by fetching it from Stripe
    stripe.events.retrieve(event.id, nextProcess);
  },
  function(event, nextProcess) {
    // retrieve stripe customer data
    incoming = event;
    if (incoming.data && incoming.data.object && incoming.data.object.customer) {
      stripe.customers.retrieve(incoming.data.object.customer, nextProcess);
    } else {
      nextProcess(null, incoming);
    }
  },
  function(customer, nextProcess) {
    // Branch by the event type
    let event_type = incoming.type ? incoming.type : '';
    console.log('Event: ' + event_type);
    console.log('Customer: %j', customer);

    switch(event_type) {
      case 'invoice.created':
        nextProcess(null, incoming);
        break;
      default:
        nextProcess(null, incoming);
        break;
    }
  }],
  function(err, result) {
    let response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Stripe webhook incoming!',
        input: incoming,
        stage: stage
      }),
    };
    if (err) console.log('Error: %j', err);
    callback(null, response);
  });
};
