import { useEffect, useState } from "react";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth-mpc/web3auth";
import { OpenloginAdapter } from "@web3auth-mpc/openlogin-adapter";
import { tssDataCallback, tssGetPublic, tssSign, generatePrecompute } from "torus-mpc";
import RPC from "./web3RPC";
import "./App.css";

//from https://dashboard.web3auth.io
const clientId = "BCxzKbjFiYzK7weDw6Wsxa1C5CS7W8OhsylVxyC9RI7Iw_zFR4gGpe36cG4c44cDBa0BVLnjABLhU_BSIadNF3c"; 
const rpcTarget = "https://eth-goerli.g.alchemy.com/v2/eq_jLeOuH6iTZIL1u51ha6h2yODGGeAo";

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  let content = document.getElementById("content");

  useEffect(() => {
    const init = async () => {
      try {
        // const web3auth = new Web3Auth({
        //   clientId,
        //   chainConfig: {
        //     chainNamespace: CHAIN_NAMESPACES.EIP155,
        //     chainId: "0x5",
        //     rpcTarget: "https://eth-goerli.g.alchemy.com/v2/eq_jLeOuH6iTZIL1u51ha6h2yODGGeAo"
        //   },
        // });

        const web3auth = new Web3Auth({
          clientId: clientId,
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x5",
            rpcTarget: rpcTarget,
            displayName: "Goerli Testnet",
            blockExplorer: "https://goerli.etherscan.io/",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
        });

        //SET MFA TO MANDATORY
        const openloginAdapter = new OpenloginAdapter({
          // Multi Factor Authentication has to be mandatory
          loginSettings: {
            mfaLevel: "mandatory",
          },
          // TSS Settings needed for TSS implementation
          tssSettings: {
            useTSS: true,
            tssGetPublic,
            tssSign,
            tssDataCallback,
          },
          adapterSettings: {
            // points to the beta mpc network containing TSS implementation
            _iframeUrl: "https://mpc-beta.openlogin.com",
            // network has to be development
            network: "development",
            clientId: clientId, // Client ID from your Web3Auth Dashboard
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        setWeb3auth(web3auth);

        //Initialise Web3Auth
        await web3auth.initModal({
          // config to remove the external wallet adapters
          modalConfig: {
            "torus-evm": {
              label: "Torus Wallet",
              showOnModal: false,
            },
            metamask: {
              label: "Metamask",
              showOnModal: false,
            },
            "wallet-connect-v1": {
              label: "Wallet Connect",
              showOnModal: false,
            },
          },
        });

        if (web3auth.provider) {
          setProvider(web3auth.provider);
        };
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    generatePrecompute();
  };

  const getUserEmail = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const userInfo = await web3auth.getUserInfo();
    const user = userInfo.email;
    console.log(user);
    content = document.getElementById("content");
    content!.innerHTML = user!;
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();

    //Display chain Id
    console.log(chainId);
    content = document.getElementById("content");
    content!.innerHTML = chainId;
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();

    //Display account address
    console.log(address);
    content = document.getElementById("content");
    content!.innerHTML = address;
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();

    //Display account balance
    console.log(balance);
    content = document.getElementById("content");
    content!.innerHTML = balance;
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();

    //Display transaction receipt
    console.log(receipt);
    content = document.getElementById("content");
    content!.innerHTML = receipt;
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log(provider);
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();

    //Display signed message
    console.log(signedMessage);
    content = document.getElementById("content");
    content!.innerHTML = signedMessage;
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();

    //Display private key
    console.log(privateKey);
    content = document.getElementById("content");
    content!.innerHTML = privateKey;
  };

  const loggedInView = (
    <>
      <div id = "output">
        <p id = "content">
          welcome
        </p>
      </div>
      <button onClick={getUserEmail} className="card">
        Get User Email
      </button>
      <button onClick={getChainId} className="card">
        Get Chain ID
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={sendTransaction} className="card">
        Send Transaction
      </button>
      <button onClick={signMessage} className="card">
        Sign Message
      </button>
      <button onClick={getPrivateKey} className="card">
        Get Private Key
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;