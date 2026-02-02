import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator.js';

export async function createComment(taskId: string, authorId: string, data: CreateCommentInput) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      authorId,
      content: data.content,
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return comment;
}

export async function getComments(taskId: string) {
  const comments = await prisma.comment.findMany({
    where: { taskId, deletedAt: null },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments;
}

export async function updateComment(commentId: string, userId: string, data: UpdateCommentInput) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
  });

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new ForbiddenError('You can only edit your own comments');
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: data.content },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return updated;
}

export async function deleteComment(commentId: string, userId: string, isManager: boolean) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
  });

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Managers can delete any comment, others only their own
  if (comment.authorId !== userId && !isManager) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
}
