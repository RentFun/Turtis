import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Card from '@/components/body/profilecard';
import LoadingCard from '@/components/loadingcard';
import {  getSelfTurtles, init, generateNewTurtle } from "@/lib/Web3Client";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlay} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';

function Profile() {
  const [nftData, setNFTData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getNFTs();
    //@ts-ignore
    window.ethereum.on("accountsChanged", function (accounts) {
      getNFTs();
    });
  }, []);

  const getNFTs = () => {
    init().then((res) => {
      getSelfTurtles().then((data: any) => {
        setNFTData(data);
        setLoading(false);
      });
    });
  };

  const generateDefaultTurtle = () => {
    generateNewTurtle().then((data: any) => {
      getNFTs()
    });
  }

  const cards = nftData.map((nft: IUserNftWithMetadata) => (
    <Card turtle={nft}/>
  ));

  const dummyCards = [...Array(6)].map((_, index) => (
    <LoadingCard key={index} />
  ));

  const genNewCard =
      nftData ? <button
          onClick={() => router.push("/game")}
          className='bg-lightblue border hover:scale-110 hover:brightness-105 border-lightblue lg:rounded-xl rounded-l lg:px-10 lg:py-5 p-3 text-blue font-bold lg:text-3xl text-2xl text-center'>
        <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon> Play
      </button> : <button
          onClick={generateDefaultTurtle}
          className='bg-lightblue border hover:scale-110 hover:brightness-105 border-lightblue lg:rounded-xl rounded-l lg:px-10 lg:py-5 p-3 text-blue font-bold lg:text-3xl text-2xl text-center'>
        <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon> Mint A Turtle
      </button>

  return (
    <div className='w-full h-full font-primary'>
      <Navbar />
      <div className='bg-greyish h-full w-full px-16 py-16 flex flex-col'>
        <div className='h-full p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12'>
          {loading ? dummyCards : cards}
        </div>

        {nftData.length != 0 ? genNewCard : ''}
      </div>
    </div>
  );
}
export default Profile;
