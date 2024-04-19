import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EventContract from './contracts/EventContract.json';
import './styles.css';
import 'tailwindcss/tailwind.css';

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
  const [nextId, setNextId] = useState(0); // Initialize nextId state

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
        // alert("No ethereum browser detected. Please install MetaMask to get started.")
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

        // Fetch and set initial nextId value
        const id = await contract.methods.nextId().call();
        setNextId(parseInt(id));
      }
    }
    loadBlockchainData();
  }, [web3]);

  const createEvent = async () => {
    // const web3 = new Web3(window.ethereum);
    // const parsedPriceInWei = web3.utils.toWei(eventPrice, 'ether');
    if (!contract) return;
    try {
      const date = (new Date(eventDate)).getTime() / 1000; // Convert eventDate to Unix timestamp
      const parsedPrice = isNaN(eventPrice) || eventPrice.trim() === '' ? NaN : parseInt(eventPrice);
      const parsedCount = isNaN(ticketCount) || ticketCount.trim() === '' ? NaN : parseInt(ticketCount);
      if (isNaN(parsedPrice) || isNaN(parsedCount)) {
        alert("Invalid price or ticket count")
        throw new Error('Invalid price or ticket count');
      }
      await contract.methods.createEvent(eventName, date, parsedPrice, parsedCount).send({ from: accounts[0] });
      const newNextId = await contract.methods.nextId().call(); // Get the updated nextId
      setNextId(parseInt(newNextId)); // Update the nextId state
      const eventId = newNextId - 1; // Calculate the ID of the created event
      setEventId(eventId); // Update the eventId state
      alert('Event created successfully! 🥳');
      console.log(nextId);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please check the console for details. 😟');
    }
  };


  const buyTicket = async () => {
    if (!contract || !eventId || !ticketQuantity) return;
    try {
      const _event = await contract.methods.events(eventId).call(); // Fetch event details from the contract
      const totalPrice = _event.price * ticketQuantity;
      await contract.methods.buyTicket(eventId, ticketQuantity).send({ from: accounts[0], value: totalPrice });
      alert('Ticket(s) purchased successfully! 🥳');
    } catch (error) {
      console.error('Error buying ticket:', error);
      alert('Failed to buy ticket. Please check the console for details.');
    }
  };

  const transferTicket = async () => {
    if (!contract || !eventId || !ticketQuantity || !transferTo) return;
    try {
      const ticketsOwned = await contract.methods.tickets(accounts[0], eventId).call();
      if (ticketsOwned < ticketQuantity) {
        alert('Insufficient tickets owned.');
        return;
      }

      const gasEstimate = await contract.methods.transferTicket(eventId, ticketQuantity, transferTo).estimateGas({ from: accounts[0] });
      const txOptions = {
        from: accounts[0],
        gas: Math.round(gasEstimate * 1.1),
      };
      await contract.methods.transferTicket(eventId, ticketQuantity, transferTo).send(txOptions);
      alert('Ticket(s) transferred successfully! 🎉');
    } catch (error) {
      console.error('Error transferring ticket:', error);
      alert('Failed to transfer ticket. Please check the console for details.');
    }
  };

  const handleEventIdChange = (e) => {
    setEventId(e.target.value);
    console.log(nextId)
  };

  const handleTicketQuantityChange = (e) => {
    setTicketQuantity(e.target.value);
  };

  const handleTransferToChange = (e) => {
    setTransferTo(e.target.value);
  };

  return (
    <div className="p-20 bg-gray-200 min-h-screen flex justify-center items-center">

      <div className="w-full max-w-3xl p-10 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold underline text-center mb-8">Event Management DApp</h1>
        <div className="createevt-container mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Event</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Event Name:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="text" placeholder="Event Name" onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Event Date:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded " type="datetime-local" onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Price:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" pattern='\d*' placeholder="Price" onChange={(e) => setEventPrice(e.target.value)} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Ticket Count:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" pattern='\d*' placeholder="Ticket Count" onChange={(e) => setTicketCount(e.target.value)} />
            </div>
            <div className="flex justify-center">
              <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={createEvent}>Create Event</button>
            </div>
          </div>
        </div>
        <div className="buyticket-container mb-8">
          <h2 className="text-2xl font-semibold mb-4">Buy Ticket</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Event ID:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" placeholder="Event ID" onChange={handleEventIdChange} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Quantity:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" placeholder="Quantity" onChange={handleTicketQuantityChange} />
            </div>
            <div className="flex justify-center">
              <button className="bg-green-800 text-white py-2 px-4 rounded hover:bg-green-900" onClick={buyTicket}>Buy Ticket</button>
            </div>
          </div>
        </div>
        <div className="transfer-container">
          <h2 className="text-2xl font-semibold mb-4">Transfer Ticket</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Event ID:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" placeholder="Event ID" onChange={handleEventIdChange} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Quantity:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="number" placeholder="Quantity" onChange={handleTicketQuantityChange} />
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right mr-4">Transfer To:</label>
              <input className="flex-1 border border-gray-400 p-2 rounded" type="text" placeholder="Transfer To Address" onChange={handleTransferToChange} />
            </div>
            <div className="flex justify-center">
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600" onClick={transferTicket}>Transfer Ticket</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


}

export default App;
