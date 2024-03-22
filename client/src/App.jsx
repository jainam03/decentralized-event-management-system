// App.jsx

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EventContract from './contracts/EventContract.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPrice, setEventPrice] = useState('');
  const [ticketCount, setTicketCount] = useState('');
  const [eventId, setEventId] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState('');

  useEffect(() => {
    async function loadBlockchainData() {
      // Load web3
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' }); // Use eth_requestAccounts instead of enable
          setWeb3(web3);
        } catch (error) {
          console.error('User denied account access');
        }
      }
      else {
        console.log('No Ethereum browser detected. You should consider trying MetaMask.');
      }

      // Load accounts and contract
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = EventContract.networks[networkId];
        const contract = new web3.eth.Contract(
          EventContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(contract);
      }
    }
    loadBlockchainData();

    // return () => {
    //   isMounted = false;

    //   if (web3) {
    //     web3.currentProvider.disconnect();
    //   }
    // }
  }, [web3]); // Include web3 in the dependency array

  const createEvent = async () => {
    if (!contract) return;
    try {
      await contract.methods.createEvent(eventName, eventDate, eventPrice, ticketCount).send({ from: accounts[0] });
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please check the console for details.');
    }
  };

  const buyTicket = async () => {
    if (!contract || !eventId || !ticketQuantity) return;
    try {
      await contract.methods.buyTicket(eventId, ticketQuantity).send({ from: accounts[0], value: eventPrice * ticketQuantity });
      alert('Ticket(s) purchased successfully!');
    } catch (error) {
      console.error('Error buying ticket:', error);
      alert('Failed to buy ticket. Please check the console for details.');
    }
  };

  const handleEventIdChange = (e) => {
    setEventId(e.target.value);
  };

  const handleTicketQuantityChange = (e) => {
    setTicketQuantity(e.target.value);
  };

  return (
    <div className="App">
      <h1>Event Management DApp</h1>
      <div>
        <h2>Create Event</h2>
        <input type="text" placeholder="Event Name" onChange={(e) => setEventName(e.target.value)} />
        <input type="datetime-local" onChange={(e) => setEventDate(e.target.value)} />
        <input type="number" placeholder="Price (in Wei)" onChange={(e) => setEventPrice(e.target.value)} />
        <input type="number" placeholder="Ticket Count" onChange={(e) => setTicketCount(e.target.value)} />
        <button onClick={createEvent}>Create Event</button>
      </div>
      <div>
        <h2>Buy Ticket</h2>
        <input type="number" placeholder="Event ID" onChange={handleEventIdChange} />
        <input type="number" placeholder="Quantity" onChange={handleTicketQuantityChange} />
        <button onClick={buyTicket}>Buy Ticket</button>
      </div>
    </div>
  );
}

export default App;
