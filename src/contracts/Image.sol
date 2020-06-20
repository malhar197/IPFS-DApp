//SPDX-License-Identifier:MIT
pragma solidity >=0.4.21 <0.7.0;

contract Image{
    string ipfsHash;
    //Write Function
    function set(string memory _ipfsHash) public{
        ipfsHash = _ipfsHash;
    }
    //Read Function
    function get() public view returns (string memory){
        return ipfsHash;
    }
}