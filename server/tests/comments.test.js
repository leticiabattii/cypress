const request = require('supertest');
const app = require('../index');
const models = require('../models/model');
const User = models.User;
const Task = models.Task;
const Comment = models.Comment;

// Mock das funções do Mongoose (para simular interações com o banco)
jest.mock('../models/model');

describe('Comment API', () => {
  let user, task, comment;

  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.resetAllMocks();

    // Criar objetos simulados
    user = {
      _id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    task = {
      _id: 'task123',
      title: 'Test Task',
      description: 'A task for testing',
      user: user._id,
    };

    comment = {
      _id: 'comment123',
      content: 'This is a test comment',
      task: task._id,
      user: user._id,
    };
  });

  it('should create a comment', async () => {
    // Mock para a criação de um comentário
    Comment.prototype.save = jest.fn().mockResolvedValue(comment);
    Task.findById = jest.fn().mockResolvedValue(task);
    User.findById = jest.fn().mockResolvedValue(user);

    const response = await request(app)
      .post('/comments')
      .set('Authorization', `Bearer ${user._id}`)
      .send({
        content: 'This is a test comment',
        task_id: task._id,
      });

    expect(response.status).toBe(201);
    expect(response.body.content).toBe('This is a test comment');
    expect(response.body.user._id).toBe(user._id);
    expect(response.body.task.toString()).toBe(task._id.toString());
    expect(Comment.prototype.save).toHaveBeenCalledTimes(1);
  });

  it('should list all comments for a task', async () => {
    // Mock para listar os comentários
    Comment.find = jest.fn().mockResolvedValue([comment]);

    const response = await request(app).get(`/comments/${task._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content).toBe('This is a test comment');
    expect(Comment.find).toHaveBeenCalledTimes(1);
  });

  it('should update a comment', async () => {
    // Mock para atualizar um comentário
    Comment.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...comment,
      content: 'Updated content',
    });

    const response = await request(app)
      .put(`/comments/${comment._id}`)
      .set('Authorization', `Bearer ${user._id}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(200);
    expect(response.body.content).toBe('Updated content');
    expect(Comment.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('should delete a comment', async () => {
    // Mock para deletar um comentário
    Comment.findByIdAndDelete = jest.fn().mockResolvedValue(comment);

    const response = await request(app)
      .delete(`/comments/${comment._id}`)
      .set('Authorization', `Bearer ${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe('This is a test comment');
    expect(Comment.findByIdAndDelete).toHaveBeenCalledTimes(1);

    // Verifica se o comentário foi deletado
    const deletedComment = await Comment.findById(comment._id);
    expect(deletedComment).toBeNull();
  });
});
