import { ethers } from "ethers";
import TurtisData from "../deployments/ArbitrumGoerli/Turtis.json"; // get Turtis data
import RentFunData from "../deployments/ArbitrumGoerli/RentFun.json"; // get RentFunABI data
import { create } from "ipfs-http-client";
import {Buffer} from 'buffer';
import {ImageNames, AllTurtleNames} from "@/lib/names";

const RentFunAddress = RentFunData.address;
const RentFunABI = RentFunData.abi;

const TurtisAddress = TurtisData.address;
const TurtisABI = TurtisData.abi;

let rentFunContract: ethers.Contract;
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
});

/**
 * * for init web3 metamasek
 * @returns true
 */
export const init = async () => {
  //@ts-ignore
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
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
  rentFunContract = new ethers.Contract(RentFunAddress, RentFunABI, signer);
  contract = new ethers.Contract(TurtisAddress, TurtisABI, signer);
  console.log("TurtisAddress", TurtisAddress);
  return true;
};

export const generateTurtle = async (score: number, tokenURL: string) => {
  return new Promise(function (res, rej) {
    try {
      contract.generateTurtle(score, tokenURL, {...overrides, value: ethers.utils.parseEther('0.02')}).then(async function (transaction: any) {
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
    } catch (error) {
      console.log("generateTurtleError", error);
    }
  });
};

export const upgradeTurtle = async (score: number, tokenURI: string, tokenId: number) => {
  return new Promise(function (res, rej) {
    try {
      contract.upgradeTurtle(score, tokenURI, tokenId).then(async function (transaction: any) {
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
    } catch (error) {
      console.log("upgradeTurtleError", error);
    }
  });
};

export const upgradeTurtleWithNewScore = async (score: number, tokenId: number) => {
  const turtles = await getSelfTurtles();

  // @ts-ignore
  const turtle = turtles.find((obj) => {
    return obj.tokenId.toString() === tokenId.toString();
  });

  const speedAttrib = turtle.metadata.attributes.find((attr: any) => {
    return attr.trait_type === 'speed';
  });

  const breedAttrib = turtle.metadata.attributes.find((attr: any) => {
    return (attr.trait_type === 'breed') ;
  });

  if (!speedAttrib) {
    console.log("speed is not found");
    return;
  }

  let nextBreed = breedAttrib.value;
  if (breedAttrib.value == 10) {
    nextBreed = 1;
  } else {
    nextBreed += 1;
  }

  const newtokenURI = await upgradedMetadata(score, speedAttrib.value, nextBreed);
  if (!newtokenURI) {
    console.log("newtokenURI was wrong");
    return;
  }

  return upgradeTurtle(score, newtokenURI, tokenId);
};

const upgradedMetadata = async (score: number, speed: number, breed: number) => {
  if (score < 1000) return;
  let newSpeed = getNewSpeed(score);
  if (newSpeed < speed) {
    console.log("new speed if less than the old, unable to upgrade");
    return;
  }

  const [component, imageUrl] = await generateUpgraedTurtle(breed);
  const metadata = {
    name: randTurtleName(),
    description: 'A Turtle that is on a journey in the river',
    image: imageUrl,
    componentIndices: {
      eyes: component,
      hands: component,
      head: component,
      legs: component,
      shell: component,
      shellOuter: component,
      tail: component,
    },
    attributes: [
      {
        trait_type: 'speed',
        value: newSpeed,
      },
      {
        trait_type: 'breed',
        value: breed,
      },
    ],
  };

  try {
    const result: any = await ipfsClient.add({path: "/Turtis", content: JSON.stringify(metadata)});
    const tokenURI = `ipfs://${result.cid}`;
    console.log("upgradedMetadataTokenURI", tokenURI);
    return tokenURI;
  } catch (error) {
    console.log("upgradedMetadata-uploadMdError", error);
  }
};

export const generateNewTurtle = async () => {
  const [name, breed, components, imageUrl] = await generateRandomTurtle();
  const metadata = {
    name: name,
    description: 'A Turtle that is on a journey in the river',
    image: imageUrl,
    componentIndices: {
      eyes: components[6],
      hands: components[0],
      head: components[2],
      legs: components[1],
      shell: components[4],
      shellOuter: components[5],
      tail: components[3],
    },
    attributes: [
      {
        trait_type: 'speed',
        value: 10,
      },
      {
        trait_type: 'breed',
        value: breed,
      },
    ],
  };

  let tokenURI = '';
  try {
    const result: any = await ipfsClient.add({path: "/Turtis", content: JSON.stringify(metadata)});
    tokenURI = `ipfs://${result.cid}`;
    console.log("newTurtleTokenURI", tokenURI);
  } catch (error) {
    console.log("generateNewTurtle-uploadMdError", error);
  }

  return generateTurtle(4000, tokenURI);
};


/**
 * * func get my nft in smart contract
 * @returns my NFTs
 */
export const getUserTurtles = async () => {
  const owned = await getSelfTurtles();
  const rented = await getAliveRentals();

  // @ts-ignore
  return [...owned, ...rented];
};

export const getSelfTurtles = () => {
  return new Promise(function (res, rej) {
    try {
      contract.getUserOwnedNFTs(currentUser).then(async function (transaction: any) {
        const datas = transaction.map(async (item: any) => {
          let tokenURI = item.tokenURI.toString();
          tokenURI = tokenURI.replace(FileHead, dedicatedGateway);
          let metadata = await (
              await fetch(tokenURI)
          ).json();
          metadata.image = metadata.image.replace(FileHead, dedicatedGateway);
          return {tokenId: item.tokenId, tokenUri: item.tokenURI, metadata: metadata, rented: false, endTime: 0};
        });

        const numFruits = await Promise.all(datas);
        res(await numFruits);
      });
    } catch (error) {
      console.log("getSelfTurtlesError", error);
    }
  });
};

export const getAliveRentals = async () => {
  return new Promise(function (res, rej) {
    try {
      rentFunContract.getAliveRentals(currentUser, TurtisAddress).then(async function (transaction: any) {
        const datas = transaction.map(async (item: Rental) => {
          let tokenURI = await getTokenUrlById(item.tokenId);
          // @ts-ignore
          tokenURI = tokenURI.replace(FileHead, dedicatedGateway);
          let metadata = await (
              // @ts-ignore
              await fetch(tokenURI)
          ).json();
          metadata.image = metadata.image.replace(FileHead, dedicatedGateway);
          return {tokenId: item.tokenId, tokenUri: tokenURI, metadata: metadata, rented: true, endTime: item.endTime};
        });

        const numFruits = await Promise.all(datas);
        res(await numFruits);
      });
    } catch (error) {
      console.log("getAliveRentalsError", error);
    }
  });
};

export const getTokenUrlById = async (tokenId: number) => {
  return new Promise(function (res, rej) {
    try {
      contract.tokenURI(tokenId).then(async function (transaction: any) {
        console.log("transaction", transaction);
        res(transaction);
      });
    } catch (error) {
      console.log("gettokenURIError", error);
    }
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
  let address: string;
  const signer = provider?.getSigner();
  address = await signer?.getAddress();
  return address;
};

const sleep = (milliseconds: number | undefined) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const overrides = {
  gasLimit: 4300000,
  gasPrice: ethers.utils.parseUnits('7', 'gwei'),
};

const randTurtleName = () => {
  return getRandomElement(AllTurtleNames);
};

const randImageName = () => {
  return getRandomElement(ImageNames);
};

const getRandomElement = (arr: any[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
}


const rareFolder = "ipfs://QmZSZmikBg1ApznhDo5ckTJjuz6tKVLBYQmCuGKLQCF6Wz/turtles/";
const commonFolder = "ipfs://QmdAZJAStu3EMGeaC8TA2kfosVW65itkjY5V5w7x5sqUH9/turtleImages/";
const images_per_component = 5;

export const generateUpgraedTurtle = (breed: number) => {
  const component = Math.floor(Math.random() * images_per_component + 1);

  let imageUrl = `${rareFolder}breed_${breed}_component_${component}.png`;
  return [component, imageUrl];
};

export const generateRandomTurtle = () => {
  let turtleName = randTurtleName();
  let imageName = randImageName();

  let imageUrl = `${commonFolder}breed_${imageName.breed}_component_${imageName.components}.png`;
  return [turtleName, imageName.breed, imageName.components, imageUrl];
};

const getNewSpeed = (score: number) => {
  let newSpeed: number;
  if (score < 4800) {
    newSpeed = score / 400;
  } else if (score < 30000) {
    newSpeed = score / 2000;
  } else if (score < 108000) {
    newSpeed = score / 6000;
  } else {
    newSpeed = score / 12000;
  }
  return Math.floor(newSpeed);
};
