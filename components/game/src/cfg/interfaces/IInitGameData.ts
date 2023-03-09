export interface IInitGameData {
    initMetaData: Array<IUserNftWithMetadata>;
    highScore: number;
    endGameCB: (score: number, metersTravelled: number) => void;
    mintTurtisCB: (score: number, tokenId: number) => void;
    goHomeCB: () => void;
}