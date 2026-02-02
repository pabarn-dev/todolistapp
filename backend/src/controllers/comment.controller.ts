import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as commentService from '../services/comment.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const taskId = req.params.taskId as string;
  const data = req.body as CreateCommentInput;
  const comment = await commentService.createComment(taskId, req.user.id, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: comment,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const taskId = req.params.taskId as string;
  const comments = await commentService.getComments(taskId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: comments,
  });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const commentId = req.params.commentId as string;
  const data = req.body as UpdateCommentInput;
  const comment = await commentService.updateComment(commentId, req.user.id, data);

  res.status(StatusCodes.OK).json({
    success: true,
    data: comment,
  });
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const commentId = req.params.commentId as string;
  const isManager = req.projectMember?.role === 'MANAGER';
  await commentService.deleteComment(commentId, req.user.id, isManager);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Comment deleted',
  });
}
