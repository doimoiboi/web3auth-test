import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./web3RPC";
import "./App.css";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

//from https://dashboard.web3auth.io
const clientId = "BCxzKbjFiYzK7weDw6Wsxa1C5CS7W8OhsylVxyC9RI7Iw_zFR4gGpe36cG4c44cDBa0BVLnjABLhU_BSIadNF3c"; 

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  let content = document.getElementById("content");

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x5",
            rpcTarget: "https://eth-goerli.g.alchemy.com/v2/eq_jLeOuH6iTZIL1u51ha6h2yODGGeAo"
          },
        });

        //SET MFA TO MANDATORY
        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "mandatory",
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();
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

    // Call web3auth modal login
    const web3authProvider = await web3auth.connect();
    console.log(web3authProvider);
    setProvider(web3authProvider);

    // Get login email and compare with signer email
    const userEmail = await getUserEmail();

    // Sign message with private key
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();

    logout();
    console.log("logged out!");
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
    return user;
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
    <>
    <div id = "output">
        <p id = "content">
          welcome
        </p>
    </div>
    <button onClick={login} className="card">
      Login
    </button>
    </>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        & ReactJS Example
      </h1>

      <div className="grid">{unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;