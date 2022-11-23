let web3 = new Web3(window.ethereum);

const TOKENPRZ_ADDRESS = "0x4dBE394478d3B7E120412e61Bba3E3c8c85a079C";
const TOKENHTC_ADDRESS = "0xD3312D8aA3862088D1A9d660003d7EDe013DdAd3";
const TOKENGATE_ADDRESS = "0xcBE266C1169B34638EB34d7B40989310e6434ebd";
const TOKENGATE_SERVER_ADDRESS = "0xC4A6ac15220c5366EA2f8a045FEc2ACD81269652";

const ABIHTC = tokenHTC;
const TokenHTC = new web3.eth.Contract(ABIHTC, TOKENHTC_ADDRESS);

const ABITokenGate = TokenGateABI;
const TokenGate = new web3.eth.Contract(ABITokenGate, TOKENGATE_ADDRESS);

//deposit HTC
async function depositHTC(data) {
  //user approve token
  await TokenHTC.methods
    .approve(
      data.transporter_address,
      new BigNumber(data.blockchain_amount).toFixed()
    )
    .send(
      {
        from: data.owner,
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
        from: data.owner,
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
  await TokenGate.methods
    .claim({
      owner: data.owner,
      token: data.token,
      blockExpired: new BigNumber(data.block_expired).toFixed(),
      amount: new BigNumber(data.blockchain_amount),
      nonce: data.nonce,
      v: data.v,
      r: data.r,
      s: data.s,
    })
    .send(
      {
        from: data.owner,
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
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.web3 = new Web3(window.ethereum);
  } else {
    alert("Please install MetaMask Extension in your browser");
  }

  const params = new URLSearchParams(window.location.search);

  console.log(params.get("action"));
  console.log(params.get("data"));

  switch (params.get("action")) {
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
