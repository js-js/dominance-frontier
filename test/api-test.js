var common = require('./fixtures/common');

describe('Dominance Frontier', function() {
  it('should support example from Tarjan', function() {
    // NOTE: in Tarjan paper `R` is in dominance frontier of `R` and `K`
    // This algorithm treats root in a special way, so it can't be in DF of
    // anything.
    //
    // However, this does not really break any real CFG, because root usually
    // does not have predecessors
    common.test('R', function() {/*
      R -> C, B, A
      C -> F, G
      B -> E, A, D
      F -> I
      G -> I, J
      E -> H
      A -> D
      I -> K
      J -> I
      H -> K, E
      D -> L
      K -> R, I
      L -> H
    */}, function() {/*
      IDOM:
        C -> F, G
        D -> L
        G -> J
        R -> A, B, C, D, E, H, I, K
      DF:
        A -> D
        B -> A, D, E
        C -> I
        D -> H
        E -> H
        F -> I
        G -> I
        H -> E, K
        I -> K
        J -> I
        K -> I
        L -> H
    */});
  });

  it('should support example from Cytron', function() {
    common.test('Entry', function() {/*
      Entry -> 1, Exit
      1 -> 2
      2 -> 3, 7
      3 -> 4, 5
      4 -> 6
      5 -> 6
      6 -> 8
      7 -> 8
      8 -> 9
      9 -> 10
      9 -> 11
      10 -> 11
      11 -> 9, 12
      12 -> 2, Exit
    */}, function() {/*
      IDOM:
        1 -> 2
        11 -> 12
        2 -> 3, 7, 8
        3 -> 4, 5, 6
        8 -> 9
        9 -> 10, 11
        Entry -> 1, Exit
      DF:
        1 -> Exit
        10 -> 11
        11 -> 2, 9, Exit
        12 -> 2, Exit
        2 -> 2, Exit
        3 -> 8
        4 -> 6
        5 -> 6
        6 -> 8
        7 -> 8
        8 -> 2, Exit
        9 -> 2, 9, Exit
      DEPTH:
        1 : 0
        10 : 2
        11 : 2
        12 : 1
        2 : 1
        3 : 1
        4 : 1
        5 : 1
        6 : 1
        7 : 1
        8 : 1
        9 : 2
        Entry : 0
        Exit : 0
    */});
  });

  it('should support basic branch', function() {
    common.test('A', function() {/*
      A -> B, C
      B -> D
      C -> D
    */}, function() {/*
      IDOM:
        A -> B, C, D
      DF:
        B -> D
        C -> D
    */});
  });

  it('should support example# from Cooper', function() {
    common.test('6', function() {/*
      6 -> 5, 4
      5 -> 1
      4 -> 2, 3
      1 -> 2
      2 -> 1, 3
    */}, function() {/*
      IDOM:
        6 -> 1, 2, 3, 4, 5
      DF:
        1 -> 2
        2 -> 1, 3
        4 -> 2, 3
        5 -> 1
    */});
  });

  it('should not fail on disconnected blocks', function() {
    common.test('1', function() {/*
      1 -> 2
      3
    */}, function() {/*
      IDOM:
        1 -> 2
      DF:
    */});
  });

  it('should not fail on regression loop', function() {
    common.test('0', function() {/*
      1 -> 2
      2 -> 1
      0 -> 1
    */}, function() {/*
      IDOM:
        0 -> 1
        1 -> 2
      DF:
        1 -> 1
        2 -> 1
      DEPTH:
        0 : 0
        1 : 1
        2 : 1
    */});
  });
});
