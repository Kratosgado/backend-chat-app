import { Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/resources/utils/auth.utils';

const prisma = new PrismaClient();

const userData: SignUpDto[] = [
    {
        email: "gado@gmail.com",
        username: "Gado",
        password: "28935617Aa@",
    },
    {
        email: "mbeah@gmail.com",
        username: "Mbeah",
        password: "28935617Aa@",
    },
    {
        email: "john@gmail.com",
        username: "John",
        password: "28935617Aa@",
    },
    {
        email: "jane@gmail.com",
        username: "Jane",
        password: "28935617Aa@",
    }

]

async function main() {
    const logger = new Logger("Seeding");
    logger.log("Start seeding...");
    for (const u of userData) {
        try {
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(u.password, salt);
            const user = await prisma.user.create({
                data: {
                    email: u.email,
                    username: u.username,
                    password,
                    salt
                }
            });
        } catch (error) {
            logger.error(error.message);
        }
    }
    logger.log("Seeding completed");

}

main().then(async () => {
    await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1);
})