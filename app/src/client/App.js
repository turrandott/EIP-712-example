import React, { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Signature from './components/Signature'

function App() {

  const [address, setAddress] = useState(null)

  return (
    <>
      {address
        ? <Signature address={address}/>
        : <Login
          address={address}
          setAddress={setAddress}
        />
      }
    </>
  )
}

export default App
