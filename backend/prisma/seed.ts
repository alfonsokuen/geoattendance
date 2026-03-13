import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Creando SuperAdmin...');
  await prisma.user.upsert({
    where: { email: 'admin@geoattendance.com' },
    update: {},
    create: {
      email: 'admin@geoattendance.com',
      passwordHash,
      role: Role.SUPERADMIN,
    },
  });

  console.log('Creando Geocerca y Sucursal (Sede Central)...');
  const geofence = await prisma.geofence.create({
    data: {
      name: 'HQ Geofence (Radio de 50m)',
      latitude: -12.046374,  // Lima, Perú como ejemplo
      longitude: -77.042793,
      radiusMeters: 50,
    }
  });

  const branch = await prisma.branch.create({
    data: {
      name: 'Sede Central',
      geofenceId: geofence.id,
    }
  });

  console.log('Creando empleado de prueba...');
  await prisma.user.create({
    data: {
      email: 'empleado@geoattendance.com',
      passwordHash,
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: 'Juan',
          lastName: 'Prueba',
          documentId: '12345678',
          branchId: branch.id,
        }
      }
    }
  });

  console.log('✅ Seed ejecutado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
