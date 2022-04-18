const useForm = ({
  defaultValues
}) => {
  const {current: state$} = useRef(new BehaviorSubject(defaultValues))



  return {
    useField: (name) => {},
    set: () => {}
  }
}


type FieldValues = Record<string, unknown>
type FieldState<T = unknown> = {
  value: T
  dirty: boolean
  touched: boolean
  validating: boolean
  error?: false | string
}
type Fields<T extends FieldValues> = {
  [K in keyof T]: FieldState<T[K]>
}
type FormState = {
  valid
  validating
  errors
  dirty
  touched


  // TODO: needed ?
  // submitting
  // submitted
}