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

export function parse(content: string): number
{
    const match = grammar.match(content);
    
    if (match.failed()) {
        throw new SyntaxError(match.message);
    }
    
    return addMulSemantics(match).calculate();
}