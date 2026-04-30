import { PrismaClient, CategoryType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log('🌱 Début du seeding catégories...');

  
  const defaultCategories = [
    // INCOME
  
  { name: 'Salaire', type: CategoryType.INCOME, color: '#10B981', icon: 'Banknote' },
  { name: 'Freelance', type: CategoryType.INCOME, color: '#22C55E', icon: 'Laptop' },
  { name: 'Investissements', type: CategoryType.INCOME, color: '#16A34A', icon: 'TrendingUp' },
  { name: 'Aides / Allocations', type: CategoryType.INCOME, color: '#059669', icon: 'HandCoins' },
  { name: 'Autres revenus', type: CategoryType.INCOME, color: '#34D399', icon: 'PlusCircle' },


  // EXPENSE
 
  { name: 'Alimentation', type: CategoryType.EXPENSE, color: '#F59E0B', icon: 'ShoppingCart' },
  { name: 'Logement', type: CategoryType.EXPENSE, color: '#6366F1', icon: 'Home' },
  { name: 'Transport', type: CategoryType.EXPENSE, color: '#EF4444', icon: 'Car' },
  { name: 'Factures', type: CategoryType.EXPENSE, color: '#3B82F6', icon: 'Receipt' },
  { name: 'Restaurants', type: CategoryType.EXPENSE, color: '#FB923C', icon: 'UtensilsCrossed' },
  { name: 'Shopping', type: CategoryType.EXPENSE, color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Abonnements', type: CategoryType.EXPENSE, color: '#8B5CF6', icon: 'CreditCard' },
  { name: 'Jeux vidéo', type: CategoryType.EXPENSE, color: '#A855F7', icon: 'Gamepad2' },
  { name: 'Sport', type: CategoryType.EXPENSE, color: '#10B981', icon: 'Dumbbell' },
  { name: 'Voyages', type: CategoryType.EXPENSE, color: '#06B6D4', icon: 'Plane' },
  { name: 'Santé', type: CategoryType.EXPENSE, color: '#14B8A6', icon: 'HeartPulse' },
  { name: 'Cadeaux', type: CategoryType.EXPENSE, color: '#F43F5E', icon: 'Gift' },
  { name: 'Autres', type: CategoryType.EXPENSE, color: '#9CA3AF', icon: 'MoreHorizontal' },
]
  

      
    await prisma.category.createMany({
  data: defaultCategories,
  skipDuplicates: true,
});

  console.log('✅ Seeding terminé');
}
main()
// si c'est un echec, on affiche l'erreur et on arrête tout
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  //ferme la connexion dans tout les cas
  .finally(async () => {
    await prisma.$disconnect();
  });
