// On importe CategoryType généré automatiquement par Prisma
import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Utilisation de l'Enum CategoryType au lieu d'un texte simple
  const defaultCategories = [
    { name: 'Salaire', type: CategoryType.income, color: '#10B981', icon: 'Banknote' },
    { name: 'Alimentation', type: CategoryType.expense, color: '#F59E0B', icon: 'ShoppingCart' },
    { name: 'Logement', type: CategoryType.expense, color: '#6366F1', icon: 'Home' }
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name_id_user: { name: cat.name, id_user: 0 } },
      update: {},
      create: {
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        isdefault: true,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });