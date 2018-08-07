import { assert } from 'chai';
import { describe, it } from 'mocha';

import { Duplex } from '../src';

describe('DuplexStringStream', () => {
    it('should work with initial input', () => {
        const stream = new Duplex('Hello World!');
        assert(
            stream.content === 'Hello World!',
            `'${stream.content}' === 'Hello World!'`,
        );
    });
    it('should work with initial input and additional input', () => {
        const stream = new Duplex('Hello World!');
        stream.write(' Hello World');
        stream.end('!');
        assert(
            stream.content === 'Hello World! Hello World!',
            `'${stream.content}' === 'Hello World! Hello World!'`,
        );
    });
    it('should return the contents with `read` with intial content', () => {
        const stream = new Duplex('Hello World!');
        let content = '';
        let chunk;
        while (chunk !== null) {
            chunk = stream.read();
            content += chunk !== null ? chunk : '';
        }
        assert('Hello World!' === content, `'Hello World!' === '${content}'`);
    });
    it('should return the contents with `read` with content trough `write`', () => {
        const stream = new Duplex();
        stream.write('Hello ');
        stream.write('World');
        stream.end('!');
        let content = '';
        let chunk;
        while (chunk !== null) {
            chunk = stream.read();
            content += chunk !== null ? chunk : '';
        }
        assert('Hello World!' === content, `'Hello World!' === '${content}'`);
    });
});
