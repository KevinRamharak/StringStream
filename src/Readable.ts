import { Readable } from 'stream';
import Encoding from './Encoding';
import IBaseStringStream from './IBaseStringStream';

/**
 * This class fakes having a buffer. Since it is only readable the internal content will never change.
 * The only time a buffer is used is when `toString()` is called with a different encoding
 */
export default class ReadableStringStream extends Readable
    implements IBaseStringStream {
    public [Symbol.toStringTag] = 'ReadableStringStream';
    private index = 0;

    get length(): number {
        return this.content.length;
    }

    /**
     *
     * @param content content to stream
     * @param encoding content encoding
     */
    constructor(
        public readonly content: string,
        public readonly encoding: Encoding = Encoding.utf8,
    ) {
        super({
            encoding,
            highWaterMark: content.length,
        });
    }

    /**
     * override the default `read` method to read 1 character by default
     * @param size number of characters to read
     */
    public read(size = 1): string {
        return super.read(size);
    }

    /**
     * marked as 'private' by the leading underscore
     */
    public _read(size: number = 1) {
        if (this.index >= this.content.length) {
            this.push(null);
            return;
        }
        if (size > 0) {
            const chunk = this.content.substr(this.index, size);
            this.index += size;
            this.push(chunk, this.encoding);
            if (this.index >= this.content.length) {
                this.push(null);
            }
        }
    }

    public toString(encoding = this.encoding): string {
        if (encoding === this.encoding) {
            return this.content;
        } else {
            return Buffer.from(this.content, this.encoding).toString(encoding);
        }
    }
}
