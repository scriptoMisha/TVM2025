import { ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export const rpnCalc = {
     Exp_num(n) {
        return parseInt(n.sourceString);
    },

    Exp_plus(a, b, _plus) {
        return a.calculate() + b.calculate();
    },

    Exp_mul(a, b, _mul) {
        return a.calculate() * b.calculate();
    },
} satisfies ReversePolishNotationActionDict<number>;
