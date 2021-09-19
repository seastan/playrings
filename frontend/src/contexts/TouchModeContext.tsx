import React, { useState } from 'react'

const TouchModeContext = React.createContext<any | null>(null)
const SetTouchModeContext = React.createContext<any | null>(null)


function TouchModeProvider({children} : any) {
  const [touchMode, setTouchMode] = useState<any | null>(false);
  return (
    <TouchModeContext.Provider value={touchMode}>
      <SetTouchModeContext.Provider value={setTouchMode}>
        {children}
      </SetTouchModeContext.Provider>
    </TouchModeContext.Provider>
  )
}

function useTouchMode() {
  const context = React.useContext(TouchModeContext)
  if (context === undefined) {
    throw new Error('touchMode must be used within a TouchModeProvider')
  }
  return context
}

function useSetTouchMode() {
  const context = React.useContext(SetTouchModeContext)
  if (context === undefined) {
    throw new Error('setTouchMode must be used within a TouchModeProvider')
  }
  return context
}

export {TouchModeProvider, useTouchMode, useSetTouchMode}