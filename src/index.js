import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App.jsx"
import { ThirdwebWeb3Provider } from '@3rdweb/hooks'

// Set supported chains to 4 for Rinkeby
const supportedChainIds = [4]

// Set supported wallet type - "injected wallet" for metamask
const connectors = {
  injected: {},
}

// Wrap the app with the web3 provider
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider connectors={connectors} supportedChainIds={supportedChainIds}>
      <App />
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
