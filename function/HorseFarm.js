const ABIHorseFarm = horseFarm;
const ABIHorseNFT = horseNFT;
const HORSENFT_ADDRESS = "0xb4469839f184aA3d223126d3964B18C59f703D9d";

const copyToClipboard = async function (dataResult) {
  try {
    // focus from metamask back to browser
    window.focus();
    // wait to finish focus
    await new Promise((resolve) => setTimeout(resolve, 300));
    // copy tx hash to clipboard
    await navigator.clipboard.writeText(dataResult);
  } catch (err) {
    console.log(err);
    // for metamask mobile android
    const input = document.createElement("input");
    input.type = "text";
    input.value = dataResult;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.style = "visibility: hidden";
  }
};

const createCopyInputButton = (dataResult) => {
  const btnCopy = document.createElement("input");
  btnCopy.type = "button";
  btnCopy.id = "btnCopy";
  btnCopy.value = "OK";
  btnCopy.onclick = () => {
    copyToClipboard(dataResult);
    document.getElementById("myModal").style.visibility = "hidden";
  };
  document.getElementById("btnCopyHiden").appendChild(btnCopy);
};

const openModal = (title) => {
  document.getElementById("myModal").style.visibility = "visible";
  document.getElementById("title-modal").innerHTML = title;
};

const sign = async (message) => {
  document.getElementById("a3").innerHTML = "signa";
  try {
    let web3 = new Web3(window.ethereum);
    let accounts = await web3.eth.getAccounts();
    let signature = await web3.eth.personal.sign(message, accounts[0], "");
    createCopyInputButton([accounts, message, signature].join("|"));
    openModal("You have successfully signed");
  } catch (err) {
    console.log(err);
    createCopyInputButton([400, err.message].join("|"));
    openModal("Sign failed");
  }
};

async function switchMetamaskNetwork() {
  const chainId = 55; //id testnet

  if (window.ethereum.networkVersion !== chainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainId) }],
      });
    } catch (err) {
      console.error(err);
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: "Spectre Testnet",
              chainId: web3.utils.toHex(chainId),
              nativeCurrency: { name: "SPECTRE", decimals: 18, symbol: "SPC" },
              rpcUrls: ["https://testnet.spectre-rpc.io"],
            },
          ],
        });
      }
    }
  }
  console.log(2222);
}

//user lease horse
async function lease(data, token_id) {
  console.log(data);
  let web3 = new Web3(window.ethereum);
  let accounts = await web3.eth.getAccounts();
  console.log("account: ", accounts);
  const HorseFarmContract = new web3.eth.Contract(
    ABIHorseFarm,
    data.horse_farm_address
  );
  const HorseNFTContract = new web3.eth.Contract(ABIHorseNFT, HORSENFT_ADDRESS);

  await HorseNFTContract.methods
    .approve(data.transporter_address, token_id)
    .send(
      {
        from: accounts[0],
        to: HORSENFT_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
      }
    );

  await HorseFarmContract.methods
    .lease({
      owner: data.owner,
      horseId: token_id,
      blockExpired: data.block_expired,
      nonce: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: accounts[0],
        to: data.horse_farm_address,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
      }
    );
}

