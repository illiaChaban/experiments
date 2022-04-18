import { BehaviorSubject, distinctUntilChanged, map, TSyncObservable } from "../sync-observables"
import { pipe } from "../utils/pipe"

/**
 * 
 * @example
 * type Data = {
 *   users: {a: string}[],
 *   else: Record<string, {name: string}>
 * }
 * const store = new Store<Data>({users: [], else: {1: {name: 'hello'}}})
 * const x = store.get(v => v.else[1]).value()
 * store.set((val) => ({...val, else: {}}))
 */
export class Store<T extends Record<string, unknown>> {
  private value$: BehaviorSubject<T>
  constructor(value: T) {
    this.value$ = new BehaviorSubject(value)
  }

  public get<U = T>(getter: (value: T) => U = identity as any): TSyncObservable<U> {
    return pipe(this.value$, map(getter), distinctUntilChanged())
  }

  public set(valueOrUpdate: T | ((value: T) => T)): void {
    const oldValue = this.value$.value()
    
    const newValue = typeof valueOrUpdate === 'function'
      ? valueOrUpdate(oldValue)
      : valueOrUpdate

    if (oldValue === newValue) return;
    this.value$.next(newValue)
  }
}


const identity = <T>(value: T): T => value

