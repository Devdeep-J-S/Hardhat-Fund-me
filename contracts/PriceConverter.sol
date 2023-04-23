// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

// oracle problem discussion thats why ising other link

library PriceConverter {
    function getPrice(
        AggregatorV3Interface pricefeed
    ) internal view returns (uint256) {
        // ABI Application Binary Interface
        // address 0x694AA1769357215DE4FAC081bf1f309aDC325306

        // for abi info about interface - boiler type abstarct class analogy

        // removing hard coded address type depencdecy
        // AggregatorV3Interface price = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );

        (, int256 num, , , ) = pricefeed.latestRoundData();
        return uint256(num * 1e10); //type cast // to get 1e18 in both things
    }

    function getconversionrate(
        uint256 amount,
        AggregatorV3Interface pricefeed
    ) internal view returns (uint256) {
        return uint256((amount * getPrice(pricefeed)) / 1e18);
    }
}
