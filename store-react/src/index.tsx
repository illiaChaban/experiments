import { skip } from "../../sync-observables"
import { pipe } from "../../utils/pipe"
import { Store } from "../../store"
import { useConst, useLatest } from "./helpers"

import React,{useRef, useState, useEffect} from 'react'

const useMakeWatch = <T,>(store: Store<T>) => {
  const useWatch = useConst(<U,>(path: string[]) => {

    const [value, setValue] = useState(store.get(path).value()) 

    useEffect(() => {
      const unsub = pipe(store.get(path), skip(1)).subscribe(
        (value: U) => setValue(value)
      )
      return () => unsub()
    }, [])

    return value
  })
  return useWatch
}

const makeSet = <T,>(store: Store<T>) => {
  const useSet = useConst(<U,>(path: string[]) => {
    const [value, setValue] = useState(store.get(path).value()) 

    useEffect(() => {
      const unsub = pipe(store.get(path), skip(1)).subscribe(
        (value: U) => setValue(value)
      )
      return () => unsub()
    }, [])

    return [value]
  })
  return useSet
}


const makeUseLens = <T,>(store: Store<T>) => {
  const useWatch = useMakeWatch(store)
  const make
  const useLens = <U,>(path: string[]) => {
    const value = useWatch(path)
    const setValue = makeSet(store)

    return [value, updateInStore]
  }
  return useLens
}


const useStore = <T,>(values: T): Store<T> => {
  const {current: store} = useRef(new Store<T>(values))
  return store
}



type Values = {}
export const StoreContextProvider = ({children}) => {
  const store = useStore<Values>({})
  return (
    <StoreContext.Provider value={{update: store.update, useLens: makeUseLens(store)}}>
      {children}
    </StoreContext.Provider>
  )
}
