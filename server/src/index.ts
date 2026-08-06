import { app } from './app'

const port = Number(process.env.PORT ?? 3211)

app.listen(port, '0.0.0.0', () => {
  console.log(`Archive server listening on port ${port}`)
})
