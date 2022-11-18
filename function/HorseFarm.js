const ABIHorseFarm = horseFarm
const ABIHorseNFT = horseNFT
const HORSENFT_ADDRESS = ''

const sign = async (message) => {
    let web3 = new Web3(window.ethereum)
    let accounts = await web3.eth.getAccounts();
    console.log("accounts: ", accounts[0]);
    let signature = await web3.eth.personal.sign(message, accounts[0], '');
    console.log('sign: ', [accounts, message, signature].join('|'));
    document.getElementById("p1").innerHTML = "Login success! Copy and go back your game!";
    createCopyInputButton([accounts, message, signature].join('|'));
  }

//user lease horse
async function lease(data){
    let web3 = new Web3(window.ethereum)
    const HorseFarmContract = new web3.eth.Contract(ABIHorseFarm, data.horse_farm_address)
    const HorseNFTContract = new web3.eth.Contract(ABIHorseNFT, HORSENFT_ADDRESS)

    await HorseNFTContract.methods.approve(data.transporter_address, token_id).send({
        from: data.owner,
        to: HORSENFT_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
        },function (err, res) {
            if (err) {
              console.log("An error occured", err)
              return
            }
        })
    
    await HorseFarmContract.methods.lease({
        owner: data.owner,
        horseId: token_id,
        blockExpired: data.block_expired,
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: data.owner,
        to: data.horse_farm_address,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = "Exchange HTC success! Copy and go back your game!";
        createCopyInputButton(res);
    })
}

//user withdraw horse
async function withdraw(data){
    let web3 = new Web3(window.ethereum)
    const HorseFarmContract = new web3.eth.Contract(ABIHorseFarm, data.horse_farm_address)
    await HorseFarmContract.methods.withdraw({
        owner: data.owner,
        horseId: token_id,
        blockExpired: data.block_expired,
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: data.owner,
        to: data.horse_farm_address,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = "Exchange HTC success! Copy and go back your game!";
        createCopyInputButton(res);
    })
}

async function getGasPrice(){
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
  
    const params = new URLSearchParams(window.location.search)
  
    console.log(params)
    console.log(params.get('action'))
    console.log(params.get('data'))
  
    switch(params.get('action'))
    {
        case "sign":
        sign(params.get('data'));
            break;
        case "lease":
          lease(JSON.parse(params.get('data')));
          break;
        case "withdraw":
            withdraw(JSON.parse(params.get('data')))
            break;
      default:
          break;
    }
  };

  const createCopyInputButton = (data) => {
    var btnCopy = document.createElement('input');
    btnCopy.type = "button";
    btnCopy.id = "btnCopy";
    btnCopy.value = "Copy";
  
    btnCopy.onclick = () => copyToClipboard(data);
  
    document.body.appendChild(btnCopy);
  }