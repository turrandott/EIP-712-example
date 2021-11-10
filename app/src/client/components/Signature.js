import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
import abiVault from '../../solidity/abi/Vault.json'

export default function Signature ({ address }) {

    if (!address) return null

    const web3 = new Web3(Web3.givenProvider)

    const spendBtn = async() => {
        const vaultAddress = "0x017FA3318Df56b55b1463d563C47D6eE067AF30F"
        const timestamp = Date.now()
        const amount = 10

        const Vault = new web3.eth.Contract(abiVault, vaultAddress)

        console.log('alice sign')

        // let res = await fetch("http://localhost:8081/addr").then(res => res.json())
        const bob = '0xeA085D9698651e76750F07d0dE0464476187b3ca'

        const alice = address

        const messageForAlice = `You spend ${amount} RAC`

        const previousClaim = JSON.parse(localStorage.getItem("claim"))

        console.log("previousClaim", previousClaim)

        let nonce,
            cumulativeDebitAlice = 0,
            cumulativeDebitBob = 0

        if (previousClaim === null) {
            cumulativeDebitAlice = amount
            cumulativeDebitBob = 0
            nonce = 1
        } else {
            nonce = previousClaim.nonce + 1

            if (amount >= previousClaim.cumulativeDebitBob) {
                cumulativeDebitAlice = amount - previousClaim.cumulativeDebitBob
                cumulativeDebitBob = 0
            } else {
                cumulativeDebitAlice = 0
                cumulativeDebitBob = amount - previousClaim.cumulativeDebitAlice
            }
        }


        const EIP712Domain = [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ]

        const Claim = [
            { name: 'alice', type: 'address' },
            { name: 'bob', type: 'address' },
            { name: 'messageForAlice', type: 'string' },
            { name: 'nonce', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
            { name: 'cumulativeDebitAlice', type: 'uint256' },
            { name: 'cumulativeDebitBob', type: 'uint256' },
        ]

        // attention for the EIP712 contract's name & version
        const name = "CoinGames Vault"
        const version = "1"
        const chainId = await web3.eth.getChainId()

        console.log('chainId', chainId)

        const claim = {
            alice: alice,
            bob: bob,
            messageForAlice: messageForAlice,
            nonce: nonce,
            timestamp: timestamp,
            cumulativeDebitAlice: cumulativeDebitAlice,
            cumulativeDebitBob: cumulativeDebitBob
        } 

        const buildData = (verifyingContract) => ({
            types: { 
                EIP712Domain, 
                Claim
            },
            domain: { name, version, chainId, verifyingContract },
            primaryType: 'Claim',
            message: claim,
        })

        const data = buildData(vaultAddress)

        claim.signatureAlice = await web3.currentProvider.request({
            method: "eth_signTypedData_v4",
            params: [alice, JSON.stringify(data)],
            from: alice,
        })

        claim.signatureBob = claim.signatureAlice // change to Bob's sign

        const check1 = await Vault.methods.verify(claim).call({from: alice})

        console.log(`Vault verify: ${check1}`)

    }

    return (
        <button
            onClick={spendBtn}
        >
            Spend
        </button>
    )

}