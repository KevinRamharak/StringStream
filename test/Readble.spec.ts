import { assert } from 'chai';
import { describe, it } from 'mocha';

import { Readable } from '../src';

describe('ReadableStringStream', () => {
    it('should return the stream contents', () => {
        const stream = new Readable('Hello World!');
        assert(
            'Hello World!' === stream.content,
            `'Hello World' === '${stream.content}'`,
        );
    });
    it('should return the contents with `read`', () => {
        const stream = new Readable('Hello World!');
        let content = '';
        let chunk;
        while (chunk !== null) {
            chunk = stream.read();
            content += chunk !== null ? chunk : '';
        }
        assert('Hello World!' === content, `'Hello World!' === '${content}'`);
    });
});
