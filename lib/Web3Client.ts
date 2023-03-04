import { ethers } from "ethers";
import TurtisData from "../deployments/ArbitrumGoerli/Turtis.json"; // get Turtis data
import { create } from "ipfs-http-client";
import {Buffer} from 'buffer'


const TurtisAddress = TurtisData.address;
const TurtisABI = TurtisData.abi;


const FileHead = "ipfs://";
const DedicatedGateway = "https://rentfun.infura-ipfs.io/ipfs/"

let contract: ethers.Contract;
let provider: ethers.providers.Web3Provider;
let currentUser: string;

/**
 * * for init web3 metamasek
 * @returns true
 */
export const init = async () => {
  //@ts-ignore
  provider = new ethers.providers.Web3Provider(web3.currentProvider, "any");
  provider.on("network", (oldNetwork) => {
    console.log(oldNetwork.chainId);
    if (oldNetwork.chainId != 421613) {
      //@ts-ignore
      window.ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x66eed",
              chainName: "Arbitrum Goerli Testnet",
              nativeCurrency: {
                name: "Goerli ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://goerli.arbiscan.io/"],
            },
          ],
        })
        .catch((error: any) => {
          console.log(error);
        });
      return false;
    }
  });
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  currentUser = await signer.getAddress();
  contract = new ethers.Contract(TurtisAddress, TurtisABI, signer);
  console.log("init...");
  return true;
};

export const generateTurtle = async (score: number, tokenURL: string) => {
  return new Promise(function (res, rej) {
    contract.generateTurtle(score, tokenURL).then(async function (transaction: any) {
      console.log("generateTurtle transaction", transaction);
      let transactionReceipt = null;
      while (transactionReceipt == null) {
        // Waiting expectedBlockTime until the transaction is mined
        transactionReceipt = await provider.getTransactionReceipt(
          transaction.hash
        );
        await sleep(1000);
      }
      res(transaction);
    });
  });
};

export const generateNewTurtle = async () => {
  return generateTurtle(10, NewTurtle.tokenUri);
};

/**
 * * func get my nft in smart contract
 * @returns my NFTs
 */
export const getSelfTurtles = () => {
  return new Promise(function (res, rej) {
    contract.getUserOwnedNFTs(currentUser).then(async function (transaction: any) {
      console.log("getUserOwnedNFTs", transaction);

      const datas = transaction.map(async (item: any) => {
        let tokenURI = item.tokenURI.toString();
        tokenURI = tokenURI.replace(FileHead, DedicatedGateway);
        let metadata = await (
            await fetch(tokenURI)
        ).json();
        metadata.image = metadata.image.replace(FileHead, DedicatedGateway);
        return {tokenId: item.tokenId, tokenURI: tokenURI, metadata: metadata};
      });

      const numFruits = await Promise.all(datas);
      res(await numFruits);
    });
  });
};

/**
 * * isAuth is middleware to chekc auth web3 or metamask connected or not
 * @returns string my address
 */
export const isAuth = async () => {
  let address = "";
  const signer = provider?.getSigner();
  address = await signer?.getAddress();
  return address;
};

const sleep = (milliseconds: number | undefined) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const NewTurtle = {
  tokenUri: 'ipfs://bafyreicjwky6t2dcdqpj6r6lx2tl2rgdo5riazknoq4yzgyvkrhyuxyqfm/metadata.json',
  metadata: {
    name: 'Starter Turtle',
    description: 'A Turtle that is on a journey in the river',
    componentIndices: {
      eyes: '1',
      hands: '1',
      head: '1',
      legs: '1',
      shell: '1',
      shellOuter: '1',
      tail: '1',
    },
    attributes: [
      {
        trait_type: 'speed',
        value: 10,
      },
      {
        trait_type: 'breed',
        value: 1,
      },
    ],
    image: 'ipfs://bafybeihjzfdlnzw7xfpc33o3cf7tunqcyj6ithepao3apdzykj4gvvug5y/NewTurtle.png',
  }
};

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth,
  }
})

export const uploadFile = async () => {
}