//user withdraw horse
async function withdraw(data, token_id) {
  let web3 = new Web3(window.ethereum);
  let accounts = await web3.eth.getAccounts();
  const HorseFarmContract = new web3.eth.Contract(
    ABIHorseFarm,
    data.horse_farm_address
  );
  await HorseFarmContract.methods
    .withdraw({
      owner: data.owner,
      horseId: token_id,
      blockExpired: data.block_expired,
      nonce: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: accounts[0],
        to: data.horse_farm_address,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
        // document.getElementById("p1").innerHTML =
        //   "withdraw success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );
}

const TOKENPRZ_ADDRESS = "0x4dBE394478d3B7E120412e61Bba3E3c8c85a079C";
const TOKENHTC_ADDRESS = "0xD3312D8aA3862088D1A9d660003d7EDe013DdAd3";
const TOKENGATE_ADDRESS = "0xcBE266C1169B34638EB34d7B40989310e6434ebd";
const TOKENGATE_SERVER_ADDRESS = "0xC4A6ac15220c5366EA2f8a045FEc2ACD81269652";

//deposit HTC
async function depositHTC(data) {
  let web3 = new Web3(window.ethereum);
  let accounts = await web3.eth.getAccounts();
  const ABIHTC = tokenHTC;
  const TokenHTC = new web3.eth.Contract(ABIHTC, TOKENHTC_ADDRESS);

  const ABITokenGate = TokenGateABI;
  const TokenGate = new web3.eth.Contract(ABITokenGate, TOKENGATE_ADDRESS);
  //user approve token
  await TokenHTC.methods
    .approve(
      data.transporter_address,
      new BigNumber(data.blockchain_amount).toFixed()
    )
    .send(
      {
        from: accounts[0],
        to: TOKENHTC_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
      }
    );
  //user deposit
  await TokenGate.methods
    .deposit({
      owner: data.owner,
      token: data.token,
      blockExpired: new BigNumber(data.block_expired).toFixed(),
      amount: new BigNumber(data.blockchain_amount).toFixed(),
      none: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: accounts[0],
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
        // document.getElementById("p1").innerHTML =
        //   " deposit success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );
}
//swap HTC to PRZ
async function swapHTCtoPRZ(data) {
  let web3 = new Web3(window.ethereum);
  const ABITokenGate = TokenGateABI;
  const TokenGate = new web3.eth.Contract(ABITokenGate, TOKENGATE_ADDRESS);
  let accounts = await web3.eth.getAccounts();
  await TokenGate.methods
    .swapVaultHTCtoPRZ(
      TOKENHTC_ADDRESS,
      TOKENPRZ_ADDRESS,
      new BigNumber(data.amount).toFixed()
    )
    .send(
      {
        from: accounts[0],
        to: TOKENHTC_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
        // document.getElementById("p1").innerHTML =
        //   "swap success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );

  await TokenGate.methods
    .withdrawVault(TOKENPRZ_ADDRESS, new BigNumber(data.amount).toFixed())
    .send(
      {
        from: TOKENGATE_SERVER_ADDRESS,
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
        // document.getElementById("p1").innerHTML =
        //   "Exchange HTC success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );
}

//claimPRZ
async function claim(data) {
  console.log(data);
  let web3 = new Web3(window.ethereum);
  let accounts = await web3.eth.getAccounts();
  const ABITokenGate = TokenGateABI;
  const TokenGate = new web3.eth.Contract(ABITokenGate, TOKENGATE_ADDRESS);
  await TokenGate.methods
    .claim({
      owner: data.owner,
      token: data.token,
      blockExpired: new BigNumber(data.block_expired).toFixed(),
      amount: new BigNumber(data.blockchain_amount).toFixed(),
      none: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: accounts[0],
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("Hash of the transaction: " + res);
        // document.getElementById("p1").innerHTML =
        //   "claim success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );
}

async function getGasPrice() {
  return await web3.eth.getGasPrice();
}

window.onload = async () => {
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  document.getElementById("a5").innerHTML = "url" + params;

  if (window.ethereum) {
    console.log(12);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask Extension in your browser");
  }
  await switchMetamaskNetwork();

  console.log(params);
  console.log(params.get("action"));
  console.log(params.get("data"));

  switch (params.get("action")) {
    // case "switchNetwork":
    //   switchMetamaskNetwork()
    case "sign":
      sign(params.get("data"));
      break;
    case "lease":
      lease(JSON.parse(params.get("data")), 121);
      break;
    case "withdraw":
      withdraw(JSON.parse(params.get("data")));
      break;
    case "depositHTC":
      depositHTC(JSON.parse(params.get("data")));
      break;
    case "swapVaultHTCtoPRZ":
      swapHTCtoPRZ(JSON.parse(params.get("data")));
    case "claim":
      claim(JSON.parse(params.get("data")));
    default:
      break;
  }
};

function isMobileDevice() {
  return "ontouchstart" in window || "onmsgesturechange" in window;
}

function openMetaHorse() {
  console.log("1");
  if (isMobileDevice()) {
    console.log("2");
    window.open("metahorse://web3login");
  } else {
    console.log("3");
    window.open("https://metamask.io/", "_blank");
  }
}
