import { getAddress, isAddress } from '@ethersproject/address'

class Address {
  public readonly address: string

  constructor(address: Address | string | undefined) {
    let _address
    if (address instanceof Address) {
      _address = address.toString()
    } else if (typeof address === 'string') {
      _address = getAddress(address)
    }

    if (!_address || !isAddress(_address)) {
      throw new Error('Invalid address')
    }

    this.address = _address
  }

  static from(address: Address | string | undefined): Address {
    return new Address(address)
  }

  toString(): string {
    return this.address
  }

  truncate(): string {
    return this.address.slice(0, 6) + '...' + this.address.slice(38, 42)
  }

  toLowercase(): string {
    return this.address.toLowerCase()
  }

  eq(address: Address | string | undefined): boolean {
    if (address && isAddress(address?.toString())) {
      return new Address(address).toLowercase() === this.toLowercase()
    }
    return false
  }
}

export type Addressish = Address | string | undefined
export default Address
