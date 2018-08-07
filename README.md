# StringStream

## Description

I got carried away by the idea of implementing the NodeJS stream interfaces on top of strings where writable streams have an underlying `Buffer`. The `Readable` stream has no underlying buffer because the content will never change after its initialisation inside the `constructor`.

The main excercise of this project was to learn a bit about (NodeJS) streams and setup a decent dev environment existing of:

*   `npm run ${task}` scripts to automate tasks
*   a simple typescript build system
*   a (semi) automated testing environment
*   debuggable tests (in typescript)
*   `.prettierrc`, `tslint --fix --project .` and `formatOnSave` for automatic linting and styling

## What does it do

These classes behave as you would expect from the `Stream` API. You can read, write and pipe to and/or from it in whatever way you would want to. It also provides the getters `content` and `length` and implements a `toString(encoding: string)` method to implement some easy string behaviour.

## Problems

As the underlying buffer is based on octets there might be unexpected behaviour when the content has multibyte characters. This could be avoided by using the primitive string type as underlying object. That would have the drawback of lots of copy behaviour because strings are immutable. Another way is to decode all `write` calls into buffers and copy them to the internal buffer (that grows exponentialy). Also to return `Buffer` objects from `read` calls and leaving the encoding part up to the caller.

Also not really sure if `await readable.pipe(writable)` works correctly in the test.

## Examples

### Readable

```ts
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
```

### Writable

```ts
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
```

### Piping

```ts
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
```

### Duplex

```ts
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
```
