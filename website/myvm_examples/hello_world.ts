const Hello_world = `
program:

macro output_literal(%literal): // I am a comment at the end of a macro definition
    %literal
    mov 0 out
end_macro:

macro print_positive_offset(%offset):
    print_offset(%offset, add)
end_macro:

macro print_negative_offset(%offset):
    print_offset(%offset, sub)
end_macro:

macro print_offset(%offset, %pos_or_neg):
    mov 3 1
    %offset
    mov 0 2
    %pos_or_neg
    mov 3 out
end_macro:

    // 63 is biggest literal value we can load, we still need to add 9 to get to H
    63
    mov 0 3
    
    // H
    print_positive_offset(9)
    // E
    print_negative_offset(3)
    // L
    print_positive_offset(7)
    // L
    mov 3 out
    // O
    print_positive_offset(3)
    // WHITESPACE
    32
    mov 0 out
    
    // W
    print_positive_offset(8)
    // O
    print_negative_offset(8)
    // R
    print_positive_offset(3)
    // L
    print_negative_offset(6)
    // D
    print_negative_offset(8)
    // !
    exclamation_mark = 33
    output_literal(exclamation_mark)
`;

export default Hello_world;
