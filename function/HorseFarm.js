const myURL = new URL('https://web3-73e9a.web.app/?action=depositHTC&data=%7b%0d%0a++%22transporter_address%22%3a+%220x473eFC873090CD75ace402c05987Af5bdc7e8A5e%22%2c%0d%0a++%22owner%22%3a+%220x4A088CEE4598AEbf7CF2a4032876Be1795d99D53%22%2c%0d%0a++%22token%22%3a+%220xD3312D8aA3862088D1A9d660003d7EDe013DdAd3%22%2c%0d%0a++%22in_game_id%22%3a+%22278%22%2c%0d%0a++%22amount%22%3a+1%2c%0d%0a++%22blockchain_amount%22%3a+1000000000000000000%2c%0d%0a++%22nonce%22%3a+%22278-8%22%2c%0d%0a++%22v%22%3a+28%2c%0d%0a++%22r%22%3a+%220xc7232a9b23ba9a1fd99f7110947b998bc2102bc9a8e7f86ee74d0444474a5f60%22%2c%0d%0a++%22s%22%3a+%220x6b65ed321a2413996e0a7c2ecc15bebe86d82af0d7ac147895f989d116982b9d%22%2c%0d%0a++%22block_expired%22%3a+4834447%0d%0a%7d')
const data = myURL.searchParams.get('data');
require('dotenv').config();

const Web3 = require('web3')
let web3 = new Web3(window.ethereum)

let accounts = await web3.eth.getAccounts();

const ABIHorseFarm = require("../abis/contracts/HorseFarm.sol/HorseFarm.json")
const HorseFarmContract = new web3.eth.Contract(ABIHorseFarm, process.env.HorseFarm)

const ABIHorseNFT = require("../abis/contracts/HorseNFT.sol/HorseNFT.json")
const HorseNFTContract = new web3.eth.Contract(ABIHorseNFT, process.env.HorseNFT)

//user lease horse
async function lease(data){
    await HorseNFTContract.methods.approve(process.env.Transporter, data.horseId).send({
        from: accounts[0],
        to: process.env.HorseNFT,
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
        horseId: horseId,
        blockExpired: data.block_expired,
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: accounts[0],
        to: process.env.HorseFarm,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

//server withdraw token
async function withdrawToken(data){
    
    await HorseFarmContract.methods.withdrawToken(data.token).send({
        from: process.env.HORSEFARM_SERVER_ADDRESS,
        to: process.env.HorseFarm,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

//server withdraw NFT
async function withdrawNFT(data){
    await HorseFarmContract.methods.withdrawNFT(data.token, data.tokenId).send({
        from: process.env.HORSEFARM_SERVER_ADDRESS,
        to: process.env.HorseFarm,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

//user withdraw nft
async function withdraw(data){
    await HorseFarmContract.methods.withdraw({
        owner: data.owner,
        horseId: data.horseId,
        blockExpired: data.block_expired,
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: accounts[0],
        to: process.env.HorseFarm,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    },function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

async function getGasPrice(){
    return await web3.eth.getGasPrice();
}

window.onload = async () => {

    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("Please install MetaMask Extension in your browser");
    }
  
    const params = new URLSearchParams(window.location.search)
  
    console.log(params.get('action'))
    console.log(params.get('data'))
  
    switch(params.get('action'))
    {
      case "lease":
          lease(JSON.parse(params.get('data')));
          break;
      case "withdrawToken":
            withdrawToken(JSON.parse(params.get('data')));
            break;
      case "withdrawNFT":
            withdrawNFT(JSON.parse(params.get('data')))
            break;
        case "withdraw":
            withdraw(JSON.parse(params.get('data')))
            break;
      default:
          break;
    }
  };