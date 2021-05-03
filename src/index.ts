import { Doulevo } from "./doulevo";

async function main(): Promise<void> {
    const doulevo = new Doulevo();
    await doulevo.invoke();
}

main()
    .catch(err => {
        console.error(`Failed:`);
        console.error(err);
        process.exit(1);
    });