/** Expression parser/evaluator for the Basic Calculator page. Uses × ÷ internally replaced. */

const D = 15;

export function roundDisplay(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e16 || (abs < 1e-15 && abs > 0)) return n.toPrecision(D);
  const s = n.toFixed(D).replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("!");
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

type Tok =
  | { k: "num"; v: number }
  | { k: "op"; v: string }
  | { k: "lp" | "rp" }
  | { k: "id"; v: string }
  | { k: "!" };

function tokenize(raw: string): Tok[] {
  const s = raw
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "(") {
      out.push({ k: "lp" });
      i++;
      continue;
    }
    if (c === ")") {
      out.push({ k: "rp" });
      i++;
      continue;
    }
    if (c === "!") {
      out.push({ k: "!" });
      i++;
      continue;
    }
    if ("+-*/%^".includes(c)) {
      out.push({ k: "op", v: c });
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      while (j < s.length && ((s[j] >= "0" && s[j] <= "9") || s[j] === ".")) j++;
      const num = parseFloat(s.slice(i, j));
      if (Number.isNaN(num)) throw new Error("num");
      out.push({ k: "num", v: num });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      out.push({ k: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    throw new Error("tok");
  }
  return out;
}

class Parser {
  private t: Tok[];
  private i = 0;

  constructor(tokens: Tok[]) {
    this.t = tokens;
  }

  private peek(): Tok | undefined {
    return this.t[this.i];
  }

  private eat(): Tok {
    return this.t[this.i++]!;
  }

  parseExpr(): number {
    return this.parseAdd();
  }

  parseAll(): number {
    const v = this.parseExpr();
    if (this.i !== this.t.length) throw new Error("extra");
    return v;
  }

  private parseAdd(): number {
    let l = this.parseMul();
    for (;;) {
      const p = this.peek();
      if (p?.k !== "op") break;
      const op = (p as { v: string }).v;
      if (op !== "+" && op !== "-") break;
      this.eat();
      const r = this.parseMul();
      l = op === "+" ? l + r : l - r;
    }
    return l;
  }

  private parseMul(): number {
    let l = this.parsePow();
    for (;;) {
      const p = this.peek();
      if (p?.k !== "op") break;
      const op = (p as { v: string }).v;
      if (op !== "*" && op !== "/" && op !== "%") break;
      this.eat();
      const r = this.parsePow();
      if (op === "*") l *= r;
      else if (op === "/") l = r === 0 ? NaN : l / r;
      else l = ((l % r) + r) % r;
    }
    return l;
  }

  private parsePow(): number {
    let l = this.parseUnary();
    if (this.peek()?.k === "op" && (this.peek() as any).v === "^") {
      this.eat();
      const r = this.parsePow();
      l = Math.pow(l, r);
    }
    return l;
  }

  private parseUnary(): number {
    const p = this.peek();
    if (p?.k === "op" && (p as any).v === "+") {
      this.eat();
      return this.parseUnary();
    }
    if (p?.k === "op" && (p as any).v === "-") {
      this.eat();
      return -this.parseUnary();
    }
    return this.parsePostfix();
  }

  private parsePostfix(): number {
    let v = this.parsePrimary();
    while (this.peek()?.k === "!") {
      this.eat();
      v = factorial(v);
    }
    return v;
  }

  private parsePrimary(): number {
    const p = this.peek();
    if (!p) throw new Error("exp");

    if (p.k === "num") {
      this.eat();
      return p.v;
    }

    if (p.k === "lp") {
      this.eat();
      const inner = this.parseExpr();
      const q = this.eat();
      if (q.k !== "rp") throw new Error(")");
      return inner;
    }

    if (p.k === "id") {
      const name = p.v;
      this.eat();
      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;
      if (this.peek()?.k !== "lp") throw new Error("fn");
      this.eat();
      const arg = this.parseExpr();
      if (this.eat().k !== "rp") throw new Error(")");
      switch (name) {
        case "sqrt":
          return arg < 0 ? NaN : Math.sqrt(arg);
        case "sin":
          return Math.sin((arg * Math.PI) / 180);
        case "cos":
          return Math.cos((arg * Math.PI) / 180);
        case "tan":
          return Math.tan((arg * Math.PI) / 180);
        case "log":
          return Math.log10(arg);
        case "ln":
          return Math.log(arg);
        case "pct":
          return arg / 100;
        default:
          throw new Error("fn");
      }
    }

    throw new Error("prim");
  }
}

export function evaluateExpression(input: string): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, message: "Empty" };
  try {
    const tokens = tokenize(trimmed);
    const p = new Parser(tokens);
    const v = p.parseAll();
    return { ok: true, value: v };
  } catch {
    return { ok: false, message: "Invalid expression" };
  }
}
