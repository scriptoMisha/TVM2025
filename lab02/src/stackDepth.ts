import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnStackDepth = {
    Exp_num(n) {
        return { max: 1, out: 1 };
    },

    Exp_plus(left, right, _plus) {
        const leftDepth = left.stackDepth;
        const rightDepth = right.stackDepth;
        
        const maxDepth = Math.max(
            leftDepth.max,
            leftDepth.out + rightDepth.max
        );
        

        return { max: maxDepth, out: 1 };
    },

    Exp_mul(left, right, _times) {
        const leftDepth = left.stackDepth;
        const rightDepth = right.stackDepth;
        
        const maxDepth = Math.max(
            leftDepth.max,
            leftDepth.out + rightDepth.max
        );
        
        return { max: maxDepth, out: 1 };
    }
} satisfies ReversePolishNotationActionDict<StackDepth>;

export type StackDepth = {max: number, out: number};
