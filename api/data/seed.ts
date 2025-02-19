import { seedEmbeddings } from "../embeddings";

async function main() {
  console.log("Starting seeding process...");
  await seedEmbeddings();
  console.log("Seeding complete!");
}

main().catch(console.error);
