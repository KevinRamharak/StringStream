import Encoding from './Encoding';

export default interface IBaseStringStream {
    content: string;
    encoding: Encoding;
    [Symbol.toStringTag]: string;
    toString(): string;
}
