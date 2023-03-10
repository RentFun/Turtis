import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Card from '@/components/body/profilecard';
import {  getUserTurtles, init, generateNewTurtle} from "@/lib/Web3Client";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlay, faPlus} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/router';

function Profile() {
  const [nft, setNft] = useState([]);
  const [minted, setMinted] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getNFTs = async () => {
      await init();
      const datas = await getUserTurtles();

      // @ts-ignore
      setNft(datas);
    };

    getNFTs();
    //@ts-ignore
    window.ethereum.on("accountsChanged", function (accounts) {
      getNFTs();
    });
  }, []);

  const generateDefaultTurtle = async () => {
    setMinted(false);
    await init();
    await generateNewTurtle();
    const datas = await getUserTurtles();

    // @ts-ignore
    setNft(datas);
    setMinted(true);
  };

  const cards = nft.map((nft: IUserNftWithMetadata) => (
    <Card turtle={nft} key={nft.tokenId.toString()} />
  ));

  const PlayBtn =
      <button
          onClick={() => router.push("/game")}
          className='bg-lightblue border hover:scale-110 hover:brightness-105 border-lightblue lg:rounded-xl rounded-l lg:px-10 lg:py-5 p-3 text-blue font-bold lg:text-3xl text-2xl text-center'>
        <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon> Play
      </button>

  const NewCardBtn = <button
      onClick={generateDefaultTurtle}
      style={{marginTop: '3rem'}}
      className='bg-lightblue border hover:scale-110 hover:brightness-105 border-lightblue lg:rounded-xl rounded-l lg:px-10 lg:py-5 p-3 text-blue font-bold lg:text-3xl text-2xl text-center'>
    <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon> Mint a turtle
  </button>

  return (
    <div className='w-full h-full font-primary'>
      <Navbar />
      <div className='bg-greyish h-full w-full px-16 py-16 flex flex-col'>
        <div className='h-full p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' style={{ width: '48rem'}}>
          {cards}
        </div>

        {PlayBtn}
        {NewCardBtn}
      </div>
    </div>
  );
}
export default Profile;
