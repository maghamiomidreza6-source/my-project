const repo = require('../repositories/repository');

class TaskService {
  listTasks(filters) {
    return repo.getAllTasks(filters);
  }

  getTask(id) {
    const task = repo.getTaskById(id);
    if (!task) {
      const err = new Error(`Task with ID '${id}' not found`);
      err.status = 404;
      throw err;
    }
    return task;
  }

  createTask(payload) {
    const { title, description, type, status, priority, assigneeId, estimatedHours, tags } = payload;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      const err = new Error('Field "title" is required and must not be empty');
      err.status = 400;
      throw err;
    }

    const validTypes = ['BUG', 'FEATURE', 'TASK', 'DOCS'];
    if (type && !validTypes.includes(type)) {
      const err = new Error(`Field "type" must be one of: ${validTypes.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    if (status && !validStatuses.includes(status)) {
      const err = new Error(`Field "status" must be one of: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (priority && !validPriorities.includes(priority)) {
      const err = new Error(`Field "priority" must be one of: ${validPriorities.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (assigneeId) {
      const user = repo.getUserById(assigneeId);
      if (!user) {
        const err = new Error(`Assignee user with ID '${assigneeId}' does not exist`);
        err.status = 404;
        throw err;
      }
    }

    return repo.insertTask({
      title: title.trim(),
      description,
      type: type || 'TASK',
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      assigneeId: assigneeId || null,
      estimatedHours: Number(estimatedHours) || 0,
      tags: tags || []
    });
  }

  updateTask(id, payload) {
    this.getTask(id); // Throws 404 if missing

    if (payload.assigneeId) {
      const user = repo.getUserById(payload.assigneeId);
      if (!user) {
        const err = new Error(`Assignee user with ID '${payload.assigneeId}' does not exist`);
        err.status = 404;
        throw err;
      }
    }

    return repo.updateTask(id, payload);
  }

  updateStatus(id, newStatus) {
    this.getTask(id); // Throws 404 if missing

    const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      const err = new Error(`Invalid status '${newStatus}'. Must be one of: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    return repo.updateTask(id, { status: newStatus });
  }

  deleteTask(id) {
    this.getTask(id); // Throws 404 if missing
    return repo.removeTask(id);
  }
}

module.exports = new TaskService();
