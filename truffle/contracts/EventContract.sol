// SPDX-License-Identifier: Unlicense
pragma solidity >=0.5.0 <0.9.0;

contract EventContract {
    struct Event {
        address organizer;
        string name;
        uint date;
        uint price;
        uint ticketCount;
        uint ticketRemain;
    }

    mapping(uint => Event) public events;
    mapping(address => mapping(uint => uint)) public tickets;
    uint public nextId;

    function createEvent(
        string calldata name,
        uint date,
        uint price,
        uint ticketCount
    ) external {
        require(date > block.timestamp, "Event date must be in the future");
        require(ticketCount > 0, "Ticket count must be greater than 0");

        events[nextId] = Event(
            msg.sender,
            name,
            date,
            price,
            ticketCount,
            ticketCount
        );
        nextId++;
    }

    function buyTicket(uint id, uint quantity) external payable {
        require(events[id].date != 0, "Event does not exist");
        require(block.timestamp < events[id].date, "Event has already occurred");

        Event storage _event = events[id];
        uint totalCost = _event.price * quantity;

        require(msg.value >= totalCost, "Insufficient Ether sent");
        require(_event.ticketRemain >= quantity, "Not enough tickets available");

        _event.ticketRemain -= quantity;
        tickets[msg.sender][id] += quantity;
    }

    function transferTicket(uint id, uint quantity, address to) external {
        require(events[id].date != 0, "Event does not exist");
        require(block.timestamp < events[id].date, "Event has already occurred");
        require(tickets[msg.sender][id] >= quantity, "Insufficient tickets owned");

        tickets[msg.sender][id] -= quantity;
        tickets[to][id] += quantity;
    }
}
