const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
require('dotenv').config()
const Web3 = require('web3')

let PORT = process.env.PORT
if (PORT == null || PORT == "") {
    PORT = 8080
}

const app = express()

app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

try {
    app.use(express.static(path.join(__dirname, '../../dist')))
    app.get(['/*'], function (req, res) {
        res.sendFile(path.join(__dirname, '../../dist', 'index.html'))
    })
} catch (error) {
    
}

app.post('/api/verify', async (req, res) => {

    const { signature, address } = req.body
    const net = "https://kovan.infura.io/v3/9826f6d552f4452f98df83cf563fd9a3"
    const web3 = new Web3(new Web3.providers.HttpProvider(net))
    // OR const web3 = new Web3()

    const dataThatWasSigned = 'Sign to verify your account!'
    const addressSigner = await web3.eth.accounts.recover(dataThatWasSigned, signature)
    
    if (web3.utils.toChecksumAddress(address) === web3.utils.toChecksumAddress(addressSigner)) {
        res.status(200).send('Signature verified') 
    } else {
        // console.log('Signature is not verified')
        res.status(401).send('Signature is not verified')
    } 
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

module.exports = app
