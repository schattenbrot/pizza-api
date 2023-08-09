import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../../config/app.config';
import { IUser, IUserDocument, User } from '../../models/user.model';
import userService from '../../services/user.service';

const mockedUser: IUser = {
  email: 'test@example.com',
  password: 'abCD12!@',
};

const mockUser = async () => {
  const user = await userService.createUser(mockedUser);
  return user.toObject();
};

const mockUsers = async (user: IUserDocument | null = null) => {
  let users: IUserDocument[] = [];

  if (user) {
    users.push(user);
  }

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
          .set('Cookie', (await signup()).cookie)
          .expect(201);
        expect(createdUser._id).toBeUndefined();
        expect(createdUser.id).toBeDefined();
        expect(createdUser.email).toBe('test@example.com');
        expect(createdUser.password).toBeUndefined();
        expect(createdUser.avatar).toBeUndefined();
        expect(createdUser.createdAt).toBe(createdUser.updatedAt);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app)
          .post(`/api/users`)
          .send(mockedUser)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
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
            .set('Cookie', (await signup()).cookie)
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
            .set('Cookie', (await signup()).cookie)
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
            .set('Cookie', (await signup()).cookie)
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
            .set('Cookie', (await signup()).cookie)
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
            .set('Cookie', (await signup()).cookie)
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
        const { cookie } = await signup();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/users')
          .send(mockedUser)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
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
        const { user, cookie } = await signup();
        const users = await mockUsers(user);
        const { body } = await supertest(app)
          .get('/api/users')
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual(users);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app).get(`/api/users`).expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getAllUsers').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const { cookie } = await signup();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .get('/api/users')
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Get current user route
  // ----------------------------------------------------------------
  describe('get user by id route', () => {
    describe('given the user exists', () => {
      it('should return the status 200 and the user', async () => {
        const { user, cookie } = await signup();
        const { body } = await supertest(app)
          .get(`/api/users/me`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual(user);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app).get(`/api/users/me`).expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { user, cookie } = await signup();
        await userService.deleteUserById(user.id);
        const { body } = await supertest(app)
          .get(`/api/users/me`)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserById').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return the status 500 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(500);
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
        const { user, cookie } = await signup();
        const { body } = await supertest(app)
          .get(`/api/users/${user.id}`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual(user);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided id is invalid', () => {
      it('should return the status 422 and an error message', async () => {
        const { cookie } = await signup();
        const userId = 'test';
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', cookie)
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
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Update currentuser email route
  // ----------------------------------------------------------------
  describe('update current user email route', () => {
    const payload = { email: 'test@changed.com' };

    describe('given the user exists and the email is valid', () => {
      it('should return the status 200 and the user', async () => {
        const { user, cookie } = await signup();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/me/email`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(payload.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app)
          .patch(`/api/users/me/email`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { user, cookie } = await signup();
        await User.findByIdAndDelete(user.id);
        const { body } = await supertest(app)
          .patch(`/api/users/me/email`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/email`)
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be present: [body / email] (undefined)'
          );
        });
      });

      describe('if the email is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/email`)
            .send({ email: 'test' })
            .set('Cookie', cookie)
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
        const { cookie } = await signup();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/me/email`)
          .send(payload)
          .set('Cookie', cookie)
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
        const { user, cookie } = await signup();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/${user.id}/email`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(payload.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/email`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/email`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the id is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const userId = 'test';
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe('Id must be valid: [params / id] (test)');
        });
      });

      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Email must be present: [body / email] (undefined)'
          );
        });
      });

      describe('if the email is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const userId = new mongoose.Types.ObjectId().toHexString();
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/email`)
            .send({ email: 'test' })
            .set('Cookie', cookie)
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
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/email`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Update currnnt user password route
  // ----------------------------------------------------------------
  describe('update current user password route', () => {
    const payload = { password: '1234aA!@', oldPassword: 'abCD12!@' };

    describe('given the user exists and the password is valid', () => {
      it('should return the status 200 and the user', async () => {
        const { user, cookie } = await signup();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/me/password`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(user.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app)
          .patch(`/api/users/me/password`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { user, cookie } = await signup();
        await User.findOneAndDelete(user.id);
        const { body } = await supertest(app)
          .patch(`/api/users/me/password`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the old password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/password`)
            .set('Cookie', cookie)
            .send({
              password: '1aA!567890123',
            })
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Old password must be present: [body / oldPassword] ()'
          );
        });
      });

      describe('if the old password is wrong', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/password`)
            .set('Cookie', cookie)
            .send({
              password: '1aA!567890123',
              oldPassword: 'neiars',
            })
            .expect(400);
          expect(body.statusCode).toBe(400);
          expect(body.message).toBe('Invalid credentials');
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/password`)
            .set('Cookie', cookie)
            .send({
              OldPassword: '1aA!56789012345678901',
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
          const { user, cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/password`)
            .send({
              password: '1aA!56789012345678901',
              oldPassword: 'arstenarietsnars',
            })
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be at most 20 characters long: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's not strong enough", () => {
        it('should return the status 422 and an error message', async () => {
          const { user, cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/me/password`)
            .send({
              password: '1234',
            })
            .set('Cookie', cookie)
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
        jest
          .spyOn(userService, 'getUserByIdWithPassword')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });

      it('should return the status 500 and an error message', async () => {
        const { user, cookie } = await signup();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/me/password`)
          .send(payload)
          .set('Cookie', cookie)
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
        const { user, cookie } = await signup();
        const { body: updatedUser } = await supertest(app)
          .patch(`/api/users/${user.id}/password`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(200);
        expect(updatedUser._id).toBeUndefined();
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.email).toEqual(user.email);
        expect(updatedUser.password).toBeUndefined();
        expect(updatedUser.avatar).toBeUndefined();
        expect(updatedUser.createdAt).not.toBe(updatedUser.updatedAt);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/password`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the user does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .patch(`/api/users/${userId}/password`)
          .send(payload)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the id is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const { cookie } = await signup();
          const userId = 'test';
          const { body } = await supertest(app)
            .patch(`/api/users/${userId}/password`)
            .send(payload)
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe('Id must be valid: [params / id] (test)');
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { user, cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/${user.id}/password`)
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be present: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's too long", () => {
        it('should return the status 422 and an error message', async () => {
          const { user, cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/${user.id}/password`)
            .send({
              password: '1aA!56789012345678901',
            })
            .set('Cookie', cookie)
            .expect(422);
          expect(body.statusCode).toBe(422);
          expect(body.message).toBe(
            'Password must be at most 20 characters long: [body / password] ()'
          );
        });
      });

      describe("if the password is invalid because it's not strong enough", () => {
        it('should return the status 422 and an error message', async () => {
          const { user, cookie } = await signup();
          const { body } = await supertest(app)
            .patch(`/api/users/${user.id}/password`)
            .send({
              password: '1234',
            })
            .set('Cookie', cookie)
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
        const { user, cookie } = await signup();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .patch(`/api/users/${user.id}/password`)
          .send(payload)
          .set('Cookie', cookie)
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
        const { user, cookie } = await signup();
        const { body } = await supertest(app)
          .delete(`/api/users/${user.id}`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body.message).toBe('User deleted successfully');
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the provided id is invalid', () => {
      it('should return the status 422 and an error message', async () => {
        const { cookie } = await signup();
        const userId = 'test';
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Id must be valid: [params / id] (test)');
      });
    });

    describe('given the provided id does not exist', () => {
      it('should return the status 404 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('User not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'deleteUserById').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const { cookie } = await signup();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .delete(`/api/users/${userId}`)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(userServiceMock).toBeCalledWith(userId);
      });
    });
  });
});
