import { assert } from 'chai';
import { describe, it } from 'mocha';

import { Writable } from '../src';

describe('WritableStringStream', () => {
    it('should write a chunk with `end`', () => {
        const stream = new Writable();
        stream.end('Hello World!');
        assert(
            'Hello World!' === stream.content,
            `'Hello World' === '${stream.content}'`,
        );
    });
    it('should write multiple chunks with `write`', () => {
        const stream = new Writable();
        stream.write('Hello');
        stream.write(' World!');
        assert(
            'Hello World!' === stream.content,
            `'Hello World!' === '${stream.content}'`,
        );
    });
    it('should write multiple chunks with `write` and one chunk with `end`', () => {
        const stream = new Writable();
        stream.write('Hello');
        stream.write(' World');
        stream.end('!');
        assert(
            'Hello World!' === stream.content,
            `'Hello World!' === '${stream.content}'`,
        );
    });
});
