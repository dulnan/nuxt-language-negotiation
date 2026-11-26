import type { H3Event } from 'h3'
import type { ServerNegotiator } from '../../types'

export function defineServerNegotiator<T extends object, E = H3Event>(
  cb: (options: T) => ServerNegotiator<E>,
): (options: T) => ServerNegotiator<E> {
  return cb
}
