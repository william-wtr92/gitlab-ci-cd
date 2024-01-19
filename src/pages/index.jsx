import fs from "fs"
import path from "path"
import styles from "@/styles/Home.module.css"
import FighterCard from "@/components/FighterCard"
import FightCard from "@/components/FightCard"
import { useEffect, useState } from "react"
import { Howl } from "howler"


export async function getStaticProps() {
  const env = process.env.ENV
  let filePath

  if (env === "production") {
    filePath = "data/emb-data/data1.json"
  } else if (env === "production-over") {
    filePath = "data/emb-data/data1.json"
  } else {
    filePath = "data/modif-data/data2.json"
  }

  const fullPath = path.join(process.cwd(), filePath)
  let data

  try {
    data = JSON.parse(fs.readFileSync(fullPath, "utf8"))
  } catch (error) {
    data = { title: "Default Title" }
  }

  return {
    props: {
      data,
      environment: data.environment
    }
  }
}

const Home = (props) => {
  const { data, environment } = props
  const fighters = data.fighters

  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const sound = new Howl({
      src: ["/coming-home.mp3"], // Remplacez par le chemin de votre musique
      autoplay: true,
      loop: true, // Si vous voulez que la musique se répète
      volume: 0.3, // Réglage du volume (0 à 1)
    })

    return () => {
      sound.stop()
    }
  }, [])

  useEffect(() => {
    const banner = document.querySelector("header")
    const main = document.querySelector("main")

    if (!clicked) {
      banner.classList.add(styles.show)
      main.classList.add(styles.hide)

      return
    }

    banner.classList.remove(styles.show)
    banner.classList.add(styles.hide)

    main.classList.remove(styles.hide)
    main.classList.add(styles.show)
  }, [clicked])

  return (
    <>
      <span id="environmentText" className={styles.environmentText}>{environment}</span>

      <header className={styles.header} onClick={() => setClicked(true)}>
        <h1 className={styles.title}>UFC TOP 5 BEST FIGHTERS</h1>
      </header>

      <main className={styles.main} id="bottom">
        {/* Volkanovski */}
        {fighters[0].fights.map((fight, index) => (
          <FightCard 
            key={index}
            imageSrc={fight.fightImage}
            fighter={fight.fighter}
            opponent={fight.opponent}
          /> 
        ))}

        <FighterCard
          fighter={fighters[0]}
          imageSrc={fighters[0].fighterImage}
          alt={fighters[0].name}
        />

        {/* Jon Jones */}
        <FighterCard
          fighter={fighters[1]}
          imageSrc={fighters[1].fighterImage}
          alt={fighters[1].name}
        />
        {fighters[1].fights.map((fight, index) => (
          <FightCard 
            key={index}
            imageSrc={fight.fightImage}
            fighter={fight.fighter}
            opponent={fight.opponent}
          /> 
        ))}

        {/* Mcgregor */}
        {fighters[2].fights.map((fight, index) => (
          <FightCard 
            key={index}
            imageSrc={fight.fightImage}
            fighter={fight.fighter}
            opponent={fight.opponent}
          /> 
        ))}
        <FighterCard
          fighter={fighters[2]}
          imageSrc={fighters[2].fighterImage}
          alt={fighters[2].name}
        />

        {/* George St Pierre */}
        {fighters[3].fights.map((fight, index) => (
          <FightCard 
            key={index}
            imageSrc={fight.fightImage}
            fighter={fight.fighter}
            opponent={fight.opponent}
          /> 
        ))}
        <FighterCard
          fighter={fighters[3]}
          imageSrc={fighters[3].fighterImage}
          alt={fighters[3].name}
        />

        {/* Alex Pereira */}
        {fighters[4].fights.map((fight, index) => (
          <FightCard 
            key={index}
            imageSrc={fight.fightImage}
            fighter={fight.fighter}
            opponent={fight.opponent}
          /> 
        ))}
        <FighterCard
          fighter={fighters[4]}
          imageSrc={fighters[4].fighterImage}
          alt={fighters[4].name}
        />
      </main>
    </>
  )
}

export default Home
