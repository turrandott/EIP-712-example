// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./utils/cryptography/draft-EIP712.sol";
import "./utils/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "hardhat/console.sol";

contract Vault is EIP712 {
    constructor(string memory name, string memory version) EIP712(name, version) {}

    struct Claim {
        address alice;
        address bob;
        string messageForAlice;
        uint nonce;
        uint timestamp;
        uint cumulativeDebitAlice;
        uint cumulativeDebitBob;
        bytes signatureAlice;
        bytes signatureBob;
    }

    bytes32 private constant CLAIM_TYPE_HASH = keccak256("Claim(address alice,address bob,string messageForAlice,uint256 nonce,uint256 timestamp,uint256 cumulativeDebitAlice,uint256 cumulativeDebitBob)");


    function verify(Claim calldata req) public view returns (bool) {

        console.log('Vault verify:', req.messageForAlice);

        console.log('sign alice');
        console.logBytes(req.signatureAlice);
        console.log('address alice');
        console.logAddress(req.alice);


        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    CLAIM_TYPE_HASH,
                    req.alice,
                    req.bob,
                    keccak256(bytes(req.messageForAlice)), // string!
                    req.nonce,
                    req.timestamp,
                    req.cumulativeDebitAlice,
                    req.cumulativeDebitBob
                )
            )
        );

        address signer = ECDSA.recover(digest, req.signatureAlice);

        console.log('address recovered');
        console.logAddress(signer);

        return signer == req.alice;
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
