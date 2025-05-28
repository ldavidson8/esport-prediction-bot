import fs from 'node:fs';
import path from 'node:path';

function generateFilePath(name: string): string {
	const currentDate = new Date();
	const isoDate = currentDate.toISOString();
	const fileName = `${isoDate}-${name}.ts`;
	return path.join(process.cwd(), 'src', 'database', 'migrations', fileName);
}

function createFile(fileName: string): void {
	fs.writeFile(fileName, '', 'utf8', (error) => {
		if (error) {
			console.error(`Error creating file: ${error}`);
		} else {
			console.log(`File created: ${fileName}`);
		}
	});
}

function writeFileContnt(
	fileName: string,
	content: string = `import { Kysely, sql } from 'kysely';\n
export async function up(db: Kysely<any>): Promise<void> {}\n
export async function down(db: Kysely<any>): Promise<void> {}`,
): void {
	fs.appendFileSync(fileName, content, { encoding: 'utf-8' });
	console.log(`File content written to: ${fileName}`);
}

const [_, __, name] = process.argv;
if (!name) {
	console.error('Please provide a name for the migration.');
	process.exit(1);
}

const filePath = generateFilePath(name);
createFile(filePath);
writeFileContnt(filePath);
