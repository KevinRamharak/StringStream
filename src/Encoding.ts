/**
 * see: https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
 */
enum Encoding {
    ascii = 'ascii',
    utf8 = 'utf8',
    utf16le = 'utf16le',
    ucs2 = utf16le,
    base64 = 'base64',
    latin1 = 'latin1',
    binary = latin1,
    hex = 'hex',
}

export default Encoding;
