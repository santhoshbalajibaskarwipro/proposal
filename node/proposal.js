/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
	// The Init method is called when the Smart Contract 'proposal' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info('=========== Instantiated proposal chaincode ===========');
    return shim.success();
  }
  
   // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'proposal'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }
  
  async initLedger(stub, args) {
	   console.info('============= START : Initialize Ledger ===========');
	   let proposal_data = [];
    proposal_data.push({
      proposal_id: 'INDBLRSJP001',
      region: 'Bangalore',
      country: 'India'
    });
    proposal_data.push({
      proposal_id: 'UKLONWS001',
      region: 'London',
      country: 'UK'
    });
    proposal_data.push({
      proposal_id: 'FRPAREF001',
      region: 'Paris',
      country: 'France'
    });
	   for (let i = 0; i < proposal_data.length; i++) {

      await stub.putState(proposal_data[i].proposal_id, Buffer.from(JSON.stringify(proposal_data[i])));
      console.info('Added <--> ', proposal_data[i]);
    }
    console.info('============= END : Initialize Ledger ===========');
	  
	  
  }
  
  
  async createProposal(stub, args) {
    console.info('============= START : Create Proposal ===========');
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }

    var proposal_data = {
      docType: 'car',
      proposal_id: args[0],
      region: args[1],
      country: args[2]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(proposal_data)));
    console.info('============= END : Create Proposal ===========');
  }
  
  
  
  
  async queryProposal(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting Proposal ID');
    }
    let given_proposal_id = args[0];

    let ProposalAsBytes = await stub.getState(given_proposal_id); //get the car from chaincode state
    if (!ProposalAsBytes || ProposalAsBytes.toString().length <= 0) {
      throw new Error(given_proposal_id + ' does not exist: ');
    }
    console.log(ProposalAsBytes.toString());
    return ProposalAsBytes;
  }
	
	
	};

shim.start(new Chaincode());
