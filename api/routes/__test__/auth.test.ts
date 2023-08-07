import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../../config/app.config';
import { IUser, IUserDocument, User } from '../../models/user.model';
import userService from '../../services/user.service';
import * as tokenHelper from '../../utils/resetTokenExpiration';
import { randomBytes } from 'crypto';

const mockedUser: IUser = {
  email: 'test@example.com',
  password: 'abCD12!@',
};

const mockUser = async () => {
  const user = await userService.createUser(mockedUser);
  return user.toObject();
};

describe('auth', () => {
  // ----------------------------------------------------------------
  // Sign Up route
  // ----------------------------------------------------------------
  describe('sign up route', () => {
    describe('given the provided inputs are valid', () => {
      it('should return the status 201 and the created user with a cookie', async () => {
        const response = await supertest(app)
          .post('/api/auth/sign-up')
          .send(mockedUser)
          .expect(201);
        const { body: createdUser } = response;
        expect(createdUser._id).toBeUndefined();
        expect(createdUser.id).toBeDefined();
        expect(createdUser.email).toBe('test@example.com');
        expect(createdUser.password).toBeUndefined();
        expect(createdUser.avatar).toBeUndefined();
        expect(createdUser.createdAt).toBe(createdUser.updatedAt);
        expect(response.get('Set-Cookie')).toBeDefined();
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/sign-up')
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
            .post('/api/auth/sign-up')
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

      describe('if the email is already in use', () => {
        it('should return the status 400 and an error message', async () => {
          await mockUser();
          const { body } = await supertest(app)
            .post('/api/auth/sign-up')
            .send(mockedUser)
            .expect(400);
          expect(body.statusCode).toBe(400);
          expect(body.message).toBe('Email is already in use');
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/sign-up')
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
            .post('/api/auth/sign-up')
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
            .post('/api/auth/sign-up')
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
        jest.spyOn(userService, 'getUserByEmail').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/auth/sign-up')
          .send(mockedUser)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalledWith(mockedUser.email);
      });
    });
  });

  // ----------------------------------------------------------------
  // Sign In route
  // ----------------------------------------------------------------
  describe('sign in route', () => {
    describe('given the provided inputs are valid', () => {
      it('should return the status 200 and the created user with a cookie', async () => {
        const user = await mockUser();
        const response = await supertest(app)
          .post('/api/auth/sign-in')
          .send(mockedUser)
          .expect(200);
        const { body: signedInUser } = response;
        expect(signedInUser._id).toBeUndefined();
        expect(signedInUser.id).toBeDefined();
        expect(signedInUser.email).toBe(user.email);
        expect(signedInUser.password).toBeUndefined();
        expect(signedInUser.avatar).toBeUndefined();
        expect(signedInUser.createdAt).toBe(signedInUser.updatedAt);
        expect(response.get('Set-Cookie')).toBeDefined();
      });
    });

    describe('given the provided inputs are invalid', () => {
      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/sign-in')
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
            .post('/api/auth/sign-in')
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
            .post('/api/auth/sign-in')
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

      describe('if no user with the provided email exists', () => {
        it('should return the status 400 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/sign-in')
            .send(mockedUser)
            .expect(400);
          expect(body.statusCode).toBe(400);
          expect(body.message).toBe('Invalid credentials');
        });
      });

      describe('if the password is invalid', () => {
        it('should return the status 400 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/sign-in')
            .send({
              email: mockedUser.email,
              password: '1234',
            })
            .expect(400);
          expect(body.statusCode).toBe(400);
          expect(body.message).toBe('Invalid credentials');
        });
      });

      describe("if the password doesn't match", () => {
        it('should return the status 400 and an error message', async () => {
          await mockUser();
          const { body } = await supertest(app)
            .post('/api/auth/sign-in')
            .send({
              email: mockedUser.email,
              password: `${mockedUser.password}wrong`,
            })
            .expect(400);
          expect(body.statusCode).toBe(400);
          expect(body.message).toBe('Invalid credentials');
        });
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserByEmail').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/auth/sign-in')
          .send(mockedUser)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalledWith(mockedUser.email);
      });
    });
  });

  // ----------------------------------------------------------------
  // Sign Out route
  // ----------------------------------------------------------------
  describe('sign out route', () => {
    describe('given the sign out was successful', () => {
      it('should return the status 200 an empty object and delete the cookie', async () => {
        const response = await supertest(app)
          .get('/api/auth/sign-out')
          .expect(200);
        expect(response.get('Set-Cookie')[0]).toBe(
          'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
        );
      });
    });
  });

  // ----------------------------------------------------------------
  // Reset Password route
  // ----------------------------------------------------------------
  describe('reset password route', () => {
    describe('given the reset password was successful', () => {
      it('should return the status 200 an empty object', async () => {
        await mockUser();
        await supertest(app)
          .post('/api/auth/password-reset')
          .send({ email: mockedUser.email })
          .expect(200);
      });
    });

    describe('given the provided input is invalid', () => {
      describe('if the email is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/password-reset')
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            'Email must be present: [body / email] (undefined)'
          );
        });
      });

      describe('if the email is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const { body } = await supertest(app)
            .post('/api/auth/password-reset')
            .send({ email: 'test@example' })
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            'Email must be valid: [body / email] (test@example)'
          );
        });
      });
    });

    describe('given the user of the provided email does not exist', () => {
      it('should return the status 400 and an error message', async () => {
        const { body } = await supertest(app)
          .post('/api/auth/password-reset')
          .send({ email: mockedUser.email })
          .expect(400);
        expect(body.statusCode).toEqual(400);
        expect(body.message).toEqual('Invalid credentials');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserByEmail').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/auth/password-reset')
          .send(mockedUser)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalledWith(mockedUser.email);
      });
    });
  });

  // ----------------------------------------------------------------
  // Reset Password By Token route
  // ----------------------------------------------------------------
  describe('reset password by token route', () => {
    const payload = { password: mockedUser.password };

    describe('given the reset password was successful', () => {
      it('should return the status 200 an empty object', async () => {
        const mockedToken = randomBytes(12).toString('hex');
        const createdUser = await userService.createUser(mockedUser);
        const user = await userService.getUserById(createdUser.id);
        user!.resetToken = mockedToken;
        user!.resetTokenExpires = Date.now();
        User.findByIdAndUpdate(user?.id, {
          resetToken: mockedToken,
          resetTokenExpires: Date.now() + 3600000,
        });
        user!.save();
        const userServiceMock = jest
          .spyOn(userService, 'getUserByResetToken')
          .mockResolvedValueOnce(await userService.getUserById(user!.id));
        const tokenExpiredMock = jest
          .spyOn(tokenHelper, 'default')
          // .mockImplementationOnce(() => true);
          .mockReturnValueOnce(false);
        const { body } = await supertest(app)
          .post(`/api/auth/password-reset/${mockedToken}`)
          .send(payload)
          .expect(200);
        expect(body).toEqual({});
        // expect(userServiceMock).toBeCalledWith(mockedToken);
      });
    });

    describe('given the provided input is invalid', () => {
      describe('if the token is invalid', () => {
        it('should return the status 422 and an error message', async () => {
          const invalidToken = randomBytes(8).toString('hex');
          const { body } = await supertest(app)
            .post(`/api/auth/password-reset/${invalidToken}`)
            .send(payload)
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            `Token must be valid: [params / token] (${invalidToken})`
          );
        });
      });

      describe('if the password is missing', () => {
        it('should return the status 422 and an error message', async () => {
          const mockedToken = randomBytes(12).toString('hex');
          const { body } = await supertest(app)
            .post(`/api/auth/password-reset/${mockedToken}`)
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            'Password must be present: [body / password] ()'
          );
        });
      });

      describe('if the password is not strong enough', () => {
        it('should return the status 422 and an error message', async () => {
          const mockedToken = randomBytes(12).toString('hex');
          const { body } = await supertest(app)
            .post(`/api/auth/password-reset/${mockedToken}`)
            .send({ password: '12345678' })
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            'Password is not strong enough: [body / password] ()'
          );
        });
      });

      describe('if the password is too long', () => {
        it('should return the status 422 and an error message', async () => {
          const mockedToken = randomBytes(12).toString('hex');
          const { body } = await supertest(app)
            .post(`/api/auth/password-reset/${mockedToken}`)
            .send({ password: 'aA!@5678901234567890123' })
            .expect(422);
          expect(body.statusCode).toEqual(422);
          expect(body.message).toEqual(
            'Password must be at most 20 characters long: [body / password] ()'
          );
        });
      });
    });

    describe('given no user exists for the token', () => {
      const mockUserService = () =>
        jest
          .spyOn(userService, 'getUserByResetToken')
          .mockResolvedValueOnce(null);

      it('should return the status 403 and an error message', async () => {
        const mockedToken = randomBytes(12).toString('hex');
        const userServiceMock = mockUserService();

        const { body } = await supertest(app)
          .post(`/api/auth/password-reset/${mockedToken}`)
          .send(payload)
          .expect(403);
        expect(body.statusCode).toEqual(403);
        expect(body.message).toEqual('Token invalid');
        expect(userServiceMock).toBeCalledWith(mockedToken);
      });
    });

    // describe('given the user is missing reset token or expiration', () => {
    //   it('should return the status 403 and an error message', async () => {
    //     const mockedToken = randomBytes(12).toString('hex');
    //     const { body: user } = await supertest(app)
    //       .post('/api/users')
    //       .send(mockedUser)
    //       .expect(201);
    //     jest.clearAllMocks();
    //     const user2 = await userService.createUser({
    //       email: 'test+err@example.com',
    //       password: mockedUser.password,
    //     });
    //     const retrievedUser = await userService.getUserById(user2.id);
    //     const userServiceMock = jest
    //       .spyOn(userService, 'getUserByResetToken')
    //       .mockResolvedValueOnce(user);
    //     const { body } = await supertest(app)
    //       .post(`/api/auth/password-reset/${mockedToken}`)
    //       .send(payload)
    //       .expect(403);
    //     expect(body.statusCode).toEqual(403);
    //     expect(body.message).toEqual('Token invalid');
    //     expect(userServiceMock).toBeCalledWith(mockedToken);
    //   });
    // });

    describe('given the reset token is expired', () => {
      it('should return the status 403 and an error message', async () => {
        const mockedToken = randomBytes(12).toString('hex');
        const user = await mockUser();
        user.resetToken = mockedToken;
        user.resetTokenExpires = new Date(Date.now() - 3600000).getDate(); // 1 hour ago

        const userServiceMock = jest
          .spyOn(userService, 'getUserByResetToken')
          .mockResolvedValueOnce(user);
        const { body } = await supertest(app)
          .post(`/api/auth/password-reset/${mockedToken}`)
          .send(payload)
          .expect(403);
        expect(body.statusCode).toEqual(403);
        expect(body.message).toEqual('Token invalid');
        expect(userServiceMock).toBeCalledWith(mockedToken);
      });
    });

    describe('given an internal server error occurred', () => {
      const mockUserService = () =>
        jest.spyOn(userService, 'getUserByEmail').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return the status 500 and an error message', async () => {
        const userServiceMock = mockUserService();
        const { body } = await supertest(app)
          .post('/api/auth/password-reset')
          .send(mockedUser)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(userServiceMock).toBeCalledWith(mockedUser.email);
      });
    });
  });
});
