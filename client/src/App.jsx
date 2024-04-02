// App.jsx

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EventContract from './contracts/EventContract.json';
import './styles.css';

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
  const [transferTo, setTransferTo] = useState('');

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(web3);
        } catch (error) {
          console.error('User denied account access');
        }
      }
      else {
        console.log('No Ethereum browser detected. You should consider trying MetaMask.');
      }

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
  }, [web3]);

  const createEvent = async () => {
    if (!contract) return;
    try {
      const date = (new Date(eventDate)).getTime() / 1000; // Convert eventDate to Unix timestamp
      // const parsedPrice = parseInt(eventPrice);
      // const parsedCount = parseInt(ticketCount);
      const parsedPrice = isNaN(eventPrice) || eventPrice.trim() === '' ? NaN : parseInt(eventPrice)
      const parsedCount = isNaN(ticketCount) || ticketCount.trim() === '' ? NaN : parseInt(ticketCount)
      if (isNaN(parsedPrice) || isNaN(parsedCount)) {
        throw new Error('Invalid price or ticket count');
      }
      await contract.methods.createEvent(eventName, date, parsedPrice, parsedCount).send({ from: accounts[0] });
      alert('Event created successfully!');
      console.log(eventId, eventName, date, parsedPrice, parsedCount)
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please check the console for details.');
    }
  };

  const buyTicket = async () => {
    if (!contract || !eventId || !ticketQuantity) return;
    try {
      const _event = await contract.methods.events(eventId).call(); // Fetch event details from the contract
      const totalPrice = _event.price * ticketQuantity;
      await contract.methods.buyTicket(eventId, ticketQuantity).send({ from: accounts[0], value: totalPrice });
      alert('Ticket(s) purchased successfully!');
    } catch (error) {
      console.error('Error buying ticket:', error);
      alert('Failed to buy ticket. Please check the console for details.');
    }
  };

  const transferTicket = async () => {
    if (!contract || !eventId || !ticketQuantity || !transferTo) return;
    try {
      await contract.methods.transferTicket(eventId, ticketQuantity, transferTo).send({ from: accounts[0] });
      alert('Ticket(s) transferred successfully!');
    } catch (error) {
      console.error('Error transferring ticket:', error);
      alert('Failed to transfer ticket. Please check the console for details.');
    }
  };

  const handleEventIdChange = (e) => {
    setEventId(e.target.value);
    console.log(setEventId)
  };

  const handleTicketQuantityChange = (e) => {
    setTicketQuantity(e.target.value);
  };

  const handleTransferToChange = (e) => {
    setTransferTo(e.target.value);
  };

  return (
    <div className="App">
      <h1>Event Management DApp</h1>
      <div className='createevt-container' >
        <h2>Create Event</h2>
        <input type="text" placeholder="Event Name" onChange={(e) => setEventName(e.target.value)} />
        <input type="datetime-local" onChange={(e) => setEventDate(e.target.value)} />
        <input type="number" pattern='\d*' placeholder="Price (in Wei)" onChange={(e) => setEventPrice(e.target.value)} />
        <input type="number" pattern='\d*' placeholder="Ticket Count" onChange={(e) => setTicketCount(e.target.value)} />
        <button onClick={createEvent}>Create Event</button>
      </div>
      <div className='buyticket-container' >
        <h2>Buy Ticket</h2>
        <input type="number" placeholder="Event ID" onChange={handleEventIdChange} />
        <input type="number" placeholder="Quantity" onChange={handleTicketQuantityChange} />
        <button onClick={buyTicket}>Buy Ticket</button>
      </div>
      <div className='transfer-container' >
        <h2>Transfer Ticket</h2>
        <input type="number" placeholder="Event ID" onChange={handleEventIdChange} />
        <input type="number" placeholder="Quantity" onChange={handleTicketQuantityChange} />
        <input type="text" placeholder="Transfer To Address" onChange={handleTransferToChange} />
        <button onClick={transferTicket}>Transfer Ticket</button>
      </div>
    </div>
  );
}

export default App;
