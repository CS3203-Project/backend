import { PrismaClient } from '@prisma/client';

async function checkSchedules() {
  const prisma = new PrismaClient();

  try {
    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Find services with confirmed schedules
    const servicesWithSchedules = await prisma.service.findMany({
      include: {
        schedules: {
          where: {
            customerConfirmation: true,
            providerConfirmation: true
          }
        }
      }
    });

    console.log('Services with confirmed schedules:');
    servicesWithSchedules.forEach(service => {
      if (service.schedules.length > 0) {
        console.log(`Service ID: ${service.id}, Title: ${service.title}, Confirmed schedules: ${service.schedules.length}`);
      }
    });

    // Test API with first service that has confirmed schedules
    const testService = servicesWithSchedules.find(s => s.schedules.length > 0);
    if (testService) {
      console.log(`\nTesting API with service ID: ${testService.id}`);

      // Simulate the API call logic
      let schedules = await prisma.schedule.findMany({
        where: {
          serviceId: testService.id,
          customerConfirmation: true,
          providerConfirmation: true,
          startTime: { gte: now.toISOString() }
        },
        select: {
          startTime: true,
          endTime: true,
        },
        orderBy: {
          startTime: 'asc',
        },
        take: 5,
      });

      if (schedules.length === 0) {
        schedules = await prisma.schedule.findMany({
          where: {
            serviceId: testService.id,
            customerConfirmation: true,
            providerConfirmation: true,
            startTime: { lt: now.toISOString() }
          },
          select: {
            startTime: true,
            endTime: true,
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 3,
        });
      }

      console.log(`API would return ${schedules.length} schedules for service ${testService.id}`);
      schedules.forEach(s => {
        console.log(`  Start: ${s.startTime}, End: ${s.endTime}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchedules();