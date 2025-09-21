import {  MatchResult } from "ohm-js";
import { addMulSemantics } from "./calculate";
import grammar from "./addmul.ohm-bundle";

export function evaluate(content: string): number
{
    return parse(content);
}

export class SyntaxError extends Error
{
}

// Main composite function as required by task
export function parse(content: string): number
{
    // 1. Parse the input string via the grammar
    const match = grammar.match(content);
    
    // 2. On parsing failure throw SyntaxException
    if (match.failed()) {
        throw new SyntaxError(match.message);
    }
    
    // 3. On success apply calculate semantic action and return result
    return addMulSemantics(match).calculate();
}