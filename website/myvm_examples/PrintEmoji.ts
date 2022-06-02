const PrintEmoji = `program:
// This program prints a smiley emoji :).
// The emoji is U+1F600, which is 4 bytes long.
// First byte is 0xF0, or 240 in decimal. We reach 240 by multiplying 60 by 4.
60
mov 0 1
mov 0 2
add
mov 3 1
mov 3 2
add
mov 3 o
// Second byte is 0x9F, or 159 in decimal.
// 120 is still in reg1, so we can add 39 to it to get to 159.
39
mov 0 2
add
mov 3 o
// Third byte is 0x98, which is 152 in decimal.
// We add 32 to reg1 to get there.
32
mov 0 2
add
mov 3 o
// Fourth byte is 0x80, which is 128 in decimal.
// We add 8 to 120 to get there.
8
mov 0 2
add
mov 3 o
`;

export default PrintEmoji;
