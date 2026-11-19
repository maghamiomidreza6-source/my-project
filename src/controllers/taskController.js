const taskService = require('../services/taskService');

exports.getTasks = (req, res, next) => {
  try {
    const { type, status, priority, assigneeId } = req.query;
    const tasks = taskService.listTasks({ type, status, priority, assigneeId });
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = (req, res, next) => {
  try {
    const task = taskService.getTask(req.params.id);
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

exports.createTask = (req, res, next) => {
  try {
    const task = taskService.createTask(req.body);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = (req, res, next) => {
  try {
    const updated = taskService.updateTask(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTaskStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = taskService.updateStatus(req.params.id, status);
    return res.status(200).json({
      success: true,
      message: `Task status transitioned to '${status}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = (req, res, next) => {
  try {
    taskService.deleteTask(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
