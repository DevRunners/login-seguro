class Users {
  constructor() {
    this.users = [
      new User('julio', 'tulio'),
      new User('pedro', 'fredo'),
      new User('akira', 'toriyama')
    ]
  }
  get getUsers() {
    return this.users
  }

  getUserByUsername(username) {
    return this.users.find(user => user.username === username)
  }
}

class User {
  constructor(username, password) {
    this.username = username
    this.password = password
  }

  get getUsername() {
    return this.username
  }

  get getPassword() {
    return this.password
  }
}

module.exports = {
  Users,
  User
}