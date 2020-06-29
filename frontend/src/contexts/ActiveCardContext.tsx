import React, { useState } from 'react'
import { Card } from "elixir-backend";


const ActiveCardContext = React.createContext<Card | null>(null)
const SetActiveCardContext = React.createContext<any | null>(null)


function ActiveCardProvider({children} : any) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  return (
    <ActiveCardContext.Provider value={activeCard}>
      <SetActiveCardContext.Provider value={setActiveCard}>
        {children}
      </SetActiveCardContext.Provider>
    </ActiveCardContext.Provider>
  )
}

function useActiveCard() {
  const context = React.useContext(ActiveCardContext)
  if (context === undefined) {
    throw new Error('activeCard must be used within a ActiveCardProvider')
  }
  return context
}

function useSetActiveCard() {
  const context = React.useContext(SetActiveCardContext)
  if (context === undefined) {
    throw new Error('setActiveCard must be used within a ActiveCardProvider')
  }
  return context
}

export {ActiveCardProvider, useActiveCard, useSetActiveCard}