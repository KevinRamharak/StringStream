import { constants } from 'buffer';
import { Writable } from 'stream';
import Encoding from './Encoding';
import IBaseStringStream from './IBaseStringStream';

// default to 1kb
const defaultHighWaterMark = 1024;

export default class WritableStringStream extends Writable
    implements IBaseStringStream {
    public [Symbol.toStringTag] = 'WritableStringStream';
    private buffer: Buffer;
    private index = 0;

    get content(): string {
        return this.toString();
    }

    get length(): number {
        return this.content.length;
    }

    /**
     *
     * @param encoding default encoding when converted to a string
     * @param highWaterMark intitial internal buffer length (and internal internal buffer length)
     * @param decodeStrings should stay true for now
     */
    constructor(
        public readonly encoding: Encoding = Encoding.utf8,
        highWaterMark = defaultHighWaterMark,
        decodeStrings = true,
    ) {
        super({
            decodeStrings,
            highWaterMark,
        });
        this.buffer = Buffer.alloc(highWaterMark);
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
                chunk.length + (this.buffer.length - this.index) >
                this.buffer.length
            ) {
                let newLength = this.buffer.length * 2;
                // double the buffer size until we find a possible size or throw if we cannot allocate buffer
                while (newLength < this.index + chunk.length) {
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
            this.buffer.fill(chunk, this.index, this.index + chunk.length);
            this.index += chunk.length;
        }
        callback();
    }

    public toString(encoding = this.encoding): string {
        return this.buffer.toString(encoding, 0, this.index);
    }
}
