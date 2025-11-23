import { c as C, Op, I32 } from "@tvm/wasm";
import { Expr } from "@tvm/lab04";
import { buildOneFunctionModule, Fn } from "./emitHelper";
const { i32, get_local} = C;
    
export function getVariables(e: Expr): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  function helper(expr: Expr) {
    switch (expr.type) {
      case 'number':
        break;
      case 'variable':
        if (!seen.has(expr.name)) {
          seen.add(expr.name);
          names.push(expr.name);
        }
        break;
      case 'binary':
        helper(expr.left);
        helper(expr.right);
        break;
      case 'unary':
        helper(expr.operand);
        break;
    }
  }

  helper(e);
  return names;
}


export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {
  switch (e.type) {
    case 'number':
      return i32.const(e.value) as Op<I32>;
    case 'variable': {
      const index = args.indexOf(e.name);
      if (index === -1) {
        throw new WebAssembly.RuntimeError(`Переменная ${e.name} не найдена`);
      }
      return get_local(i32, index) as Op<I32>;
    }
    case 'binary': {
      const left = wasm(e.left, args);
      const right = wasm(e.right, args);
      switch (e.operator) {
        case '+': return C.i32.add(left, right);
        case '-': return C.i32.sub(left, right);
        case '*': return C.i32.mul(left, right);
        case '/': return C.i32.div_s(left, right);
        default: throw new Error(`Неизвестный оператор`);
      }
    }
    case 'unary': {
      const operand = wasm(e.operand, args);
      if (e.operator === '-') {
        return C.i32.sub(C.i32.const(0), operand);
      }
      throw new Error(`Неизвестный унарный оператор`);
    }
  }
}