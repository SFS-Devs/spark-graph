import parser from '@babel/parser'
import * as babelTraverse from '@babel/traverse'
import fs from 'fs'

const traverse = babelTraverse.default

// Read your JavaScript source code
const code = fs.readFileSync(`${__dirname}/dicks.js`, 'utf-8')
console.log('code', code)

// Parse the code into an AST
const ast = parser.parse(code)

// Prepare call graph array
const callGraph: string[] = []

// Traverse the AST
traverse(ast, {
  // For each function declaration...
  FunctionDeclaration(path) {
    const functionName = path.node?.id?.name

    // For each call expression within this function...
    path.traverse({
      CallExpression(innerPath) {
        const callee = innerPath.node.callee

        if (callee.type === 'Identifier') {
          // Simple function call
          const calledFunctionName = callee.name
          callGraph.push(`${functionName} -> ${calledFunctionName}`)
        } else if (callee.type === 'MemberExpression') {
          // Method call on an object
          // @ts-ignore
          const calledFunctionName = callee.property.name
          // @ts-ignore
          const objectName = callee.object.name || callee.object.id.name
          callGraph.push(
            `${functionName} -> ${objectName}.${calledFunctionName}`
          )
        }
      }
    })
  }
})

// Print call graph
console.log(callGraph.join('\n'))
