const calcScore = (infixExpression, valuesObj) => {
    let postfixExpression = [];
    let operators = [];
    const charArray = infixExpression.split("");
    charArray.forEach((element) => {
        if (
            element === "^" ||
            element === "*" ||
            element === "/" ||
            element === "-" ||
            element === "+" ||
            element === "(" ||
            element === ")"
        ) {
            if (operators.length === 0) {
                operators.push(element);
            } else if (element === "(") {
                operators.push(element);
            } else if (element === ")") {
                while (operators[operators.length - 1] !== "(") {
                    let val1, val2, result;
                    const temp1 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    const temp2 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    if (typeof temp1 === "string" || temp1 instanceof String)
                        val1 = valuesObj[temp1];
                    else val1 = temp1;
                    if (typeof temp2 === "string" || temp2 instanceof String)
                        val2 = valuesObj[temp2];
                    else val2 = temp2;
                    if (operators[operators.length - 1] === "+")
                        result = val2 + val1;
                    else if (operators[operators.length - 1] === "-")
                        result = val2 - val1;
                    else if (operators[operators.length - 1] === "*")
                        result = val2 * val1;
                    else if (operators[operators.length - 1] === "/")
                        result = val2 / val1;
                    else if (operators[operators.length - 1] === "^")
                        result = Math.pow(val2, val1);
                    operators.pop();
                    postfixExpression.push(result);
                }
                operators.pop();
            } else if (element === "^") {
                operators.push(element);
            } else if (element === "*" || element === "/") {
                while (
                    operators.length > 0 &&
                    !(
                        operators[operators.length - 1] === "+" ||
                        operators[operators.length - 1] === "-" ||
                        operators[operators.length - 1] === "("
                    )
                ) {
                    let val1, val2, result;
                    const temp1 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    const temp2 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    if (typeof temp1 === "string" || temp1 instanceof String)
                        val1 = valuesObj[temp1];
                    else val1 = temp1;
                    if (typeof temp2 === "string" || temp2 instanceof String)
                        val2 = valuesObj[temp2];
                    else val2 = temp2;
                    if (operators[operators.length - 1] === "*")
                        result = val2 * val1;
                    else if (operators[operators.length - 1] === "/")
                        result = val2 / val1;
                    else if (operators[operators.length - 1] === "^")
                        result = Math.pow(val2, val1);
                    operators.pop();
                    postfixExpression.push(result);
                }
                operators.push(element);
            } else if (element === "+" || element === "-") {
                while (
                    operators.length > 0 &&
                    operators[operators.length - 1] !== "("
                ) {
                    let val1, val2, result;
                    const temp1 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    const temp2 =
                        postfixExpression[postfixExpression.length - 1];
                    postfixExpression.pop();
                    if (typeof temp1 === "string" || temp1 instanceof String)
                        val1 = valuesObj[temp1];
                    else val1 = temp1;
                    if (typeof temp2 === "string" || temp2 instanceof String)
                        val2 = valuesObj[temp2];
                    else val2 = temp2;
                    if (operators[operators.length - 1] === "+")
                        result = val2 + val1;
                    else if (operators[operators.length - 1] === "-")
                        result = val2 - val1;
                    else if (operators[operators.length - 1] === "*")
                        result = val2 * val1;
                    else if (operators[operators.length - 1] === "/")
                        result = val2 / val1;
                    else if (operators[operators.length - 1] === "^")
                        result = Math.pow(val2, val1);
                    operators.pop();
                    postfixExpression.push(result);
                }
                operators.push(element);
            }
        } else {
            postfixExpression.push(element);
        }
    });
    while (operators.length > 0) {
        let val1, val2, result;
        const temp1 = postfixExpression[postfixExpression.length - 1];
        postfixExpression.pop();
        const temp2 = postfixExpression[postfixExpression.length - 1];
        postfixExpression.pop();
        if (typeof temp1 === "string" || temp1 instanceof String)
            val1 = valuesObj[temp1];
        else val1 = temp1;
        if (typeof temp2 === "string" || temp2 instanceof String)
            val2 = valuesObj[temp2];
        else val2 = temp2;
        if (operators[operators.length - 1] === "+") result = val2 + val1;
        else if (operators[operators.length - 1] === "-") result = val2 - val1;
        else if (operators[operators.length - 1] === "*") result = val2 * val1;
        else if (operators[operators.length - 1] === "/") result = val2 / val1;
        else if (operators[operators.length - 1] === "^")
            result = Math.pow(val2, val1);
        operators.pop();
        postfixExpression.push(result);
    }
    return postfixExpression[0];
};

// console.log(calcScore("a^(b^c)", { a: 5, b: 8, c: 2, d: 7, e: 2, f: 4 }));

module.exports = calcScore;
