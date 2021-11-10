import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
import { verifyUser } from '../api'

export default function Login ({ address, setAddress }) {
    const [web3, setWeb3] = useState(null)
    const [verified, setVerified] = useState(false)

    const signMsg = async (msg) => {
        const signature = await web3.eth.personal.sign(msg, address)
        const response = await verifyUser(signature, address) 
        // console.log('response', response)
        setVerified(response)
    }

    const connectToMetamask = async () => {
        if (window.ethereum) {
            console.log('window.ethereum')
            const web3Provider = window.ethereum
            const account = await getAccount(web3Provider)
            return account
        } else if (window.web3) { // Legacy dApp browsers...
            console.log('window.web3')
            const web3Provider = window.web3.currentProvider
            const account = await getAccountLegacy(web3Provider)
            return account
        } else {
            console.error('Please install MetaMask!')
            return false
        }
    }

    useEffect(() => {
        connectToMetamask()
    }, [])

    useEffect(() => {
        const getBalance = async () => {
            if (web3 && address) {
                const balance = await web3.eth.getBalance(address)
                console.log('balance', balance)
            }

            // if (web3) {
            //     const privateKey = '=='
            //     const accountByKey = await web3.eth.accounts.privateKeyToAccount(privateKey)

            //     console.log('accountByKey', accountByKey)
            //     const balance = await web3.eth.getBalance(accountByKey.address)
            //     console.log('accountByKey balance', balance)
            // }

        }
        getBalance()
    }, [web3, address])

    const handleClick = async event => {
        if (web3 && address) {
            signMsg('Sign to verify your account!')
        }
    }

    const getAccount = async (web3Provider) => {
        const web3internal = new Web3(web3Provider)
        setWeb3(web3internal)
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            if (accounts && accounts[0]) {
                setAddress(accounts[0])
            }
            const address = accounts[0]
            console.log('address', address)

            return address
        } catch (error) {
            console.log('User denied account access...', error)
            console.warn('Please allow access to your Web3 wallet.')
            return false
        }
    }
    
    const getAccountLegacy = (web3Provider) => {
        web3.eth.getAccounts((error, accounts) => {
            setAddress(accounts[0])
            console.log(error)
            if (error) return false
            const address = accounts[0]
            console.log('address', address)
            return address
        })
    }

    return (
        <>
            { verified
                ? <p>Your account is verified!</p>
                :  <button onClick={handleClick}>Verify your account</button>
            }
        </>
    )
}
