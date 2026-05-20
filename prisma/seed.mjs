import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const groups = [
  {
    code: "A",
    teams: [
      { name: "Mexico", fifaCode: "MEX" },
      { name: "Africa do Sul", fifaCode: "RSA" },
      { name: "Coreia do Sul", fifaCode: "KOR" },
      { name: "Tchequia", fifaCode: "CZE" }
    ]
  },
  {
    code: "B",
    teams: [
      { name: "Canada", fifaCode: "CAN" },
      { name: "Suica", fifaCode: "SUI" },
      { name: "Qatar", fifaCode: "QAT" },
      { name: "Bosnia e Herzegovina", fifaCode: "BIH" }
    ]
  },
  {
    code: "C",
    teams: [
      { name: "Brasil", fifaCode: "BRA" },
      { name: "Marrocos", fifaCode: "MAR" },
      { name: "Haiti", fifaCode: "HAI" },
      { name: "Escocia", fifaCode: "SCO" }
    ]
  },
  {
    code: "D",
    teams: [
      { name: "Estados Unidos", fifaCode: "USA" },
      { name: "Paraguai", fifaCode: "PAR" },
      { name: "Australia", fifaCode: "AUS" },
      { name: "Turquia", fifaCode: "TUR" }
    ]
  },
  {
    code: "E",
    teams: [
      { name: "Alemanha", fifaCode: "GER" },
      { name: "Curacao", fifaCode: "CUW" },
      { name: "Costa do Marfim", fifaCode: "CIV" },
      { name: "Equador", fifaCode: "ECU" }
    ]
  },
  {
    code: "F",
    teams: [
      { name: "Paises Baixos", fifaCode: "NED" },
      { name: "Japao", fifaCode: "JPN" },
      { name: "Tunisia", fifaCode: "TUN" },
      { name: "Suecia", fifaCode: "SWE" }
    ]
  },
  {
    code: "G",
    teams: [
      { name: "Belgica", fifaCode: "BEL" },
      { name: "Egito", fifaCode: "EGY" },
      { name: "Ira", fifaCode: "IRN" },
      { name: "Nova Zelandia", fifaCode: "NZL" }
    ]
  },
  {
    code: "H",
    teams: [
      { name: "Espanha", fifaCode: "ESP" },
      { name: "Cabo Verde", fifaCode: "CPV" },
      { name: "Arabia Saudita", fifaCode: "KSA" },
      { name: "Uruguai", fifaCode: "URU" }
    ]
  },
  {
    code: "I",
    teams: [
      { name: "Franca", fifaCode: "FRA" },
      { name: "Senegal", fifaCode: "SEN" },
      { name: "Noruega", fifaCode: "NOR" },
      { name: "Iraque", fifaCode: "IRQ" }
    ]
  },
  {
    code: "J",
    teams: [
      { name: "Argentina", fifaCode: "ARG" },
      { name: "Argelia", fifaCode: "ALG" },
      { name: "Austria", fifaCode: "AUT" },
      { name: "Jordania", fifaCode: "JOR" }
    ]
  },
  {
    code: "K",
    teams: [
      { name: "Portugal", fifaCode: "POR" },
      { name: "Uzbequistao", fifaCode: "UZB" },
      { name: "Colombia", fifaCode: "COL" },
      { name: "RD Congo", fifaCode: "COD" }
    ]
  },
  {
    code: "L",
    teams: [
      { name: "Inglaterra", fifaCode: "ENG" },
      { name: "Croacia", fifaCode: "CRO" },
      { name: "Gana", fifaCode: "GHA" },
      { name: "Panama", fifaCode: "PAN" }
    ]
  }
];

const stages = [
  { code: "GROUP", orderIndex: 1, lockAt: new Date("2026-06-10T22:00:00.000Z") },
  { code: "R32", orderIndex: 2, lockAt: new Date("2026-06-27T22:00:00.000Z") },
  { code: "R16", orderIndex: 3, lockAt: new Date("2026-07-03T22:00:00.000Z") },
  { code: "QF", orderIndex: 4, lockAt: new Date("2026-07-08T22:00:00.000Z") },
  { code: "SF", orderIndex: 5, lockAt: new Date("2026-07-13T22:00:00.000Z") },
  { code: "FINAL", orderIndex: 6, lockAt: new Date("2026-07-18T22:00:00.000Z") }
];

const groupFixturePattern = [
  [1, 2],
  [3, 4],
  [4, 2],
  [1, 3],
  [4, 1],
  [2, 3]
];

async function seedStages() {
  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { code: stage.code },
      update: {
        orderIndex: stage.orderIndex,
        lockAt: stage.lockAt
      },
      create: stage
    });
  }
}

async function seedGroupsAndTeams() {
  for (const [groupIndex, group] of groups.entries()) {
    const savedGroup = await prisma.worldCupGroup.upsert({
      where: { code: group.code },
      update: { orderIndex: groupIndex + 1 },
      create: {
        code: group.code,
        orderIndex: groupIndex + 1
      }
    });

    for (const [teamIndex, team] of group.teams.entries()) {
      await prisma.team.upsert({
        where: { fifaCode: team.fifaCode },
        update: {
          name: team.name,
          groupId: savedGroup.id,
          groupPosition: teamIndex + 1
        },
        create: {
          ...team,
          groupId: savedGroup.id,
          groupPosition: teamIndex + 1
        }
      });
    }
  }
}

async function seedGroupMatches() {
  const groupStage = await prisma.stage.findUniqueOrThrow({ where: { code: "GROUP" } });
  const savedGroups = await prisma.worldCupGroup.findMany({
    include: { teams: true },
    orderBy: { orderIndex: "asc" }
  });

  let matchNumber = 1;
  for (const group of savedGroups) {
    const teamsByPosition = new Map(group.teams.map((team) => [team.groupPosition, team]));

    for (const [homePosition, awayPosition] of groupFixturePattern) {
      const homeTeam = teamsByPosition.get(homePosition);
      const awayTeam = teamsByPosition.get(awayPosition);

      if (!homeTeam || !awayTeam) {
        throw new Error(`Grupo ${group.code} esta incompleto.`);
      }

      await prisma.match.upsert({
        where: { matchNumber },
        update: {
          stageId: groupStage.id,
          groupId: group.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id
        },
        create: {
          matchNumber,
          stageId: groupStage.id,
          groupId: group.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id
        }
      });

      matchNumber += 1;
    }
  }
}

async function main() {
  await seedStages();
  await seedGroupsAndTeams();
  await seedGroupMatches();
  await prisma.appConfig.upsert({
    where: { singletonKey: "global" },
    update: {},
    create: { singletonKey: "global" }
  });

  console.log("Seed de fases, grupos, selecoes e jogos da fase de grupos concluido.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
