import {
  NOTIFICATION_TYPE,
  Store as NotificationStore,
} from 'react-notifications-component';

export const FileHead: string = "ipfs://";
export const dedicatedGateway = process.env.IPFS_DEDICATED_GATEWAY as string;
export const NET_ID = 80001;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export enum Order {
  PRICE_ASC,
  PRICE_DSC,
  LATEST,
  OLDEST,
}

export function notify(type: NOTIFICATION_TYPE, data: string) {
  NotificationStore.addNotification({
    title: type === 'danger' ? 'Error' : 'Success',
    message: data,
    type: type,
    insert: 'top',
    container: 'top-right',
    dismiss: {
      duration: 1000,
      pauseOnHover: true,
      onScreen: true,
      showIcon: true,
    },
    animationIn: ['animate__animated animate__fadeIn'], // `animate.css v4` classes
    animationOut: ['animate__animated animate__fadeOut'],
  });
}

export async function fetchIpfs(url: string) {
  url = url.replace(FileHead, dedicatedGateway);
  const data = await fetch(url);
  const metadata: IMetadata = await data.json();
  metadata.image = metadata.image.replace(FileHead, dedicatedGateway);
  return metadata;
}

export function sortNfts(globalNfts: IMarketNft[], sortOrder: Order) {
  switch (sortOrder) {
    case Order.PRICE_ASC:
      return globalNfts.sort((a, b) => a.price - b.price);
    case Order.PRICE_DSC:
      return globalNfts.sort((a, b) => b.price - a.price);
    case Order.OLDEST:
      return globalNfts.sort((a, b) => b.tokenId - a.tokenId);
    default:
      return globalNfts.sort((a, b) => a.tokenId - b.tokenId);
  }
}

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
