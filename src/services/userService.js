const repo = require('../repositories/repository');

class UserService {
  listUsers() {
    return repo.getAllUsers();
  }

  getUser(id) {
    const user = repo.getUserById(id);
    if (!user) {
      const err = new Error(`User with ID '${id}' not found`);
      err.status = 404;
      throw err;
    }
    return user;
  }

  registerUser(payload) {
    const { username, fullName, email, department, role } = payload;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      const err = new Error('Field "username" must be a string with at least 3 characters');
      err.status = 400;
      throw err;
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      const err = new Error('Field "fullName" is required');
      err.status = 400;
      throw err;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      const err = new Error('Field "email" must be a valid email format');
      err.status = 400;
      throw err;
    }

    if (repo.getUserByUsername(username)) {
      const err = new Error(`Username '${username}' is already registered`);
      err.status = 409;
      throw err;
    }

    if (repo.getUserByEmail(email)) {
      const err = new Error(`Email '${email}' is already in use`);
      err.status = 409;
      throw err;
    }

    return repo.insertUser({
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department || 'General Engineering',
      role: role || 'engineer'
    });
  }

  modifyUser(id, payload) {
    this.getUser(id); // Throws 404 if missing
    return repo.updateUser(id, payload);
  }

  deleteUser(id) {
    this.getUser(id); // Throws 404 if missing
    return repo.removeUser(id);
  }
}

module.exports = new UserService();
