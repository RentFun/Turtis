import { ethers } from "ethers";
import TurtisData from "../deployments/ArbitrumGoerli/Turtis.json"; // get Turtis data
import { create } from "ipfs-http-client";
import {Buffer} from 'buffer'

const TurtisAddress = TurtisData.address;
const TurtisABI = TurtisData.abi;

let contract: ethers.Contract;
let provider: ethers.providers.Web3Provider;
let currentUser: string;

export const FileHead = "ipfs://";
export const dedicatedGateway = process.env.NEXT_PUBLIC_DEDICATED_GATEWAY as string;
const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth,
  }
})

/**
 * * for init web3 metamasek
 * @returns true
 */
export const init = async () => {
  console.log('dedicatedGateway', dedicatedGateway);
  console.log('projectId', projectId);
  console.log('projectSecret', projectSecret);

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
  console.log("TurtisAddress", TurtisAddress);
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

export const upgradeTurtle = async (score: number, tokenURL: string, tokenId: number) => {
  return new Promise(function (res, rej) {
    contract.upgradeTurtle(score, tokenURL, tokenId).then(async function (transaction: any) {
      console.log("upgradeTurtle transaction", transaction);
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

export const upgradeDefaultTurtle = async () => {
  const metadata = {
    name: 'Sweet',
    description: 'A Turtle that is on a journey in the river',
    image: `ipfs://QmUknw7DGUUnAh7aFuBV6n8eFJun9iGSuWaSzoYnf9A6r8`,
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
  };

  // @ts-ignore
  const result: any = await ipfsClient.add(JSON.stringify(metadata));
  const tokenURI = `ipfs://${result.cid}`;
  console.log("tokenURI", tokenURI);
  return upgradeTurtle(110, tokenURI, 0);
}

export const generateNewTurtle = async () => {
  return generateTurtle(10, 'ipfs://QmX6RYTH6ruLB2Z9TT8mwqHN1QVy95KYkS7HsBhFHRK6uB');
};


/**
 * * func get my nft in smart contract
 * @returns my NFTs
 */
export const getSelfTurtles = () => {
  return new Promise(function (res, rej) {
    console.log("currentUser", currentUser);
    contract.getUserOwnedNFTs(currentUser).then(async function (transaction: any) {
      console.log("transaction", transaction);
      const datas = transaction.map(async (item: any) => {
        let tokenURI = item.tokenURI.toString();
        tokenURI = tokenURI.replace(FileHead, dedicatedGateway);
        let metadata = await (
            await fetch(tokenURI)
        ).json();
        metadata.image = metadata.image.replace(FileHead, dedicatedGateway);
        return {tokenId: item.tokenId, tokenUri: item.tokenURI, metadata: metadata};
      });

      const numFruits = await Promise.all(datas);
      res(await numFruits);
    });
  });
};

export const getHighScore = () => {
  return new Promise(function (res, rej) {
    contract.userAddressToHighScore(currentUser).then(async function (data: any) {
      res(await data);
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

export const dummyTurtle1 = {
  tokenId: -1,
  tokenUri:
      'ipfs://bafyreicjwky6t2dcdqpj6r6lx2tl2rgdo5riazknoq4yzgyvkrhyuxyqfm/metadata.json',
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
    image:
        'https://rentfun.infura-ipfs.io/ipfs/bafybeihjzfdlnzw7xfpc33o3cf7tunqcyj6ithepao3apdzykj4gvvug5y/randomTurtle.png',
  },
};
export const dummyTurtle2 = {
  tokenId: 2,
  tokenUri:
      'ipfs://bafyreicjwky6t2dcdqpj6r6lx2tl2rgdo5riazknoq4yzgyvkrhyuxyqfm/metadata.json',
  metadata: {
    name: 'Floppy Turtle 2',
    description: 'A Turtle that is on a journey in the river',
    componentIndices: {
      eyes: '2',
      hands: '2',
      head: '2',
      legs: '3',
      shell: '4',
      shellOuter: '4',
      tail: '5',
    },
    attributes: [
      {
        trait_type: 'speed',
        value: 10,
      },
      {
        trait_type: 'breed',
        value: 6,
      },
    ],
    image:
        'https://rentfun.infura-ipfs.io/ipfs/bafybeihjzfdlnzw7xfpc33o3cf7tunqcyj6ithepao3apdzykj4gvvug5y/randomTurtle.png',
  },
};

export const dummyUserNftWithMetadata: IUserNftWithMetadata[] = [
  dummyTurtle1,
  dummyTurtle2,
];

