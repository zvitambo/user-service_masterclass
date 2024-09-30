import {Client} from 'pg'

export const DBClient = () => {
    return new Client({
      host: "127.0.0.1",
      user: "root",
      database: "sls_masterclass_user_service",
      password: "root",
      port: 5432,
    });
    
}