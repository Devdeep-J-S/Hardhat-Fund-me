//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// get funds
// withdraw fund
// set min fund price

//Imports 
import './PriceConverter.sol';

//Errors 
error FundMe__NotOwner(); // declaring custom error

// solc cherck : solc --userdoc --devdoc FundMe.sol
/**
 * @title FundMe
 * @author Devdeep Shetranjiwala 
 * @notice This is a basic contract to get funds and withdraw them
 * @dev All function calls are currently implemented without side effects
 * @dev Price is getting from oracle chain link using library 
 */

// Prfered order : 
/*
Type declarations
State variables
Events
Errors
Modifiers
Functions
*/
contract FundMe {
    using PriceConverter for uint256; // using for something library the library - class name here

    uint256 public constant MINI_USD = 50 * 1e18; // const reduces gas usage good thing

    address[] public s_funders;
    mapping(address => uint256) public s_amountfunded;

    address public immutable i_owner; // if value in fun not in global i_ just good pratice

    AggregatorV3Interface public s_PriceFeed;


    modifier onlyOwner() {
        // great way to check before going into the code
        // require(i_owner == msg.sender, "Sender is not owner!!");
        // why custom error saves gas
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // this just represnt the rest of the code do
    }

    constructor(address priceFeedAddress) {
        // it will give owner of contract the owner address
        i_owner = msg.sender;
        s_PriceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // public so anyone can use it
        // take prices and set min price in USD 50 $
        require(
            msg.value.getconversionrate(s_PriceFeed) >= MINI_USD,
            'yo min limit is not reached!!!'
        );
        s_funders.push(msg.sender);
        s_amountfunded[msg.sender] = msg.value; //msg. global declared variables
        // revert stop till here and go back with remaing gas
    }

    function cheap_withdraw() public onlyOwner {
        // onlyOwner check first then goes in function
        // for ( start , end , step ) like c++
        address[] memory  temp_funders = s_funders ; 
        uint256 len = temp_funders.length; // saves gas
        for (
            uint256 funderindex = 0;
            funderindex < len ;
            ++funderindex
        ) {
            address temp_address = temp_funders[funderindex];
            s_amountfunded[temp_address] = 0;
        }

        // reset array
        s_funders = new address[](0); // resetting with making new funder

        // withdraw fund
        // 3 fucntionality -> transfer , send , call  https://solidity-by-example.org/sending-ether/
        // call best why link ...

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }(''); // this balcnce gives balance of contract - acts as wallet // blank for function we are not using now
        // payable address type cast from only address
        require(success, 'call failed!!!');
    }

    function withdraw() public onlyOwner{
        /** 
         optimize for loop to save money beaicse its doing redudunt store varaibles use 
         */
        for (
            uint256 funderindex = 0;
            funderindex < s_funders.length;
            ++funderindex
        ) {
            address temp_address = s_funders[funderindex];
            s_amountfunded[temp_address] = 0;
        }

        // reset array
        s_funders = new address[](0); // resetting with making new funder

        // withdraw fund
        // 3 fucntionality -> transfer , send , call  https://solidity-by-example.org/sending-ether/
        // call best why link ...

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }(''); // this balcnce gives balance of contract - acts as wallet // blank for function we are not using now
        // payable address type cast from only address
        require(success, 'call failed!!!');
    }

}


//advanced stuff ;
//constant , immutable

// custom errors

// sender sends ETH without calling fund  // a true daan , fund :)
// receive () , fallback()
// above will trigger automatically if we don't want to store the data like senders
// https://solidity-by-example.org/fallback/

// for routing
// receive() external payable{
//    fund() ;
//    }
