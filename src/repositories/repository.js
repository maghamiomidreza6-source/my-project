/**
 * In-memory repository with indexing and referential constraints.
 */
class MemoryRepository {
  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.seed();
  }

  seed() {
    const initialUsers = [
      {
        id: 'usr-201',
        username: 'omid_lead',
        fullName: 'Omid Reza Maghami',
        email: 'omid@company.internal',
        department: 'Core Infrastructure',
        role: 'lead',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-202',
        username: 'sara_qa',
        fullName: 'Sara Mohammadi',
        email: 'sara@company.internal',
        department: 'Quality Assurance',
        role: 'qa',
        createdAt: new Date().toISOString()
      }
    ];
    initialUsers.forEach(u => this.users.set(u.id, u));

    const initialTasks = [
      {
        id: 'TSK-101',
        title: 'Configure Container Orchestration',
        description: 'Set up multi-stage Dockerfile and healthcheck probes',
        type: 'FEATURE',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: 'usr-201',
        estimatedHours: 6,
        tags: ['docker', 'infrastructure'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'TSK-102',
        title: 'Formulate REST API Contract',
        description: 'Document endpoints, HTTP status codes, and architecture flows',
        type: 'DOCS',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigneeId: 'usr-201',
        estimatedHours: 4,
        tags: ['api', 'docs'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'TSK-103',
        title: 'Implement Integration Test Coverage',
        description: 'Write comprehensive tests covering positive and negative flows',
        type: 'TASK',
        status: 'TODO',
        priority: 'CRITICAL',
        assigneeId: 'usr-202',
        estimatedHours: 8,
        tags: ['testing', 'qa'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    initialTasks.forEach(t => this.tasks.set(t.id, t));
  }

  // Users
  getAllUsers() {
    return Array.from(this.users.values());
  }

  getUserById(id) {
    return this.users.get(id) || null;
  }

  getUserByUsername(username) {
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) return u;
    }
    return null;
  }

  getUserByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  insertUser(userData) {
    const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const user = {
      id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      department: userData.department,
      role: userData.role || 'engineer',
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = {
      ...user,
      fullName: updates.fullName !== undefined ? updates.fullName : user.fullName,
      department: updates.department !== undefined ? updates.department : user.department,
      role: updates.role !== undefined ? updates.role : user.role
    };
    this.users.set(id, updated);
    return updated;
  }

  removeUser(id) {
    if (!this.users.has(id)) return false;
    this.users.delete(id);
    // Disassociate assignee on tasks
    for (const task of this.tasks.values()) {
      if (task.assigneeId === id) {
        task.assigneeId = null;
        task.updatedAt = new Date().toISOString();
      }
    }
    return true;
  }

  // Tasks
  getAllTasks(query = {}) {
    let list = Array.from(this.tasks.values());
    if (query.type) list = list.filter(t => t.type === query.type);
    if (query.status) list = list.filter(t => t.status === query.status);
    if (query.priority) list = list.filter(t => t.priority === query.priority);
    if (query.assigneeId) list = list.filter(t => t.assigneeId === query.assigneeId);
    return list;
  }

  getTaskById(id) {
    return this.tasks.get(id) || null;
  }

  insertTask(taskData) {
    const id = `TSK-${Date.now()}`;
    const task = {
      id,
      title: taskData.title,
      description: taskData.description || '',
      type: taskData.type || 'TASK',
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      assigneeId: taskData.assigneeId || null,
      estimatedHours: taskData.estimatedHours || 0,
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated = {
      ...task,
      title: updates.title !== undefined ? updates.title : task.title,
      description: updates.description !== undefined ? updates.description : task.description,
      type: updates.type !== undefined ? updates.type : task.type,
      status: updates.status !== undefined ? updates.status : task.status,
      priority: updates.priority !== undefined ? updates.priority : task.priority,
      assigneeId: updates.assigneeId !== undefined ? updates.assigneeId : task.assigneeId,
      estimatedHours: updates.estimatedHours !== undefined ? updates.estimatedHours : task.estimatedHours,
      tags: updates.tags !== undefined ? updates.tags : task.tags,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  removeTask(id) {
    return this.tasks.delete(id);
  }
}

module.exports = new MemoryRepository();
