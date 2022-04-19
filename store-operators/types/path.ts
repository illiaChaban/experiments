
type PathImplArr<K extends Key, V> = V extends Primitive 
? [K] 
: [K] | [K, ...PathArr<V>]

export type PathArr<T extends {}> = {
[K in keyof T]: PathImplArr<K & Key, T[K]> 
}[keyof T]


export type Path<T extends {}> = PathArr<T>


const lens: Lens = (path) => {}
type Lens = {
<
  K1 extends keyof Data,
  K2 extends keyof GetNonNullable1<Data, K1>,
  K3 extends keyof GetNonNullable2<Data, K1, K2>,
  K4 extends keyof GetNonNullable3<Data, K1, K2, K3>
>(path: [K1?, K2?, K3?, K4?] & Path<Data>): [K1, K2?, K3?, K4?]
}

lens(['a', 'd', ''])


type Nullable<T> = Exclude<T, NonNullable<T>>;
// Get Safe types
export type GetByKey1<T, K1> = K1 extends keyof T ? T[K1] : never;

export type GetByKey2<T, K1, K2> = K1 extends keyof T
? K2 extends keyof GetNonNullable1<T, K1>
  ? GetNonNullable1<T, K1>[K2] | Nullable<GetByKey1<T, K1>>
  : never
: never;

export type GetByKey3<T, K1, K2, K3> = K1 extends keyof T
? K2 extends keyof GetNonNullable1<T, K1>
  ? K3 extends keyof GetNonNullable2<T, K1, K2>
    ? GetNonNullable2<T, K1, K2>[K3] | Nullable<GetByKey2<T, K1, K2>>
    : never
  : never
: never;

export type GetByKey4<T, K1, K2, K3, K4> = K1 extends keyof T
? K2 extends keyof GetNonNullable1<T, K1>
  ? K3 extends keyof GetNonNullable2<T, K1, K2>
    ? K4 extends keyof GetNonNullable3<T, K1, K2, K3>
      ? GetNonNullable3<T, K1, K2, K3>[K4] | Nullable<GetByKey3<T, K1, K2, K3>>
      : never
    : never
  : never
: never;

export type GetNonNullable1<T, K1> = NonNullable<GetByKey1<T, K1>>;
export type GetNonNullable2<T, K1, K2> = NonNullable<GetByKey2<T, K1, K2>>;
export type GetNonNullable3<T, K1, K2, K3> = NonNullable<GetByKey3<T, K1, K2, K3>>;
export type GetNonNullable4<T, K1, K2, K3, K4> = NonNullable<GetByKey4<T, K1, K2, K3, K4>>;




type Data = {
a: {
  b?: {
    c: string
  }
  d: number
  // k: Record<string, {hi: 'x'}>
  k: { [K in 2|3]: {hi: 'x', hello: number}}
}
e: 'hello'
}
type A = Path<Data>
const a = ['b']

