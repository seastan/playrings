import React, { useState } from 'react'

const TouchActionContext = React.createContext<any | null>(null)
const SetTouchActionContext = React.createContext<any | null>(null)


function TouchActionProvider({children} : any) {
  const [touchAction, setTouchAction] = useState<any | null>(null);
  return (
    <TouchActionContext.Provider value={touchAction}>
      <SetTouchActionContext.Provider value={setTouchAction}>
        {children}
      </SetTouchActionContext.Provider>
    </TouchActionContext.Provider>
  )
}

function useTouchAction() {
  const context = React.useContext(TouchActionContext)
  if (context === undefined) {
    throw new Error('touchAction must be used within a TouchActionProvider')
  }
  return context
}

function useSetTouchAction() {
  const context = React.useContext(SetTouchActionContext)
  if (context === undefined) {
    throw new Error('setTouchAction must be used within a TouchActionProvider')
  }
  return context
}

export {TouchActionProvider, useTouchAction, useSetTouchAction}