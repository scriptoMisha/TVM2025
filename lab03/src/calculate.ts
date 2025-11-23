import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;


const arithCalc = {
  AddExpr(head, op, tail) {
    let result = head.calculate(this.args.params);
    for (let i = 0; i < tail.numChildren; i++) {
      const opType = op.child(i).sourceString;
      const value = tail.child(i).calculate(this.args.params);

      if (isNaN(result) || isNaN(value)) {
        return NaN;
      }
      
      result = opType === "+" ? result + value : result - value;
    }

    return result;
  },

  MulExpr(head, op, tail) {
    let result = head.calculate(this.args.params);
    for (let i = 0; i < tail.numChildren; i++) {
      const opType = op.child(i).sourceString;
      const value = tail.child(i).calculate(this.args.params);

      if (opType === "/" && value === 0) {
        throw new Error("Division by zero");
      }
      if (isNaN(result) || isNaN(value)) {
        return NaN;
      }

      result = opType === "*" ? result * value : result / value;
    }
    
    return result;
  },

  UnaryExpr_neg(_1,exp) {
    const val = exp.calculate(this.args.params);
    return isNaN(val) ? NaN : -val;
  },

  UnaryExpr(exp) {
    return exp.calculate(this.args.params);
  },

  Primary(exp) {
    return exp.calculate(this.args.params);
  },

  Primary_paren(_1, exp, _2) {
    return exp.calculate(this.args.params);
  },

  number(_1) {
    return parseInt(this.sourceString, 10);
  },

  variable(_1, _2) {
    const name = this.sourceString;
    if (!(name in this.args.params)) {
      return NaN;
    }
    return this.args.params[name];
  },
} satisfies ArithmeticActionDict<number>;


arithSemantics.addOperation<Number>("calculate(params)", arithCalc);


export interface ArithActions {
    calculate(params: {[name:string]:number}): number;
}

export interface ArithSemantics extends ArithmeticSemantics
{
    (match: MatchResult): ArithActions;
}