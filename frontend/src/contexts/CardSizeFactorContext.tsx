import React, { useState } from 'react'



const CardSizeFactorContext = React.createContext<number>(100)
const SetKeyPressContext = React.createContext<any | null>(null)


function CardSizeFactorProvider({children} : any) {
  const [cardSizeFactor, setCardSizeFactor] = useState<number>(100);
  return (
    <CardSizeFactorContext.Provider value={cardSizeFactor}>
      <SetKeyPressContext.Provider value={setCardSizeFactor}>
        {children}
      </SetKeyPressContext.Provider>
    </CardSizeFactorContext.Provider>
  )
}

function useCardSizeFactor() {
  const context = React.useContext(CardSizeFactorContext)
  if (context === undefined) {
    throw new Error('cardSizeFactor must be used within a cardSizeFactorProvider')
  }
  return context
}

function useSetCardSizeFactor() {
  const context = React.useContext(SetKeyPressContext)
  if (context === undefined) {
    throw new Error('setCardSizeFactor must be used within a cardSizeFactorProvider')
  }
  return context
}

export {CardSizeFactorProvider, useCardSizeFactor, useSetCardSizeFactor}