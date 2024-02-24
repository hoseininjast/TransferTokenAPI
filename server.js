require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const router = require("express").Router();
var Web3 = require('web3');


const Account       = process.env.PublicKey;
const PrivateKey    = process.env.PrivateKey;
const RpcHttpUrl    = process.env.RPCAddress; //Infura

app.post("/transfer", async (request, response) => {
    const { amount, receiver , token } = request.body;
    if (token == "Ai1Polaris:MCvS3YwvLkn+5j5ajh70dzrWdgi9fAbNt8qaPjg25/4="){
        const web3 = new Web3(new Web3.providers.HttpProvider(RpcHttpUrl));
        const Account = web3.eth.accounts.privateKeyToAccount(PrivateKey );
        const ConnectedAccount = Account.address;
        const MaticTokenContract = new web3.eth.Contract([
                {
                    "constant": true,
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": false,
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "transfer",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "payable": true,
                    "stateMutability": "payable",
                    "type": "function"
                }
            ]
            , '0x0000000000000000000000000000000000001010', {from: ConnectedAccount})

        let Balance = await MaticTokenContract.methods.balanceOf(ConnectedAccount).call().then(function (result) {
           return result;
        });

        if (amount == 'all'){
            var num = parseFloat(web3.utils.fromWei(Balance) - 0.1).toString();
            var wei = web3.utils.toWei(num);
            var finalnumber = web3.utils.toHex(wei);
        } else if (typeof (parseInt(amount)) == 'number'){
            var num = parseFloat(amount).toString();
            var wei = web3.utils.toWei(num);
            var finalnumber = web3.utils.toHex(wei)
        }

        var toAddress = receiver;
        var ToAddressBalance = await MaticTokenContract.methods.balanceOf(toAddress).call().then(function (result) {
            return result;
        });
        gasfee = await MaticTokenContract.methods.transfer(toAddress, finalnumber).estimateGas({ from: ConnectedAccount });

        // var gasfee = await web3.eth.estimateGas({
        //     to: toAddress,
        // }).then(function (result){
        //     return result + 700;
        // });
        var gasprice = await web3.eth.getGasPrice().then(function (result){
           return result ;
        });


        // web3.eth.transactionPollingTimeout = 1500;
        const tx = {
            from: ConnectedAccount,
            gasPrice: gasprice,
            gas: gasfee,
            to: toAddress,
            value: finalnumber,
            data: MaticTokenContract.methods.transfer(toAddress, finalnumber).encodeABI()
        };
        const signTrx = await web3.eth.accounts.signTransaction(tx, PrivateKey);

        web3.eth.sendSignedTransaction(signTrx.rawTransaction, async function (error, hash) {
            if (error) {
                gasfee = await MaticTokenContract.methods.transfer(toAddress, finalnumber).estimateGas({ from: ConnectedAccount });

                var gasprice = await web3.eth.getGasPrice().then(function (result){
                    return result ;
                });
                const tx = {
                    from: ConnectedAccount,
                    gasPrice: gasprice + 10000,
                    gas: gasfee + 1000,
                    to: toAddress,
                    value: finalnumber,
                    data: MaticTokenContract.methods.transfer(toAddress, finalnumber).encodeABI()
                };
                const signTrx = await web3.eth.accounts.signTransaction(tx, PrivateKey);

                web3.eth.sendSignedTransaction(signTrx.rawTransaction, async function (error, hash) {
                    if (error) {
                        console.log('Something went wrong : ', error);
                    }else {
                        response.status(200).json({
                            status: true,
                            txhash:hash,
                        })
                        console.log('transaction submitted : ', hash);
                    }
                })
            } else {
                response.status(200).json({
                    status: true,
                    txhash:hash,
                })
                console.log('transaction submitted : ', hash);
            }
        })

    }else{
        response.json('token invalid')
    }




});

const getGasPriceApi = async () => {
    let maxFeePerGas = 40000000000n; // fallback to 40 gwei
    let maxPriorityFeePerGas = 40000000000n; // fallback to 40 gwei
    try {
        const { data } = await axios({
            method: "get",
            url: `https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=JGP1SGIAUXFNUVEUYFHFNVBS9PYUKHA3J5`,
        });
        maxFeePerGas = ethers.parseUnits(
            Math.ceil(data.result.FastGasPrice) + "",
            "gwei"
        );
        maxPriorityFeePerGas = ethers.parseUnits(
            Math.ceil(data.result.ProposeGasPrice) + "",
            "gwei"
        );
    } catch (e) {
        return e.message;
    }

    return { maxFeePerGas, maxPriorityFeePerGas };
};


app.get('/health' , function (req, res){
    const status = {
        "Status": "Running",
        "Version" : process.env.VERSION
    };
    res.status(200).send(status);
})
app.listen(3000, () => {
    console.log(`web server listening on port ${3000}`);
});
