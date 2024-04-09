# Event Ticketing DApp

A decentralized application (DApp) for managing and purchasing event tickets on the Ethereum blockchain.

## Overview

The Event Ticketing DApp allows users to create events, buy tickets for those events, and transfer tickets to other Ethereum addresses. The DApp is built using Solidity for the smart contract, React for the frontend, and Web3.js for interacting with the Ethereum blockchain.

## Key Features

- **Create Event:** Users can create new events by specifying the event name, date, ticket price, and the number of available tickets.
- **Buy Ticket:** Users can purchase tickets for existing events by specifying the event ID and the desired quantity of tickets. Payment is made in Ether.
- **Transfer Ticket:** Users can transfer their purchased tickets to other Ethereum addresses.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository_url>
   ```

2. Navigate to the project directory:

   ```bash
   cd event-ticketing-dapp
   ```

3. Install dependencies for the frontend:

   ```bash
   npm install
   ```

4. Install Ganache GUI.

5. Now, create a project on Ganache GUI and pass on the path of truffle-config.js file

6. Compile & migrate the smart contract using Truffle.

    ```bash
    cd truffle

    truffle compile
    
    truffle migrate
    ```

7. Start the development server:

   ```bash
   cd client

   npx webpack

   npm start
   ```

8. Ensure you have MetaMask installed in your browser and connected to the desired Ethereum network (Ganache, in this case).

## Project Structure

- `contracts/EventContract.sol`: Solidity smart contract for managing events and ticket transactions.
- `src/App.jsx`: React component for the frontend UI and interaction with the smart contract.
- `src/contracts/EventContract.json`: JSON file containing the compiled ABI and network information of the smart contract.

## Usage

1. Connect MetaMask to the desired Ethereum network (e.g., localhost for development or Rinkeby for testing).
2. Create an event by filling out the event creation form and clicking "Create Event".
3. Purchase tickets for an existing event by entering the event ID and desired ticket quantity, then clicking "Buy Ticket".
4. Transfer tickets to another Ethereum address by entering the event ID, ticket quantity, and recipient address, then clicking "Transfer Ticket".

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or inquiries, feel free to contact raise an issue. 🙂
