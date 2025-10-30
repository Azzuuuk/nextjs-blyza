import GameIframe from '../../components/GameIframe';

export default function Game1Page() {
  return (
    <GameIframe 
      gameId="game1" 
      gameHtml="game1.html" 
      title="Guess the Price" 
    />
  );
}
