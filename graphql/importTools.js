const neo4j = require('neo4j-driver')

const TOOLS = require('./TOOLS')
const flattenedToolParameters = R.compose(R.flatten, R.pluck('parameters'), R.prop('SEURAT'))(TOOLS)

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

try {
  for (const tool in Obj.keys(TOOLS)) {
    const createTool = await session.run(
      'CREATE (a:Tool {name: $name}) RETURN a',
      {name: tool}
    )

    for (const toolStep in TOOLS[tool]) {
      const {step: name, label} = toolStep
      const createStepResult = await session.run(
        'CREATE (a:ToolStep {label: $label, name: $name}) RETURN a',
        {name, label}
      )
      const singleRecord = createStepResult.records[0]
      const node = singleRecord.get(0)

      
      
      for (const toolParams in toolStep.parameters) {
        const {name, label, prompt, disabled} = toolParams
        const createStep = await session.run(
          `
            CREATE (a:ToolParameter {label: $label, name: $name, prompt: $prompt, disabled: $disabled})
            MATCH
              (b:ToolStep),
              (a:ToolParameter)
            WHERE b.name = $stepName AND b.name = $paramName
            CREATE (a)-[r:RELTYPE]->(b)
            RETURN type(r)
          `,
          {stepName: node.name, paramName: name, label, name, prompt, disabled}
        )
      }
    }
  }
} finally {
  await session.close()
}

// on application exit:
await driver.close()
