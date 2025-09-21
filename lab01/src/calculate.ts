import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    // Main expression
    Exp(addExp) { 
        return addExp.calculate(); 
    },
    
    // Addition and subtraction
    AddExp_add(left, _, right) { 
        return left.calculate() + right.calculate(); 
    },
    AddExp_sub(left, _, right) { 
        return left.calculate() - right.calculate(); 
    },
    AddExp_base(mulExp) { 
        return mulExp.calculate(); 
    },
    
    // Multiplication and division
    MulExp_mul(left, _, right) { 
        return left.calculate() * right.calculate(); 
    },
    MulExp_div(left, _, right) { 
        return left.calculate() / right.calculate(); 
    },
    MulExp_base(primary) { 
        return primary.calculate(); 
    },
    
    // Primary expressions (numbers and parentheses)
    Primary_paren(_, exp, __) { 
        return exp.calculate(); // Скобки просто возвращают результат внутреннего выражения
    },
    Primary_num(number) { 
        return number.calculate(); 
    },
    
    // Numbers
    number(_) { 
        return parseInt(this.sourceString); // this.sourceString содержит исходный текст числа
    }
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict  extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}
