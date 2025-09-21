import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    Exp(addExp) { 
        return addExp.calculate(); 
    },
    
    AddExp_add(left, _, right) { 
        return left.calculate() + right.calculate(); 
    },
    AddExp_sub(left, _, right) { 
        return left.calculate() - right.calculate(); 
    },
    AddExp_base(mulExp) { 
        return mulExp.calculate(); 
    },
    
    MulExp_mul(left, _, right) { 
        return left.calculate() * right.calculate(); 
    },
    MulExp_div(left, _, right) { 
        return left.calculate() / right.calculate(); 
    },
    MulExp_base(primary) { 
        return primary.calculate(); 
    },
    
    Primary_paren(_, exp, __) { 
        return exp.calculate();
    },
    Primary_num(number) { 
        return number.calculate(); 
    },
    
    number(_) { 
        return parseInt(this.sourceString);
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
