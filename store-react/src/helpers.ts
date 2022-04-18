import {useRef} from 'react'

type Accessor<T> = () => T
/**
 * Converts value to getter, to easily get latest.
 * (Useful for async actions)
 * @example
 * const Component = () => {
 *  const [value, setValue] = useState()
 *  const getValue = useLatest(value)
 *  return (
 *    <button 
 *      onClick={async () => {
 *        const newValue = fetchData()
 *        if (getValue() !== newValue) {
 *          setValu(newValue)
 *        }
 *      }} 
 *    >Refresh</button>
 *  )
 * }
 */
export const useLatest = <T,>(value: T): Accessor<T> => {
  const valueRef = useRef(value)
  valueRef.current = value
  const {current: getLatest} = useRef(() => valueRef.current)
  return getLatest
}

export const useConst = <T>(value: T): T => {
  const {current: first} = useRef(value)
  return first
}