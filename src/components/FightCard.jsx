import Image from "next/image"
import React from "react"
import styles from "@/styles/FightCard.module.css"

const FightCard = (props) => {
  const { imageSrc, alt, fighter, opponent } = props

  return (
    <div className={styles.card} id="fight-card">
      <Image
        data-testid="fight-image"
        src={imageSrc}
        className={styles.image}
        alt={alt}
        fill
      />

      <div className={styles.overlay}>
        <p>{fighter}</p>
        <span>VS</span>
        <p>{opponent}</p>
      </div>
    </div>
  )
}

export default FightCard
