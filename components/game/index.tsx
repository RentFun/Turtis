import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useGame } from './hooks';
import {init, getHighScore, getUserTurtles, upgradeTurtleWithNewScore} from "@/lib/Web3Client";

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
      (score: number, tokenId: number) => {
        console.log("mintTurtisCB", `score=${score}tokenId=${tokenId}`);
        const upgradeTurtle = async () => {
          await upgradeTurtleWithNewScore(Math.floor(score), tokenId);
        };

        upgradeTurtle();
      },
      []
  );

  const goHomeCB = useCallback(() => {
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    const fetchScoreAndTurtles = async () => {
      await init();
      const score = await getHighScore();
      let turtles = await getUserTurtles();

      console.log("tles", turtles);
      // @ts-ignore

      if (game && !ended) {
        console.log('starting game');
        game.scene.start('boot', {
          grs,
          initGameData: {
            highScore: score,
            endGameCB,
            mintTurtisCB,
            goHomeCB,
            initMetaData: turtles,
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
