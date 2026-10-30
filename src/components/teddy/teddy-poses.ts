// Part transforms for each Teddy pose, captured from the rigged drawing.
export type PartState = { t?: string; o?: string };
export type TeddyPart =
  | "root"
  | "shadow"
  | "body"
  | "bf"
  | "ff"
  | "tail"
  | "bn"
  | "fn"
  | "haunch"
  | "head"
  | "earL"
  | "earR"
  | "open"
  | "happy"
  | "tongue"
  | "ledge";
export const TEDDY_POSES = {
  sniff: {
    root: {
      t: "translate(0.0 0) translate(150 0) scale(1.000 1) translate(-150 0)",
    },
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -0.6) rotate(7 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(-3)",
    },
    tail: {
      t: "rotate(-29.2 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(-1)",
    },
    haunch: {
      t: "translate(0 -0.42)",
      o: "0",
    },
    head: {
      t: "translate(16 31.1) rotate(9 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "0",
    },
    ledge: {
      o: "0",
    },
  },
  letter: {
    root: {
      t: "translate(300 0) scale(-1 1)",
    },
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  snug: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0",
    },
    body: {
      t: "translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "0",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(0)",
    },
    tail: {
      t: "rotate(-20 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(0)",
    },
    haunch: {
      t: "translate(0 0)",
      o: "0",
    },
    head: {
      t: "translate(0 9) rotate(4 212 100)",
    },
    earL: {
      t: "rotate(3 174 82)",
    },
    earR: {
      t: "rotate(-3 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "0",
    },
    ledge: {
      o: "1",
    },
  },
  reading: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  portrait: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0",
    },
    body: {
      t: "translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "0",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(0)",
    },
    tail: {
      t: "rotate(-20 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(0)",
    },
    haunch: {
      t: "translate(0 0)",
      o: "0",
    },
    head: {
      t: "translate(0 4) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(-6 174 82)",
    },
    earR: {
      t: "rotate(6 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "1",
    },
  },
  admiring: {
    root: {
      t: "translate(300 0) scale(-1 1)",
    },
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  crossroads: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  play: {
    root: {
      t: "translate(300 0) scale(-1 1)",
    },
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 2) rotate(15 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(-67)",
    },
    tail: {
      t: "rotate(-32 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(-73)",
    },
    haunch: {
      t: "translate(0 -0.9)",
      o: "0",
    },
    head: {
      t: "translate(14 30) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "0",
    },
    happy: {
      o: "1",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  peek: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0",
    },
    body: {
      t: "translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "0",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(0)",
    },
    tail: {
      t: "rotate(-20 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(0)",
    },
    haunch: {
      t: "translate(0 0)",
      o: "0",
    },
    head: {
      t: "translate(0 4) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(-6 174 82)",
    },
    earR: {
      t: "rotate(6 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "1",
    },
  },
  sit: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  bow: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 2) rotate(15 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(-67)",
    },
    tail: {
      t: "rotate(-32 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(-73)",
    },
    haunch: {
      t: "translate(0 -0.9)",
      o: "0",
    },
    head: {
      t: "translate(14 30) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "0",
    },
    happy: {
      o: "1",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  stand: {
    root: {
      t: "translate(300 0) scale(-1 1)",
    },
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0.12",
    },
    body: {
      t: "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "1",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "0",
    },
    ff: {
      t: "translate(168 192) rotate(24)",
    },
    tail: {
      t: "rotate(34 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "0",
    },
    fn: {
      t: "translate(186 194) rotate(24)",
    },
    haunch: {
      t: "translate(0 1.44)",
      o: "1",
    },
    head: {
      t: "translate(-10 -6) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(0 174 82)",
    },
    earR: {
      t: "rotate(0 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "0",
    },
  },
  tag: {
    root: {},
    shadow: {
      t: "translate(0 0) scale(1 1)",
      o: "0",
    },
    body: {
      t: "translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)",
      o: "0",
    },
    bf: {
      t: "translate(94 192) rotate(0)",
      o: "1",
    },
    ff: {
      t: "translate(168 192) rotate(0)",
    },
    tail: {
      t: "rotate(-20 84 150)",
    },
    bn: {
      t: "translate(110 194) rotate(0)",
      o: "1",
    },
    fn: {
      t: "translate(186 194) rotate(0)",
    },
    haunch: {
      t: "translate(0 0)",
      o: "0",
    },
    head: {
      t: "translate(0 4) rotate(0 212 100)",
    },
    earL: {
      t: "rotate(-6 174 82)",
    },
    earR: {
      t: "rotate(6 250 82)",
    },
    open: {
      o: "1",
    },
    happy: {
      o: "0",
    },
    tongue: {
      o: "1",
    },
    ledge: {
      o: "1",
    },
  },
} satisfies Record<string, Record<TeddyPart, PartState>>;
export type TeddyPose = keyof typeof TEDDY_POSES;
