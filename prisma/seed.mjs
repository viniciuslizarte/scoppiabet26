import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const teams = [
  { name: "Brasil", fifaCode: "BRA" },
  { name: "Argentina", fifaCode: "ARG" },
  { name: "Franca", fifaCode: "FRA" },
  { name: "Inglaterra", fifaCode: "ENG" },
  { name: "Espanha", fifaCode: "ESP" },
  { name: "Alemanha", fifaCode: "GER" },
  { name: "Portugal", fifaCode: "POR" },
  { name: "Uruguai", fifaCode: "URU" }
];

async function main() {
  await prisma.team.createMany({
    data: teams,
    skipDuplicates: true
  });
  console.log("Seed de selecoes concluido.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
