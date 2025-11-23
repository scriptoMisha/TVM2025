import { MatchResult } from "ohm-js";
import grammar from "./rpn.ohm-bundle";
import { rpnSemantics } from "./semantics";

export function evaluate(source: string): number
{ 
    return calculate(parse(source));
}
export function maxStackDepth(source: string): number
{ 
    const match = parse(source);
    const semantics = rpnSemantics(match);
    return semantics.stackDepth.max;
}

export class SyntaxError extends Error
{
}

function parse(content: string): MatchResult{
    const match = grammar.match(content, "Exp");
    if (match.failed()){
        const msg = (match as any).message ?? "Syntax error while parsing expression.";
        throw new SyntaxError(msg);
    }
    return match;
}
function calculate(expression: MatchResult): number{
    return rpnSemantics(expression).calculate();
}

