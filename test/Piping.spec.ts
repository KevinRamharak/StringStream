import { assert } from 'chai';
import { describe, it } from 'mocha';

import { Readable, Writable } from '../src';

describe('Piping', () => {
    it('should be able to pipe Readable into Writable and have identical contents', async () => {
        const read = new Readable('Hello World!');
        const write = new Writable();

        await read.pipe(write);

        assert(
            read.content === write.content,
            `'${read.content}' === '${write.content}'`,
        );
    });
});
