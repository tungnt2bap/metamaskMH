const ABIHorseFarm = horseFarm;
const ABIHorseNFT = horseNFT;
const HORSENFT_ADDRESS = "0xb4469839f184aA3d223126d3964B18C59f703D9d";

const sign = async (message) => {
  try {
    let web3 = new Web3(window.ethereum);
    let accounts = await web3.eth.getAccounts();
    console.log("accounts: ", accounts[0]);
    let signature = await web3.eth.personal.sign(message, accounts[0], "");
    console.log("sign: ", [accounts, message, signature].join("|"));

    // document.getElementById("p1").innerHTML =
    //   "Login success! Copy and go back your game!";
    createCopyInputButton([accounts, message, signature].join("|"));
    document.getElementById("title-modal").innerHTML =
      "You have successfully signed";
  } catch (err) {
    console.log(err);
    createCopyInputButton([400, err.message].join("|"));
    document.getElementById("title-modal").innerHTML = "Sign failed";
  }
};

async function switchMetamaskNetwork(){
  const chainId = 55 //id testnet

  if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(chainId) }]
          });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Spectre Testnet',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'SPECTRE', decimals: 18, symbol: 'SPC' },
                  rpcUrls: ['https://testnet.spectre-rpc.io']
                }
              ]
            });
          }
        }
      }
}

//user lease horse
async function lease(data, token_id) {
  let web3 = new Web3(window.ethereum);
  const HorseFarmContract = new web3.eth.Contract(
    ABIHorseFarm,
    data.horse_farm_address
  );
  const HorseNFTContract = new web3.eth.Contract(ABIHorseNFT, HORSENFT_ADDRESS);

  await HorseNFTContract.methods
    .approve(data.transporter_address, token_id)
    .send(
      {
        from: data.owner,
        to: HORSENFT_ADDRESS,
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
        from: data.owner,
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
        //   "lease success! Copy and go back your game!";
        // createCopyInputButton(res);
      }
    );
}

//user withdraw horse
async function withdraw(data, token_id) {
  let web3 = new Web3(window.ethereum);
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
        from: data.owner,
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

async function getGasPrice() {
  return await web3.eth.getGasPrice();
}

window.onload = async () => {
  console.log(123);
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask Extension in your browser");
  }

  const params = new URLSearchParams(window.location.search);

  console.log(params);
  console.log(params.get("action"));
  console.log(params.get("data"));

  switch (params.get("action")) {
    case "switchNetwork":
      switchMetamaskNetwork();
    case "sign":
      sign(params.get("data"));
      break;
    case "lease":
      lease(JSON.parse(params.get("data")));
      break;
    case "withdraw":
      withdraw(JSON.parse(params.get("data")));
      break;
    default:
      break;
  }
};

const createCopyInputButton = (data) => {
  document.getElementById("myModal").style.display = "block";
  var buttonCopy = document.getElementById("btnCopy");
  // document.body.appendChild(btnCopy);
  buttonCopy.onclick = () => {
    copyToClipboard(data);
    document.getElementById("myModal").style.display = "none";
  };
};

const copyToClipboard = async function (data) {
  try {
    // focus from metamask back to browser
    window.focus();
    // wait to finish focus
    await new Promise((resolve) => setTimeout(resolve, 500));
    // copy tx hash to clipboard
    await navigator.clipboard.writeText(data);
  } catch (err) {
    console.log(err);
    // for metamask mobile android
    const input = document.createElement("input");
    input.type = "text";
    input.value = data;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    input.style = "visibility: hidden";
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
