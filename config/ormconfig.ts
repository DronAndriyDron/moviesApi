import { DataSource } from "typeorm"

const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user",
    password: "pass",
    database: "db",
    entities: ["./Entities/**/*.ts"],
    logging: true,
    synchronize: true,
})

export  default  myDataSource;

