const PrintNumbers = `program:

reset_to_zero
j
label loop:

    mov 3 output
    mov 3 1
    add
    10
    mov 0 output
    57
    mov 0 2
    mov 3 4
    sub
    reset_to_zero
    jez
    mov 4 3
    1
    mov 0 2
    loop
    j
label reset_to_zero:
    48
    mov 0 1
    mov 0 3
    1
    mov 0 2
    loop
    j`;
export default PrintNumbers;
