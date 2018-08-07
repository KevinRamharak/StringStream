import { constants } from 'buffer';
import { Duplex } from 'stream';
import Encoding from './Encoding';
import IBaseStringStream from './IBaseStringStream';

// default to 1kb
const defaultHighWaterMark = 1024;

/**
 * This is actually just a loopback stream.
 * // #TODO: support multibyte characters, pretty sure it screws up now.
 * // #TODO: this could be implemented by forcing `write` to accept only strings and then keeping track of the amount of characters
 * // #TODO: but there has to be some kind of mapping of characters to bytes that way?
 */
export default class DuplexStringStream extends Duplex
    implements IBaseStringStream {
    public [Symbol.toStringTag] = 'DuplexStringStream';
    private buffer: Buffer;
    private writeIndex = 0;
    private readIndex = 0;

    get content(): string {
        return this.toString();
    }

    get length(): number {
        return this.content.length;
    }

    /**
     *
     * @param content intial content
     * @param encoding default encoding
     * @param highWaterMark
     * @param decodeString
     */
    constructor(
        content: string = '',
        public readonly encoding = Encoding.utf8,
        highWaterMark = defaultHighWaterMark,
        decodeStrings = true,
    ) {
        super({
            allowHalfOpen: true,
            decodeStrings,
            encoding,
            highWaterMark,
        });
        const length =
            content.length <= highWaterMark
                ? highWaterMark
                : content.length +
                  (content.length - (content.length * 2) % highWaterMark); // #TODO: make this always a value of 2 ** n
        this.buffer = Buffer.alloc(length);
        this.buffer.write(content, 0, content.length, encoding);
        this.writeIndex = content.length;
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
        if (this.readIndex >= this.writeIndex) {
            this.push(null);
            return;
        }
        if (size > 0) {
            if (size > this.writeIndex - this.readIndex) {
                size = this.writeIndex - this.readIndex;
            }
            const view = this.buffer.slice(
                this.readIndex,
                this.readIndex + size,
            );
            this.push(view.toString(this.encoding), this.encoding);
            this.readIndex += size;
            if (this.readIndex >= this.writeIndex) {
                this.push(null);
                return;
            }
        }
    }

    public _write(
        chunk: string | Buffer,
        encoding: Encoding | string | null | undefined = this.encoding,
        callback: (error?: Error | null) => void,
    ): void {
        // this only happens if `decodeStrings` is explicitly `false`
        if (typeof chunk === 'string') {
            callback(
                new Error(
                    `_write(chunk: string, encoding: Encoding = ${encoding}) -> has not been implemented yet`,
                ),
            );
            return;
        } else {
            // if the chunk results into a buffer overflow, allocate a new buffer and copy contents over
            if (
                chunk.length + (this.buffer.length - this.writeIndex) >
                this.buffer.length
            ) {
                let newLength = this.buffer.length * 2;
                // double the buffer size until we find a possible size or throw if we cannot allocate buffer
                while (newLength < this.writeIndex + chunk.length) {
                    newLength *= 2;
                    if (newLength > constants.MAX_LENGTH) {
                        callback(
                            new RangeError(
                                `${
                                    this[Symbol.toStringTag]
                                }._write(chunk: Buffer) -> the requested buffer size of ${newLength} exceeds maximum buffer size of ${
                                    constants.MAX_LENGTH
                                }`,
                            ),
                        );
                        return;
                    }
                }
                this.buffer = Buffer.alloc(newLength, this.buffer);
            }
            this.buffer.fill(
                chunk,
                this.writeIndex,
                this.writeIndex + chunk.length,
            );
            this.writeIndex += chunk.length;
        }
        callback();
    }

    public toString(encoding = this.encoding): string {
        return this.buffer.toString(encoding, 0, this.writeIndex);
    }
}
