import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "./openapi.json",
  output: "./app/client",
  // exportSchemas: true,
  plugins: [
    ...defaultPlugins,
    "@hey-api/client-axios",
    "@tanstack/react-query",
    {
      name: "zod",
      requests: true,
    },
    {
      name: "@hey-api/sdk",
      // NOTE: this doesn't allow tree-shaking
      asClass: true,
      operationId: true,
      // validator: "zod",
      methodNameBuilder: (operation) => {
        // @ts-ignore
        let name: string = operation.id
        // @ts-ignore
        const service: string = operation.tags[0]

        if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
          name = name.slice(service.length)
        }

        name = name.charAt(0).toLowerCase() + name.slice(1)

        return name
      },
    },
  ],
})
