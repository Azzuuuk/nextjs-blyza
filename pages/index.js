import Head from 'next/head';

export default function GamesListPage() {
  return (
    <>
      <Head>
  <title>Blyza - Powered by Fun, Driven by Rewards!</title>
  <meta name="description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
  <meta name="keywords" content="party games , Blyza , team building games, group games, online games with friends, fun games, browser games, find imposter, imposter games" />
  <meta property="og:title" content="Blyza - Powered by Fun, Driven by Rewards!" />
  <meta property="og:description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
  <meta property="og:url" content="https://www.playblyza.com" />
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow" />



  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="icon" href="/favicon.ico" />
</Head>


      <iframe
        src="/games.html"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none'
        }}
        title="Games List"
      />
    </>
  );
}
