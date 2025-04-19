import type { ServerNegotiator } from '../../types'

export function defineServerNegotiator<T extends object>(
  cb: (options: T) => ServerNegotiator,
): (options: T) => ServerNegotiator {
  return cb
}
