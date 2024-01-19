import React from "react"
import styles from "@/styles/FighterCard.module.css"
import Image from "next/image"

const FighterCard = (props) => {
  const { imageSrc, alt, fighter } = props

  return (
    <div id="fighterCard" className={styles.card}>
      <div className={styles.contentWrapper}>
        <Image
          src={imageSrc}
          className={styles.image}
          alt={alt}
          fill
        />

        <div className={styles.content}>
          <h3 className={styles.name} data-testid="fighter-name">{fighter.name.toUpperCase()}</h3>
          <p className={styles.age} data-testid="fighter-age">AGE : {fighter.age}</p>
          <p className={styles.record} data-testid="fighter-record">RECORD : {fighter.record}</p>
          <p className={styles.weight} data-testid="fighter-weight">WEIGHT : {fighter.weight} lbs</p>
          <p className={styles.stance} data-testid="fighter-stance">STANCE : {fighter.stance}</p>
        </div>
      </div>
    </div>
  )
}

export default FighterCard