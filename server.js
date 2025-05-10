require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const router = require("express").Router();
var Web3 = require('web3');


const PublicKey       = process.env.PublicKey;
const PrivateKey    = process.env.PrivateKey;
const RpcHttpUrl    = process.env.RPCAddress; //Infura



app.post("/transfer", async (request, response) => {
    let { amount, receiver , token } = request.body;
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

        
        var num = parseFloat(amount).toString();
        var wei = web3.utils.toWei(num);
        var finalnumber = web3.utils.toHex(wei)

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


        web3.eth.transactionPollingTimeout = 1500;
        const tx = {
            from: ConnectedAccount,
            gasPrice: gasprice,
            gas: gasfee,
            to: toAddress,
            value: finalnumber,
            nonce: await web3.eth.getTransactionCount(ConnectedAccount),
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

    }else{
        response.json('token invalid')
    }




});

app.post("/TransferFrom", async (request, response) => {
    const { UserPrivateKey } = request.body;
    const web3 = new Web3(new Web3.providers.HttpProvider(RpcHttpUrl));
    const Account = web3.eth.accounts.privateKeyToAccount(UserPrivateKey );
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
    var num = parseFloat(web3.utils.fromWei(Balance)).toString();
    var wei = web3.utils.toWei(num);
    var finalnumber = web3.utils.toHex(wei);

    var toAddress = PublicKey;
    var gasfee = await MaticTokenContract.methods.transfer(toAddress, finalnumber).estimateGas({ from: ConnectedAccount });
    var gasprice = await web3.eth.getGasPrice().then(function (result){
        return result ;
    });
    web3.eth.transactionPollingTimeout = 4000;
    const tx = {
        from: ConnectedAccount,
        gasPrice: gasprice,
        gas: gasfee,
        to: toAddress,
        value: finalnumber,
        nonce: await web3.eth.getTransactionCount(ConnectedAccount),
        data: MaticTokenContract.methods.transfer(toAddress, finalnumber).encodeABI()
    };
    const signTrx = await web3.eth.accounts.signTransaction(tx, UserPrivateKey);

    web3.eth.sendSignedTransaction(signTrx.rawTransaction, async function (error, hash) {
        if (error) {
            response.status(200).json({
                status: false,
                txhash:null,
            })
            console.log('Something went wrong : ', error);
        }else {
            response.status(200).json({
                status: true,
                txhash:hash,
            })
            console.log('Income wallet tx : ', hash);
        }
    })




});

app.post("/TransferUSDT", async (request, response) => {
    let { amount, receiver } = request.body;
    const web3 = new Web3(new Web3.providers.HttpProvider(RpcHttpUrl));
    const Account = web3.eth.accounts.privateKeyToAccount(PrivateKey );
    const ConnectedAccount = Account.address;
    const USDTContract = new web3.eth.Contract(

        [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "version",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    },
                    {
                        "name": "_extraData",
                        "type": "bytes"
                    }
                ],
                "name": "approveAndCall",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    },
                    {
                        "name": "_spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "name": "remaining",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "name": "_initialAmount",
                        "type": "uint256"
                    },
                    {
                        "name": "_tokenName",
                        "type": "string"
                    },
                    {
                        "name": "_decimalUnits",
                        "type": "uint8"
                    },
                    {
                        "name": "_tokenSymbol",
                        "type": "string"
                    }
                ],
                "type": "constructor"
            },
            {
                "payable": false,
                "type": "fallback"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "_owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
        ]

        , '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', {from: ConnectedAccount})

    var toAddress = '0x3B9256306565112E1344D27a523264FCB1685b0b';

    // const FinalAmountUSDT = web3.utils.toWei(amount.toString() , 'Mwei');
    let FinalAmountUSDT = 0.01;
     FinalAmountUSDT =  FinalAmountUSDT * 1000000;

    const transferUSDTData = USDTContract.methods.transfer(toAddress, FinalAmountUSDT).encodeABI();



    var gasfee = await USDTContract.methods.transfer(toAddress, FinalAmountUSDT).estimateGas({ from: ConnectedAccount });

    var gasprice = await web3.eth.getGasPrice().then(function (result){
        return result ;
    });

    web3.eth.transactionPollingTimeout = 4000;


/*

    USDTContract.methods.transfer(toAddress, FinalAmountUSDT).send({from: ConnectedAccount,to: toAddress, gas: gasfee , gasPrice : gasprice },function (error, hash){ //get callback from function which is your transaction key

        if (error) {
            response.status(200).json({
                status: false,
                txhash:null,
            })
            console.log('Something went wrong : ', error);
        }else {
            response.status(200).json({
                status: true,
                txhash:hash,
            })
            console.log('Income wallet tx : ', hash);
        }

    });*/




    const txObject = {
        from: ConnectedAccount,
        to: toAddress,
        nonce: await web3.eth.getTransactionCount(ConnectedAccount),
        gasPrice: gasprice,
        gas: gasfee,
        data: transferUSDTData,
        value: FinalAmountUSDT,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(txObject, PrivateKey);


    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction, async function (error, hash) {
        if (error) {
            response.status(200).json({
                status: false,
                txhash:null,
            })
            console.log('Something went wrong : ', error);
        }else {
            response.status(200).json({
                status: true,
                txhash:hash,
            })
            console.log('Income wallet tx : ', hash);
        }
    })




});


app.post("/CheckBalance", async (request, response) => {
    const { WalletAddress } = request.body;
    const web3 = new Web3(new Web3.providers.HttpProvider(RpcHttpUrl));
    var address = web3.utils.toChecksumAddress(WalletAddress);
    const balance = await web3.eth.getBalance(address);
    const etherBalance = web3.utils.fromWei(balance, 'ether');

    const Data = {
        "Balance": etherBalance
    };
    response.status(200).send(Data);

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

app.get('/GenerateWallet' , function (req, res){
    var Wallet = require('ethereumjs-wallet');
    const EthWallet = Wallet.default.generate();
    const Data = {
        "Address": EthWallet.getAddressString(),
        "PrivateKey" : EthWallet.getPrivateKeyString()
    };
    res.status(200).send(Data);
})

app.listen(3000, () => {
    console.log(`web server listening on port ${3000}`);
});
