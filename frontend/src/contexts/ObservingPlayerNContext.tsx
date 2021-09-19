import React, { useState } from 'react'

const ObservingPlayerNContext = React.createContext<string | null>(null)
const SetObservingPlayerNContext = React.createContext<any | null>(null)

function ObservingPlayerNProvider({children} : any) {
  const [cardSizeFactor, setObservingPlayerN] = useState<string | null>(null);
  return (
    <ObservingPlayerNContext.Provider value={cardSizeFactor}>
      <SetObservingPlayerNContext.Provider value={setObservingPlayerN}>
        {children}
      </SetObservingPlayerNContext.Provider>
    </ObservingPlayerNContext.Provider>
  )
}

function useObservingPlayerN() {
  const context = React.useContext(ObservingPlayerNContext)
  if (context === undefined) {
    throw new Error('cardSizeFactor must be used within a cardSizeFactorProvider')
  }
  return context
}

function useSetObservingPlayerN() {
  const context = React.useContext(SetObservingPlayerNContext)
  if (context === undefined) {
    throw new Error('setObservingPlayerN must be used within a cardSizeFactorProvider')
  }
  return context
}

export {ObservingPlayerNProvider, useObservingPlayerN, useSetObservingPlayerN}