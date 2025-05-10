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
        gasfee = await MaticTokenContract.methods.transfer(toAddress, finalnumber).estimateGas({ from: ConnectedAccount });


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

    let { amount, receiver , token } = request.body;
    const web3 = new Web3(new Web3.providers.HttpProvider(RpcHttpUrl));
    const Account = web3.eth.accounts.privateKeyToAccount(PrivateKey );
    const ConnectedAccount = Account.address;
    const USDTContract = new web3.eth.Contract(


        [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"userAddress","type":"address"},{"indexed":false,"internalType":"address payable","name":"relayerAddress","type":"address"},{"indexed":false,"internalType":"bytes","name":"functionSignature","type":"bytes"}],"name":"MetaTransactionExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"CHILD_CHAIN_ID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CHILD_CHAIN_ID_BYTES","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEPOSITOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ERC712_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROOT_CHAIN_ID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROOT_CHAIN_ID_BYTES","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name_","type":"string"}],"name":"changeName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"bytes","name":"depositData","type":"bytes"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes","name":"functionSignature","type":"bytes"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"}],"name":"executeMetaTransaction","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getDomainSeperator","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getRoleMember","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint8","name":"decimals_","type":"uint8"},{"internalType":"address","name":"childChainManager","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

        , '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', {from: ConnectedAccount})


    var num = parseFloat(amount).toString();
    var wei = web3.utils.toWei(num , 'mwei');
    var finalnumber = web3.utils.toHex(wei)

    var toAddress = receiver;
    gasfee = await USDTContract.methods.transfer(toAddress, finalnumber).estimateGas({ from: ConnectedAccount });


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
        data: USDTContract.methods.transfer(toAddress, finalnumber).encodeABI()
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
