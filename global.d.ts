interface Window {
  ethereum: any;
}

interface IUserNft {
  tokenId: number;
  tokenUri: string;
}

interface IMetadata {
  name: string;
  description: string;
  componentIndices: IComponentIndices;
  attributes: IAttribute[];
  image: string;
}

interface IAttribute {
  trait_type: string;
  value: string | number;
}

interface IComponentIndices {
  eyes: string;
  hands: string;
  head: string;
  legs: string;
  shell: string;
  shellOuter: string;
  tail: string;
}

interface IUserNftWithMetadata extends IUserNft {
  metadata: IMetadata;
}
