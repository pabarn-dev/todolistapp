import { TaskStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput, ReorderTasksInput } from '../validators/task.validator.js';

export async function createTask(projectId: string, creatorId: string, data: CreateTaskInput) {
  // Get max position for the status column
  const maxPosition = await prisma.task.aggregate({
    where: { projectId, status: data.status, deletedAt: null },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      projectId,
      creatorId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId,
      position: (maxPosition._max.position ?? -1) + 1,
      labels: data.labelIds
        ? { connect: data.labelIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true } },
    },
  });

  return task;
}

export async function getTasks(projectId: string, query: TaskQueryInput) {
  const where: Prisma.TaskWhereInput = {
    projectId,
    deletedAt: null,
  };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assigneeId) where.assigneeId = query.assigneeId;
  if (query.labelId) where.labels = { some: { id: query.labelId } };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true } },
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
    take: query.limit + 1,
    ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
  });

  const hasMore = tasks.length > query.limit;
  const items = hasMore ? tasks.slice(0, -1) : tasks;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  };
}

export async function getTaskById(taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    include: {
      project: { select: { id: true, name: true, slug: true, organizationId: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true } },
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return task;
}

export async function updateTask(taskId: string, data: UpdateTaskInput) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const updateData: Prisma.TaskUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assigneeId !== undefined) updateData.assignee = data.assigneeId ? { connect: { id: data.assigneeId } } : { disconnect: true };

  // Handle status change
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === TaskStatus.DONE && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (data.status !== TaskStatus.DONE && task.completedAt) {
      updateData.completedAt = null;
    }
  }

  // Handle labels
  if (data.labelIds !== undefined) {
    updateData.labels = {
      set: data.labelIds.map((id) => ({ id })),
    };
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      _count: { select: { comments: true } },
    },
  });

  return updated;
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });
}

export async function reorderTasks(data: ReorderTasksInput) {
  await prisma.$transaction(
    data.tasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: {
          position: task.position,
          ...(task.status && { status: task.status }),
        },
      })
    )
  );
}

export async function getTaskStats(projectId: string) {
  const stats = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId, deletedAt: null },
    _count: { status: true },
  });

  const total = stats.reduce((acc, s) => acc + s._count.status, 0);
  const byStatus = Object.fromEntries(stats.map((s) => [s.status, s._count.status]));

  return {
    total,
    byStatus,
    completed: byStatus[TaskStatus.DONE] ?? 0,
    inProgress: byStatus[TaskStatus.IN_PROGRESS] ?? 0,
  };
}
