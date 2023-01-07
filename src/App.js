import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNFT from "./utils/MyEpicNFT.json";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = "muradapps";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;

const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintAmount, setMintAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const CONTRACT_ADDRESS = "0x09b7911fD793f371C145d60E69D72c5f14F970fe";
  const CONTRACT_ABI = myEpicNFT.abi;

  // ユーザーが認証可能なウォレットアドレスを持っているか確認
  const checkIfWalletsIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
      // eth_accountsは、空の配列または単一のアカウントアドレスを含む配列を返す特別なメソッド
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        setupEventListener();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask");
        return;
      }
      // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。
      // 許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
      // eth_requestAccounts関数を使用することで、MetaMaskからユーザーにウォレットへのアクセスを許可するよう呼びかける
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const myEpicNFTContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        const currentTokenIds = await myEpicNFTContract.getTokenIds();
        setMintAmount(currentTokenIds.toNumber());
        myEpicNFTContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          // setMintAmount(tokenId.toNumber() + 1);
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const askContractToMintNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        //ethereum nodeに接続するプロバイダーを設定
        const provider = new ethers.providers.Web3Provider(ethereum);
        //signer:ウォレットアドレスの抽象化
        //provider.getSigner()：ウォレットアドレスを使用してトランザクションに署名し、そのデータをイーサリアムネットワークに送信する
        const signer = provider.getSigner();
        //contractへの接続
        //providerを渡すと読み取り専用インスタンス
        //signerを渡すと読み取りと書き込み可能なインスタンス
        const myEpicNFTContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");

        let nftTxn = await myEpicNFTContract.makeAnEpicNFT();
        setIsLoading(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        setIsLoading(false);
        const currentTokenIds = await myEpicNFTContract.getTokenIds();
        setMintAmount(currentTokenIds.toNumber());
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );
  const renderMintUI = () => (
    <button
      onClick={askContractToMintNFT}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  const checkIfWalletsIsConnectedToGoerliChain = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x5 は　Goerli の ID
    const goerliChainId = "0x5";
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }
  };
  const goToOpensea = () => {
    window.open("https://testnets.opensea.io/ja/" + currentAccount, "_blank");
  };
  useEffect(() => {
    checkIfWalletsIsConnected();
  }, []);
  useEffect(() => {
    checkIfWalletsIsConnectedToGoerliChain();
  }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
          {isLoading ? (
            <p className="sub-text">Loading...</p>
          ) : (
            <p className="sub-text">
              Mintされた数{mintAmount}/{TOTAL_MINT_COUNT}NFT
            </p>
          )}
          <button
            className="cta-button connect-wallet-button"
            onClick={goToOpensea}
          >
            OpenSeaでコレクションを表示
          </button>
          ;
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
