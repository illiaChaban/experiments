import { map, TSyncObservable } from '../sync-observables'



const Component: FC<{
  name: string
  value: number
  big?: boolean
}> = ({
  name,
  value,
  big
}) => {
  const showOtherField$ = useState(false)

  useSub(value, (value) => {
    if (value === 'show') {
      showOtherField$.set(true)
    }
  })


  return (
    <>
      {when(big, <div>Is big</div>, <div>Is small</div>)}
      <input name={name} value={value} />
      {map(showOtherField$, show => show && <input name="hello" />)}
    </>
  )
}

const For: FC<{
  each: any[]
  children: (value: any) => JSXElement
}> = ({each}) => {
  
  return (
    <>  
      
    </>
  )
}



type JSXElement = any
type FC<TProps extends {}> = (props: {[K in keyof TProps]: TSyncObservable<TProps[K]>}) => JSXElement