import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as taskService from '../services/task.service.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput, ReorderTasksInput } from '../validators/task.validator.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const data = req.body as CreateTaskInput;
  const task = await taskService.createTask(req.projectMember!.projectId, req.user.id, data);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: task,
  });
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  const query = req.query as unknown as TaskQueryInput;
  const result = await taskService.getTasks(req.projectMember!.projectId, query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: {
      nextCursor: result.nextCursor,
    },
  });
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  const taskId = req.params.taskId as string;
  const task = await taskService.getTaskById(taskId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: task,
  });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const taskId = req.params.taskId as string;
  const data = req.body as UpdateTaskInput;
  const task = await taskService.updateTask(taskId, data);

  res.status(StatusCodes.OK).json({
    success: true,
    data: task,
  });
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const taskId = req.params.taskId as string;
  await taskService.deleteTask(taskId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Task deleted',
  });
}

export async function reorder(req: AuthenticatedRequest, res: Response) {
  const data = req.body as ReorderTasksInput;
  await taskService.reorderTasks(data);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Tasks reordered',
  });
}

export async function getStats(req: AuthenticatedRequest, res: Response) {
  const stats = await taskService.getTaskStats(req.projectMember!.projectId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: stats,
  });
}
