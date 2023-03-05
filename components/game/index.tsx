import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from './hooks';
import {init, getHighScore, getSelfTurtles, dummyUserNftWithMetadata} from "@/lib/Web3Client";

const GameScreen = () => {
  const [ended, setEnded] = useState(false);
  const router = useRouter();
  const parentEl = useRef<HTMLDivElement>(null);
  const { game, grs } = useGame(parentEl);

  const endGameCB = useCallback(
      (score: number, metersTravelled: number, choseToMint: boolean) => {
        console.log("endGameCB-score", score);
      },
      []
  );

  const mintTurtisCB = useCallback(
      (score: number) => {
        console.log("mintTurtisCB-score", score);
      },
      []
  );

  const goHomeCB = useCallback(() => {
    router.push('/profile');
  }, [router]);

  // useEffect(() => {
  //
  //
  //   //@ts-ignore
  //   window.ethereum.on("accountsChanged", function (accounts) {
  //     router.replace('/profile');
  //   });
  // }, []);

  useEffect(() => {
    const fetchScoreAndTurtles = async () => {
      await init();
      const score = await getHighScore();
      const tles = await getSelfTurtles();

      console.log("tles", tles);

      if (game && !ended) {
        console.log('starting game');
        game.scene.start('boot', {
          grs,
          initGameData: {
            highScore: score,
            endGameCB,
            mintTurtisCB,
            goHomeCB,
            initMetaData: tles,
            // highScore: score,
            // goHomeCB,
            // initMetaData: tutle
          },
        });
      }
    };

    fetchScoreAndTurtles();


    if (ended) {
      console.log('rerouting');
      router.push('/profile');
    }
  }, [game, ended, router, goHomeCB, grs]);

  return (
      <>
        <div ref={parentEl} style={{ height: '100vh', overflow: 'hidden' }} />
        <div id='font-hack'>.</div>
      </>
  );
};

export default GameScreen;
