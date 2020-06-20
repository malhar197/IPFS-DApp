import React, { Component } from 'react';
import './App.css';
import Web3 from "web3";
import Image from "../abi/Image.json"
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  // Get the account
  // Get the network
  // Get Smart Contract
  // ----> ABI
  // ----> Address
  // Get Meme Hash
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()

    const networkData = Image.networks[networkId]
    console.log(networkData)

    if (networkData) {
      // Fetch contract
      const abi = Image.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi, address)
      this.setState({ contract: contract })
      const ipfsHash = await contract.methods.get().call()
      this.setState({ ipfsHash: ipfsHash })
    }
    else {
      window.alert('Smart contract not deplyed to detected network!')
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer: null,
      contract: null,
      ipfsHash: 'QmdYMzY6oEejiaa5WKeo26AxsGvPNerP64xff4nLv4y842'
    };
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Please use Metamask!')
    }
  }
  captureFile = (event) => {
    event.preventDefault()
    //Process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ 'buffer': Buffer(reader.result) })
    }

  }
  // Example hash: "QmdYMzY6oEejiaa5WKeo26AxsGvPNerP64xff4nLv4y842"
  // Example url: https://ipfs.infura.io/ipfs/QmdYMzY6oEejiaa5WKeo26AxsGvPNerP64xff4nLv4y842

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting the form..")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('ipfs result', result)
      const ipfsHash = result[0].hash
          if (error) {
        console.error(error)
        return
      }
      // Step2: store file on blockchain
      this.state.contract.methods.set(ipfsHash).send({ from: this.state.account }).then((res)=> {
        this.setState({ ipfsHash: ipfsHash })
      })
    })

  }
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
          >
            IPFS Ethereum
          </a>
          <ul className="nav-bar px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.ipfsHash}`} />
                </a>
                <h3>Upload New Image</h3>
                <form onSubmit={this.onSubmit}>
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
