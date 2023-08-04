import mongoose, { mongo } from 'mongoose';
import supertest from 'supertest';

import app from '../../config/app.config';
import { IUser, IUserDocument } from '../../models/user.model';
import userService from '../../services/user.service';

const mockedUser: IUser = {
  email: 'test@example.com',
  password: 'abCD12!@',
};

const mockUser = async () => {
  const user = await userService.createUser(mockedUser);
  return user.toObject();
};

const mockUsers = async () => {
  let users: IUserDocument[] = [];

  for (let i = 0; i < 3; i++) {
    const user = await userService.createUser({
      ...mockedUser,
      email: `test+${i}@example.com`,
    });
    users.push(user.toObject());
  }

  return users;
};

describe('users', () => {
  // ----------------------------------------------------------------
  // Create user route
  // ----------------------------------------------------------------
  describe('create user route', () => {
    describe('given the provided inputs are valid', () => {
      it('should return the status 201 and the created user', async () => {
        const { body: createdUser } = await supertest(app)
          .post('/api/users')
          .send(mockedUser)
          .expect(201);
        expect(createdUser._id).toBeUndefined();
        expect(createdUser.id).toBeDefined();
        expect(createdUser.email).toBe('test@example.com');
        expect(createdUser.password).toBeUndefined();
        expect(createdUser.avatar).toBeUndefined();
        expect(createdUser.createdAt).toBe(createdUser.updatedAt);
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/users')
            .send({
              password: mockedUser.password,
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be present: [body / email] (undefined)'
          );
        });
      });

      describe('if the email is not valid', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/users')
            .send({
              email: 'test@example',
              password: mockedUser.password,
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be valid: [body / email] (test@example)'
          );
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/users')
            .send({
              email: mockedUser.email,
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be present: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's too long", () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/users')
            .send({
              email: mockedUser.email,
              password: '1aA!56789012345678901',
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be at most 20 characters long: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's not strong enough", () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/users')
            .send({
              email: mockedUser.email,
              password: '1234',
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password is not strong enough: [body / password] ()'
          );
        });
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'createUser').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/users')
          .send(mockedUser)
          .expect(500);
        expect(body.statusCode).toBe(500);
        console.log(body.message);
        expect(userServiceMock).toBeCalledWith(mockedUser);
      });
    });
  });

  // ----------------------------------------------------------------
  // Get all users route
  // ----------------------------------------------------------------
  describe('get all users route', () => {
    describe('given at least one user exists', () => {
      it('should return the status 200 and the list of users', async () => {
        const users = await mockUsers();
        const { body } = await supertest(app).get('/api/users').expect(200);
        expect(body).toEqual(users);
      });
    });

    describe('given no user exists', () => {
      it('should return the status 404 and an error message', async () => {
        const { body } = await supertest(app).get('/api/users').expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Users not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getAllUsers').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app).get('/api/users').expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Get user by id route
  // ----------------------------------------------------------------
  describe('get user by id route', () => {
    describe('given the user exists', () => {
      it('should return the status 200 and the user', async () => {
        const user = await mockUser();
        const { body } = await supertest(app)
          .get(`/api/users/${user.id}`)
          .expect(200);
        expect(body).toEqual(user);
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided id is invalid', () => {
      it('should return the status 422 and an error message', async () => {
        const userId = 'test';
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Id must be valid: [params / id] (test)');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserById').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Update user email by id route
  // ----------------------------------------------------------------
  describe('update user email by id route', () => {
    const payload = { email: 'test@changed.com' };

    describe('given the user exists and the email is valid', () => {
      it('should return the status 200 and the user', async () => {
        const user = await mockUser();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/${user.id}/email`)
          .send(payload)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(payload.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/email`)
          .send(payload)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the id is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const userId = 'test';
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe('Id must be valid: [params / id] (test)');
        });
      });

      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be present: [body / email] (undefined)'
          );
        });
      });

      describe('if the email is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .send({ email: 'test' })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be valid: [body / email] (test)'
          );
        });
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserById').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/email`)
          .send(payload)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Update user password by id route
  // ----------------------------------------------------------------
  describe('update user password by id route', () => {
    const payload = { password: '1234aA!@' };

    describe('given the user exists and the password is valid', () => {
      it('should return the status 200 and the user', async () => {
        const user = await mockUser();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/${user.id}/password`)
          .send(payload)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(user.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/password`)
          .send(payload)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the id is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const userId = 'test';
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/password`)
            .send(payload)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe('Id must be valid: [params / id] (test)');
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/password`)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be present: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's too long", () => {
        it('should return the status 422 and an error message', async () => {
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/password`)
            .send({
              password: '1aA!56789012345678901',
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be at most 20 characters long: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's not strong enough", () => {
        it('should return the status 422 and an error message', async () => {
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/password`)
            .send({
              password: '1234',
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password is not strong enough: [body / password] ()'
          );
        });
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserById').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/password`)
          .send(payload)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Delete user route
  // ----------------------------------------------------------------
  describe('delete user route', () => {
    describe('given the provided inputs are valid', () => {
      it('should return the status 200 without success message', async () => {
        const user = await mockUser();
        const { body } = await supertest(app)
          .delete(`/api/users/${user.id}`)
          .expect(200);
        expect(body.message).toBe('User deleted successfully');
      });
    });

    describe('given the provided id is invalid', () => {
      it('should return the status 422 and an error message', async () => {
        const userId = 'test';
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Id must be valid: [params / id] (test)');
      });
    });

    describe('given the provided id does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest
          .spyOn(userService, 'deletePizzaById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });
      it('should return the status 500 and an error message', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(500);
        expect(body.statusCode).toBe(500);
        console.log(body.message);
        expect(userServiceMock).toBeCalledWith(userId);
      });
    });
  });
});
