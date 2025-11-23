import { Expr, createNumber, createBinary, createUnary } from "../../lab04";

// Функция упрощения выражений
function simplify(e: Expr): Expr {
    // Применяем упрощение рекурсивно до тех пор, пока не получим стабильный результат
    let current = e;
    let previous: Expr;
    
    do {
        previous = current;
        current = simplifyOnce(current);
    } while (JSON.stringify(current) !== JSON.stringify(previous));
    
    return current;
}

function simplifyOnce(e: Expr): Expr {
    switch (e.type) {
        case 'number':
        case 'variable':
            return e;
            
        case 'unary':
            const simplifiedOperand = simplifyOnce(e.operand);
            if (e.operator === '-') {
                // Упрощаем -(-x) = x
                if (simplifiedOperand.type === 'unary' && simplifiedOperand.operator === '-') {
                    return simplifiedOperand.operand;
                }
                // Упрощаем -0 = 0
                if (isZero(simplifiedOperand)) {
                    return createNumber(0);
                }
                // Упрощаем -(константа)
                if (simplifiedOperand.type === 'number') {
                    return createNumber(-simplifiedOperand.value);
                }
                // Упрощаем -(0*x) = 0, -(x*0) = 0
                if (simplifiedOperand.type === 'binary' && simplifiedOperand.operator === '*') {
                    if (isZero(simplifiedOperand.left) || isZero(simplifiedOperand.right)) {
                        return createNumber(0);
                    }
                }
                // Упрощаем -(0-x) = x
                if (simplifiedOperand.type === 'binary' && simplifiedOperand.operator === '-' && isZero(simplifiedOperand.left)) {
                    return simplifiedOperand.right;
                }
                // Упрощаем -(a/b) = (-a)/b
                if (simplifiedOperand.type === 'binary' && simplifiedOperand.operator === '/') {
                    const negatedNumerator = simplifyOnce(createUnary('-', simplifiedOperand.left));
                    return createBinary('/', negatedNumerator, simplifiedOperand.right);
                }
            }
            return createUnary(e.operator, simplifiedOperand);
            
        case 'binary':
            const left = simplifyOnce(e.left);
            const right = simplifyOnce(e.right);
            
            switch (e.operator) {
                case '+':
                    // x + 0 = x, 0 + x = x
                    if (isZero(left)) return right;
                    if (isZero(right)) return left;
                    // Складываем константы
                    if (left.type === 'number' && right.type === 'number') {
                        return createNumber(left.value + right.value);
                    }
                    return createBinary('+', left, right);
                    
                case '-':
                    // x - 0 = x
                    if (isZero(right)) return left;
                    // 0 - x = -x
                    if (isZero(left)) {
                        return createUnary('-', right);
                    }
                    // x - x = 0 (если одинаковые выражения)
                    if (JSON.stringify(left) === JSON.stringify(right)) {
                        return createNumber(0);
                    }
                    // Вычитаем константы
                    if (left.type === 'number' && right.type === 'number') {
                        return createNumber(left.value - right.value);
                    }
                    return createBinary('-', left, right);
                    
                case '*':
                    // x * 0 = 0, 0 * x = 0
                    if (isZero(left) || isZero(right)) return createNumber(0);
                    // x * 1 = x, 1 * x = x
                    if (isOne(left)) return right;
                    if (isOne(right)) return left;
                    // Перемножаем константы
                    if (left.type === 'number' && right.type === 'number') {
                        return createNumber(left.value * right.value);
                    }
                    return createBinary('*', left, right);
                    
                case '/':
                    // 0 / x = 0 (при x != 0)
                    if (isZero(left)) return createNumber(0);
                    // x / 1 = x
                    if (isOne(right)) return left;
                    // Делим константы
                    if (left.type === 'number' && right.type === 'number' && right.value !== 0) {
                        return createNumber(left.value / right.value);
                    }
                    return createBinary('/', left, right);
                    
                default:
                    throw new Error(`Unknown binary operator: ${(e as any).operator}`);
            }
            
        default:
            const exhaustiveCheck: never = e;
            throw new Error(`Unhandled expression type: ${exhaustiveCheck}`);
    }
}

export function derive(e: Expr, varName: string): Expr
{
    const result = deriveInternal(e, varName);
    const simplified = simplify(result);
    return simplified;
}

function deriveInternal(e: Expr, varName: string): Expr {
    switch (e.type) {
        case 'number':
            // Производная константы = 0
            return createNumber(0);
            
        case 'variable':
            // Производная переменной = 1 если это наша переменная, иначе 0
            return createNumber(e.name === varName ? 1 : 0);
            
        case 'unary':
            // Производная -f = -f'
            if (e.operator === '-') {
                return createUnary('-', deriveInternal(e.operand, varName));
            }
            throw new Error(`Unknown unary operator: ${(e as any).operator}`);
            
        case 'binary':
            switch (e.operator) {
                case '+':
                    // Производная (f + g) = f' + g'
                    return createBinary('+', deriveInternal(e.left, varName), deriveInternal(e.right, varName));
                    
                case '-':
                    // Производная (f - g) = f' - g'
                    return createBinary('-', deriveInternal(e.left, varName), deriveInternal(e.right, varName));
                    
                case '*':
                    // Производная (f * g) = f' * g + f * g' (правило произведения)
                    return createBinary('+',
                        createBinary('*', deriveInternal(e.left, varName), e.right),
                        createBinary('*', e.left, deriveInternal(e.right, varName))
                    );
                    
                case '/':
                    // Производная (f / g) = (f' * g - f * g') / (g * g) (правило частного)
                    return createBinary('/',
                        createBinary('-',
                            createBinary('*', deriveInternal(e.left, varName), e.right),
                            createBinary('*', e.left, deriveInternal(e.right, varName))
                        ),
                        createBinary('*', e.right, e.right)
                    );
                    
                default:
                    throw new Error(`Unknown binary operator: ${(e as any).operator}`);
            }
            
        default:
            const exhaustiveCheck: never = e;
            throw new Error(`Unhandled expression type: ${exhaustiveCheck}`);
    }
}
function isZero(e: Expr): boolean {
    return e.type === 'number' && e.value === 0;
}

function isOne(e: Expr): boolean {
    return e.type === 'number' && e.value === 1;
}
