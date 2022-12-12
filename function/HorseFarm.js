const ABIHorseFarm = horseFarm;
const ABIHorseNFT = horseNFT;
const HORSENFT_ADDRESS = "0x8dB54Bb8bE369cbea3c1270E08Af2D62E549D5F4";
const TOKENPRZ_ADDRESS = "0x946556cE6A1Dea9C7dD9Ba74B57852fB699e0fB3";
const TOKENHTC_ADDRESS = "0x2083372751851864B8a448cCe40AaF01ee0aDc3C";
const TOKENGATE_ADDRESS = "0xF806D36F01898Ed427fD10e93d165CdcdE89d856";
const TOKENGATE_SERVER_ADDRESS = "0xC4A6ac15220c5366EA2f8a045FEc2ACD81269652";
const configs = {
  chainId: 7575,
  chainName: "ADIL Chain",
  currencyName: "ADIL",
  linkRPC: "https://testnet.adil-rpc.io",
  linkBlockExplorerurls: "https://testnet.adil-scan.io",
};

const ACTIONS = {
  sign: "sign",
  lease: "lease",
  withdraw: "withdraw",
  depositMARE: "depositMARE",
  claim: "claim",
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const isMobileDevice = () => {
  return "ontouchstart" in window || "onmsgesturechange" in window;
};
const openMetaHorse = () => {
  if (isMobileDevice()) {
    window.open("metahorse://web3login");
  } else {
    window.open("https://metamask.io/", "_blank");
  }
};

const copyToClipboard = async function (dataResult) {
  try {
    // focus from metamask back to browser
    window.focus();
    // wait to finish focus
    // await new Promise((resolve) => setTimeout(resolve, 300));
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

const createCopyInputButton = async (dataResult) => {
  const btnCopy = document.createElement("input");
  btnCopy.type = "button";
  btnCopy.id = "btnCopy";
  btnCopy.value = "OK";
  btnCopy.onclick = async () => {
    await copyToClipboard(dataResult);
    openMetaHorse();
    document.getElementById("myModal").style.visibility = "hidden";
  };
  document.getElementById("btnCopyHiden").appendChild(btnCopy);
};

const openModal = (title) => {
  document.getElementById("myModal").style.visibility = "visible";
  document.getElementById("title-modal").innerHTML = title;
};

const handleValueLocalStorage = (value, key) => {
  if (!value) return;
  if (key !== "time") {
    const findText = value.indexOf("|");
    return value.slice(0, findText);
  } else {
    const findText = value.indexOf("|");
    return parseInt(value.slice(findText + 1));
  }
};

const getLatestValueLocal = () => {
  const sign = getLocalStorage(ACTIONS.sign);
  const depositHTC = getLocalStorage(ACTIONS.depositMARE);
  const lease = getLocalStorage(ACTIONS.lease);
  const withdraw = getLocalStorage(ACTIONS.withdraw);
  const claim = getLocalStorage(ACTIONS.claim);

  const timeLocals = [
    {
      key: ACTIONS.sign,
      value: handleValueLocalStorage(sign) || 0,
      time: handleValueLocalStorage(sign, "time") || 0,
    },
    {
      key: ACTIONS.depositMARE,
      value: handleValueLocalStorage(depositHTC) || 0,
      time: handleValueLocalStorage(depositHTC, "time") || 0,
    },
    {
      key: ACTIONS.lease,
      value: handleValueLocalStorage(lease) || 0,
      time: handleValueLocalStorage(lease, "time") || 0,
    },
    {
      key: ACTIONS.claim,
      value: handleValueLocalStorage(claim) || 0,
      time: handleValueLocalStorage(claim, "time") || 0,
    },
    {
      key: ACTIONS.withdraw,
      value: handleValueLocalStorage(withdraw) || 0,
      time: handleValueLocalStorage(withdraw, "time") || 0,
    },
  ];

  const max = timeLocals.reduce(function (prev, current) {
    return parseInt(prev.time) > parseInt(current.time) ? prev : current;
  }); //returns object
  console.log("timeLocals", max);
  return max;
};

const sign = async (message) => {
  // await window.ethereum.request({ method: "eth_requestAccounts" });
  try {
    let accounts = await web3.eth.getAccounts();
    let signature = await web3.eth.personal.sign(message, accounts[0], "");
    createCopyInputButton([accounts, message, signature].join("|"));
    openModal("You have successfully signed");
  } catch (err) {
    console.log(err);
    await createCopyInputButton([400, err.message].join("|"));
    openModal("Sign failed");
  }
};

function getAllValueStorage() {
  var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

  while (i--) {
    values.push(localStorage.getItem(keys[i]));
  }

  return values;
}
const filterName = (arr, value) => {
  return arr.filter((item) => item.includes(value));
};

const replaceLatestUrl = () => {
  //  check if ios
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const timeLocalStorage = parseInt(getLatestValueLocal().time);
  const timeURL = parseInt(params.get("current_time"));
  if (timeURL != timeLocalStorage) {
    location.replace(
      `https://tungnt2bap.github.io/metamaskMH/?action=${
        getLatestValueLocal().key
      }&data=${getLatestValueLocal().value}&current_time=${
        getLatestValueLocal().time
      }`
    );
  }
};

const setLocalStorage = (key, value) => {
  return localStorage.setItem(key, value);
};

const getLocalStorage = (key) => {
  console.log("get", localStorage.getItem("key"));
  return localStorage.getItem(key);
};

async function switchMetamaskNetwork() {
  document.getElementById("a11").innerHTML = window.ethereum.networkVersion;
  if (window.ethereum.networkVersion !== configs.chainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(configs.chainId) }],
      });
    } catch (err) {
      document.getElementById("a12").innerHTML = err;
      console.error(err);
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: configs.chainName,
              chainId: web3.utils.toHex(configs.chainId),
              nativeCurrency: {
                name: configs.chainName,
                decimals: 18,
                symbol: configs.currencyName,
              },
              rpcUrls: [configs.linkRPC],
            },
          ],
        });
      }
    }
  }
}

