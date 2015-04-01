AppleBasic.JS
=============

Implement &lt;http://www.calormen.com/jsbasic/reference.htm> in JavaScript (with editor)

=============
Examples

1)
0 home
10 print a + 1
15 input a
20 print a + 1

2)
0 home
1 GOTO 9
2 print "this should never appear"
3 print "a"
4 GOSUB 14
5 print "d"
6 RETURN
8 end
9 print "hi"
10 GOSUB 3
11 print "end"
12 end
14 print "b"
15 POP
16 print "c"
17 RETURN

3)
0 home
1 FOR i = 0 to 5
2 for j = 1 to 2
3 print i " - " j
4 next

4)
0 home
1 def fn a(b) = ABS(b + 1)
2 for i = 0 to 3
3 input c
4 print fn a(c)
5 next

5)
0 home
1 input "write 1"; a
2 if a <> 1 goto 5
3 print "thanks"
4 end
5 print "you didn't wrote 1"

======
NOT IMPLEMENTED

'HTAB'
'VTAB'
'COLOR='
'HCOLOR='
'SPEED='
'CALL'
'PR#'
'INVERSE'
'FLASH'
'NORMAL'
'TEXT'
'GR'
'HGR'
'HGR2'
"PDL"
"POS"
"SCRN"
"HSCRN"
"FRE"
'RESTORE'
"PEEK"
'Poke'
'Read'
'Data'
'HPlot'
'VLin'
'HLin'
'Plot'
'Get'
'Dim'
"USR"
'ROT='
'SCALE='
'Draw'
'XDRaw'
'CONT'
'DEL'
'List'
'NEW'
'Run'
'HIMEM:'
'IN#'
'LOMEM:'
'Wait'
'LOAD'
'RECALL'
'SAVE'
'STORE'
'SHLOAD'
