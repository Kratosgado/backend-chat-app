import {TypeOrmModuleOptions} from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import * as config from 'config';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Message } from 'src/conversation/entities/message.entity';


const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
   type: dbConfig.type,
   host:  dbConfig.host,
   port:  dbConfig.port,
   username: dbConfig.username,
   password: dbConfig.password,
   database:  dbConfig.database,
   entities: [User, Conversation, Message],
   logging: true,
   synchronize:dbConfig.synchronize,
}

// export const typeOrmConfig: TypeOrmModuleOptions = {
//    type: dbConfig.type,
//    host: process.env.RDS_HOSTNAME || dbConfig.host,
//    port: process.env.RDS_PORT || dbConfig.port,
//    username: process.env.RDS_USERNAME || dbConfig.username,
//    password: process.env.RDS_PASSWORD || dbConfig.password,
//    database: process.env.RDS_DB_NAME || dbConfig.database,
//    entities: [ User],
//    logging: true,
//    synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
// }
