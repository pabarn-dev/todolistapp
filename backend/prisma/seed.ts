import 'dotenv/config';
import { PrismaClient, OrganizationRole, ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('Password123', 12);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice Martin',
      emailVerified: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
      name: 'Bob Dupont',
      emailVerified: true,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      passwordHash,
      name: 'Charlie Bernard',
      emailVerified: true,
    },
  });

  console.log('✓ Users created');

  // Create organization
  const acmeOrg = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  });

  // Add members to organization
  await prisma.organizationMember.createMany({
    data: [
      { userId: alice.id, organizationId: acmeOrg.id, role: OrganizationRole.OWNER },
      { userId: bob.id, organizationId: acmeOrg.id, role: OrganizationRole.ADMIN },
      { userId: charlie.id, organizationId: acmeOrg.id, role: OrganizationRole.MEMBER },
    ],
  });

  console.log('✓ Organization created');

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { organizationId: acmeOrg.id, name: 'Bug', color: '#ef4444' } }),
    prisma.label.create({ data: { organizationId: acmeOrg.id, name: 'Feature', color: '#22c55e' } }),
    prisma.label.create({ data: { organizationId: acmeOrg.id, name: 'Enhancement', color: '#3b82f6' } }),
    prisma.label.create({ data: { organizationId: acmeOrg.id, name: 'Documentation', color: '#a855f7' } }),
    prisma.label.create({ data: { organizationId: acmeOrg.id, name: 'Urgent', color: '#f97316' } }),
  ]);

  console.log('✓ Labels created');

  // Create projects
  const webApp = await prisma.project.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Web Application',
      slug: 'web-app',
      description: 'Main web application frontend and backend',
      color: '#6366f1',
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      organizationId: acmeOrg.id,
      name: 'Mobile App',
      slug: 'mobile-app',
      description: 'iOS and Android mobile application',
      color: '#ec4899',
    },
  });

  // Add project members
  await prisma.projectMember.createMany({
    data: [
      { userId: alice.id, projectId: webApp.id, role: ProjectRole.MANAGER },
      { userId: bob.id, projectId: webApp.id, role: ProjectRole.MEMBER },
      { userId: charlie.id, projectId: webApp.id, role: ProjectRole.MEMBER },
      { userId: alice.id, projectId: mobileApp.id, role: ProjectRole.MANAGER },
      { userId: bob.id, projectId: mobileApp.id, role: ProjectRole.VIEWER },
    ],
  });

  console.log('✓ Projects created');

  // Create tasks for Web App
  const tasks = [
    {
      title: 'Setup authentication system',
      description: 'Implement JWT-based authentication with refresh tokens',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: alice.id,
      labelIds: [labels[1].id], // Feature
    },
    {
      title: 'Design database schema',
      description: 'Create Prisma schema for all entities',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: bob.id,
      labelIds: [labels[1].id],
    },
    {
      title: 'Implement RBAC middleware',
      description: 'Role-based access control for organizations and projects',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: alice.id,
      labelIds: [labels[1].id, labels[4].id], // Feature, Urgent
    },
    {
      title: 'Fix login redirect bug',
      description: 'Users are not redirected after successful login',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: charlie.id,
      labelIds: [labels[0].id], // Bug
    },
    {
      title: 'Add task comments feature',
      description: 'Allow users to comment on tasks',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: null,
      labelIds: [labels[1].id],
    },
    {
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      assigneeId: null,
      labelIds: [labels[3].id], // Documentation
    },
    {
      title: 'Improve error handling',
      description: 'Add better error messages and logging',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      assigneeId: bob.id,
      labelIds: [labels[2].id], // Enhancement
    },
    {
      title: 'Add drag and drop for tasks',
      description: 'Implement drag and drop to reorder tasks and change status',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: charlie.id,
      labelIds: [labels[1].id, labels[2].id],
    },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    await prisma.task.create({
      data: {
        projectId: webApp.id,
        creatorId: alice.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        position: i,
        completedAt: task.status === TaskStatus.DONE ? new Date() : null,
        labels: {
          connect: task.labelIds.map(id => ({ id })),
        },
      },
    });
  }

  console.log('✓ Tasks created');

  // Create some comments
  const firstTask = await prisma.task.findFirst({
    where: { projectId: webApp.id },
    orderBy: { createdAt: 'asc' },
  });

  if (firstTask) {
    await prisma.comment.createMany({
      data: [
        {
          taskId: firstTask.id,
          authorId: bob.id,
          content: 'I\'ve started working on this. Should be done by EOD.',
        },
        {
          taskId: firstTask.id,
          authorId: alice.id,
          content: 'Great! Let me know if you need any help with the token refresh logic.',
        },
      ],
    });
  }

  console.log('✓ Comments created');

  // Create a pending invitation
  await prisma.invitation.create({
    data: {
      organizationId: acmeOrg.id,
      email: 'david@example.com',
      role: OrganizationRole.MEMBER,
      senderId: alice.id,
      token: 'demo-invitation-token-12345',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log('✓ Invitation created');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Test accounts:');
  console.log('  - alice@example.com / Password123 (Owner)');
  console.log('  - bob@example.com / Password123 (Admin)');
  console.log('  - charlie@example.com / Password123 (Member)');
  console.log('\nOrganization: acme-corp');
  console.log('Projects: web-app, mobile-app\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