//user lease horse
async function lease(value) {
  const data = JSON.parse(value);
  let accounts = await web3.eth.getAccounts();
  console.log("account: ", accounts);
  const HorseFarmContract = new web3.eth.Contract(
    ABIHorseFarm,
    data.horse_farm_address
  );
  const HorseNFTContract = new web3.eth.Contract(ABIHorseNFT, HORSENFT_ADDRESS);

  await HorseNFTContract.methods
    .approve(data.transporter_address, data.token_id)
    .send(
      {
        from: accounts[0],
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      function (err, res) {
        if (err) {
          // createCopyInputButton([400, "failed"].join("|"));
          openModal("Approve failed");
        }
        console.log("Hash of the transaction: " + res);
        // createCopyInputButton([401, res].join("|"));
        openModal("You not done yet");
      }
    );

  await HorseFarmContract.methods
    .lease({
      owner: data.owner,
      horseId: data.token_id,
      blockExpired: data.block_expired,
      nonce: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: accounts[0],
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice(),
      },
      async function (err, res) {
        if (err) {
          createCopyInputButton([400, "failed"].join("|"));
          openModal("Transaction failed");
          return;
        }
        console.log("Hash of the transaction: " + res);
        await createCopyInputButton([402, res].join("|"));
        openModal("You have successfully approved");
      }
    );
}

//user withdraw horse
async function withdraw(value) {
  const data = JSON.parse(value);
  let accounts = await web3.eth.getAccounts();
  const HorseFarmContract = new web3.eth.Contract(
    ABIHorseFarm,
    data.horse_farm_address
  );
  await HorseFarmContract.methods
    .withdraw({
      owner: data.owner,
      horseId: data.token_id,
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
      async function (err, res) {
        if (err) {
          createCopyInputButton([400, "failed"].join("|"));
          openModal("Transaction failed");
          return;
        }
        console.log("Hash of the transaction: " + res);
        await createCopyInputButton([402, res].join("|"));
        openModal("You have successfully approved");
      }
    );
}

//TokenGate
//deposit HTC
async function depositHTC(value) {
  // await window.ethereum.request({ method: "eth_requestAccounts" });
  const data = JSON.parse(value);
  let accounts = await web3.eth.getAccounts();
  const ABIHTC = tokenMARE;
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
          // createCopyInputButton([400, "failed"].join("|"));
          openModal("Approve failed");
          return;
        }
        console.log("Hash of the transaction: " + res);
        // createCopyInputButton([401, res].join("|"));
        openModal("You not done yet");
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
      async function (err, res) {
        if (err) {
          createCopyInputButton([400, "failed"].join("|"));
          openModal("Transaction failed");
          return;
        }
        console.log("Hash of the transaction: " + res);
        await createCopyInputButton([402, res].join("|"));
        openModal("You have successfully deposit");
      }
    );
}
//claimPRZ
async function claim(value) {
  const data = JSON.parse(value);
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
      async function (err, res) {
        if (err) {
          createCopyInputButton([400, "failed"].join("|"));
          openModal("Transaction failed");
          return;
        }
        console.log("Hash of the transaction: " + res);
        await createCopyInputButton([402, res].join("|"));
        openModal("You have successfully approved");
      }
    );
}

async function getGasPrice() {
  return await web3.eth.getGasPrice();
}

const firstLoad = async () => {
  const params = new URLSearchParams(window.location.search);
  document.getElementById("a9").innerHTML = parseInt(
    params.get("current_time")
  );
  document.getElementById("btn-transaction").innerHTML = getActionUrl();
  document.getElementById("a10").innerHTML = parseInt(
    getLatestValueLocal().time
  );
  if (
    parseInt(params.get("current_time")) > parseInt(getLatestValueLocal().time)
  ) {
    setLocalStorage(
      params.get("action"),
      params.get("data") + "|" + params.get("current_time")
    );
  }

  await switchMetamaskNetwork();

  setTimeout(async () => {
    replaceLatestUrl();
    document.getElementById("a5").innerHTML = params;
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
    } else {
      alert("Please install MetaMask Extension in your browser");
    }
  }, 300);
};

const getActionUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("action");
};

const handleTransactionMetamask = (type) => {
  const params = new URLSearchParams(window.location.search);
  switch (type) {
    // case "switchNetwork":
    //   switchMetamaskNetwork()
    case ACTIONS.sign:
      // setLocalStorage("sign", params.get("data"));
      sign(params.get("data"));
      break;
    case ACTIONS.lease:
      lease(params.get("data"));
      break;
    case ACTIONS.withdraw:
      withdraw(params.get("data"));
      break;
    case ACTIONS.depositMARE:
      // setLocalStorage("depositHTC", params.get("data"));
      depositHTC(params.get("data"));
      break;
    // case "swapVaultHTCtoPRZ":
    //   swapHTCtoPRZ(params.get("data"));
    case ACTIONS.claim:
      claim(params.get("data"));
    default:
      break;
  }
};
