import { pipe } from "../utils/pipe"

export type TObservable<T> = {
  subscribe: (callback: (value: T) => unknown) => Unsubscribe
}

export type TSyncObservable<T> = {
  value: () => T
} & TObservable<T>

type Unsubscribe = () => void
type Callback<T> = (value: T) => unknown

export class BehaviorSubject<T> implements TSyncObservable<T> {
  private subscribers: Callback<T>[]
  constructor(private val: T) {}

  public next(value: T): void {
    this.val = value
    this.subscribers.forEach(cb => cb(value))
  }

  public subscribe(cb: Callback<T>): Unsubscribe {
    this.subscribers.push(cb)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== cb)
    }
  }

  public value(): T {
    return this.val
  }
}


// Operators 
// TODO: make it work for both functional way (callback) => (obj) and OOP way (obj, callback) 
type TMap = {
  <T, U>(mapper: (value: T) => U): (obs$: TSyncObservable<T>) => TSyncObservable<U>
  <T, U>(mapper: (value: T) => U): (obs$: TObservable<T>) => TObservable<U>

  <T, U>(obs$: TSyncObservable<T>, mapper: (value: T) => U): TSyncObservable<U>
  <T, U>(obs$: TObservable<T>, mapper: (value: T) => U): TObservable<U>
}
export const map = ((...args) => {
  if (args.length === 2) {
    const [obs$, mapper] = args
    return mapBase(mapper)(obs$)
  }
  const mapper = args[0]
  return mapBase(mapper)
}) as TMap


const mapBase = (mapper) => (obs$) => {
  return {
    subscribe: (callback) => {
      const unsub = obs$.subscribe(value => {
        const mapped = mapper(value)
        callback(mapped)
      })
      return unsub
    },
    ...(isSync(obs$) && {
      value: () => mapper(obs$.value())
    })
  }
}

const isFunction = (value: unknown): value is Function => typeof value === 'function'

type TFilter = {
  <T>(condition: (value: T) => unknown): (obs$: TObservable<T>) => TObservable<T>
}
export const filter: TFilter = (condition) => (obs$) => {
  return {
    subscribe: (callback) => {
      const unsub = obs$.subscribe(value => {
        const shouldPropagate = condition(value)
        if (shouldPropagate) {
          callback(value)
        }
      })
      return unsub 
    }
  }
}

type TDistinctUntilChanged = {
  <T>(comparer?: (prev: T, curr: T) => boolean): (obs$: TSyncObservable<T>) => TSyncObservable<T>
  <T>(comparer?: (prev: T, curr: T) => boolean): (obs$: TObservable<T>) => TObservable<T>
}
export const distinctUntilChanged: TDistinctUntilChanged = <T>(comparer = (a, b) => a === b) => (obs$: TSyncObservable<T> | TObservable<T>) => {
  let numberOfSubscribers = 0

  let currentValue
  let changed = false
  const calculateNewValue = scope(() => {
    let assignedFirstValue = false

    return (value: T) => {
      if (!assignedFirstValue) {
        currentValue = value
        changed = true
        assignedFirstValue = true
        return
      }

      changed = comparer(currentValue, value)
      if (changed) {
        currentValue = value
      }
    }
  })
  return {
    subscribe: (callback) => {
      const unsub = obs$.subscribe(value => {
        const currentSubscriberIndex = ++numberOfSubscribers
        if (currentSubscriberIndex === 1) {
          // calculate changed only once to avoid heavy comparisons running multiple times
          calculateNewValue(value)
        }

        if (changed) callback(currentValue);
      })
      return () => {
        numberOfSubscribers--
        unsub()
      } 
    },
    ...(isSync(obs$) && {
      value: () => {
        // new value was already calculated
        if (numberOfSubscribers) return currentValue;
        calculateNewValue(obs$.value())
        return currentValue
      }
    })
  }
}


type TDefaultValue = {
  <T>(value: T): (obs$: TObservable<T>) => TSyncObservable<T>
}
const defaultValue: TDefaultValue = <T>(defaultValue) => (obs$) => {
  const getSync = <T>(obs$: TObservable<T>): {received: false, value: undefined} | {received: true, value: T} => {
    let value
    let received = false
    const unsub = obs$.subscribe(val => {
      value = val
      received = true
      unsub()
    })
    if (!received) unsub();
  
    return {value, received}
  }
  
  const subscribe = (callback) => {
    let receivedInitialValue = false
    const unsub = obs$.subscribe(value => {
      callback(value ?? defaultValue)
      receivedInitialValue = true
    })
    if (!receivedInitialValue) callback(defaultValue)
    return unsub
  }
  return {
    subscribe,
    value: () => getSync({subscribe}).value as T
  }
}

type TMemo = {
  <T>(): (obs: TSyncObservable<T>) => TSyncObservable<T>
  <T>(): (obs: TObservable<T>) => TObservable<T>
}
export const memo: TMemo = () => (obs$) => {
  const self = {
    subscribers: [],
    unsubscribe: undefined,
  } 
  let lastValue
  return {
    subscribe: (callback) => {
      self.subscribers.push(callback)
      if (self.subscribers.length === 1) {
        self.unsubscribe = obs$.subscribe(value => {
          self.subscribers.forEach(cb => cb(value))
          lastValue = value
        })
      }

      return () => {
        self.subscribers = self.subscribers.filter(cb => cb !== callback)
        if (!self.subscribers.length) self.unsubscribe();
      }
    },
    ...(isSync(obs$) && {
      // This is hacky, because no memo actually happening for when there's no subscription 
      // Is there a way to make it work for component context with onCleanup and eager: true?
      value: () => self.subscribers.length ? lastValue : obs$.value()
    })
  }
}

export const skip = <T>(times: number) => (obs$: TObservable<T>): TObservable<T> => {
  return {
    subscribe: (callback) => obs$.subscribe(value => {
      if (times !== 0) return times--;
      callback(value)
    })
  }
}

// UTILS
const isSync = <T>(obs$: TObservable<T>): obs$ is TSyncObservable<T> => {
  return 'value' in obs$
}



const scope = <T>(callback: () => T): T => callback()